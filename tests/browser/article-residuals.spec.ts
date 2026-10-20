import { expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };

test('article featured images retain source aspect-derived widths at fixed responsive heights', async ({
  page,
}, info) => {
  const { errors } = collectPageDiagnostics(page);
  const width = page.viewportSize()!.width;
  const height = width > 1024 ? 379 : width > 767 ? 450 : 350;
  const gutter = width > 1024 ? 40 : width > 767 ? 30 : 20;
  for (const id of [
    'R-fbbead80b209e23c',
    'R-15de724c087e16e9',
    'R-a7d871258750bc2a',
    'R-beb9a0ed5a4db3ce',
  ]) {
    const identity = identities.pages.find((item) => item.id === id)!;
    await page.goto(encodeURI(identity.path));
    const image = page.locator('.article-featured img');
    const intrinsic = await image.evaluate(async (element) => {
      const image = element as HTMLImageElement;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    });
    const bounds = (await image.boundingBox())!;
    const expectedWidth = Math.min(
      (height * intrinsic.width) / intrinsic.height,
      width - gutter * 2,
    );
    expect(Math.abs(bounds.width - expectedWidth)).toBeLessThanOrEqual(1);
    expect(bounds.height).toBe(height);
    expect(Math.abs(bounds.x + bounds.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`${id}-featured.png`), animations: 'disabled' });
  }
  expect(errors).toEqual([]);
});

test('site header menu glyph stays centered across page families', async ({ page }, info) => {
  const { errors } = collectPageDiagnostics(page);
  if (page.viewportSize()!.width > 1024) await page.setViewportSize({ width: 768, height: 1024 });
  for (const [index, path] of [
    '/about-us/',
    '/services-ai-automation-saudi-arabia/',
    '/blog/',
    '/how-to-build-an-api-from-scratch-a-step-by-step-guide/',
  ].entries()) {
    await page.goto(path);
    // D-21 uses the same enclosed header and menu glyph across every page family.
    const button = page.locator('.site-header .menu-trigger');
    await expect(button).toBeVisible();
    // D-20 keeps header controls disabled until React owns their handlers.
    // Locator.focus does not wait for enabled state, unlike click/keyboard use.
    await expect(button).toBeEnabled();
    const container = (await button.boundingBox())!;
    const glyph = (await button.locator('svg').boundingBox())!;
    expect(
      Math.abs(glyph.x + glyph.width / 2 - container.x - container.width / 2),
    ).toBeLessThanOrEqual(0.5);
    expect(
      Math.abs(glyph.y + glyph.height / 2 - container.y - container.height / 2),
    ).toBeLessThanOrEqual(0.5);
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await page.screenshot({ path: info.outputPath(`menu-${index}.png`), animations: 'disabled' });
  }
  expect(errors).toEqual([]);
});

test('article body preserves reviewed inline typography and source image flow', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  const width = page.viewportSize()!.width;
  const bodySize = width > 1024 ? 18 : width > 767 ? 17 : 16;
  await page.goto('/ar/how-ai-helps-companies-in-saudi-arabia/');
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('[data-article-body] > h1');
  await expect(heading).toHaveCSS('margin-bottom', `${bodySize * 0.75}px`);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.goto('/email-marketing-goals-and-objectives/');
  const compact = page.locator('[data-article-body] > p:first-child .content-compact-text');
  await expect(compact).toHaveCSS('font-size', '16px');
  await expect(compact).toHaveCSS('font-weight', '400');
  await expect(compact).not.toHaveAttribute('style', /.+/u);

  await page.goto('/search-ads-vs-display-ads/');
  const image = page.locator('[data-article-body] img.content-inline-image');
  await expect(image).toHaveCount(1);
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((element) => (element as HTMLImageElement).decode());
  await expect(image).toHaveCSS('display', 'inline');
  await expect(image).toHaveCSS('vertical-align', 'baseline');
  await expect(image).toHaveCSS('margin', '0px');
  await expect(page.locator('[data-article-body] img:not(.content-inline-image)')).toHaveCSS(
    'margin-top',
    `${bodySize * 3}px`,
  );
  await expect(page.locator('[data-article-body] .content-prose > h3').first()).toHaveCSS(
    'margin-top',
    '0px',
  );

  await page.goto('/virtual-marketing-2026-strategies/');
  await expect(page.locator('[data-article-body] > h2').last()).toHaveText('Next Steps:');
  expect(
    await page
      .locator('[data-article-body] :is(h1,h2,h3,h4,h5,h6)')
      .evaluateAll((elements) => elements.some((element) => !element.textContent?.trim())),
  ).toBe(false);
  await expect(page.locator('[data-article-body]')).toContainText(
    'Virtual marketing in 2026 rewards businesses',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('article categories share one source pill and related actions use homepage feedback', async ({
  page,
}, info) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/what-is-intelligent-workflow-automation/');
  await page.evaluate(() => document.fonts.ready);
  const categories = page.locator('.article-categories');
  const links = categories.locator('a');
  await expect(links).toHaveCount(2);
  await expect(categories).toHaveCSS('padding', '3px 12px');
  await expect(links.first()).toHaveCSS('padding', '0px');
  await expect(links.first()).toHaveCSS('background-image', 'none');
  const boxes = await links.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    }),
  );
  if (page.viewportSize()!.width >= 390) expect(boxes[0]!.top).toBe(boxes[1]!.top);
  const action = page.locator('.article-card .site-button').first();
  await expect(page.locator('.article-related-track')).toHaveCSS('display', 'grid');
  await action.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await action.hover();
  await expect(action).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await expect
    .poll(() => action.evaluate((element) => getComputedStyle(element, '::before').opacity))
    .toBe('1');
  await expect
    .poll(() => action.evaluate((element) => getComputedStyle(element, '::before').backgroundColor))
    .toBe('rgb(255, 251, 189)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(action).toHaveCSS('transform', 'none');
  await expect(action).toHaveCSS('transition-duration', '0s');
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await action.focus();
  await expect(action).toHaveCSS('outline-style', 'solid');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: info.outputPath('article-categories-actions.png'),
    animations: 'disabled',
  });
  expect(errors).toEqual([]);
});
