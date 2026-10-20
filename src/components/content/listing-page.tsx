import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import assets from '../../content/listings/assets.generated.json';
import { CapturedPageFrame } from './captured-page-frame';
import { DocumentBody, type ContentContext } from './document-body';
import { Fragment, type CSSProperties } from 'react';
import { BlogTopics } from '../journey/blog-topics';

export function ListingPage({
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
  if (!document.listingLayout) throw new Error('Listing page requires a reviewed layout');
  const style = {
    '--listing-background': `url("${assets.backgrounds[document.listingLayout]}")`,
  } as CSSProperties;
  return (
    <CapturedPageFrame
      page={page}
      pages={pages}
      className={`listing-site listing-layout-${document.listingLayout}`}
      style={style}
    >
      {document.nodes.map((node, index) => (
        <Fragment key={index}>
          <DocumentBody
            nodes={[node]}
            prefix={`listing-${index}`}
            context={{ ...context, searchAppearance: 'listing', sharedButtons: true }}
          />
          {document.listingLayout === 'blog' &&
            node.type === 'element' &&
            node.variant === 'listing-hero' && (
              <div data-journey-supplement>
                <BlogTopics pages={context.searchable} locale={context.locale} />
              </div>
            )}
        </Fragment>
      ))}
    </CapturedPageFrame>
  );
}
