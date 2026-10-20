import type { ProofPage } from '../../content/schema';
import { OfferCards, SpecialistDirectory, JourneyContact } from './offer-links';
import { servicesIntroduction } from '../../content/journey/pages';
import { journeyArabic as ar } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';

export function ServicesOverview({
  pages,
  locale = 'en',
}: {
  pages: readonly ProofPage[];
  locale?: Locale;
}) {
  return (
    <div className="journey-services" data-journey-page="services">
      <section className="journey-hero journey-section">
        <p className="section-label">
          {locale === 'ar' ? ar.servicesBadge : 'Built for Saudi businesses'}
        </p>
        <h1 className="gradient-text">{locale === 'ar' ? ar.servicesHeading : 'Our Services'}</h1>
        <p>{locale === 'ar' ? ar.servicesIntroduction : servicesIntroduction}</p>
      </section>
      <section
        className="journey-section"
        aria-label={locale === 'ar' ? ar.chooseOffer : 'Choose a service offer'}
      >
        <h2 className="sr-only">{locale === 'ar' ? ar.chooseOffer : 'Choose a service offer'}</h2>
        <OfferCards pages={pages} locale={locale} />
      </section>
      <JourneyContact
        locale={locale}
        compact
        title={locale === 'ar' ? ar.unsure : 'Not sure where to start?'}
      />
      <SpecialistDirectory pages={pages} locale={locale} />
      <JourneyContact
        locale={locale}
        title={locale === 'ar' ? ar.nextStep : 'A clear next step for your business.'}
      />
    </div>
  );
}
