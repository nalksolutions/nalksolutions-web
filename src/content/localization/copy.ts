import 'server-only';
import en from './copy/en.json';
import ar from './copy/ar-authored.json';
import journey from './copy/journey-ar.json';
import type { Locale } from '../../i18n/messages';
import type { Offer } from '../journey/offers';
import { arabicOnlySpecialists } from '../journey/arabic';

export function copyText(locale: Locale, key: keyof typeof ar.labels, english: string) {
  return locale === 'ar' ? ar.labels[key] : english;
}
export function homeCopy(locale: Locale) {
  if (locale === 'en') return en.home;
  return {
    ...en.home,
    intro: ar.home.intro,
    faq: ar.home.faq,
    features: en.home.features.map((item, index) => ({ ...item, ...ar.home.features[index]! })),
    benefits: en.home.benefits.map((item, index) => ({ ...item, ...ar.home.benefits[index]! })),
    reviews: en.home.reviews.map((item, index) => ({ ...item, ...ar.home.reviews[index]! })),
  };
}
export function offerCopy(offer: Offer, locale: Locale): Offer {
  if (locale === 'en') return offer;
  const index = en.offers.findIndex((item) => item.id === offer.id);
  const translated = ar.offers[index];
  if (!translated || translated.specialists.length !== offer.specialists.length)
    throw new Error(`Incomplete localized offer: ${offer.id}`);
  return {
    ...offer,
    ...translated,
    aliases: [...offer.aliases, translated.label],
    specialists: [
      ...offer.specialists.map((item, index) => ({
        ...item,
        label: translated.specialists[index]!,
      })),
      ...(offer.id === 'software' ? arabicOnlySpecialists.software : []),
    ],
  };
}
export const contactArabic = ar.contact;
export const journeyArabic = journey;
