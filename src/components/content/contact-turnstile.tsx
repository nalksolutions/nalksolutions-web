'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../i18n/messages';

export interface TurnstileApi {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      language: string;
      theme: string;
      size: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ): string;
  remove(id: string): void;
}

export function createContactWidget(
  element: HTMLElement,
  api: TurnstileApi,
  options: {
    siteKey: string;
    locale: Locale;
    onToken: (token: string) => void;
    onUnavailable: () => void;
  },
) {
  let widget: string | undefined;
  let size: 'compact' | 'flexible' | undefined;
  let disposed = false;
  function resize() {
    if (disposed) return;
    const next = element.clientWidth < 300 ? 'compact' : 'flexible';
    if (next === size) return;
    if (widget !== undefined) api.remove(widget);
    widget = undefined;
    size = next;
    options.onToken('');
    try {
      widget = api.render(element, {
        sitekey: options.siteKey,
        action: 'contact',
        language: options.locale,
        theme: 'dark',
        size,
        callback: options.onToken,
        'expired-callback': () => options.onToken(''),
        'error-callback': options.onUnavailable,
      });
    } catch {
      options.onUnavailable();
    }
  }
  resize();
  return {
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (widget !== undefined) api.remove(widget);
    },
  };
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function ContactTurnstile({
  siteKey,
  locale,
  resetKey,
  onToken,
  onUnavailable,
}: {
  siteKey: string;
  locale: Locale;
  resetKey: number;
  onToken: (value: string) => void;
  onUnavailable: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !api || !container.current) return;
    const widget = createContactWidget(container.current, api, {
      siteKey,
      locale,
      onToken,
      onUnavailable,
    });
    const observer = new ResizeObserver(widget.resize);
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      widget.dispose();
    };
  }, [ready, siteKey, locale, resetKey, onToken, onUnavailable]);
  return (
    <>
      <Script
        id="contact-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={onUnavailable}
      />
      <div className="contact-verification" ref={container} />
    </>
  );
}
