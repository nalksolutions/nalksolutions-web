import { installLocalNetworkGuard, expect, test } from '../local-test';
import content from '../../src/content/home/home.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';

test('homepage refinements center readable stats and remove duplicated introduction', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/');
  await expect(page.getByText(content.intro, { exact: true })).toHaveCount(0);
  await expect(page.getByText(content.tagline, { exact: true })).toHaveCount(0);
  await expect(page.locator('.home-about-copy')).toContainText('We are Nalk Solutions');
  await expect(page.locator('.home-brand-slider button')).toHaveCount(0);
  const stats = page.locator('.home-stats');
  await stats.scrollIntoViewIfNeeded();
  await expect(stats.locator('.home-stats-grid > div > p')).toHaveText([
    '120+',
    '300%',
    '48hrs',
    '100%',
  ]);
  await expect(stats).toContainText('Client Satisfaction');
  const geometry = await stats.locator('.home-stats-grid > div').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      const label = element.querySelector('h2')!.getBoundingClientRect();
      const value = element.querySelector('p')!;
      return {
        center: box.x + box.width / 2,
        labelCenter: label.x + label.width / 2,
        align: getComputedStyle(value).textAlign,
        color: getComputedStyle(value).color,
      };
    }),
  );
  for (const item of geometry) {
    expect(Math.abs(item.center - item.labelCenter)).toBeLessThan(1);
    expect(item.align).toBe('center');
    expect(item.color).toBe('rgb(255, 251, 189)');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('homepage FAQ animates both directions and supports interruption, keyboard and reduced motion', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const item = page.locator('.home-faq details').first();
  const summary = item.locator('summary');
  await expect(item).toHaveAttribute('data-enhanced', 'true');
  await summary.scrollIntoViewIfNeeded();
  // A completed short animation can disappear before the next remote poll.
  // Record starts without changing playback, then verify real completion below.
  await item.evaluate((el) => {
    const observed = el as HTMLElement & { animationStarts: { state: string; duration: number }[] };
    observed.animationStarts = [];
    const animate = el.animate.bind(el);
    el.animate = (...args) => {
      const animation = animate(...args);
      observed.animationStarts.push({
        state: animation.playState,
        duration: Number(animation.effect?.getComputedTiming().duration),
      });
      return animation;
    };
  });
  const closed = await item.evaluate((el) => el.getBoundingClientRect().height);
  await summary.click();
  await expect
    .poll(() =>
      item.evaluate(
        (el) => (el as HTMLElement & { animationStarts: unknown[] }).animationStarts.length,
      ),
    )
    .toBe(1);
  await expect.poll(() => item.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(item).toHaveAttribute('open', '');
  expect(await item.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(closed);
  await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect
    .poll(() =>
      item.evaluate(
        (el) => (el as HTMLElement & { animationStarts: unknown[] }).animationStarts.length,
      ),
    )
    .toBe(2);
  const starts = await item.evaluate(
    (el) =>
      (el as HTMLElement & { animationStarts: { state: string; duration: number }[] })
        .animationStarts,
  );
  for (const start of starts) {
    expect(start.state).toBe('running');
    expect(start.duration).toBeGreaterThan(0);
  }
  await expect(item).not.toHaveAttribute('open', '');
  await summary.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(item).not.toHaveAttribute('open', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await summary.click();
  await expect(item).toHaveAttribute('open', '');
  expect(await item.evaluate((el) => el.getAnimations().length)).toBe(0);
  await summary.click();
  await expect(item).not.toHaveAttribute('open', '');
  expect(errors).toEqual([]);
});

test('homepage hero plays the recovered local video and respects reduced motion', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const video = page.locator('.home-hero-video');
  await expect(video).toHaveAttribute('src', '/media/home-hero.mp4');
  await expect
    .poll(() =>
      video.evaluate((el) => {
        const v = el as HTMLVideoElement;
        return v.readyState >= 2 && !v.paused && v.currentTime > 0;
      }),
    )
    .toBe(true);
  expect(await video.evaluate((el) => (el as HTMLVideoElement).error)).toBeNull();
  const time = await video.evaluate((el) => (el as HTMLVideoElement).currentTime);
  await expect
    .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentTime))
    .not.toBe(time);
  await page.locator('.home-faq').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => scrollTo(0, 0));
  await expect(video).toHaveCSS('display', 'none');
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('homepage FAQ retains native no-JavaScript disclosure behavior', async ({
  browser,
  baseURL,
}, info) => {
  if (!baseURL) throw new Error('A local test base URL is required');
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: info.project.use.viewport ?? { width: 1440, height: 1000 },
  });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    await page.goto('/');
    const item = page.locator('.home-faq details').first();
    await item.locator('summary').click();
    await expect(item.getByText(content.faq[0]!.answer, { exact: true })).toBeVisible();
    await item.locator('summary').click();
    await expect(item.getByText(content.faq[0]!.answer, { exact: true })).not.toBeVisible();
    await expect(page.locator('.home-hero-video')).not.toHaveAttribute('src');
  } finally {
    await context.close();
  }
});
