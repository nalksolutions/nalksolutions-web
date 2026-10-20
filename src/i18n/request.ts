import { getRequestConfig } from 'next-intl/server';
import { getRequestPage } from '../lib/routing/request-page';
import { messages, localeTag } from './messages';

export default getRequestConfig(async () => {
  const { locale } = await getRequestPage();
  return { locale: localeTag(locale), messages: messages[locale], timeZone: 'Asia/Riyadh' };
});
