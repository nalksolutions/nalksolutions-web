import { createTranslator } from 'next-intl';
import en from './messages/en.json';
import ar from './messages/ar.json';

export type Locale = 'en' | 'ar';
export const messages = { en, ar };
export const localeTag = (locale: Locale) =>
  locale === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-US';
export function ui(locale: Locale = 'en') {
  return createTranslator({
    locale: localeTag(locale),
    messages: messages[locale],
    formats: {},
    onError(error) {
      throw error;
    },
  });
}
