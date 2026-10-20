import recovered from '../tooling/sources/api-article.generated.json' with { type: 'json' };

type TextNode = { type: string; text?: string | undefined; children?: TextNode[] | undefined };
function sourceText(nodes: readonly TextNode[]): string {
  return nodes.map((node) => (node.text ?? '') + sourceText(node.children ?? [])).join('');
}
// HTML parsing normalizes CRLF and CR to LF in both archived and new documents.
// The recovery artifact retains the original code line endings unchanged.
const browserText = (text: string) => text.replace(/\r\n?/gu, '\n');
export const articleSource = {
  path: recovered.path,
  title: recovered.title,
  bodyText: browserText(sourceText(recovered.body)),
  code: recovered.body
    .filter((node) => node.type === 'codeBlock')
    .map((node) => browserText(node.text ?? '')),
  headings: recovered.reconciliation.headings,
};
