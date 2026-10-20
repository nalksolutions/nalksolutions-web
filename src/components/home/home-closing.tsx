import { copyText, homeCopy } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';
import { ui } from '../../i18n/messages';
import type { CSSProperties } from 'react';
import assets from '../../content/home/assets.generated.json';
import { ButtonLink } from '../site/button-link';
import { SectionHeading } from './section-heading';
import { FaqItem } from './faq-item';
import { homeEntrance, homeEntranceAttributes } from '../site/source-entrance';
import { enquiry } from '../../content/journey/offers';

const stats = [
  ['120+', 'Successful Projects Delivered'],
  ['300%', 'Improvement In Performance'],
  ['48hrs', 'Fastest project completion'],
  ['100%', 'Client Satisfaction'],
] as const;

export function HomeStats({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section
      className="home-stats"
      aria-label={copyText(locale, 'numbers', 'Nalk Solutions in numbers')}
      style={{ '--home-stats-artwork': `url("${assets.roles.stats}")` } as CSSProperties}
    >
      <div className="home-stats-grid">
        {stats.map(([value, label], index) => (
          <div
            key={label}
            {...homeEntranceAttributes(
              (['1b93c2d', 'bbb5e98', '2553b87', '760cb6e'] as const)[index]!,
            )}
          >
            <p dir={locale === 'ar' && index === 2 ? 'rtl' : 'ltr'}>
              {locale === 'ar' && index === 2 ? copyText(locale, 'hours', value) : value}
            </p>
            <h2>
              {copyText(
                locale,
                (['projects', 'performance', 'fastest', 'satisfaction'] as const)[index]!,
                label,
              )}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomeFaq({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section className="home-faq home-section home-inner-section">
      <SectionHeading
        label={copyText(locale, 'faq', 'FAQ')}
        title={copyText(locale, 'faqTitle', 'Got Questions? We’ve Got Answers')}
        source={['6d481ef', '7830bbd']}
      />
      <div>
        {homeCopy(locale).faq.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}

export function HomeCallToAction({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section className="home-cta home-section home-inner-section">
      <div
        className="home-glass-card"
        style={{ '--home-card-artwork': `url("${assets.roles.cta}")` } as CSSProperties}
        {...homeEntranceAttributes('08924fa')}
      >
        <SectionHeading
          label={copyText(locale, 'next', 'Your Product Could Be Next')}
          title={copyText(locale, 'ready', 'Ready to Transform Your Business?')}
          source={['fe10e95', '594a195']}
        />
        <p {...homeEntranceAttributes('61d35b8')}>
          {copyText(locale, 'cta', 'Nalk Solutions is where bold ideas become unstoppable brands.')}
        </p>
        <div className="home-cta-actions">
          <ButtonLink
            href={locale === 'ar' ? '/ar/contacts/' : enquiry.href}
            appearance="reverse"
            entrance={homeEntrance('693c4df')}
          >
            {ui(locale)('nav.enquiry')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
