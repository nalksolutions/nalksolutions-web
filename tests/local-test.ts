import { test as base, type BrowserContext, type Request } from '@playwright/test';
import { PUBLIC_ORIGIN } from '../src/lib/env/config';
export * from '@playwright/test';

const methods = new Set(['fetch', 'get', 'head', 'post', 'put', 'patch', 'delete']);
const approvedHost = new URL(PUBLIC_ORIGIN).hostname;
const isPublic = (url: URL) => url.hostname.replace(/^www\./u, '') === approvedHost;

export async function installLocalNetworkGuard(
  context: BrowserContext,
  baseURL = `http://127.0.0.1:${process.env.TEST_PORT ?? '3100'}`,
) {
  const origin = new URL(baseURL).origin;
  const localURL = (url: URL) => {
    if (url.origin !== origin && !isPublic(url))
      throw new Error(`Verification cannot follow an external destination: ${url.origin}`);
    return new URL(url.pathname + url.search, baseURL).href;
  };
  await context.route('**/*', async (route) => {
    const request = route.request();
    const original = new URL(request.url());
    if (!request.isNavigationRequest() && !isPublic(original)) {
      await route.continue();
      return;
    }
    let destination = localURL(original);
    const headers = { ...request.headers() };
    for (const name of ['host', 'connection', 'content-length']) delete headers[name];
    for (let hop = 0; hop < 10; hop++) {
      const response = await context.request.fetch(destination, {
        method: request.method(),
        headers,
        ...(request.postDataBuffer() ? { data: request.postDataBuffer()! } : {}),
        maxRedirects: 0,
      });
      const location = response.headers().location;
      if ([301, 302, 303, 307, 308].includes(response.status()) && location) {
        destination = localURL(new URL(location, destination));
        await response.dispose();
        continue;
      }
      if (request.isNavigationRequest() && destination !== original.href) {
        // Resolve the complete canonical chain locally before returning a browser
        // hop: browser routing does not re-intercept every redirected request.
        await response.dispose();
        await route.fulfill({
          status: 307,
          headers: { location: destination, 'x-local-test-redirect': '1' },
          body: '',
        });
      } else {
        await route.fulfill({ response });
        await response.dispose();
      }
      return;
    }
    throw new Error('Local verification redirect chain exceeded ten hops');
  });
}

/** Canonical redirects must never send a verification client onto the live website. */
export const test = base.extend({
  context: async ({ context, baseURL }, provide) => {
    if (!baseURL) throw new Error('Local test baseURL is required');
    await installLocalNetworkGuard(context, baseURL);
    await provide(context);
  },
  request: async ({ request, baseURL }, provide) => {
    if (!baseURL) throw new Error('Local test baseURL is required');
    const localOnly = new Proxy(request, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        if (typeof value !== 'function') return value;
        if (typeof key === 'string' && methods.has(key))
          return (input: string | URL | Request, options: Record<string, unknown> = {}) => {
            const url = new URL(
              typeof input === 'string' || input instanceof URL ? String(input) : input.url(),
              baseURL,
            );
            const local = isPublic(url) ? new URL(url.pathname + url.search, baseURL).href : input;
            const inherited =
              typeof input !== 'string' && !(input instanceof URL) && isPublic(url)
                ? {
                    method: input.method(),
                    headers: input.headers(),
                    ...(input.postDataBuffer() ? { data: input.postDataBuffer() } : {}),
                  }
                : {};
            return value.call(target, local, { ...inherited, ...options, maxRedirects: 0 });
          };
        return value.bind(target);
      },
    });
    await provide(localOnly);
  },
});
