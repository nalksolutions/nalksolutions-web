import type { ProofPage } from '../../content/schema';
import { PUBLIC_ORIGIN } from '../env/config';
import { findLegacyRule } from './legacy';
import { decodePublicPath, encodePublicPath, withoutTrailingSlash } from './path';

export type RouteResult =
  | { kind: 'page'; page: ProofPage }
  | { kind: 'redirect'; status: 301; location: string }
  | { kind: 'gone'; status: 410 }
  | { kind: 'notFound'; status: 404 };

export function resolveLegacy(pathname: string, search: string): RouteResult | null {
  const rule = findLegacyRule(pathname, search);
  if (!rule) return null;
  if (rule.status === 410) return { kind: 'gone', status: 410 };
  if (!rule.location) throw new Error(`Missing target: ${rule.id}`);
  return { kind: 'redirect', status: 301, location: rule.location };
}

export function resolvePage(pathname: string, pages: readonly ProofPage[]): RouteResult {
  const decoded = decodePublicPath(pathname);
  const page = pages.find(
    (candidate) => withoutTrailingSlash(candidate.path) === withoutTrailingSlash(decoded),
  );
  if (!page) return { kind: 'notFound', status: 404 };
  if (decoded !== page.path) {
    // Proxy requires absolute Location URLs; use the approved origin, never Host.
    return { kind: 'redirect', status: 301, location: PUBLIC_ORIGIN + encodePublicPath(page.path) };
  }
  return { kind: 'page', page };
}
