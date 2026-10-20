import { offers } from './offers';
import { normalizeSearch } from '../localization/search';
import { ui } from '../../i18n/messages';
import { arabicOfferAliases } from './arabic';

export interface JourneySearchPage {
  id: string;
  title: string;
  path: string;
  locale: string;
  entityId?: string;
}

export function searchPages<T extends JourneySearchPage>(pages: readonly T[], query: string): T[] {
  const term = normalizeSearch(query);
  if (!term) return [];
  const matches = pages.filter((page) => {
    const offer = offers.find((offer) => offer.pageId === (page.entityId ?? page.id));
    return (
      normalizeSearch(page.title).includes(term) ||
      Boolean(
        offer &&
        [
          offer.label,
          ...offer.aliases,
          ...(page.locale === 'ar' ? arabicOfferAliases[offer.id] : []),
          ui(page.locale === 'ar' ? 'ar' : 'en')(`offers.${offer.id}`),
        ].some((label) => normalizeSearch(label).includes(term)),
      )
    );
  });
  return matches.sort(
    (a, b) =>
      Number(offers.some((offer) => offer.pageId === (b.entityId ?? b.id))) -
      Number(offers.some((offer) => offer.pageId === (a.entityId ?? a.id))),
  );
}
