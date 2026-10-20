'use client';

import { preload } from 'react-dom';

/** Discover the local text fonts in the server response, before CSS requests them. */
export function SiteFonts({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  if (locale === 'ar')
    preload('/fonts/noto-sans-arabic.woff2', {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    });
  preload('/fonts/manrope-latin.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  preload('/fonts/space-grotesk-latin.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  return null;
}
