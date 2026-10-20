import { createHash } from 'node:crypto';
import type { DocumentNode } from '../site/schema';
import type { TranslationRecord } from './schema';

export function blockText(nodes: readonly DocumentNode[]): string {
  return nodes
    .map((node) =>
      node.type === 'text' ? node.text : 'children' in node ? blockText(node.children) : '',
    )
    .join('')
    .replace(/\s+/gu, ' ')
    .trim();
}
export const blockKey = (text: string) =>
  createHash('sha256').update(text.replace(/\s+/gu, ' ').trim()).digest('hex');
type LanguageNode = {
  type: string;
  tag?: string;
  text?: string;
  children?: readonly LanguageNode[];
  summary?: readonly LanguageNode[];
};
/** Reject whole English prose fallbacks; this does not constitute linguistic approval. */
export function untranslatedProse(nodes: readonly LanguageNode[]): string[] {
  const found: string[] = [];
  const protectedNode = (node: LanguageNode) =>
    ['code', 'pre', 'svg'].includes(node.tag ?? '') ||
    ['codeBlock', 'inlineCode'].includes(node.type);
  const visible = (node: LanguageNode): string =>
    protectedNode(node) ? '' : (node.text ?? node.children?.map(visible).join('') ?? '');
  for (const node of nodes) {
    if (protectedNode(node)) continue;
    if (
      node.type === 'text' ||
      /^(?:h[1-6]|p|li|td|th)$/u.test(node.tag ?? '') ||
      ['paragraph', 'heading', 'listItem', 'tableCell', 'tableHeader'].includes(node.type)
    ) {
      const value = visible(node);
      const english = value.match(/[A-Za-z]+/gu)?.length ?? 0;
      const arabic = value.match(/[\u0621-\u064a]+/gu)?.length ?? 0;
      if ((english >= 8 && !arabic) || (english >= 20 && arabic < 3)) {
        found.push(value);
        continue;
      }
    }
    found.push(...untranslatedProse(node.children ?? []), ...untranslatedProse(node.summary ?? []));
  }
  return found;
}
export function isTranslationBlock(node: DocumentNode) {
  return (
    node.type === 'element' &&
    (/^(?:h[1-6]|p|li)$/u.test(node.tag) ||
      ['service-button', 'service-tab', 'service-tab-mobile', 'service-counter-title'].includes(
        node.variant ?? '',
      ))
  );
}

/** Entire semantic blocks are authored together; source markup is never translated at runtime. */
export function applyDocumentTranslation(
  nodes: readonly DocumentNode[],
  translation: TranslationRecord,
): DocumentNode[] {
  return nodes.map((node): DocumentNode => {
    if (node.type === 'text') {
      if (node.text.trim() && !/^[\d\s+.,%]+$/u.test(node.text))
        throw new Error('Unowned source prose outside a translation block');
      return node;
    }
    if (isTranslationBlock(node) && node.type === 'element') {
      const text = blockText(node.children);
      if (!text) return node;
      if (text.startsWith('Lorem ipsum')) return { type: 'text', text: '' };
      const children = translation.blocks[blockKey(text)];
      if (!children) throw new Error(`Missing translated block: ${blockKey(text)}`);
      return { ...node, children };
    }
    if (node.type === 'element' && node.tag === 'img') {
      const original = node.attributes.alt ?? '';
      const alt = original ? translation.imageAlts[node.attributes.src ?? ''] : '';
      if (alt === undefined) throw new Error('Missing localized image description');
      return { ...node, attributes: { ...node.attributes, alt } };
    }
    // Numeric counters, decorative SVGs and opaque source controls retain their protected values.
    if (node.type === 'element' && node.tag === 'svg') return node;
    if ('children' in node)
      return {
        ...node,
        children: applyDocumentTranslation(node.children, translation),
        ...(node.type === 'disclosure'
          ? { summary: applyDocumentTranslation(node.summary, translation) }
          : {}),
      };
    return node;
  });
}
