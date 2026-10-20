'use client';

import { useEffect, useRef } from 'react';
import { homeHeroVideoPath } from '../../content/home/media';

/** Decorative media: keep the server-rendered poster when motion cannot play. */
export function HeroVideo({ poster }: { poster: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    function update() {
      if (!element) return;
      if (motion.matches || !visible || document.hidden) {
        element.pause();
        return;
      }
      if (!element.getAttribute('src')) element.src = homeHeroVideoPath;
      // Autoplay can be denied by browser policy; the poster remains useful.
      void element.play().catch(() => {});
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      update();
    });
    observer.observe(element);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      element.pause();
    };
  }, []);

  return (
    <video
      ref={video}
      className="home-hero-video"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
