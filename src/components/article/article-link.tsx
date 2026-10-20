import type { ComponentProps } from 'react';
import type { ProofPage } from '../../content/schema';
import { PUBLIC_ORIGIN } from '../../lib/env/config';
import { LocaleLink } from '../site/locale-link';
import { canonicalContentHref } from '../../content/localization/identity';

export interface ArticleNavigation {
  locale: 'en' | 'ar';
  pages: readonly (Pick<ProofPage, 'path' | 'locale'> & Partial<Pick<ProofPage, 'content'>>)[];
}
export function articleLinkTitle(navigation: ArticleNavigation, href: string, fallback: string) {
  if (navigation.locale !== 'ar') return fallback;
  const destination = new URL(canonicalContentHref(navigation.pages, href, 'ar'), PUBLIC_ORIGIN);
  const target = navigation.pages.find(
    (page) => page.locale === 'ar' && page.path === decodeURIComponent(destination.pathname),
  );
  return target?.content?.heading ?? fallback;
}

/** Destination language comes from published identity, including noindex pages. */
export function ArticleLink({
  navigation,
  ...props
}: Omit<ComponentProps<typeof LocaleLink>, 'locale' | 'targetLocale'> & {
  navigation: ArticleNavigation;
}) {
  const href = canonicalContentHref(navigation.pages, props.href, navigation.locale);
  const destination = new URL(href, PUBLIC_ORIGIN);
  const identity = navigation.pages.find(
    (page) =>
      destination.origin === PUBLIC_ORIGIN &&
      page.path === decodeURIComponent(destination.pathname),
  );
  return (
    <LocaleLink
      {...props}
      href={href}
      locale={navigation.locale}
      targetLocale={identity?.locale ?? navigation.locale}
    />
  );
}
