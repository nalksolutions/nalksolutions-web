'use client';

import { Fragment, useEffect, useRef } from 'react';
import { Icon } from '../site/icon';
import type { Locale } from '../../i18n/messages';

// Source widgets 8d87445 / 0ce1db3: the second ribbon adds Google My Business.
const services = [
  'PORTALS',
  'IT SOLUTIONS',
  'APP DEVELOPMENT',
  'SOCIAL MEDIA MANAGEMENT (SMM)',
  'WEB DEVELOPMENT',
  'GRAPHIC DESIGNING',
];
const rows = [services, [...services, 'GOOGLE MY BUSINESS (GMB)']];

export function HomeMarquee({ locale = 'en' }: { locale?: Locale }) {
  const translated = [
    'البوابات',
    'الحلول التقنية',
    'تطوير تطبيقات الجوال',
    'إدارة التواصل الاجتماعي (SMM)',
    'تطوير المواقع',
    'التصميم الجرافيكي',
  ];
  const displayRows =
    locale === 'ar' ? [translated, [...translated, 'الملف التجاري على Google (GMB)']] : rows;
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !('ResizeObserver' in window) || !('IntersectionObserver' in window)) return;
    const tracks = element.querySelectorAll<HTMLElement>('.home-marquee-track');
    const resize = new ResizeObserver(() => {
      for (const track of tracks) {
        const group = track.firstElementChild;
        if (group instanceof HTMLElement)
          track.style.setProperty('--marquee-duration', `${group.offsetWidth / 60}s`);
      }
      element.dataset.enhanced = 'true';
    });
    for (const track of tracks)
      if (track.firstElementChild) resize.observe(track.firstElementChild);
    const visibility = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry?.isIntersecting ?? false);
    });
    visibility.observe(element);
    return () => {
      resize.disconnect();
      visibility.disconnect();
      delete element.dataset.enhanced;
      delete element.dataset.visible;
      for (const track of tracks) track.style.removeProperty('--marquee-duration');
    };
  }, []);
  return (
    <div className="home-marquee" ref={root} aria-hidden="true">
      {displayRows.map((items, row) => (
        <div className="home-marquee-ribbon" key={row}>
          <div className="home-marquee-track">
            {[0, 1].map((copy) => (
              <div className="home-marquee-group" key={copy}>
                {items.map((item) => (
                  <Fragment key={item}>
                    <span>{item}</span>
                    <Icon name="asterisk" />
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
