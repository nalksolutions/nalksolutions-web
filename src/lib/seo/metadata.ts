import type { Metadata } from 'next';
import type { ProofPage } from '../../content/schema';
import { PUBLIC_ORIGIN } from '../env/config';

const mappedSocial = new Set([
  'og:type',
  'og:locale',
  'og:title',
  'og:description',
  'og:url',
  'og:site_name',
  'og:image',
  'og:image:secure_url',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'og:image:type',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
]);

export function pageMetadata(page: ProofPage, pages: readonly ProofPage[] = []): Metadata {
  const social = new Map(page.seo.social.map(({ property, content }) => [property, content]));
  const image = social.get('og:image');
  const extra: Record<string, string> = {};
  for (const { property, content } of page.seo.social) {
    if (!mappedSocial.has(property)) extra[property] = content;
  }
  const entity = page.localization?.entityId ?? page.id;
  const equivalent = pages.find(
    (item) =>
      item.localization?.entityId === entity &&
      !item.localization.preview &&
      !(item.localization.listing?.family === 'blog' && item.localization.listing.number > 1) &&
      item.locale !== page.locale,
  );
  const original =
    page.localization &&
    !page.localization.preview &&
    !(page.localization.listing?.family === 'blog' && page.localization.listing.number > 1)
      ? pages.find((item) => item.id === page.localization?.entityId && item.locale === 'en')
      : null;
  const pair = equivalent ?? original;
  const languages =
    pair && page.seo.canonical && pair.seo.canonical
      ? {
          en: page.locale === 'en' ? page.seo.canonical : pair.seo.canonical,
          'ar-SA': page.locale === 'ar' ? page.seo.canonical : pair.seo.canonical,
        }
      : undefined;
  return {
    metadataBase: new URL(PUBLIC_ORIGIN),
    title: { absolute: page.seo.title },
    description: page.seo.description,
    alternates: page.seo.canonical
      ? { canonical: page.seo.canonical, ...(languages ? { languages } : {}) }
      : null,
    robots: page.localization?.preview ? 'noindex, nofollow' : page.seo.robots,
    openGraph: {
      type: social.get('og:type') === 'article' ? 'article' : 'website',
      ...(social.has('og:title') ? { title: social.get('og:title') ?? '' } : {}),
      ...(social.has('og:description') ? { description: social.get('og:description') ?? '' } : {}),
      ...(social.has('og:url') ? { url: social.get('og:url') ?? '' } : {}),
      ...(social.has('og:locale') ? { locale: social.get('og:locale') ?? '' } : {}),
      ...(social.has('og:site_name') ? { siteName: social.get('og:site_name') ?? '' } : {}),
      ...(image
        ? {
            images: [
              {
                url: image,
                secureUrl: social.get('og:image:secure_url'),
                width: social.get('og:image:width'),
                height: social.get('og:image:height'),
                alt: social.get('og:image:alt'),
                type: social.get('og:image:type'),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: social.get('twitter:card') === 'summary' ? 'summary' : 'summary_large_image',
      ...(social.has('twitter:title') ? { title: social.get('twitter:title') ?? '' } : {}),
      ...(social.has('twitter:description')
        ? { description: social.get('twitter:description') ?? '' }
        : {}),
      ...(social.has('twitter:image') ? { images: [social.get('twitter:image') ?? ''] } : {}),
    },
    other: { ...extra, ...(page.seo.googlebot ? { googlebot: page.seo.googlebot } : {}) },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/gu, (character) => {
    const escapes: Record<string, string> = {
      '<': '\\u003c',
      '>': '\\u003e',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    return escapes[character] ?? character;
  });
}
