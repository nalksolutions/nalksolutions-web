import { describe, expect, it } from 'vitest';
import { entranceSchema } from '../../src/content/motion/schema';
import { entranceAttributes } from '../../src/components/site/entrance';

describe('finite source entrances', () => {
  it('keeps delay, responsive motion and absence explicit', () => {
    expect(entranceAttributes(undefined)).toEqual({});
    const entrance = entranceSchema.parse({
      kind: 'left',
      mobile: 'up',
      delay: 300,
      duration: 750,
    });
    expect(entranceAttributes(entrance)).toMatchObject({
      'data-entrance': 'left',
      'data-entrance-mobile': 'up',
      'data-entrance-delay': 300,
      'data-entrance-duration': 750,
    });
  });
  it('rejects executable or unreviewed settings', () => {
    for (const value of [
      { kind: 'bounce', delay: 0 },
      { kind: 'up', delay: -1 },
      { kind: 'fade', delay: 0, duration: 123 },
      { kind: 'fade', delay: 0, onclick: 'alert(1)' },
    ])
      expect(entranceSchema.safeParse(value).success).toBe(false);
  });
});
