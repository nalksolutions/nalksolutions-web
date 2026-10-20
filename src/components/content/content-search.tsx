'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { LocaleLink } from '../site/locale-link';
import { Icon } from '../site/icon';
import { searchPages } from '../../content/journey/search';
import { ui } from '../../i18n/messages';

export interface SearchPage {
  id: string;
  title: string;
  path: string;
  locale: 'en' | 'ar';
  entityId?: string;
}

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function ContentSearch({
  pages,
  locale,
  appearance,
}: {
  pages: readonly SearchPage[];
  locale: 'en' | 'ar';
  appearance?: 'listing' | undefined;
}) {
  const id = useId();
  // The server/hydration snapshot keeps input disabled until React owns its events.
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [query, setQuery] = useState('');
  const [visibleResults, setVisibleResults] = useState(6);
  const t = ui(locale);
  const results = searchPages(
    pages.filter((page) => page.locale === locale),
    query,
  );
  const input = (
    <input
      id={id}
      type="search"
      disabled={!ready}
      value={query}
      placeholder={appearance === 'listing' ? t('search.title') : undefined}
      onChange={(event) => {
        setQuery(event.target.value);
        setVisibleResults(6);
      }}
    />
  );
  return (
    <section
      className={`content-search${appearance === 'listing' ? ' listing-search' : ''}`}
      aria-label={t('search.region')}
      data-recovered-control
    >
      <label htmlFor={id}>{t('search.label')}</label>
      {appearance === 'listing' ? (
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          {input}
          <button type="submit" aria-label={t('search.title')} disabled={!ready}>
            <Icon name="search" />
          </button>
        </form>
      ) : (
        input
      )}
      {query.trim() && (
        <>
          <p role="status">{t('search.count', { count: results.length })}</p>
          <ul>
            {results.slice(0, visibleResults).map((page) => (
              <li key={page.id}>
                <LocaleLink href={page.path} locale={locale} targetLocale={page.locale}>
                  {page.title}
                </LocaleLink>
              </li>
            ))}
          </ul>
          {visibleResults < results.length && (
            <button
              type="button"
              className="journey-show-more"
              onClick={() => setVisibleResults((count) => count + 6)}
            >
              {t('search.more')}
            </button>
          )}
        </>
      )}
    </section>
  );
}
