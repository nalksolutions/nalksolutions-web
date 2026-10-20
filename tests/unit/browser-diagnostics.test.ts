import { describe, expect, it } from 'vitest';
import { isNavigationCancellation } from '../browser/diagnostics';

const observed = {
  url: 'http://127.0.0.1:3100/blog/?cmsmasters-page-c1619d2=3&_rsc=token',
  currentUrl: 'http://127.0.0.1:3100/blog/?cmsmasters-page-c1619d2=4',
  reason: 'net::ERR_ABORTED',
  resourceType: 'fetch',
  allowedPaths: ['/blog/'],
};
describe('browser failure evidence', () => {
  it('recognizes only explicit same-origin RSC navigation cancellations', () => {
    for (const reason of ['net::ERR_ABORTED', 'NS_BINDING_ABORTED', 'cancelled'])
      expect(isNavigationCancellation({ ...observed, reason })).toBe(true);
  });
  it('never classifies required assets, other routes, origins or failures as navigation cancellations', () => {
    for (const change of [
      { resourceType: 'image' },
      { resourceType: 'font' },
      { resourceType: 'stylesheet' },
      { resourceType: 'script' },
      { reason: 'net::ERR_FAILED' },
      { allowedPaths: ['/contacts/'] },
      { url: 'http://127.0.0.1:3100/blog/' },
      { url: 'http://127.0.0.1:3100/other/?_rsc=token' },
      { url: 'https://external.example/blog/?_rsc=token' },
    ])
      expect(isNavigationCancellation({ ...observed, ...change })).toBe(false);
  });
});
