import { copyText, journeyArabic as ar } from '../../content/localization/copy';
import { entityId, localizedHref } from '../../content/localization/identity';
import { ui } from '../../i18n/messages';
import Link from 'next/link';
import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import type { ContentContext } from '../content/document-body';
import { ServiceSections } from '../content/service-sections';
import { CapturedPageFrame } from '../content/captured-page-frame';
import { ServiceArtwork } from '../content/service-artwork';
import { presentServiceNodes, serviceTheme } from '../../content/services/presentation';
import { enquiry, type Offer } from '../../content/journey/offers';
import {
  serviceSections,
  coreServiceCopy,
  findHeading,
  offerContext,
} from '../../content/journey/service-content';
import { ButtonLink } from '../site/button-link';
import { OfferSpecialists } from './offer-links';

export function OfferPage({
  page,
  pages,
  document,
  context,
  offer,
}: {
  page: ProofPage;
  pages: readonly ProofPage[];
  document: PageDocument;
  context: ContentContext;
  offer: Offer;
}) {
  const locale = page.locale;
  const t = ui(locale);
  const elements = document.nodes.filter((node) => node.type === 'element');
  const source = presentServiceNodes(elements.map((node) => coreServiceCopy(node, locale)));
  const groups = serviceSections[offer.id];
  const used = Object.values(groups).flat();
  if (new Set(used).size !== elements.length - 1 || used.some((index) => !elements[index]))
    throw new Error(`Core service section contract changed: ${page.id}`);
  const render = (indices: readonly number[]) => (
    <ServiceSections
      nodes={source}
      indices={indices}
      prefix="offer"
      context={{ ...context, sharedButtons: true }}
    />
  );
  const theme = serviceTheme(entityId(page));
  return (
    <CapturedPageFrame
      page={page}
      pages={pages}
      className={`service-site service-theme-${theme} journey-offer-page`}
    >
      <div data-journey-page={offer.id}>
        <div className="service-hero-scene">
          <section className="content-service-hero">
            {localizedHref(pages, '/our-services/', locale) && (
              <Link
                href={localizedHref(pages, '/our-services/', locale)!}
                prefetch={false}
                className="journey-back"
              >
                {t('common.allServices')}
              </Link>
            )}
            <p className="section-label">{offer.label}</p>
            <h1>{findHeading(document.nodes)}</h1>
            <p className="journey-lead">{offer.description}</p>
            <p>{offer.audience}</p>
            <div className="journey-actions">
              <ButtonLink href={locale === 'ar' ? '/ar/contacts/' : enquiry.href}>
                {t('nav.enquiry')}
              </ButtonLink>
              <ButtonLink href="#whats-included" outline>
                {t('common.included')}
              </ButtonLink>
            </div>
          </section>
          <ServiceArtwork theme={theme} />
        </div>
        <section className="journey-section">
          <p className="section-label">
            {copyText(locale, 'startProblem', 'Start with the problem')}
          </p>
          <h2>{offer.outcome}</h2>
          <ul className="journey-problems">
            {offer.problems.map((problem) => (
              <li key={problem} className="home-glass-card">
                {problem}
              </li>
            ))}
          </ul>
        </section>
        <div id="whats-included" className="journey-source-group">
          {render(groups.capabilities)}
        </div>
        <div className="journey-source-group">{render(groups.evidence)}</div>
        {offerContext[offer.id] && (
          <section className="journey-section">
            <h2>
              {locale === 'ar' && offer.id !== 'automation'
                ? ar.offerContext[offer.id].heading
                : offerContext[offer.id]!.heading}
            </h2>
            {(locale === 'ar' && offer.id !== 'automation'
              ? ar.offerContext[offer.id].paragraphs
              : offerContext[offer.id]!.paragraphs
            ).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        )}
        {offer.id === 'marketing' && (
          <section className="journey-section">
            <h2>
              {locale === 'ar'
                ? ar.marketingApproachHeading
                : 'A connected approach to your marketing'}
            </h2>
            <p>
              {locale === 'ar' ? (
                ar.marketingApproach
              ) : (
                <>
                  Start with your audience and objectives, choose the channels that fit, and use
                  reporting and follow-up to improve the work. The services above can work together
                  as your business grows.
                </>
              )}
            </p>
          </section>
        )}
        {render(groups.process)}
        <OfferSpecialists offer={offer} pages={pages} locale={locale} />
        {render(groups.areas)}
        {document.localizedSections && (
          <ServiceSections
            nodes={presentServiceNodes(document.localizedSections)}
            context={{ ...context, sharedButtons: true }}
            prefix="localized"
          />
        )}
        {render(groups.faq)}
        {render(groups.closing)}
      </div>
    </CapturedPageFrame>
  );
}
