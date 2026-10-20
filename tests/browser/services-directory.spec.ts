import { installLocalNetworkGuard, expect, test, type Locator } from '../local-test';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';

async function buttonStyle(button: Locator) {
  return button.evaluate((element) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(
      [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'padding',
        'borderRadius',
        'backgroundImage',
        'boxShadow',
      ].map((name) => [name, style[name as keyof CSSStyleDeclaration]]),
    );
  });
}

test('services directory shares homepage button styles and responsive interaction feedback', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const homeCardStyle = await buttonStyle(page.locator('.home-card-action').first());
  const homePrimaryStyle = await buttonStyle(
    page.locator('.home-hero-actions .site-button').first(),
  );
  await page.goto('/our-services/');
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('main .site-button-card');
  await expect(cards).toHaveCount(4);
  // Geometry is measured without entrance transforms; motion feedback is exercised below.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const card of await cards.all()) {
    await expect(card.locator('a,button')).toHaveCount(0);
    await expect(card.locator('.site-button')).toHaveCount(1);
    expect(await buttonStyle(card.locator('.site-button'))).toEqual(homeCardStyle);
    const box = await card.boundingBox();
    const outer = await card.evaluate((e) => e.parentElement!.getBoundingClientRect().toJSON());
    expect(box!.width).toBeCloseTo(
      page.viewportSize()!.width >= 768 ? (outer.width - 28) / 2 : outer.width,
      1,
    );
    expect(box!.x).toBeGreaterThanOrEqual(outer.x);
    expect(box!.y + box!.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
  }
  const geometry = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      const action = element.querySelector('.site-button')!.getBoundingClientRect();
      return { top: box.top, left: box.left, right: box.right, actionBottom: action.bottom };
    }),
  );
  for (const box of geometry) {
    expect(box.left).toBeGreaterThanOrEqual(19);
    expect(box.right).toBeLessThanOrEqual(page.viewportSize()!.width - 19);
    const row = geometry.filter((other) => Math.abs(other.top - box.top) < 1);
    expect(
      Math.max(...row.map((item) => item.actionBottom)) -
        Math.min(...row.map((item) => item.actionBottom)),
    ).toBeLessThan(1);
  }
  const footerLogo = await page.locator('.footer-logo').boundingBox();
  expect(footerLogo!.width).toBeLessThanOrEqual(260);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const card = cards.nth(1);
  const action = card.locator('.site-button');
  await card.focus();
  await expect(action).toHaveCSS('color', 'rgb(2, 2, 2)');
  await expect
    .poll(() => action.evaluate((e) => getComputedStyle(e, '::before').opacity))
    .toBe('1');
  await expect(card).toHaveCSS('outline-style', 'solid');
  await page.locator('h1').click();
  await expect(action).toHaveCSS('color', 'rgb(255, 255, 255)');
  await card.hover();
  await expect(action).toHaveCSS('color', 'rgb(2, 2, 2)');
  await expect
    .poll(() => action.evaluate((e) => getComputedStyle(e, '::before').opacity))
    .toBe('1');
  const primary = page.locator('.journey-contact-compact .site-button');
  expect(await buttonStyle(primary)).toEqual(homePrimaryStyle);
  await primary.hover();
  await expect(primary).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await primary.focus();
  await expect(primary).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(primary).toHaveCSS('transform', 'none');
  await expect(primary).toHaveCSS('transition-duration', '0s');
  await expect(action).toHaveCSS('transition-duration', '0s');
  await info.attach('shared-button-styles', {
    body: JSON.stringify({ homeCardStyle, homePrimaryStyle }),
    contentType: 'application/json',
  });
  expect(errors).toEqual([]);
});

test('services directory card actions navigate with pointer, keyboard and history', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const navigationPaths = ['/our-services/', '/contacts/'];
  const { errors, attachCancellations } = collectPageDiagnostics(page, navigationPaths);
  await page.goto('/our-services/');
  const cards = page.locator('main .site-button-card');
  const paths = await cards.evaluateAll((elements) => elements.map((e) => e.getAttribute('href')!));
  expect(paths).toHaveLength(4);
  navigationPaths.push(...paths);
  expect(new Set(paths).size).toBe(4);
  for (const path of paths) expect(identities.pages.some((p) => p.path === path)).toBe(true);
  for (const index of [0, 1]) {
    const target = index === 0 ? cards.first() : cards.nth(1).locator('.site-button');
    const options = index === 0 ? { position: { x: 8, y: 8 } } : {};
    if (info.project.use.hasTouch) await target.tap(options);
    else await target.click(options);
    await expect(page).toHaveURL(new URL(paths[index]!, page.url()).href);
    await expect(page.locator('main')).toHaveAttribute(
      'data-page-id',
      identities.pages.find((p) => p.path === paths[index])!.id,
    );
    await page.goBack();
    await expect(page.locator('.company-layout-services')).toBeVisible();
  }
  const indices =
    info.project.name === 'chromium-desktop' ? paths.map((_, index) => index) : [0, 1, 3];
  for (const index of indices) {
    const path = paths[index]!;
    const destination = identities.pages.find((p) => p.path === path)!;
    await cards.nth(index).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new URL(path, page.url()).href);
    await expect(page.locator('main')).toHaveAttribute('data-page-id', destination.id);
    await expect(page).toHaveTitle(destination.seo.title);
    await page.goBack();
    await expect(page.locator('.company-layout-services')).toBeVisible();
  }
  await page.locator('.journey-contact-compact .site-button').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/contacts\/$/u);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('services directory cards remain functional without JavaScript', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    await page.goto('/our-services/');
    await expect(page.locator('main .site-button-card')).toHaveCount(4);
    await expect(page.locator('.journey-directory a')).toHaveCount(21);
    await expect(page.locator('.journey-directory details[open]')).toHaveCount(0);
    const group = page.locator('[data-offer-directory="marketing"]');
    await group.locator('summary').focus();
    await page.keyboard.press('Enter');
    await group.locator('a[href="/services-seo-saudi-arabia/"]').click();
    await expect(page).toHaveURL(/\/services-seo-saudi-arabia\/$/u);
    await expect(page.locator('h1')).toContainText('SEO');
  } finally {
    await context.close();
  }
});
