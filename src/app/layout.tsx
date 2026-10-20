import { Suspense, type ReactNode } from 'react';
import { SiteMotion } from '../components/site/site-motion';
import { SiteFonts } from '../components/site/site-fonts';
import { brandIcons } from '../content/home/brand';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { messages, localeTag } from '../i18n/messages';
import { getRequestPage } from '../lib/routing/request-page';
import '../styles/globals.css';

export const metadata: Metadata = { icons: brandIcons };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const page = await getRequestPage();
  return (
    <html lang={page.locale === 'ar' ? 'ar' : 'en-US'} dir={page.locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <SiteFonts locale={page.locale} />
        <NextIntlClientProvider
          locale={localeTag(page.locale)}
          messages={messages[page.locale]}
          timeZone="Asia/Riyadh"
        >
          {children}
        </NextIntlClientProvider>
        <Suspense fallback={null}>
          <SiteMotion />
        </Suspense>
      </body>
    </html>
  );
}
