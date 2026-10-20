import { entityId } from '../../content/localization/identity';
import type { ProofPage } from '../../content/schema';
import type { PageDocument, DocumentNode } from '../../content/site/schema';
import { aboutNodes } from '../../content/journey/company-content';
import { DocumentBody, type ContentContext } from '../content/document-body';
import { JourneyContact } from './offer-links';
import { ButtonLink } from '../site/button-link';
import { aboutServices } from '../../content/journey/pages';
import { corePages } from '../../content/journey/pages';
import { ContactJourney } from './contact-journey';
import { journeyArabic as ar } from '../../content/localization/copy';

export function CompanyJourney({
  page,
  document,
  context,
}: {
  page: ProofPage;
  document: PageDocument;
  context: ContentContext;
}) {
  const render = (nodes: readonly DocumentNode[], prefix: string) => (
    <DocumentBody
      nodes={nodes}
      prefix={prefix}
      context={{ ...context, sharedButtons: true, enquiryPlaceholders: true }}
    />
  );
  if (entityId(page) === corePages.about) {
    const nodes = context.localized ? document.nodes : aboutNodes(document.nodes);
    const arabic = context.locale === 'ar';
    return (
      <div data-journey-page="about">
        {nodes.map((node, index) => {
          if (node.type === 'element' && node.variant === 'company-showcase') return null;
          if (node.type === 'element' && node.variant === 'company-offerings')
            return (
              <section
                className="journey-section journey-about-summary home-glass-card"
                key={index}
              >
                <p className="section-label">{arabic ? ar.aboutServicesBadge : 'What we offer'}</p>
                <h2 className="gradient-text">
                  {arabic ? ar.aboutServicesHeading : 'Explore Our Services'}
                </h2>
                {(arabic ? ar.aboutServices : aboutServices).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ButtonLink href={arabic ? '/ar/our-services/' : '/our-services/'}>
                  {arabic ? ar.aboutServicesHeading : 'Explore Our Services'}
                </ButtonLink>
              </section>
            );
          return <div key={index}>{render([node], `about-${index}`)}</div>;
        })}
        <JourneyContact locale={context.locale} />
      </div>
    );
  }
  return <ContactJourney document={document} context={context} />;
}
