import manifest from './redirects.json';
import type { ProofPage } from '../schema';
import { decodePublicPath, withoutTrailingSlash } from '../../lib/routing/path';
import { PUBLIC_ORIGIN } from '../../lib/env/config';

/** Compatibility moves activate only for an available, publishable replacement. */
export function resolveLocalizedRedirect(
  pathname: string,
  search: string,
  pages: readonly ProofPage[],
) {
  const path = withoutTrailingSlash(decodePublicPath(pathname));
  const rule = manifest.rules.find((rule) => withoutTrailingSlash(rule.source) === path);
  if (!rule) return null;
  const target = pages.find(
    (page) =>
      page.path === rule.target &&
      page.localization?.entityId === rule.entityId &&
      !page.localization.preview,
  );
  return target
    ? {
        kind: 'redirect' as const,
        status: 301 as const,
        location: PUBLIC_ORIGIN + encodeURI(target.path) + search,
      }
    : null;
}
