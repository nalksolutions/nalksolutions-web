'use client';
import { ui, type Locale } from '../../i18n/messages';

/** Next integrates native History API calls; a bare hash anchor loses router state. */
export function SkipLink({ locale = 'en' }: { locale?: Locale }) {
  return (
    <a
      href="#main-content"
      className="skip-link"
      tabIndex={0}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
          return;
        const main = document.getElementById('main-content');
        if (!main) return;
        event.preventDefault();
        if (window.location.hash !== '#main-content')
          window.history.pushState(null, '', '#main-content');
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: 'start' });
      }}
    >
      {ui(locale)('common.skip')}
    </a>
  );
}
