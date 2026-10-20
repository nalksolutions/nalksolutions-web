import type { ProofPage } from '../schema';
import type { DocumentNode, PageDocument, documentVariants, documentTags } from '../site/schema';
import type { TranslationRecord } from './schema';
import { entityId, localizedHref } from './identity';
import { arabicDateLabel } from './format';
import { PUBLIC_ORIGIN } from '../../lib/env/config';
import index from './listing-index.json';
import taxonomy from './copy/taxonomy-ar.json';
import { ui } from '../../i18n/messages';

type Listing = NonNullable<TranslationRecord['listing']>;
export function listingMembers(listing: Listing, pages: readonly ProofPage[]) {
  return index.articles
    .filter(
      (item) =>
        listing.family === 'blog' ||
        (listing.family === 'category'
          ? item.categories.includes(listing.basePath)
          : item.author === listing.basePath),
    )
    .flatMap((item) => {
      const page = pages.find(
        (page) =>
          page.locale === 'ar' && !page.localization?.preview && entityId(page) === item.entityId,
      );
      return page ? [page] : [];
    });
}

/** Only real published article identities determine Arabic listing sizes and URLs. */
export function publishListingViews(pages: readonly ProofPage[]): ProofPage[] {
  const result: ProofPage[] = [];
  for (const page of pages) {
    const listing = page.localization?.listing;
    if (!listing) {
      result.push(page);
      continue;
    }
    const members = listingMembers(listing, pages);
    const size = listing.family === 'blog' ? 9 : 10;
    const count = Math.max(1, Math.ceil(members.length / size));
    if (listing.number > count) continue;
    result.push({
      ...page,
      seo: {
        ...page.seo,
        robots: members.length ? page.seo.robots : 'noindex, follow',
        social: page.seo.social.map((item) => ({
          ...item,
          content:
            item.property === 'twitter:data1'
              ? String(members.length)
              : item.property === 'twitter:label1'
                ? 'المقالات'
                : item.content,
        })),
      },
    });
    if (listing.family !== 'blog' || listing.number !== 1 || !page.localization) continue;
    for (let number = 2; number <= count; number++) {
      const path = `/ar/blog/page/${number}/`;
      result.push({
        ...page,
        id: `${page.id}-page-${number}`,
        path,
        localization: { ...page.localization, listing: { ...listing, number } },
        seo: {
          ...page.seo,
          title: `${page.seo.title} — الصفحة ${number}`,
          canonical: PUBLIC_ORIGIN + path,
          jsonLd: [],
        },
      });
    }
  }
  return result;
}

const text = (value: string): DocumentNode => ({ type: 'text', text: value });
function element(
  tag: (typeof documentTags)[number],
  variant: (typeof documentVariants)[number] | null,
  children: DocumentNode[],
  attributes: Record<string, string> = {},
): DocumentNode {
  return { type: 'element', tag, variant, children, attributes };
}
const link = (
  href: string,
  label: string,
  variant: (typeof documentVariants)[number] | null = null,
) => element('a', variant, [text(label)], { href });

export async function localizedListingDocument(
  page: ProofPage,
  pages: readonly ProofPage[],
  source: PageDocument,
  read: (id: string) => Promise<TranslationRecord | null>,
): Promise<PageDocument> {
  const listing = page.localization?.listing;
  if (!listing) throw new Error('Missing localized listing identity');
  const t = ui('ar');
  const members = listingMembers(listing, pages);
  const size = listing.family === 'blog' ? 9 : 10;
  const count = Math.max(1, Math.ceil(members.length / size));
  if (listing.number > count) throw new Error('Unpublished Arabic pagination view');
  const cards = await Promise.all(
    members.slice((listing.number - 1) * size, listing.number * size).map(async (article) => {
      const record = await read(entityId(article));
      const presentation = record?.document?.article;
      if (!presentation) throw new Error('Published article is missing localized presentation');
      const image = presentation.featured;
      const category = localizedHref(pages, presentation.category.href, 'ar');
      const label =
        taxonomy[presentation.category.href as keyof typeof taxonomy] ??
        presentation.category.label;
      const metadata = [
        ...(category ? [link(category, label, 'listing-taxonomy')] : []),
        element('span', 'listing-date', [text(arabicDateLabel(presentation.dateLabel))]),
      ];
      return element('article', 'listing-blog-card', [
        element('div', 'listing-blog-image', [
          element(
            'a',
            null,
            [
              element('img', null, [], {
                src: image.src,
                alt: image.alt || article.content.heading,
                width: String(image.width),
                height: String(image.height),
                ...(image.variants.length
                  ? {
                      srcset: image.variants.map((item) => `${item.src} ${item.width}w`).join(', '),
                      sizes: '(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw',
                    }
                  : {}),
              }),
            ],
            { href: article.path, 'aria-label': article.content.heading },
          ),
        ]),
        element('div', 'listing-blog-copy', [
          element('div', 'listing-blog-meta', metadata),
          element('hr', 'listing-divider', []),
          element('h2', 'listing-card-title', [link(article.path, article.content.heading)]),
          element('div', 'listing-action', [
            link(article.path, t('article.read'), 'listing-read-more'),
          ]),
        ]),
      ]);
    }),
  );
  const base = page.path.replace(/page\/\d+\/$/u, '');
  const pagination = element(
    'div',
    'listing-pagination',
    Array.from({ length: count }, (_, offset) => {
      const number = offset + 1;
      return number === listing.number
        ? element('span', 'listing-current', [text(String(number))], { 'aria-current': 'page' })
        : link(number === 1 ? base : `${base}page/${number}/`, String(number));
    }),
  );
  const nodes = [
    element('div', 'listing-hero', [
      element('div', 'listing-title', [element('h1', null, [text(page.content.heading)])]),
    ]),
    element('div', 'listing-body', [
      ...(cards.length
        ? [element('div', 'listing-blog-grid', cards)]
        : [element('p', null, [text('لا توجد مقالات منشورة في هذا الموضوع حاليًا.')])]),
      ...(count > 1 ? [pagination] : []),
    ]),
  ];
  return { ...source, path: page.path, locale: 'ar', nodes, listingViews: undefined };
}
