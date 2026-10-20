'use client';
import { LocaleLink } from './locale-link';
import { useRef } from 'react';
import { ui, type Locale } from '../../i18n/messages';
import { AnimatedDisclosure } from './animated-disclosure';

export function LanguageSwitch({
  locale,
  href,
  homeHref,
  embedded = false,
}: {
  locale: Locale;
  href: string | null;
  homeHref: string | null;
  embedded?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const t = ui(locale);
  const label = locale === 'ar' ? 'English' : 'العربية';
  if (href)
    return (
      <a
        href={href}
        hrefLang={locale === 'ar' ? 'en' : 'ar-SA'}
        lang={locale === 'ar' ? 'en' : 'ar'}
      >
        {label}
      </a>
    );
  const choices = (
    <>
      <p>{locale === 'ar' ? t('common.languageUnavailable') : t('common.unavailable')}</p>
      {homeHref && (
        <a href={homeHref}>{locale === 'ar' ? t('common.englishHome') : 'العربية — الرئيسية'}</a>
      )}
      {locale === 'ar' && (
        <p>
          <LocaleLink locale="ar" targetLocale="en" href="/blog/">
            {t('common.englishBlog')}
          </LocaleLink>{' '}
          ·{' '}
          <LocaleLink locale="ar" targetLocale="en" href="/our-services/">
            {t('common.englishServices')}
          </LocaleLink>
        </p>
      )}
    </>
  );
  if (embedded)
    return (
      <AnimatedDisclosure
        className="language-menu-option"
        bodyClassName="language-choices"
        summary={label}
      >
        {choices}
      </AnimatedDisclosure>
    );
  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="language-trigger"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="site-dialog language-dialog"
        onClose={() => trigger.current?.focus()}
        aria-label={t('common.version')}
      >
        <div className="dialog-heading">
          <h2>{t('common.version')}</h2>
          <button onClick={() => dialog.current?.close()} aria-label={t('common.close')}>
            ×
          </button>
        </div>
        {choices}
      </dialog>
    </>
  );
}
