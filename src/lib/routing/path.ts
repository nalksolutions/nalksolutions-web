export class InvalidPathError extends Error {
  constructor(public readonly status: 400 | 404) {
    super('Invalid public path');
  }
}

/** Decode segments once; encoded separators must never acquire routing meaning. */
export function decodePublicPath(pathname: string): string {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) throw new InvalidPathError(400);
  return pathname
    .split('/')
    .map((segment) => {
      let decoded: string;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        throw new InvalidPathError(400);
      }
      if (/[\\/]/u.test(decoded) || decoded === '.' || decoded === '..') {
        throw new InvalidPathError(404);
      }
      if (/[\u0000-\u001f\u007f]/u.test(decoded)) throw new InvalidPathError(400);
      return decoded;
    })
    .join('/');
}

export function encodePublicPath(decoded: string): string {
  return decoded.split('/').map(encodeURIComponent).join('/');
}

export function withoutTrailingSlash(path: string): string {
  return path === '/' ? path : path.replace(/\/+$/u, '');
}

const SYSTEM_ROOTS = new Set([
  'api',
  'studio',
  '_next',
  '_internal',
  'en',
  'ar',
  'wp-admin',
  'wp-content',
  'media',
  'brand',
]);
const SYSTEM_FILES = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/favicon.ico',
  '/favicon.svg',
]);

export function isReservedPath(path: string): boolean {
  return SYSTEM_ROOTS.has(path.split('/')[1] ?? '') || SYSTEM_FILES.has(withoutTrailingSlash(path));
}
