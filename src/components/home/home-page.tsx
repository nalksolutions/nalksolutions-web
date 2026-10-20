import { SkipLink } from '../site/skip-link';
import type { ProofPage } from '../../content/schema';
import { serializeJsonLd } from '../../lib/seo/metadata';
import { SiteHeader } from '../site/site-header';
import { SiteFooter } from '../site/site-footer';
import { HomeHero } from './home-hero';
import { HomeIntroduction, HomeBrands } from './home-introduction';
import { HomeServices } from './home-services';
import { HomeMarquee } from './home-marquee';
import { HomeFeatures } from './home-features';
import { HomeBenefits } from './home-benefits';
import { HomeTestimonials } from './home-testimonials';
import { HomeStats, HomeFaq, HomeCallToAction } from './home-closing';
import content from '../../content/home/home.generated.json';

export function HomePage({ page, pages }: { page: ProofPage; pages: readonly ProofPage[] }) {
  return (
    <div className="marketing-site" id="top">
      <SkipLink locale={page.locale} />
      <SiteHeader pages={pages} locale={page.locale} currentPath={page.path} />
      <main id="main-content" tabIndex={-1} data-page-id={page.id}>
        <HomeHero page={page} />
        <HomeBrands locale={page.locale} />
        <HomeServices pages={pages} locale={page.locale} />
        <HomeIntroduction locale={page.locale} />
        <HomeMarquee locale={page.locale} />
        <HomeFeatures pages={pages} locale={page.locale} />
        <HomeBenefits locale={page.locale} />
        <HomeTestimonials locale={page.locale} />
        <HomeStats locale={page.locale} />
        <HomeFaq locale={page.locale} />
        <HomeCallToAction locale={page.locale} />
      </main>
      <SiteFooter locale={page.locale} pages={pages} />
      {(page.localization ? page.seo.jsonLd : content.jsonLd).map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </div>
  );
}
