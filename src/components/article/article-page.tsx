import { SkipLink } from '../site/skip-link';
import type { ProofPage } from '../../content/schema';
import type { ReactNode } from 'react';
import type { ArticlePresentation } from '../../content/articles/schema';
import { serializeJsonLd } from '../../lib/seo/metadata';
import { PUBLIC_ORIGIN } from '../../lib/env/config';
import { SiteHeader } from '../site/site-header';
import { SiteFooter } from '../site/site-footer';
import { ArticleBody } from './article-body';
import { ArticleImage } from './article-image';
import { ArticleSharing } from './article-sharing';
import { ArticleAdjacent } from './article-adjacent';
import { ArticleRelated } from './article-related';
import { ArticleLink } from './article-link';
import assets from '../../content/articles/assets.generated.json';
import { offerForArticle } from '../../content/journey/articles';
import { OfferBridge } from '../journey/offer-links';
import { entityId } from '../../content/localization/identity';
import { arabicDateLabel } from '../../content/localization/format';
import { arabicOnlyArticleOffers } from '../../content/journey/arabic';
import { offers } from '../../content/journey/offers';

export function ArticlePage({ page, pages }: { page: ProofPage; pages: readonly ProofPage[] }) {
  const article = page.content.article;
  if (!article) throw new Error('Article page requires resolved content');
  return (
    <ArticleLayout page={page} pages={pages} presentation={article.presentation}>
      <ArticleBody nodes={article.body} />
    </ArticleLayout>
  );
}

/** One source-derived template for both recovered and CMS-independent article bodies. */
export function ArticleLayout({
  page,
  pages,
  presentation,
  children,
  recovered = false,
}: {
  page: ProofPage;
  pages: readonly ProofPage[];
  presentation: ArticlePresentation;
  children: ReactNode;
  recovered?: boolean;
}) {
  const navigation = { locale: page.locale, pages };
  const categories = [presentation.category, ...(presentation.additionalCategories ?? [])];
  const offer =
    page.locale === 'en' || page.localization
      ? (offerForArticle(entityId(page)) ??
        (page.locale === 'ar'
          ? offers.find((offer) => offer.id === arabicOnlyArticleOffers[entityId(page)])
          : undefined))
      : undefined;
  return (
    <div className="marketing-site floating-shell article-site" id="top">
      <SkipLink locale={page.locale} />
      <SiteHeader pages={pages} locale={page.locale} currentPath={page.path} />
      <main id="main-content" tabIndex={-1} data-page-id={page.id}>
        <article>
          <header className="article-heading">
            {categories.length === 1 ? (
              <ArticleLink
                navigation={navigation}
                className="article-category"
                href={presentation.category.href}
              >
                {presentation.category.label}
              </ArticleLink>
            ) : (
              <div className="article-categories">
                {categories.map((category) => (
                  <ArticleLink
                    navigation={navigation}
                    className="article-category"
                    href={category.href}
                    key={category.href}
                  >
                    {category.label}
                  </ArticleLink>
                ))}
              </div>
            )}
            <h1>{page.content.heading}</h1>
            <p className="article-excerpt">{presentation.excerpt}</p>
            <p className="article-date">
              {page.locale === 'ar'
                ? arabicDateLabel(presentation.dateLabel)
                : presentation.dateLabel}
            </p>
            <div className="article-featured">
              <ArticleImage image={presentation.featured} priority />
            </div>
          </header>
          <div className="article-body-layout">
            <ArticleSharing
              url={page.seo.canonical ?? new URL(page.path, PUBLIC_ORIGIN).href}
              title={page.content.heading}
              locale={page.locale}
            />
            <div
              className="article-body"
              data-article-body
              data-document-body={recovered ? true : undefined}
            >
              {children}
            </div>
          </div>
          {offer && <OfferBridge offer={offer} pages={pages} locale={page.locale} />}
          <ArticleAdjacent links={presentation.adjacent} navigation={navigation} />
        </article>
        <ArticleRelated posts={presentation.related} navigation={navigation} />
      </main>
      <SiteFooter
        pages={pages}
        mobileBackground={assets.footer.mobile}
        copyright={presentation.footer}
        locale={page.locale}
      />
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
