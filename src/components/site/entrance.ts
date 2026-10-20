import type { Entrance } from '../../content/motion/schema';
import type { CSSProperties } from 'react';

export function entranceAttributes(entrance: Entrance | undefined) {
  return entrance
    ? {
        'data-entrance': entrance.kind,
        'data-entrance-delay': entrance.delay,
        'data-entrance-duration': entrance.duration,
        'data-entrance-mobile': entrance.mobile,
        'data-entrance-tablet': entrance.tablet,
      }
    : {};
}

/** First-paint entrances run in CSS, independently of hydration and effect lifecycles. */
export function initialEntranceAttributes(entrance: Entrance) {
  return {
    ...entranceAttributes(entrance),
    'data-entrance-initial': true,
    style: {
      '--entrance-delay': `${entrance.delay}ms`,
      '--entrance-duration': `${entrance.duration ?? 1000}ms`,
    } as CSSProperties,
  };
}
