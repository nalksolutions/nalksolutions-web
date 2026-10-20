import { entityId } from '../../content/localization/identity';
import { offerCopy } from '../../content/localization/copy';
import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import type { ContentContext } from './document-body';
import { ServiceSections } from './service-sections';
import { CapturedPageFrame } from './captured-page-frame';
import { presentServiceNodes, serviceTheme } from '../../content/services/presentation';
import { offerForService, offers } from '../../content/journey/offers';
import { arabicOnlyServiceParents } from '../../content/journey/arabic';
import { OfferPage } from '../journey/offer-page';
import { OfferBridge, JourneyContact } from '../journey/offer-links';

/** Redesigned service family; immutable source documents retain their content and links. */
export function ServicePage({
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
  if (!document.serviceLayout) throw new Error('Service page requires a service layout');
  const offer =
    page.locale === 'en' || page.localization
      ? (offerForService(entityId(page)) ??
        (page.locale === 'ar'
          ? offers.find((offer) => offer.id === arabicOnlyServiceParents[entityId(page)])
          : undefined))
      : undefined;
  if (offer?.pageId === entityId(page))
    return (
      <OfferPage
        page={page}
        pages={pages}
        document={document}
        context={context}
        offer={offerCopy(offer, page.locale)}
      />
    );
  const theme = serviceTheme(entityId(page));
  const presentationContext = { ...context, sharedButtons: true };
  return (
    <CapturedPageFrame
      page={page}
      pages={pages}
      className={`service-site service-theme-${theme}${offer ? ' journey-specialist-page' : ''}`}
      beforeDocument={
        offer && <OfferBridge offer={offer} pages={pages} specialist locale={page.locale} />
      }
      afterDocument={offer && <JourneyContact compact locale={page.locale} />}
    >
      <ServiceSections
        nodes={presentServiceNodes(document.nodes)}
        context={presentationContext}
        theme={theme}
      />
    </CapturedPageFrame>
  );
}
