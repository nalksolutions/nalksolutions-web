import { parse, type DefaultTreeAdapterMap } from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];

function elements(node: Node): Element[] {
  const found = 'tagName' in node ? [node] : [];
  if ('childNodes' in node) for (const child of node.childNodes) found.push(...elements(child));
  return found;
}

function attribute(element: Element, name: string): string | undefined {
  return element.attrs.find((attr) => attr.name === name)?.value;
}

function text(node: Node): string {
  if (node.nodeName === '#text' && 'value' in node) return node.value;
  return 'childNodes' in node ? node.childNodes.map(text).join('') : '';
}

function documentText(node: Node): string {
  // D-20 Blog topic navigation is tested independently from the preserved archive body.
  if (
    'tagName' in node &&
    (attribute(node, 'data-recovered-control') !== undefined ||
      attribute(node, 'data-journey-supplement') !== undefined)
  )
    return '';
  if (node.nodeName === '#text' && 'value' in node) return node.value;
  return 'childNodes' in node ? node.childNodes.map(documentText).join('') : '';
}

function hasClass(node: Element, name: string) {
  return attribute(node, 'class')?.split(/\s/u).includes(name);
}

export function inspectHtml(html: string) {
  const document = parse(html);
  const nodes = elements(document);
  const head = nodes.find((node) => node.tagName === 'head');
  const headNodes = head ? elements(head) : [];
  const root = nodes.find((node) => node.tagName === 'html');
  const articleBody = nodes.find((node) => attribute(node, 'data-article-body') !== undefined);
  const documentBody = nodes.find((node) => attribute(node, 'data-document-body') !== undefined);
  const articleHeading = nodes.find((node) => hasClass(node, 'article-heading'));
  const headingNodes = articleHeading ? elements(articleHeading) : [];
  const sharing = nodes.find((node) => hasClass(node, 'article-sharing'));
  const featured = headingNodes.find((node) => hasClass(node, 'article-featured'));
  return {
    articleShareLinks: sharing
      ? elements(sharing)
          .filter((node) => node.tagName === 'a')
          .map((node) => ({ label: attribute(node, 'aria-label'), href: attribute(node, 'href') }))
      : [],
    articleFeaturedImages: featured
      ? elements(featured)
          .filter((node) => node.tagName === 'img')
          .map((node) => ({ src: attribute(node, 'src'), alt: attribute(node, 'alt') }))
      : [],
    articleCategories: headingNodes
      .filter((node) => hasClass(node, 'article-category'))
      .map((node) => ({ label: text(node), href: attribute(node, 'href') })),
    articleExcerpt: headingNodes.filter((node) => hasClass(node, 'article-excerpt')).map(text),
    articleDate: headingNodes.filter((node) => hasClass(node, 'article-date')).map(text),
    articleAdjacentTitles: nodes
      .filter((node) => hasClass(node, 'article-adjacent-title'))
      .map(text),
    articleRelatedTitles: nodes
      .filter((node) => hasClass(node, 'article-card'))
      .map((node) => text(elements(node).find((child) => child.tagName === 'h3') ?? node)),
    documentBodyText: documentBody ? documentText(documentBody) : null,
    articleBodyText: articleBody ? text(articleBody) : null,
    articleCode: articleBody
      ? elements(articleBody)
          .filter((node) => node.tagName === 'pre')
          .map(text)
      : [],
    title: text(nodes.find((node) => node.tagName === 'title') ?? document),
    lang: root ? attribute(root, 'lang') : undefined,
    dir: root ? attribute(root, 'dir') : undefined,
    canonical: headNodes
      .filter((node) => node.tagName === 'link' && attribute(node, 'rel') === 'canonical')
      .map((node) => attribute(node, 'href')),
    meta: (key: string) =>
      headNodes
        .filter(
          (node) =>
            node.tagName === 'meta' &&
            (attribute(node, 'name') === key || attribute(node, 'property') === key),
        )
        .map((node) => attribute(node, 'content')),
    headings: nodes.filter((node) => node.tagName === 'h1').map(text),
    paragraphs: nodes.filter((node) => node.tagName === 'p').map(text),
    schemas: nodes
      .filter(
        (node) => node.tagName === 'script' && attribute(node, 'type') === 'application/ld+json',
      )
      .map((node) => JSON.parse(text(node)) as unknown),
  };
}
