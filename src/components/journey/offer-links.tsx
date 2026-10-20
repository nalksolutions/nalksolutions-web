import { localizedTarget } from '../../content/localization/identity';
import { offerCopy, copyText, journeyArabic as ar } from '../../content/localization/copy';
import { ui, type Locale } from '../../i18n/messages';
import Link from 'next/link';
import { AnimatedDisclosure } from '../site/animated-disclosure';
import type { ProofPage } from '../../content/schema';
import { enquiry, offers, type Offer } from '../../content/journey/offers';
import { ButtonLink } from '../site/button-link';
import { buttonClassName } from '../site/button-styles';
import { Icon } from '../site/icon';
import { entranceAttributes } from '../site/entrance';

export function OfferCards({
  pages,
  home = false,
  locale = 'en',
}: {
  pages: readonly ProofPage[];
  home?: boolean;
  locale?: Locale;
}) {
  const icons = ['shape5', 'shape4', 'shape3', 'shape2'] as const;
  return (
    <div className={`journey-offer-grid${home ? ' home-service-grid' : ''}`}>
      {offers.map((original, index) => {
        const offer = offerCopy(original, locale);
        const target = localizedTarget(pages, offer.pageId, locale);
        const body = (
          <>
            <Icon name={icons[index]!} />
            <h3>{offer.label}</h3>
            <p className="journey-outcome">{offer.outcome}</p>
            <p>{home ? offer.description : offer.audience}</p>
            {!home && <p>{offer.description}</p>}
            <span
              className={buttonClassName({ appearance: 'blue', className: 'home-card-action' })}
            >
              {offer.action}
            </span>
          </>
        );
        const props = {
          className: 'journey-offer-card home-service-card home-glass-card site-button-card',
          'data-offer': offer.id,
          ...entranceAttributes({ kind: 'up', delay: index * 100 }),
        };
        return target ? (
          <Link key={offer.id} href={target.path} prefetch={false} {...props}>
            {body}
          </Link>
        ) : null;
      })}
    </div>
  );
}

function SpecialistList({
  offer,
  pages,
  ids,
  locale = 'en',
}: {
  offer: Offer;
  pages: readonly ProofPage[];
  ids?: readonly string[];
  locale?: Locale;
}) {
  const selected = offer.specialists.filter((item) => !ids || ids.includes(item.pageId));
  return (
    <>
      {[false, true].map((area) => {
        const items = selected.filter(
          (item) => Boolean(item.area) === area && localizedTarget(pages, item.pageId, locale),
        );
        if (!items.length) return null;
        return (
          <div key={String(area)}>
            {area && <h4>{copyText(locale, 'serviceAreas', 'Service areas')}</h4>}
            <ul className="journey-link-list">
              {items.map((item) => (
                <li key={item.pageId}>
                  <Link href={localizedTarget(pages, item.pageId, locale)!.path} prefetch={false}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export function SpecialistDirectory({
  pages,
  locale = 'en',
}: {
  pages: readonly ProofPage[];
  locale?: Locale;
}) {
  return (
    <section
      className="journey-section"
      id="specialist-services"
      aria-labelledby="specialist-heading"
    >
      <p className="section-label">{locale === 'ar' ? ar.specificNeeds : 'More specific needs'}</p>
      <h2 id="specialist-heading" className="gradient-text">
        {locale === 'ar' ? ar.directoryHeading : 'Explore specialist services'}
      </h2>
      <p>
        {locale === 'ar'
          ? ar.directoryIntroduction
          : 'Start with an offer above, or explore a particular capability or service area below.'}
      </p>
      <div className="journey-directory">
        {offers.map((original) => {
          const offer = offerCopy(original, locale);
          return (
            <AnimatedDisclosure
              key={offer.id}
              data-offer-directory={offer.id}
              className="journey-directory-item"
              bodyClassName="journey-disclosure-body"
              summary={
                <>
                  {offer.label}
                  <span aria-hidden="true">+</span>
                </>
              }
            >
              <SpecialistList offer={offer} pages={pages} locale={locale} />
            </AnimatedDisclosure>
          );
        })}
      </div>
    </section>
  );
}

export function OfferSpecialists({
  offer,
  pages,
  locale = 'en',
}: {
  offer: Offer;
  pages: readonly ProofPage[];
  locale?: Locale;
}) {
  const other = offer.specialists
    .filter((item) => !offer.featured.includes(item.pageId))
    .map((item) => item.pageId);
  return (
    <section
      className="journey-section journey-specialists"
      aria-labelledby="offer-specialists-heading"
    >
      <p className="section-label">
        {copyText(locale, 'specialistLabel', 'Explore in more detail')}
      </p>
      <h2 id="offer-specialists-heading">
        {copyText(locale, 'specialistTitle', 'Specialist services')}
      </h2>
      <SpecialistList offer={offer} pages={pages} ids={offer.featured} locale={locale} />
      {other.length > 0 && (
        <AnimatedDisclosure
          className="journey-details"
          bodyClassName="journey-disclosure-body"
          summary={
            <>
              {copyText(locale, 'moreCapabilities', 'More capabilities and service areas')}
              <span aria-hidden="true">+</span>
            </>
          }
        >
          <SpecialistList offer={offer} pages={pages} ids={other} locale={locale} />
        </AnimatedDisclosure>
      )}
    </section>
  );
}

export function JourneyContact({
  title,
  compact = false,
  locale = 'en',
}: {
  title?: string;
  compact?: boolean;
  locale?: Locale;
}) {
  return (
    <section
      className={`journey-section journey-contact${compact ? ' journey-contact-compact' : ' home-glass-card'}`}
    >
      <div>
        <h2 className="gradient-text">
          {title ??
            (locale === 'ar' ? ar.contactHeading : 'Let’s discuss what your business needs.')}
        </h2>
        <p>
          {locale === 'ar'
            ? ar.contactIntroduction
            : 'Tell us about your project, or the problem you want to solve.'}
        </p>
      </div>
      <ButtonLink href={locale === 'ar' ? '/ar/contacts/' : enquiry.href}>
        {ui(locale)('nav.enquiry')}
      </ButtonLink>
    </section>
  );
}

export function OfferBridge({
  offer: original,
  pages,
  specialist = false,
  locale = 'en',
}: {
  offer: Offer;
  pages: readonly ProofPage[];
  specialist?: boolean;
  locale?: Locale;
}) {
  const offer = offerCopy(original, locale);
  const target = localizedTarget(pages, offer.pageId, locale);
  if (!target) return null;
  return specialist ? (
    <nav
      className="journey-parent"
      aria-label={locale === 'ar' ? ar.relatedOffer : 'Related service offer'}
    >
      <Link href={target.path} prefetch={false}>
        {locale === 'ar' ? ar.explore : 'Explore'} {offer.label}
      </Link>
      <Link href={locale === 'ar' ? '/ar/contacts/' : enquiry.href} prefetch={false}>
        {ui(locale)('nav.enquiry')}
      </Link>
    </nav>
  ) : (
    <aside
      className="journey-section journey-article-offer home-glass-card"
      aria-label={locale === 'ar' ? ar.relatedOffer : 'Related service offer'}
      data-related-offer={offer.id}
    >
      <div>
        <p className="section-label">{locale === 'ar' ? ar.practice : 'Put it into practice'}</p>
        <h2>{offer.label}</h2>
        <p>{offer.outcome}</p>
      </div>
      <ButtonLink href={target.path} outline>
        {offer.action}
      </ButtonLink>
    </aside>
  );
}
