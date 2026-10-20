'use client';

import Link from 'next/link';
import { useRef, useSyncExternalStore, type KeyboardEvent } from 'react';
import { Icon } from '../site/icon';
import { ui, type Locale } from '../../i18n/messages';

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
type Topic = { href: string; label: string };

function TopicLinks({ items, locale }: { items: readonly Topic[]; locale: Locale }) {
  return (
    <nav aria-label={ui(locale)('topics.all')}>
      {items.map((topic) => (
        <Link href={topic.href} key={topic.href} prefetch={false}>
          {topic.label}
        </Link>
      ))}
    </nav>
  );
}

/** Category navigation in the native top layer, without expanding the article layout. */
export function TopicPicker({
  items,
  locale = 'en',
}: {
  items: readonly Topic[];
  locale?: Locale;
}) {
  const t = ui(locale);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const trapTab = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
  return (
    <>
      <button
        className="journey-topic-trigger"
        ref={trigger}
        disabled={!ready}
        aria-haspopup="dialog"
        aria-controls="blog-topic-picker"
        onClick={() => dialog.current?.showModal()}
      >
        {t('topics.all')} <span aria-hidden="true">+</span>
      </button>
      <dialog
        id="blog-topic-picker"
        ref={dialog}
        className="site-dialog topics-dialog"
        aria-labelledby="blog-topics-title"
        onKeyDown={trapTab}
        onClose={() => trigger.current?.focus({ preventScroll: true })}
      >
        <div className="dialog-heading">
          <h2 id="blog-topics-title">{t('topics.browse')}</h2>
          <button aria-label={t('topics.close')} onClick={() => dialog.current?.close()}>
            <Icon name="close" />
          </button>
        </div>
        <div
          className="topics-dialog-content"
          onClickCapture={(event) => {
            if (event.target instanceof Element && event.target.closest('a[href]'))
              dialog.current?.close();
          }}
        >
          <p>{t('topics.introduction')}</p>
          <TopicLinks items={items} locale={locale} />
        </div>
      </dialog>
      <noscript>
        <div className="topics-fallback">
          <p>{t('topics.all')}</p>
          <TopicLinks items={items} locale={locale} />
        </div>
      </noscript>
    </>
  );
}
