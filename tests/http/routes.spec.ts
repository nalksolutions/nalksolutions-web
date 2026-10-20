import { expect, test } from '../local-test';
import register from '../../docs/registers/legacy-rules.json' with { type: 'json' };
import routes from '../../docs/registers/routes.json' with { type: 'json' };
import source from '../../src/content/site/pages.generated.json' with { type: 'json' };
import recovery from '../../tooling/sources/site-recovery.generated.json' with { type: 'json' };
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { documentSchema } from '../../src/content/site/schema';
import { validateDataset } from '../../src/content/schema';
import { encodePublicPath } from '../../src/lib/routing/path';
import { inspectHtml } from './html';
import home from '../../src/content/home/home.generated.json' with { type: 'json' };
import article from '../../src/content/articles/api.generated.json' with { type: 'json' };
import editorial from '../../docs/page-reviews/customer-journey-editorial.json' with { type: 'json' };
import { expectRevisedContent } from './journey-contract';

const { pages } = validateDataset(source);

for (const { id, observed } of routes.routes.filter(({ observed }) =>
  [301, 410].includes(observed.initial_status),
)) {
  test(`${id}: captured non-200 disposition`, async ({ request }) => {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(observed.path, { method, maxRedirects: 0 });
      expect(response.status()).toBe(observed.initial_status);
      if (observed.initial_status === 301)
        expect(response.headers()['location']).toBe(observed.redirect_chain[0]?.location);
      if (method === 'HEAD') expect(await response.body()).toHaveLength(0);
    }
  });
}

for (const { id, observed } of register.rules) {
  test(`${id}: exact legacy GET and HEAD`, async ({ request }) => {
    const url = new URL(observed.source_url);
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(url.pathname + url.search, { method, maxRedirects: 0 });
      expect(response.status()).toBe(observed.expected_status);
      expect(response.headers()['content-type']).toContain('text/html');
      expect(response.headers()['x-robots-tag']).toContain('noindex');
      if (observed.expected_status === 301)
        expect(response.headers()['location']).toBe(observed.target_url);
      else {
        expect(response.headers()['content-type']).toContain('text/html');
        if (method === 'GET') expect(await response.text()).toContain('Page removed');
      }
      if (method === 'HEAD') expect(await response.body()).toHaveLength(0);
    }
  });
}

for (const page of pages) {
  test(`${page.sourceRouteId}: raw server content and SEO`, async ({ request }) => {
    const pathname = encodePublicPath(page.path);
    const response = await request.get(pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    expect(response.headers()['x-robots-tag']).toContain('noindex');
    const html = inspectHtml(await response.text());
    expect(html.title).toBe(page.seo.title);
    expect(html.lang).toBe(page.locale === 'ar' ? 'ar' : 'en-US');
    expect(html.dir).toBe(page.locale === 'ar' ? 'rtl' : 'ltr');
    const document = recovery.pages.find((item) => item.id === page.id);
    expect(html.headings).toEqual(
      page.path === '/about-us/'
        ? [' A technology company in Saudi Arabia.']
        : page.path === '/contacts/'
          ? ['Contact Us Online']
          : document
            ? document.headings.filter((item) => item.tag === 'h1').map((item) => item.text)
            : [page.content.heading],
    );
    if (document) {
      expect(html.documentBodyText).not.toBeNull();
      if (editorial.pages.some((item) => item.id === page.id)) {
        expectRevisedContent(page.id, html.documentBodyText ?? '');
      } else
        expect(
          createHash('sha256')
            .update(html.documentBodyText ?? '')
            .digest('hex'),
        ).toBe(document.renderTextSha256);
      if (document.family === 'article') {
        const content = documentSchema.parse(
          JSON.parse(readFileSync(`src/content/site/documents/${page.id}.json`, 'utf8')),
        );
        const presentation = content.article;
        if (!presentation) throw new Error('Missing article presentation');
        expect(html.articleCategories).toEqual([
          presentation.category,
          ...(presentation.additionalCategories ?? []),
        ]);
        expect(html.articleExcerpt).toEqual([presentation.excerpt]);
        expect(html.articleDate).toEqual([presentation.dateLabel]);
        expect(html.articleAdjacentTitles).toEqual(presentation.adjacent.map((link) => link.title));
        expect(html.articleRelatedTitles).toEqual(presentation.related.map((post) => post.title));
        expect(html.articleFeaturedImages).toEqual([
          { src: encodeURI(presentation.featured.src), alt: presentation.featured.alt },
        ]);
        expect(html.articleShareLinks).toHaveLength(4);
        for (const share of html.articleShareLinks) {
          const target = new URL(share.href ?? '');
          const parameter =
            share.label === 'Share via Facebook'
              ? 'u'
              : share.label === 'Share via email'
                ? 'body'
                : 'url';
          expect(target.searchParams.get(parameter)).toBe(
            page.seo.canonical ?? new URL(page.path, 'https://nalksolutions.com').href,
          );
          if (share.label === 'Share via X')
            expect(target.searchParams.get('text')).toBe(page.content.heading);
          if (share.label === 'Share via email')
            expect(target.searchParams.get('subject')).toBe(page.content.heading);
        }
      }
    }
    // Full article text is independently reconciled in article.spec.ts; old excerpts
    // included popup copy outside the body and are no longer the article expectation.
    if (!page.content.articleId && !page.content.documentId) {
      for (const paragraph of page.content.paragraphs) {
        // Owner-requested removal of the duplicated homepage introduction.
        if (
          page.path === '/' &&
          [home.intro, home.tagline, home.about[0]!.map((part) => part.text).join('')].includes(
            paragraph,
          )
        )
          expect(html.paragraphs).not.toContain(paragraph);
        else expect(html.paragraphs).toContain(paragraph);
      }
    }
    expect(html.canonical).toEqual(page.seo.canonical ? [page.seo.canonical] : []);
    expect(html.meta('description')).toEqual(page.seo.description ? [page.seo.description] : []);
    expect(html.meta('robots')).toEqual(page.seo.robots ? [page.seo.robots] : []);
    for (const field of [
      'og:title',
      'og:description',
      'og:url',
      'og:locale',
      'twitter:title',
      'twitter:description',
    ]) {
      const expected = page.seo.social.find(({ property }) => property === field);
      if (expected) expect(html.meta(field), field).toEqual([expected.content]);
    }
    expect(html.schemas).toEqual(
      page.path === '/'
        ? home.jsonLd
        : page.content.articleId
          ? article.seo.jsonLd
          : page.seo.jsonLd,
    );
    const head = await request.head(pathname);
    expect(head.status()).toBe(200);
    expect(await head.body()).toHaveLength(0);
    if (pathname !== '/') {
      const variant = await request.get(pathname.slice(0, -1), { maxRedirects: 0 });
      expect(variant.status()).toBe(301);
      expect(variant.headers()['location']).toBe(`https://nalksolutions.com${pathname}`);
    }
  });
}

test('known chains remain local and preserve recorded Locations', async ({ request }) => {
  for (const [start, target, finalStatus] of [
    ['/contact-us/', 'https://nalksolutions.com/contacts/', 200],
    ['/services/startup-growth-consulting/', 'https://nalksolutions.com/', 200],
    ['/arbic/', 'https://nalksolutions.com/arabic/', 410],
  ] as const) {
    const first = await request.get(start, { maxRedirects: 0 });
    expect(first.status()).toBe(301);
    expect(first.headers()['location']).toBe(target);
    const destination = new URL(target);
    expect(destination.origin).toBe('https://nalksolutions.com');
    const last = await request.get(destination.pathname, { maxRedirects: 0 });
    expect(last.status()).toBe(finalStatus);
  }
});

test('unknown, reserved and malformed routes never become successful pages', async ({
  request,
}) => {
  for (const pathname of [
    '/missing/',
    '/missing',
    '/en/',
    '/ar/',
    '/api/private/',
    '/studio/',
    '/_internal/render/',
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/wp-content/themes/softy-solutions/style.css',
    '/%252F/',
  ]) {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(pathname, { method, maxRedirects: 0 });
      expect(response.status(), pathname).toBe(404);
      if (method === 'HEAD') expect(await response.body()).toHaveLength(0);
    }
  }
  for (const [pathname, status] of [
    ['/%ZZ/', 400],
    ['/%2F/', 404],
    ['/%5C/', 404],
    ['/%00/', 400],
  ] as const) {
    expect((await request.get(pathname, { maxRedirects: 0 })).status(), pathname).toBe(status);
  }
});

test('case/query flags, trusted routing headers and canonical origin', async ({ request }) => {
  expect((await request.get('/CONTACT-US', { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get('/CART/', { maxRedirects: 0 })).status()).toBe(404);
  expect((await request.get('/cart/?utm_source=proof', { maxRedirects: 0 })).status()).toBe(404);
  expect((await request.get('/contact-us/?utm_source=proof', { maxRedirects: 0 })).status()).toBe(
    404,
  );
  const response = await request.get('/contacts/?utm_source=proof', {
    headers: {
      'x-nalk-public-path': '/',
      host: 'attacker.invalid',
      'x-forwarded-host': 'attacker.invalid',
    },
  });
  expect(response.status()).toBe(200);
  const html = inspectHtml(await response.text());
  expect(html.title).toBe('Contacts - Nalk Solutions');
  expect(html.canonical).toEqual(['https://nalksolutions.com/contacts/']);
});

test('local robots explicitly disallows indexing', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('Disallow: /');
  expect(response.headers()['x-robots-tag']).toContain('noindex');
});
