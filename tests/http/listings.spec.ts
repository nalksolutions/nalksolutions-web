import { createHash } from 'node:crypto';
import { expect, test } from '../local-test';
import source from '../../tooling/sources/blog-query-recovery.generated.json' with { type: 'json' };
import { inspectHtml } from './html';

for (const view of source.pages) {
  test(`Blog query page ${view.page}: server content, canonical and HEAD`, async ({ request }) => {
    const path = `/blog/?cmsmasters-page-c1619d2=${view.page}`;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
    const text = await response.text();
    const html = inspectHtml(text);
    expect(html.title).toBe(view.title);
    expect(html.canonical).toEqual([view.canonical]);
    for (const key of ['description', 'robots', 'googlebot'] as const)
      expect(html.meta(key)).toEqual(view.seo[key] ? [view.seo[key]] : []);
    for (const { property, content } of view.seo.social)
      expect(html.meta(property)).toContain(content);
    expect(html.schemas).toEqual(view.seo.jsonLd);
    expect(
      createHash('sha256')
        .update(html.documentBodyText ?? '')
        .digest('hex'),
    ).toBe(view.renderTextSha256);
    expect(text.match(/<article\b/gu) ?? []).toHaveLength(view.cards.length);
    for (const card of view.cards) expect(text).toContain(`id="${card}"`);
    const head = await request.head(path);
    expect(head.status()).toBe(200);
    expect(head.headers()['content-type']).toContain('text/html');
    expect(await head.body()).toHaveLength(0);
  });
}
