import { installLocalNetworkGuard, expect, test, type Locator } from '../local-test';
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

test('about page uses homepage actions with working services navigation and history', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    '/about-us/',
    '/our-services/',
  ]);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const homeStyle = await buttonStyle(page.locator('.home-hero-actions .site-button').first());
  await page.goto('/about-us/');
  await page.evaluate(() => document.fonts.ready);
  const action = page.locator('.journey-about-summary .site-button');
  await expect(action).toHaveAccessibleName('Explore Our Services');
  await expect(action).toHaveAttribute('href', '/our-services/');
  expect(await buttonStyle(action)).toEqual(homeStyle);
  await expect(action.locator('.site-icon')).toHaveCSS('font-size', '12px');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await action.hover();
  await expect(action).toHaveCSS('color', 'rgb(2, 2, 2)');
  await expect(action).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await expect
    .poll(() => action.evaluate((e) => getComputedStyle(e, '::before').opacity))
    .toBe('1');
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await action.focus();
  await expect(action).toHaveCSS('outline-style', 'solid');
  await expect(action).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(action).toHaveCSS('transform', 'none');
  await expect(action).toHaveCSS('transition-duration', '0s');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/our-services\/$/u);
  await expect(page.locator('.company-layout-services')).toBeVisible();
  await page.goBack();
  await expect(action).toBeVisible();
  if (info.project.use.hasTouch) await action.tap();
  else await action.click();
  await expect(page).toHaveURL(/\/our-services\/$/u);
  await page.goBack();
  await page.reload();
  await expect(page.locator('.content-company-showcase')).toHaveCount(0);
  await expect(page.locator('.journey-about-summary h2')).toHaveText('Explore Our Services');
  await expect(page.locator('h1')).toHaveText('A technology company in Saudi Arabia.');
  await expect(page.locator('.content-company-message h2')).toHaveText('CEO’s MESSAGE');
  const width = page.viewportSize()!.width;
  const geometry = await page.locator('.content-company-testimonial').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  for (const box of geometry) {
    expect(box.left).toBeGreaterThanOrEqual(19);
    expect(box.right).toBeLessThanOrEqual(width - 19);
  }
  await expect(page.locator('.content-company-testimonial:visible')).toHaveCount(3);
  const footerLogo = await page.locator('.footer-logo').boundingBox();
  expect(footerLogo!.width).toBeLessThanOrEqual(260);
  const statements = page.locator('.content-company-statements .content-company-small-copy p');
  for (const statement of await statements.all()) {
    const { size, lineHeight } = await statement.evaluate((element) => {
      const style = getComputedStyle(element);
      return { size: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight) };
    });
    expect(size).toBeGreaterThanOrEqual(17);
    expect(lineHeight / size).toBeGreaterThanOrEqual(1.6);
  }
  if (width > 1180) {
    const authorEdges = await page
      .locator('.content-company-testimonial-author')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().bottom));
    expect(Math.max(...authorEdges) - Math.min(...authorEdges)).toBeLessThan(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('about-full.png'), fullPage: true });
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('about page services action works without JavaScript', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    await page.goto('/about-us/');
    await page.getByRole('link', { name: 'Explore Our Services', exact: true }).click();
    await expect(page).toHaveURL(/\/our-services\/$/u);
    await expect(page.locator('.company-layout-services')).toBeVisible();
  } finally {
    await context.close();
  }
});
