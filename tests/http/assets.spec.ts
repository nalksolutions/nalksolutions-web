import { expect, test } from '../local-test';
import { createHash } from 'node:crypto';
import assets from '../../src/content/home/assets.generated.json' with { type: 'json' };
import articleAssets from '../../src/content/articles/assets.generated.json' with { type: 'json' };
import siteAssets from '../../src/content/site/assets.generated.json' with { type: 'json' };

test('public assets retain exact source bytes and HEAD semantics', async ({ request }) => {
  test.setTimeout(180_000);
  const unique = new Map(
    [...assets.images, ...assets.fonts, ...articleAssets.images, ...siteAssets].map((asset) => [
      asset.path,
      asset,
    ]),
  );
  for (const asset of unique.values()) {
    const response = await request.get(asset.path);
    expect(response.status(), asset.path).toBe(200);
    expect(
      createHash('sha256')
        .update(await response.body())
        .digest('hex'),
      asset.path,
    ).toBe(asset.sha256);
    const head = await request.head(asset.path);
    expect(head.status(), asset.path).toBe(200);
    expect(await head.body()).toHaveLength(0);
    expect(head.headers()['content-type']).toBe(response.headers()['content-type']);
  }
  const encoded = siteAssets.find((asset) => encodeURI(asset.path) !== asset.path);
  if (!encoded) throw new Error('Missing encoded asset contract sample');
  const lowerEscapes = encodeURI(encoded.path).replace(/%[A-F0-9]{2}/gu, (escape) =>
    escape.toLowerCase(),
  );
  expect((await request.get(lowerEscapes)).status()).toBe(200);
  for (const path of [
    '/fonts/not-published.woff2',
    '/wp-content/uploads/missing.png',
    '/wp-content/uploads/../themes/softy-solutions/style.css',
  ]) {
    expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(404);
  }
});
