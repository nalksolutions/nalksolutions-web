import { ui, type Locale } from '../../i18n/messages';
import type { DocumentNode } from '../site/schema';
import type { OfferId } from './offers';

/** Indices refer to top-level elements in the immutable source document; see editorial ledger. */
export const serviceSections: Record<
  OfferId,
  {
    capabilities: number[];
    evidence: number[];
    process: number[];
    areas: number[];
    faq: number[];
    closing: number[];
  }
> = {
  websites: {
    capabilities: [2, 3, 4, 5, 6, 7, 8],
    evidence: [1, 9, 11],
    process: [10],
    areas: [12],
    faq: [13],
    closing: [14],
  },
  software: {
    capabilities: [2, 3, 4, 5, 6, 7, 8],
    evidence: [1],
    process: [9],
    areas: [],
    faq: [],
    closing: [10],
  },
  automation: {
    capabilities: [2, 3, 4, 5, 6, 7],
    evidence: [1],
    process: [8],
    areas: [],
    faq: [],
    closing: [9],
  },
  marketing: {
    capabilities: [2, 3, 4, 5, 6, 7, 8],
    evidence: [1],
    process: [],
    areas: [9],
    faq: [10],
    closing: [11],
  },
};

export function nodeText(node: DocumentNode): string {
  return node.type === 'text'
    ? node.text
    : 'children' in node
      ? node.children.map(nodeText).join('')
      : '';
}

/** Distinct source introduction details relocated below the concise offer hero. */
export const offerContext: Partial<
  Record<OfferId, { heading: string; paragraphs: readonly string[] }>
> = {
  websites: {
    heading: 'Websites for the Saudi market',
    paragraphs: [
      'Nalk Solutions builds websites and web applications for businesses across every major Saudi sector, including retail and ecommerce, healthcare, real estate and construction, logistics and transport, education, hospitality, and professional services.',
      'From Riyadh and Jeddah to Dammam and Makkah, we deliver fast, secure websites that are easy to manage and built to turn visitors into customers. Our work supports Saudi Arabia’s Vision 2030 digital transformation goals.',
    ],
  },
  software: {
    heading: 'Applications built around your requirements',
    paragraphs: [
      'Whether you need a mobile application your customers carry in their pockets, an internal operations platform your teams depend on daily, or a complex enterprise system connecting multiple business units, we build solutions designed around your requirements from the ground up.',
    ],
  },
  marketing: {
    heading: 'Marketing that fits the local market',
    paragraphs: [
      'We build marketing that fits the market it runs in. That means Arabic and English working together rather than one bolted on at the end, ad timing that respects prayer schedules and the rhythm of the Saudi week, and channels chosen because your buyers actually live there, not because they look good in a slide.',
      'We work with companies in Riyadh, Jeddah, and the Eastern Province, and our job is simple to describe: turn your website and your ad spend into a steady source of qualified leads you can count on month after month.',
    ],
  },
};

export function findHeading(nodes: readonly DocumentNode[], tag = 'h1'): string | undefined {
  for (const node of nodes) {
    if (node.type === 'element' && node.tag === tag) return nodeText(node);
    if ('children' in node) {
      const found = findHeading(node.children, tag);
      if (found) return found;
    }
  }
  return undefined;
}

/** Core-page editorial changes only; specialists never pass through this transform. */
export function coreServiceCopy(node: DocumentNode, locale: Locale = 'en'): DocumentNode {
  if (
    node.type === 'element' &&
    node.tag === 'p' &&
    nodeText(node).trim().startsWith('Lorem ipsum dolor sit amet')
  )
    return { type: 'text', text: '' };
  if (
    node.type === 'element' &&
    node.variant === 'service-button' &&
    node.tag === 'a' &&
    (node.attributes.href ?? '').includes('contacts')
  )
    return {
      ...node,
      attributes: { ...node.attributes, href: '/contacts/' },
      children: [{ type: 'text', text: ui(locale)('nav.enquiry') }],
    };
  if ('children' in node)
    return { ...node, children: node.children.map((child) => coreServiceCopy(child, locale)) };
  return node;
}
