import { createElement, Fragment, type ReactNode } from 'react';
import type { ArticleNode } from '../../content/articles/schema';
import { ArticleImage } from './article-image';

const tags = {
  paragraph: 'p',
  strong: 'strong',
  emphasis: 'em',
  listItem: 'li',
  quote: 'blockquote',
  tableHead: 'thead',
  tableBody: 'tbody',
  tableFoot: 'tfoot',
  tableRow: 'tr',
  caption: 'caption',
  figure: 'figure',
  figureCaption: 'figcaption',
} as const;

function renderNode(node: ArticleNode): ReactNode {
  switch (node.type) {
    case 'text':
      return node.text;
    case 'codeBlock':
      return (
        <pre tabIndex={0} aria-label={`${node.language ?? 'Plain text'} code example`}>
          <code data-language={node.language ?? undefined}>{node.text}</code>
        </pre>
      );
    case 'image':
      return <ArticleImage image={node} />;
    case 'heading':
      return createElement(`h${node.level}`, null, <ArticleBody nodes={node.children} />);
    case 'list':
      return node.ordered ? (
        <ol start={node.start}>
          <ArticleBody nodes={node.children} />
        </ol>
      ) : (
        <ul>
          <ArticleBody nodes={node.children} />
        </ul>
      );
    case 'link':
      return (
        <a href={node.href} title={node.title ?? undefined}>
          <ArticleBody nodes={node.children} />
        </a>
      );
    case 'inlineCode':
      return (
        <code>
          <ArticleBody nodes={node.children} />
        </code>
      );
    case 'break':
      return <br />;
    case 'table':
      return (
        <div
          className="article-table"
          tabIndex={0}
          role="region"
          aria-label="Scrollable article table"
        >
          <table>
            <ArticleBody nodes={node.children} />
          </table>
        </div>
      );
    case 'tableCell':
      return (
        <td colSpan={node.colspan} rowSpan={node.rowspan}>
          <ArticleBody nodes={node.children} />
        </td>
      );
    case 'tableHeader':
      return (
        <th colSpan={node.colspan} rowSpan={node.rowspan} scope={node.scope}>
          <ArticleBody nodes={node.children} />
        </th>
      );
    default:
      return createElement(tags[node.type], null, <ArticleBody nodes={node.children} />);
  }
}

/** React escapes source text; only validated semantic nodes reach this renderer. */
export function ArticleBody({ nodes }: { nodes: readonly ArticleNode[] }) {
  return nodes.map((node, index) => <Fragment key={index}>{renderNode(node)}</Fragment>);
}
