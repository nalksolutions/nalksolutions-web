'use client';
import { LanguageSwitch } from './language-switch';
import { ui } from '../../i18n/messages';

import { useRef, useState, useSyncExternalStore } from 'react';
import { contacts } from '../../content/home/site';
import { Icon } from './icon';
import { SocialLinks } from './social-links';
import { LocaleLink } from './locale-link';
import { searchPages } from '../../content/journey/search';
import { useMenuDialog } from './use-menu-dialog';

interface SearchablePage {
  id: string;
  title: string;
  path: string;
  locale: string;
}

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function HeaderDialogs({
  searchable,
  locale = 'en',
  currentPath,
  activeSection,
  items,
  languageHref,
  homeHref,
}: {
  searchable: readonly SearchablePage[];
  items: readonly { label: string; href: string | null }[];
  languageHref: string | null;
  homeHref: string | null;
  locale?: 'en' | 'ar';
  currentPath?: string | undefined;
  activeSection?: string | undefined;
}) {
  const t = ui(locale);
  const {
    dialog: menuRef,
    trigger: menuTriggerRef,
    expanded: menuExpanded,
    open: openMenu,
    close: closeMenu,
    onClose: onMenuClose,
    onKeyDown: onMenuKeyDown,
  } = useMenuDialog();
  const search = useRef<HTMLDialogElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [visibleResults, setVisibleResults] = useState(6);
  const results = searchPages(
    searchable.filter((page) => page.locale === locale),
    query,
  );
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  return (
    <>
      <button
        className="search-trigger"
        data-entrance="fade"
        ref={searchTrigger}
        aria-label={t('search.title')}
        disabled={!ready}
        onClick={() => search.current?.showModal()}
      >
        <Icon name="search" />
      </button>
      <button
        className="menu-trigger"
        data-entrance="fade"
        ref={menuTriggerRef}
        aria-label={t('menu.open')}
        disabled={!ready}
        aria-haspopup="dialog"
        aria-expanded={menuExpanded}
        aria-controls="mobile-menu"
        onClick={openMenu}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <dialog
        ref={menuRef}
        id="mobile-menu"
        className="site-dialog menu-dialog"
        aria-labelledby="menu-title"
        onClose={onMenuClose}
        onKeyDown={onMenuKeyDown}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="dialog-heading">
          <h2 id="menu-title">{t('menu.title')}</h2>
          <button aria-label={t('menu.close')} onClick={() => closeMenu()}>
            <Icon name="close" />
          </button>
        </div>
        <div
          className="menu-dialog-content"
          onClickCapture={(event) => {
            if (event.target instanceof Element && event.target.closest('a[href]')) closeMenu(true);
          }}
        >
          <nav aria-label={t('nav.mobile')}>
            {items.map((item) =>
              item.href ? (
                <LocaleLink
                  locale={locale}
                  targetLocale={locale}
                  key={item.label}
                  href={item.href}
                  aria-current={item.href === currentPath ? 'page' : undefined}
                  data-active-section={item.href === activeSection ? 'true' : undefined}
                >
                  {item.label}
                </LocaleLink>
              ) : null,
            )}
            <LanguageSwitch locale={locale} href={languageHref} homeHref={homeHref} embedded />
          </nav>
          <address>
            <a href={contacts.phone.href} tabIndex={0}>
              {contacts.phone.label}
            </a>
            <a href={contacts.email.href} tabIndex={0}>
              {contacts.email.label}
            </a>
          </address>
          <SocialLinks />
          <LocaleLink
            locale={locale}
            targetLocale={locale}
            href={locale === 'ar' ? '/ar/contacts/' : '/contacts/'}
            className="site-button"
            tabIndex={0}
          >
            <Icon name="arrow" />
            {t('nav.enquiry')}
          </LocaleLink>
        </div>
      </dialog>
      <dialog
        ref={search}
        className="site-dialog search-dialog"
        aria-labelledby="search-title"
        onClose={() => searchTrigger.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            search.current?.close();
          }
        }}
      >
        <div className="dialog-heading">
          <h2 id="search-title">{t('search.title')}</h2>
          <button aria-label={t('search.close')} onClick={() => search.current?.close()}>
            <Icon name="close" />
          </button>
        </div>
        <label htmlFor="site-search">{t('search.pages')}</label>
        <input
          id="site-search"
          type="search"
          disabled={!ready}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleResults(6);
          }}
        />
        <p role="status">
          {query.trim() ? t('search.count', { count: results.length }) : t('search.prompt')}
        </p>
        <ul>
          {results.slice(0, visibleResults).map((page) => (
            <li key={page.id}>
              {page.locale === locale ? (
                <LocaleLink
                  locale={locale}
                  targetLocale={locale}
                  href={page.path}
                  tabIndex={0}
                  onClick={() => search.current?.close()}
                >
                  {page.title}
                </LocaleLink>
              ) : (
                <a href={page.path} hrefLang={page.locale} tabIndex={0}>
                  {page.title}
                </a>
              )}
            </li>
          ))}
        </ul>
        {visibleResults < results.length && (
          <button
            className="journey-show-more"
            onClick={() => setVisibleResults((count) => count + 6)}
          >
            {t('search.more')}
          </button>
        )}
      </dialog>
    </>
  );
}
