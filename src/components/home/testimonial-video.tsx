'use client';

import { useRef, useState } from 'react';
import { Icon } from '../site/icon';
import type { Locale } from '../../i18n/messages';

interface TestimonialVideoProps {
  locale?: Locale;
  poster: string;
  embedUrl: string;
  watchUrl: string;
}

export function TestimonialVideo({
  poster,
  embedUrl,
  watchUrl,
  locale = 'en',
}: TestimonialVideoProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <a
        ref={trigger}
        className="home-review-video"
        href={watchUrl}
        aria-label={locale === 'ar' ? 'شاهد رأي أحد عملائنا' : 'Watch the client testimonial'}
        aria-haspopup="dialog"
        tabIndex={0}
        style={{ backgroundImage: `url("${poster}")` }}
        onClick={(event) => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setPlaying(true);
          dialog.current?.showModal();
        }}
      />
      <dialog
        ref={dialog}
        className="site-dialog testimonial-dialog"
        aria-labelledby="testimonial-video-title"
        onClose={() => {
          setPlaying(false);
          trigger.current?.focus();
        }}
      >
        <div className="dialog-heading">
          <h2 id="testimonial-video-title">
            {locale === 'ar' ? 'رأي أحد عملائنا' : 'Client testimonial'}
          </h2>
          <button
            aria-label={locale === 'ar' ? 'إغلاق الفيديو' : 'Close video'}
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {playing && (
          <iframe
            src={embedUrl}
            title={
              locale === 'ar'
                ? 'فيديو رأي أحد عملاء نالك سوليوشنز'
                : 'Nalk Solutions client testimonial video'
            }
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </dialog>
    </>
  );
}
