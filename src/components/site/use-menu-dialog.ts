import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

/** Keep the native modal open until dismissal completes; navigation never waits. */
export function useMenuDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const animation = useRef<Animation | null>(null);
  const [expanded, setExpanded] = useState(false);

  const close = useCallback((immediate = false) => {
    const element = dialog.current;
    if (!element?.open) return;
    if (immediate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animation.current?.cancel();
      animation.current = null;
      element.close();
      return;
    }
    if (element.dataset.closing) return;
    const { opacity, transform } = getComputedStyle(element);
    animation.current?.cancel();
    element.dataset.closing = 'true';
    const current = element.animate(
      [
        { opacity, transform },
        { opacity: 0, transform: 'translateY(8px)' },
      ],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    );
    animation.current = current;
    current.onfinish = () => {
      // Hide first so cancelling the filled animation cannot flash the open panel.
      element.close();
      current.cancel();
      animation.current = null;
    };
  }, []);

  const open = useCallback(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    animation.current?.cancel();
    delete element.dataset.closing;
    element.showModal();
    setExpanded(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const current = element.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 200, easing: 'ease-out' },
    );
    animation.current = current;
    current.onfinish = () => {
      animation.current = null;
    };
  }, []);

  const onClose = useCallback(() => {
    // A queued native close event may arrive after a rapid reopen.
    if (dialog.current?.open) return;
    animation.current?.cancel();
    animation.current = null;
    if (dialog.current) delete dialog.current.dataset.closing;
    setExpanded(false);
    if (trigger.current?.getClientRects().length) trigger.current.focus({ preventScroll: true });
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex="0"]',
      ),
    ].filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }, []);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 1181px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (desktop.matches) close(true);
      else if (reduced.matches) {
        if (dialog.current?.dataset.closing) close(true);
        else {
          animation.current?.cancel();
          animation.current = null;
        }
      }
    };
    desktop.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      animation.current?.cancel();
      desktop.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, [close]);

  return { dialog, trigger, expanded, open, close, onClose, onKeyDown };
}
