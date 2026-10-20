import Link from 'next/link';
import type { ComponentProps } from 'react';

type Locale = 'en' | 'ar';
type Props = Omit<ComponentProps<typeof Link>, 'prefetch' | 'href' | 'locale'> & {
  href: string;
  locale: Locale;
  targetLocale?: Locale;
};

/** Cross-language requests must replace the persistent root HTML attributes. */
export function LocaleLink({ locale, targetLocale = 'en', ...props }: Props) {
  return locale === targetLocale ? (
    <Link {...props} prefetch={false} />
  ) : (
    <a {...props} hrefLang={targetLocale} />
  );
}
