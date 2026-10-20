import { installLocalNetworkGuard, expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

declare global {
  interface Window {
    entranceProbe: {
      opacity: number;
      height: number;
      top: number;
      fontsReady: boolean;
    }[];
    heroAnimationStarts: number;
    initialLayoutShifts: number[];
  }
}

test('hero entrance starts before hydration and never hides or replays painted text', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.entranceProbe = [];
    window.heroAnimationStarts = 0;
    window.initialLayoutShifts = [];
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!shift.hadRecentInput) window.initialLayoutShifts.push(shift.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }
    document.addEventListener('animationstart', (event) => {
      if ((event.target as HTMLElement).id === 'home-heading') window.heroAnimationStarts++;
    });
    function sample() {
      const heading = document.getElementById('home-heading');
      if (heading && getComputedStyle(heading).fontFamily.includes('Space Grotesk')) {
        window.entranceProbe.push({
          opacity: Number(getComputedStyle(heading).opacity),
          height: heading.offsetHeight,
          top: heading.offsetTop,
          fontsReady: document.fonts.status === 'loaded',
        });
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  // The CSS entrance must finish even when application JavaScript arrives late.
  await page.route('**/_next/**/*.js*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await route.continue();
  });
  await page.route('**/fonts/*.woff2', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const heading = page.locator('#home-heading');
  await expect(heading).toHaveAttribute('data-entrance-initial', 'true');
  await expect(heading).toHaveAttribute('data-entrance-delay', '150');
  await expect(heading).toHaveCSS('animation-name', 'initial-up');
  await expect(heading).toHaveCSS('animation-duration', '1s');
  await expect(heading).toHaveCSS('animation-delay', '0.15s');
  await expect(heading).toHaveCSS('animation-timing-function', 'ease');
  await expect.poll(() => page.evaluate(() => window.heroAnimationStarts)).toBe(1);
  await expect(heading).toHaveCSS('opacity', '1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(350);
  const samples = await page.evaluate(() => window.entranceProbe);
  expect(samples.length).toBeGreaterThan(10);
  let previous = 0;
  for (const sample of samples) {
    expect(
      sample.opacity,
      'Entrance opacity must never decrease after a visible frame',
    ).toBeGreaterThanOrEqual(previous - 0.001);
    previous = sample.opacity;
  }
  const loaded = samples.filter((sample) => sample.fontsReady);
  expect(new Set(loaded.map((sample) => `${sample.top}:${sample.height}`)).size).toBe(1);
  expect(await page.evaluate(() => window.heroAnimationStarts)).toBe(1);
  const shifts = await page.evaluate(() => window.initialLayoutShifts);
  expect(shifts.reduce((sum, shift) => sum + shift, 0)).toBeLessThan(0.01);
  await info.attach('cold-load-frames', {
    body: JSON.stringify({ samples, shifts }),
    contentType: 'application/json',
  });
  await expect
    .poll(() => heading.evaluate((element) => getComputedStyle(element).opacity))
    .toBe('1');
  const settled = await heading.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
    offset: (element as HTMLElement).offsetHeight,
  }));
  expect(settled.transform).toBe('none');
  await page.screenshot({
    path: info.outputPath('home-motion-settled.png'),
    animations: 'disabled',
  });
  const footer = page.locator('.site-footer .footer-links').first();
  await footer.locator('a').first().focus();
  await expect(footer).toHaveCSS('opacity', '1');
  await expect(footer).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.effect instanceof KeyframeEffect &&
              (animation.effect.target as HTMLElement)?.hasAttribute('data-entrance'),
          ).length,
    ),
  ).toBe(0);
  expect(errors).toEqual([]);
});

test('buttons crossfade and shift smoothly, with immediate reduced-motion states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const button = page.locator('.home-hero-actions .site-button').first();
  await expect(button).toBeVisible();
  await expect(button.locator('.site-icon')).toHaveCSS('font-size', '12px');
  await expect(page.locator('.desktop-nav [lang="ar"]')).toHaveCSS(
    'font-family',
    /Times New Roman/u,
  );
  const before = await button.evaluate((element) => ({
    duration: getComputedStyle(element, '::before').transitionDuration,
    easing: getComputedStyle(element, '::before').transitionTimingFunction,
    background: getComputedStyle(element, '::before').backgroundImage,
  }));
  expect(before.duration).toBe('0.3s');
  expect(before.easing).toBe('ease');
  expect(before.background).toContain('linear-gradient');
  await button.focus();
  await expect(button).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element, '::before').opacity))
    .toBe('1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button).toHaveCSS('transform', 'none');
  await expect(button).toHaveCSS('transition-duration', '0s');
  expect(
    await button.evaluate((element) => getComputedStyle(element, '::before').transitionDuration),
  ).toBe('0s');
});

test('reduced motion keeps source content and buttons immediately readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about-us/');
  await expect(page.locator('[data-document-body]')).not.toHaveText('');
  expect(
    await page
      .locator('[data-entrance]')
      .evaluateAll((elements) =>
        elements.every((element) => getComputedStyle(element).opacity === '1'),
      ),
  ).toBe(true);
  await expect(page.locator('.site-header .header-cta .site-button')).toHaveCSS(
    'transition-duration',
    '0s',
  );
});

test('server content remains visible without JavaScript or motion enhancement', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await installLocalNetworkGuard(context);
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#home-heading')).toBeVisible();
  await expect(page.locator('#home-heading')).toHaveCSS('opacity', '1');
  await context.close();
});
