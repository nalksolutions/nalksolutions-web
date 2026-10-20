import { entityId } from '../../content/localization/identity';
import type { CSSProperties } from 'react';
import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import assets from '../../content/company/assets.generated.json';
import { CapturedPageFrame } from './captured-page-frame';
import { DocumentBody, type ContentContext } from './document-body';
import { ServicesOverview } from '../journey/services-overview';
import { CompanyJourney } from '../journey/company-journey';
import { corePages } from '../../content/journey/pages';

export function CompanyPage({
  page,
  pages,
  document,
  context,
}: {
  page: ProofPage;
  pages: readonly ProofPage[];
  document: PageDocument;
  context: ContentContext;
}) {
  if (!document.companyLayout) throw new Error('Company page requires a reviewed layout');
  const style = Object.fromEntries(
    Object.entries(assets.roles).map(([role, path]) => [`--company-${role}`, `url("${path}")`]),
  ) as CSSProperties;
  return (
    <CapturedPageFrame
      page={page}
      pages={pages}
      style={style}
      className={`company-site company-layout-${document.companyLayout}`}
    >
      {entityId(page) === corePages.services ? (
        <ServicesOverview pages={pages} locale={page.locale} />
      ) : entityId(page) === corePages.about || entityId(page) === corePages.contact ? (
        <CompanyJourney page={page} document={document} context={context} />
      ) : (
        <DocumentBody
          nodes={document.nodes}
          context={{
            ...context,
            enquiryPlaceholders: true,
            sharedButtons: true,
          }}
        />
      )}
    </CapturedPageFrame>
  );
}
