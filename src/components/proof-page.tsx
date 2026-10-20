import { SkipLink } from './site/skip-link';
import type { ProofPage as Page } from '../content/schema';
import { serializeJsonLd } from '../lib/seo/metadata';
import { ProofNavigation } from './proof-navigation';

export function ProofPage({ page, pages }: { page: Page; pages: readonly Page[] }) {
  return (
    <>
      <SkipLink />
      <header className="border-b border-slate-200 px-5 py-5 sm:px-8">
        <p className="mx-auto max-w-4xl font-semibold">Nalk Solutions · Local routing proof</p>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-4xl space-y-8 px-5 py-10 sm:px-8"
        data-page-id={page.id}
      >
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          lang="en"
          dir="ltr"
        >
          Source excerpts for routing verification. Full content and visual reconstruction remain
          pending.
        </div>
        <article className="space-y-5">
          <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
            {page.content.heading}
          </h1>
          {page.content.paragraphs.map((paragraph, index) => (
            <p key={index} className="leading-8" dir="auto">
              {paragraph}
            </p>
          ))}
        </article>
        <ProofNavigation current={page} pages={pages} />
      </main>
      {page.seo.jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
