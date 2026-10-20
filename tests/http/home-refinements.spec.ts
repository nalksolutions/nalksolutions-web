import { createHash } from 'node:crypto';
import { test, expect } from '../local-test';
import provenance from '../../tooling/sources/home-hero-video.json' with { type: 'json' };

test('recovered homepage hero media has exact backup bytes and supports partial playback', async ({
  request,
}) => {
  const response = await request.get(provenance.publicPath);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('video/mp4');
  expect(
    createHash('sha256')
      .update(await response.body())
      .digest('hex'),
  ).toBe(provenance.sha256);
  const head = await request.head(provenance.publicPath);
  expect(head.status()).toBe(200);
  expect(await head.body()).toHaveLength(0);
  const range = await request.get(provenance.publicPath, { headers: { Range: 'bytes=0-1023' } });
  expect(range.status()).toBe(206);
  expect(range.headers()['content-range']).toBe(`bytes 0-1023/${provenance.bytes}`);
  expect((await range.body()).length).toBe(1024);
});
