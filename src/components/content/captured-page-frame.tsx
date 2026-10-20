import { SkipLink } from '../site/skip-link';
import type { CSSProperties, ReactNode } from 'react';
import type { ProofPage } from '../../content/schema';
import { serializeJsonLd } from '../../lib/seo/metadata';
import assets from '../../content/articles/assets.generated.json';
import { SiteHeader } from '../site/site-header';
import { SiteFooter } from '../site/site-footer';

/** Shared header/footer frame for reconstructed complete-main documents. */
export function CapturedPageFrame({
  page,
  pages,
  className,
  style,
  children,
  beforeDocument,
  afterDocument,
}: {
  page: ProofPage;
  pages: readonly ProofPage[];
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  beforeDocument?: ReactNode;
  afterDocument?: ReactNode;
}) {
  return (
    <div className={`marketing-site floating-shell ${className}`} style={style} id="top">
      <SkipLink locale={page.locale} />
      <SiteHeader pages={pages} locale={page.locale} currentPath={page.path} />
      <main id="main-content" tabIndex={-1} data-page-id={page.id}>
        {beforeDocument}
        <div data-document-body>{children}</div>
        {afterDocument}
      </main>
      <SiteFooter pages={pages} locale={page.locale} mobileBackground={assets.footer.mobile} />
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
