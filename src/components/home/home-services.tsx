import { copyText } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';
import type { ProofPage } from '../../content/schema';
import { OfferCards } from '../journey/offer-links';
import { SectionHeading } from './section-heading';
import { homeEntranceAttributes } from '../site/source-entrance';

export function HomeServices({
  pages,
  locale = 'en',
}: {
  pages: readonly ProofPage[];
  locale?: Locale;
}) {
  return (
    <section id="services" className="home-services home-section">
      <div>
        <SectionHeading
          label={copyText(locale, 'what', 'What We Do')}
          title={copyText(locale, 'best', 'Here’s What We Do Best')}
          source={['b96b6e3', '36da31a']}
        />
        <p className="home-services-subtitle" {...homeEntranceAttributes('b6d3887')}>
          {copyText(locale, 'subtitle', 'Code, Strategy, and Technology')}
        </p>
      </div>
      <OfferCards pages={pages} home locale={locale} />
    </section>
  );
}
