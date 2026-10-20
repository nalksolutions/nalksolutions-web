import type { PageDocument } from './schema';

export const blogPageQuery = 'cmsmasters-page-c1619d2';
export type PublicSearchParams = Record<string, string | string[] | undefined>;

/** Query views share the published Blog identity, title and canonical. */
export function selectListingView(
  document: PageDocument,
  search: PublicSearchParams,
): PageDocument {
  if (document.listingLayout !== 'blog' || document.locale === 'ar') return document;
  const input = search[blogPageQuery];
  const value = Array.isArray(input) ? input.at(-1) : input;
  if (!value || !/^\d+$/u.test(value)) return document;
  const number = Number(value);
  if (number < 2) return document;
  // The verified page-6 response is the empty state for out-of-range numeric pages.
  const selected = Math.min(number, 6);
  const view = document.listingViews?.find((candidate) => candidate.page === selected);
  if (!view) throw new Error('Validated Blog query view is missing');
  return { ...document, nodes: view.nodes };
}
