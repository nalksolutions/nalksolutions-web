import { entityId } from '../../content/localization/identity';
import { SkipLink } from '../site/skip-link';
import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import { serializeJsonLd } from '../../lib/seo/metadata';
import { SiteHeader } from '../site/site-header';
import { SiteFooter } from '../site/site-footer';
import { DocumentBody } from './document-body';
import { ArticleLayout } from '../article/article-page';
import { ServicePage } from './service-page';
import { CompanyPage } from './company-page';
import { ListingPage } from './listing-page';
import { SecondaryPage } from './secondary-page';

export function ContentPage({
  page,
  pages,
  document,
}: {
  page: ProofPage;
  pages: readonly ProofPage[];
  document: PageDocument;
}) {
  const searchable = pages
    .filter((item) => item.locale === page.locale && !item.seo.robots?.includes('noindex'))
    .map((item) => ({
      id: item.id,
      entityId: entityId(item),
      title: item.seo.title,
      path: item.path,
      locale: item.locale,
    }));
  const identities = pages.map((item) => ({
    path: item.path,
    locale: item.locale,
    entityId: entityId(item),
  }));
  if (document.secondaryLayout)
    return (
      <SecondaryPage
        page={page}
        pages={pages}
        document={document}
        context={{
          locale: page.locale,
          localized: Boolean(page.localization),
          identities,
          searchable,
        }}
      />
    );
  if (document.listingLayout)
    return (
      <ListingPage
        page={page}
        pages={pages}
        document={document}
        context={{
          locale: page.locale,
          localized: Boolean(page.localization),
          identities,
          searchable,
        }}
      />
    );
  if (document.companyLayout)
    return (
      <CompanyPage
        page={page}
        pages={pages}
        document={document}
        context={{
          locale: page.locale,
          localized: Boolean(page.localization),
          identities,
          searchable,
        }}
      />
    );
  if (document.serviceLayout)
    return (
      <ServicePage
        page={page}
        pages={pages}
        document={document}
        context={{
          locale: page.locale,
          localized: Boolean(page.localization),
          identities,
          searchable,
        }}
      />
    );
  if (document.article) {
    return (
      <ArticleLayout page={page} pages={pages} presentation={document.article} recovered>
        <DocumentBody
          nodes={document.nodes}
          context={{
            locale: page.locale,
            localized: Boolean(page.localization),
            identities,
            searchable,
          }}
        />
      </ArticleLayout>
    );
  }
  return (
    <div className={`marketing-site content-site content-family-${document.family}`} id="top">
      <SkipLink locale={page.locale} />
      <SiteHeader pages={pages} locale={page.locale} currentPath={page.path} />
      <main id="main-content" data-page-id={page.id} tabIndex={-1}>
        <div data-document-body>
          <DocumentBody
            nodes={document.nodes}
            context={{
              locale: page.locale,
              localized: Boolean(page.localization),
              identities,
              searchable,
            }}
          />
        </div>
      </main>
      <SiteFooter pages={pages} locale={page.locale} />
      {page.seo.jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </div>
  );
}
