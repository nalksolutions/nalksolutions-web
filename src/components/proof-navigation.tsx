import Link from 'next/link';
import type { ProofPage } from '../content/schema';
import { encodePublicPath } from '../lib/routing/path';

export function ProofNavigation({
  current,
  pages,
}: {
  current: ProofPage;
  pages: readonly ProofPage[];
}) {
  return (
    <nav aria-label="Proof routes" className="border-t border-slate-200 pt-6">
      <h2 className="mb-3 text-lg font-semibold">Routing proof pages</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {pages.map((page) => {
          const label =
            page.locale !== current.locale
              ? `${page.locale === 'ar' ? 'العربية' : 'English'} · ${page.seo.title}`
              : page.seo.title;
          const props = {
            tabIndex: 0,
            dir: 'auto',
            href: encodePublicPath(page.path),
            hrefLang: page.locale,
            'aria-current': page.id === current.id ? ('page' as const) : undefined,
          };
          return (
            <li key={page.id}>
              {page.locale === current.locale ? (
                <Link {...props} prefetch={false}>
                  {label}
                </Link>
              ) : (
                <a {...props}>{label}</a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
