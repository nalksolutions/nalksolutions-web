import register from './register.json';
import type { ProofPage } from '../schema';
import type { Locale } from '../../i18n/messages';

export const localizedId = (entityId: string) => `L-ar-${entityId}`;
export function entityId(page: Pick<ProofPage, 'id' | 'localization'>): string {
  return (
    page.localization?.entityId ??
    register.records.find((record) => record.sourceId === page.id)?.entityId ??
    page.id
  );
}
/** Existing links remain usable; available Arabic destinations avoid compatibility hops. */
export function canonicalContentHref(
  pages: readonly Pick<ProofPage, 'path' | 'locale'>[],
  href: string,
  locale: Locale,
): string {
  if (href.startsWith('#')) return href;
  const url = new URL(href, 'https://nalksolutions.com');
  if (url.origin !== 'https://nalksolutions.com') return href;
  const record = register.records.find(
    (item) => item.sourcePath === decodeURIComponent(url.pathname),
  );
  if (locale === 'ar' || record?.sourceLocale === 'ar')
    return localizedHref(pages, href, 'ar') ?? href;
  return href;
}
export function plannedArabicPath(id: string): string | null {
  return register.records.find((record) => record.entityId === id)?.arabicPath ?? null;
}
export function localizedTarget(pages: readonly ProofPage[], id: string, locale: Locale) {
  return (
    pages.find(
      (page) =>
        entityId(page) === id && page.locale === locale && (locale !== 'ar' || page.localization),
    ) ?? null
  );
}
export function localizedHref(
  pages: readonly Pick<ProofPage, 'path' | 'locale'>[],
  href: string,
  locale: Locale,
): string | null {
  if (locale === 'en' || href.startsWith('#')) return href;
  const url = new URL(href, 'https://nalksolutions.com');
  if (url.origin !== 'https://nalksolutions.com') return href;
  const pathname = decodeURIComponent(url.pathname);
  const record = register.records.find(
    (item) => item.sourcePath === pathname || item.arabicPath === pathname,
  );
  const target =
    record && pages.find((item) => item.path === record.arabicPath && item.locale === 'ar');
  return target ? target.path + url.search + url.hash : null;
}
