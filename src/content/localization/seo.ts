import type { ProofPage } from '../schema';
import type { TranslationRecord } from './schema';
import home from './copy/ar-authored.json';
import { PUBLIC_ORIGIN } from '../../lib/env/config';
import { pageSchema } from '../schema';

/** Keep organization/person facts; localize the page-owned schema and visible Home FAQs. */
export function localizedJsonLd(source: ProofPage, translation: TranslationRecord) {
  const targetUrl = PUBLIC_ORIGIN + encodeURI(translation.path);
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    const node = value as Record<string, unknown>;
    const result = Object.fromEntries(
      Object.entries(node).map(([key, item]) => [key, visit(item)]),
    );
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    if (
      types.some((type) =>
        [
          'WebPage',
          'CollectionPage',
          'ProfilePage',
          'Article',
          'BlogPosting',
          'NewsArticle',
          'FAQPage',
          'Service',
        ].includes(String(type)),
      )
    ) {
      result.inLanguage = 'ar-SA';
      for (const key of ['url', '@id'])
        if (typeof result[key] === 'string') {
          const url = new URL(result[key], PUBLIC_ORIGIN);
          if (url.origin === PUBLIC_ORIGIN && decodeURIComponent(url.pathname) === source.path)
            result[key] = targetUrl + url.hash;
        }
      if ('name' in result) result.name = translation.heading;
      if ('headline' in result) result.headline = translation.heading;
      if ('description' in result) result.description = translation.seo.description;
    }
    // References may use lowercase percent escapes in the recovered Arabic graph.
    // Keep global organization/site identities while moving this page's references.
    if (source.path !== '/')
      for (const [key, item] of Object.entries(result)) {
        if (typeof item !== 'string' || !item.startsWith(PUBLIC_ORIGIN)) continue;
        const url = new URL(item);
        if (decodeURIComponent(url.pathname) === source.path) result[key] = targetUrl + url.hash;
      }
    if (types.includes('FAQPage') && source.id === 'R-91d9b62648d713d4')
      result.mainEntity = home.home.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }));
    return result;
  };
  return pageSchema.shape.seo.shape.jsonLd.parse(source.seo.jsonLd.map(visit));
}
