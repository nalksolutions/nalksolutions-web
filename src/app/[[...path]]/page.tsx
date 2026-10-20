import { ProofPage } from '../../components/proof-page';
import { HomePage } from '../../components/home/home-page';
import { ArticlePage } from '../../components/article/article-page';
import { ContentPage } from '../../components/content/content-page';
import { getRequestContent } from '../../lib/routing/request-page';
import { pageMetadata } from '../../lib/seo/metadata';
import { selectListingView, type PublicSearchParams } from '../../content/site/listing-view';

export async function generateMetadata() {
  const { page, pages } = await getRequestContent();
  return pageMetadata(page, pages);
}

export default async function PublicPage({
  searchParams,
}: {
  searchParams: Promise<PublicSearchParams>;
}) {
  const { page, pages, document } = await getRequestContent();
  if (page.content.article) return <ArticlePage page={page} pages={pages} />;
  if (page.sourceRouteId === 'R-91d9b62648d713d4' && (page.path === '/' || page.path === '/ar/')) {
    return <HomePage page={page} pages={pages} />;
  }
  if (document)
    return (
      <ContentPage
        page={page}
        pages={pages}
        document={selectListingView(document, await searchParams)}
      />
    );
  return <ProofPage page={page} pages={pages} />;
}
