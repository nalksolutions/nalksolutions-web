'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Keep the server-rendered logo list scrollable until motion can be enhanced. */
export function BrandSlider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry?.isIntersecting ?? false);
    });
    observer.observe(element);
    element.dataset.enhanced = 'true';
    return () => {
      observer.disconnect();
      delete element.dataset.enhanced;
      delete element.dataset.visible;
    };
  }, []);

  return (
    <div className="home-brand-slider" ref={root}>
      <div className="home-brand-viewport" tabIndex={0} role="region" aria-label="Our clients">
        <div className="home-brand-track">
          <div className="home-brand-group">{children}</div>
          <div className="home-brand-group" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
