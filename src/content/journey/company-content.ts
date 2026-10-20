import type { DocumentNode } from '../site/schema';
import { nodeText } from './service-content';

export const aboutIntro = [
  'Nalk Solutions is a technology and creative partner for Saudi businesses, combining local understanding with practical delivery.',
  'We work with ambitious startups and established enterprises in Riyadh, Jeddah, Dammam and the Eastern Province, focusing on useful outcomes and long-term partnerships.',
] as const;
export const contactIntro =
  'Tell us about your project or the business problem you want to solve. Email a brief description, or call us using the details below.';

/** Explicit D-20 About edits; source data and all other company pages remain untouched. */
export function aboutNodes(nodes: readonly DocumentNode[]): DocumentNode[] {
  let intro = 0;
  function transform(node: DocumentNode, section: string): DocumentNode {
    if (node.type !== 'element')
      return 'children' in node
        ? { ...node, children: node.children.map((child) => transform(child, section)) }
        : node;
    const text = nodeText(node).replace(/\s+/gu, ' ').trim();
    if (section === 'company-about-hero' && node.tag === 'p' && text && intro < aboutIntro.length)
      return { ...node, children: [{ type: 'text', text: aboutIntro[intro++]! }] };
    let tag = node.tag;
    if (section === 'company-about-hero' && node.tag === 'h2') tag = 'h1';
    if (
      section === 'company-statements' &&
      node.tag === 'h2' &&
      !['Vision Statement', 'Mission Statement'].includes(text)
    )
      tag = 'p';
    if (section === 'company-message' && node.tag === 'h2' && text !== 'CEO’s MESSAGE') tag = 'p';
    return { ...node, tag, children: node.children.map((child) => transform(child, section)) };
  }
  return nodes.map((node) => transform(node, node.type === 'element' ? (node.variant ?? '') : ''));
}
