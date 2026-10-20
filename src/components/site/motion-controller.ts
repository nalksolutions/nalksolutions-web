import type { Entrance } from '../../content/motion/schema';

const starts: Record<Entrance['kind'], Keyframe> = {
  fade: { opacity: 0 },
  up: { opacity: 0, transform: 'translateY(60px)' },
  left: { opacity: 0, transform: 'translateX(-60px)' },
  right: { opacity: 0, transform: 'translateX(60px)' },
  pop: { opacity: 0, transform: 'scale(0.75)' },
};

export function mountEntrances(root: Document) {
  const window = root.defaultView;
  if (!window || !('IntersectionObserver' in window) || !('animate' in window.Element.prototype))
    return;
  const view = window;
  const preference = view.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<HTMLElement, Animation>();
  const observer = new view.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        animations.get(target)?.play();
        observer.unobserve(target);
      }
    },
    { threshold: 0, rootMargin: '0px 0px -5% 0px' },
  );
  function clear() {
    observer.disconnect();
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
  }
  function prepare() {
    clear();
    if (preference.matches) return;
    for (const element of root.querySelectorAll<HTMLElement>('.marketing-site [data-entrance]')) {
      if (element.hasAttribute('data-entrance-initial')) continue;
      const base = element.dataset.entrance;
      const kind =
        (view.innerWidth <= 767 && element.dataset.entranceMobile) ||
        (view.innerWidth <= 1180 && element.dataset.entranceTablet) ||
        base;
      if (!kind || !(kind in starts)) continue;
      // Restored scroll positions and focus targets must never be hidden behind an entrance.
      const box = element.getBoundingClientRect();
      // Hydration may happen after the first paint (or after the visitor scrolls).
      // Never hide content that is already in the viewport to start an enhancement.
      if (box.top < view.innerHeight || element.contains(root.activeElement)) continue;
      const animation = element.animate(
        [starts[kind as Entrance['kind']], { opacity: 1, transform: 'none' }],
        {
          duration: Number(element.dataset.entranceDuration ?? 1000),
          delay: Number(element.dataset.entranceDelay ?? 0),
          easing: 'ease',
          fill: 'both',
        },
      );
      animation.pause();
      animation.currentTime = 0;
      animations.set(element, animation);
      animation.onfinish = () => {
        animation.cancel();
        animations.delete(element);
      };
      observer.observe(element);
    }
  }
  function focus(event: FocusEvent) {
    if (!(event.target instanceof view.Node)) return;
    for (const [element, animation] of animations)
      if (element.contains(event.target)) {
        animation.cancel();
        animations.delete(element);
        observer.unobserve(element);
      }
  }
  prepare();
  preference.addEventListener('change', prepare);
  root.addEventListener('focusin', focus);
  return () => {
    clear();
    preference.removeEventListener('change', prepare);
    root.removeEventListener('focusin', focus);
  };
}
