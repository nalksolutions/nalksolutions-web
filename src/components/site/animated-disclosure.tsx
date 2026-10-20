'use client';

import { useEffect, useRef, type ReactNode, type ComponentPropsWithoutRef } from 'react';

/** Native disclosure without JavaScript, interruptible height animation with it. */
export function AnimatedDisclosure({
  summary,
  children,
  className,
  bodyClassName,
  initialOpen = false,
  ...attributes
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  initialOpen?: boolean;
} & Omit<ComponentPropsWithoutRef<'details'>, 'children' | 'open' | 'className'>) {
  const details = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const bodyAnimation = useRef<Animation | null>(null);
  const target = useRef<boolean | null>(null);
  useEffect(() => {
    const element = details.current;
    if (element) element.dataset.enhanced = 'true';
    return () => {
      animation.current?.cancel();
      bodyAnimation.current?.cancel();
      if (element) delete element.dataset.enhanced;
    };
  }, []);

  return (
    <details {...attributes} ref={details} className={className} open={initialOpen}>
      <summary
        onClick={(event) => {
          const element = details.current;
          if (!element) return;
          event.preventDefault();
          const next = !(target.current ?? element.open);
          const start = element.getBoundingClientRect().height;
          const body = element.querySelector<HTMLElement>('[data-disclosure-body]')!;
          const opacity = getComputedStyle(body).opacity;
          animation.current?.cancel();
          bodyAnimation.current?.cancel();
          target.current = next;
          element.querySelector('summary')?.setAttribute('aria-expanded', String(next));
          const finish = () => {
            bodyAnimation.current?.cancel();
            bodyAnimation.current = null;
            element.open = next;
            body.inert = false;
            element.style.overflow = '';
            delete element.dataset.closing;
            animation.current = null;
            target.current = null;
          };
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finish();
            return;
          }
          element.open = true;
          element.dataset.closing = String(!next);
          const summary = element.querySelector('summary')!;
          const style = getComputedStyle(element);
          const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
          const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          const end = next
            ? element.getBoundingClientRect().height
            : summary.getBoundingClientRect().height + padding + border;
          body.inert = !next;
          bodyAnimation.current = body.animate(
            [
              {
                opacity: next && start <= summary.offsetHeight + padding + border + 1 ? 0 : opacity,
              },
              { opacity: next ? 1 : 0 },
            ],
            { duration: 200, easing: 'ease-out', fill: 'forwards' },
          );
          element.style.overflow = 'hidden';
          const current = element.animate([{ height: `${start}px` }, { height: `${end}px` }], {
            duration: 320,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          });
          animation.current = current;
          current.onfinish = finish;
        }}
      >
        {summary}
      </summary>
      <div className={bodyClassName} data-disclosure-body>
        {children}
      </div>
    </details>
  );
}
