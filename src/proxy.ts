import { NextResponse, type NextRequest } from 'next/server';
import { readPageDocument, readPublishedPages } from './content/repository';
import { PUBLIC_PATH_HEADER } from './lib/env/config';
import { decodePublicPath, InvalidPathError } from './lib/routing/path';
import { resolveLegacy, resolvePage, type RouteResult } from './lib/routing/resolve';
import { statusResponse } from './lib/routing/status-response';
import assets from './content/home/assets.generated.json';
import articleAssets from './content/articles/assets.generated.json';
import siteAssets from './content/site/assets.generated.json';
import { brandIcons } from './content/home/brand';
import { homeHeroVideoPath } from './content/home/media';
import font from './content/localization/font.json';
import { resolveLocalizedRedirect } from './content/localization/redirect';

const publicAssets = new Set(
  [...assets.images, ...assets.fonts, ...articleAssets.images, ...siteAssets].map(
    (asset) => asset.path,
  ),
);
publicAssets.add(homeHeroVideoPath);
publicAssets.add(font.path);
publicAssets.add(font.licensePath);
for (const icon of [...brandIcons.icon, ...brandIcons.apple]) publicAssets.add(icon.url);

function routeResponse(result: Exclude<RouteResult, { kind: 'page' }>, method: string): Response {
  if (result.kind === 'redirect') {
    return new Response(null, {
      status: 301,
      headers: {
        Location: result.location,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }
  return statusResponse(result.status, method);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  try {
    const decodedPath = decodePublicPath(pathname);
    const legacy = resolveLegacy(pathname, search);
    if (legacy && legacy.kind !== 'page') return routeResponse(legacy, request.method);

    // Exact legacy rules are checked first, including the literal theme-asterisk rule.
    if (
      pathname.startsWith('/_next/') ||
      pathname === '/robots.txt' ||
      publicAssets.has(decodedPath)
    ) {
      // Next's static-file lookup uses the encoded filename. Resolve equivalent
      // lowercase escapes internally without introducing a public redirect.
      const assetPath = encodeURI(decodedPath);
      const assetUrl = request.nextUrl.clone();
      assetUrl.pathname = assetPath;
      const response =
        publicAssets.has(decodedPath) && pathname !== assetPath
          ? NextResponse.rewrite(assetUrl)
          : NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }

    const pages = await readPublishedPages();
    const localizedRedirect = resolveLocalizedRedirect(pathname, search, pages);
    if (localizedRedirect) return routeResponse(localizedRedirect, request.method);
    const result = resolvePage(pathname, pages);
    if (result.kind !== 'page')
      return result.kind === 'redirect'
        ? routeResponse(result, request.method)
        : statusResponse(
            result.status,
            request.method,
            pathname === '/ar' || pathname.startsWith('/ar/') ? 'ar' : 'en',
          );
    await readPageDocument(result.page, pages);

    const headers = new Headers(request.headers);
    headers.set(PUBLIC_PATH_HEADER, pathname);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    if (error instanceof InvalidPathError)
      return statusResponse(
        error.status,
        request.method,
        pathname.startsWith('/ar/') ? 'ar' : 'en',
      );
    console.error(
      JSON.stringify({ event: 'public_route_failure', classification: 'content_unavailable' }),
    );
    return statusResponse(503, request.method, pathname.startsWith('/ar/') ? 'ar' : 'en');
  }
}
