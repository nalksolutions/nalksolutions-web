import type { ReactNode } from 'react';

/** One intrinsic grid row keeps every card equal; native horizontal scrolling works without JS. */
export function RelatedPostStrip({ children }: { children: ReactNode }) {
  return (
    <div className="article-related-track" role="region" aria-label="Related posts" tabIndex={0}>
      {children}
    </div>
  );
}
