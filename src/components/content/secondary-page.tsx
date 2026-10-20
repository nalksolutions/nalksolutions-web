import type { CSSProperties } from 'react';
import { entityId } from '../../content/localization/identity';
import type { ProofPage } from '../../content/schema';
import type { PageDocument } from '../../content/site/schema';
import assets from '../../content/secondary/assets.generated.json';
import { CapturedPageFrame } from './captured-page-frame';
import { DocumentBody, type ContentContext } from './document-body';

export function SecondaryPage({
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
  const background = assets[entityId(page) as keyof typeof assets];
  if (!document.secondaryLayout || !background)
    throw new Error('Missing reviewed secondary presentation');
  const style = {
    '--secondary-background': `url("${background.hero}")`,
    ...('portrait' in background
      ? { '--secondary-portrait': `url("${background.portrait}")` }
      : {}),
  } as CSSProperties;
  return (
    <CapturedPageFrame
      page={page}
      pages={pages}
      className={`listing-site secondary-site secondary-layout-${document.secondaryLayout}`}
      style={style}
    >
      <DocumentBody
        nodes={document.nodes}
        context={{ ...context, enquiryPlaceholders: true, sharedButtons: true }}
      />
    </CapturedPageFrame>
  );
}
