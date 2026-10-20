import { test, expect } from '../local-test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { translationSchema } from '../../src/content/localization/schema';
import redirects from '../../src/content/localization/redirects.json' with { type: 'json' };
import index from '../../src/content/localization/listing-index.json' with { type: 'json' };
import source from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { inspectHtml } from './html';

const directory = 'src/content/localization/pages';
const records = readdirSync(directory)
  .filter((name) => name.endsWith('.json'))
  .map((name) =>
    translationSchema.parse(JSON.parse(readFileSync(path.join(directory, name), 'utf8'))),
  );
const ready = records.filter((item) => item.publication.ready);
const articles = index.articles.filter((item) =>
  ready.some((record) => record.entityId === item.entityId),
);

for (const record of ready) {
  const listing = record.listing;
  const members = listing
    ? articles.filter(
        (item) =>
          listing.family === 'blog' ||
          (listing.family === 'category'
            ? item.categories.includes(listing.basePath)
            : item.author === listing.basePath),
      )
    : null;
  const available =
    !listing ||
    listing.number <=
      Math.max(1, Math.ceil(members!.length / (listing.family === 'blog' ? 9 : 10)));
  test(`Arabic HTTP: ${record.entityId}`, async ({ request }) => {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(encodeURI(record.path), { method, maxRedirects: 0 });
      expect(response.status()).toBe(available ? 200 : 404);
      expect(response.headers()['content-type']).toContain('text/html');
      expect(response.headers()['x-robots-tag']).toContain('noindex');
      if (method === 'HEAD') {
        expect(await response.body()).toHaveLength(0);
        continue;
      }
      const body = await response.text();
      const html = inspectHtml(body);
      expect(html.lang).toBe('ar');
      expect(html.dir).toBe('rtl');
      if (!available) continue;
      expect(html.title).toBe(record.seo.title);
      const original = source.pages.find((page) => page.id === record.entityId)!;
      expect(html.canonical).toEqual(
        original.seo.canonical === null
          ? []
          : ['https://nalksolutions.com' + encodeURI(record.path)],
      );
      expect(html.headings).toHaveLength(1);
      expect(body).not.toMatch(/translation-review-banner|translation-pending|navigation-pending/u);
      if (members && !members.length) expect(html.meta('robots').join(',')).toContain('noindex');
    }
  });
}

test('Arabic compatibility: available targets are direct 301s for GET/HEAD and both slash forms', async ({
  request,
}) => {
  for (const rule of redirects.rules) {
    const available = ready.some((record) => record.path === rule.target);
    if (!available) continue;
    for (const method of ['GET', 'HEAD'])
      for (const source of [rule.source, rule.source.slice(0, -1)]) {
        const response = await request.fetch(encodeURI(source) + '?utm_source=proof&x=1', {
          method,
          maxRedirects: 0,
        });
        expect(response.status()).toBe(301);
        expect(response.headers().location).toBe(
          'https://nalksolutions.com' + encodeURI(rule.target) + '?utm_source=proof&x=1',
        );
        if (method === 'HEAD') expect(await response.body()).toHaveLength(0);
      }
  }
  expect((await request.get('/ar/blog/page/999/', { maxRedirects: 0 })).status()).toBe(404);
});
