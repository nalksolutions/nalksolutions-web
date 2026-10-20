import { installLocalNetworkGuard, expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

test('service cards align and disclosures animate both directions', async ({ page }, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    '/professional-website-development-company-in-saudi-arabia/',
    '/our-services/',
  ]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/professional-website-development-company-in-saudi-arabia/');
  const grid = page.locator('[data-service-card-grid]').last();
  await grid.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const geometry = await grid.locator('[data-service-card]').evaluateAll((cards) =>
    cards.map((card) => {
      const button = card.querySelector('.content-service-button')!.getBoundingClientRect();
      const heading = card.querySelector('h4,h3')!.getBoundingClientRect();
      return { top: button.top, bottom: button.bottom, heading: heading.top };
    }),
  );
  expect(geometry).toHaveLength(3);
  if (page.viewportSize()!.width > 767) {
    for (const item of geometry) {
      expect(item.top).toBeCloseTo(geometry[0]!.top, 0);
      expect(item.bottom).toBeCloseTo(geometry[0]!.bottom, 0);
      expect(item.heading).toBeCloseTo(geometry[0]!.heading, 0);
    }
  }
  await grid.screenshot({ path: info.outputPath('service-area-cards.png') });
  const faq = page.locator('.content-disclosure').first();
  await expect(faq).toHaveAttribute('data-enhanced', 'true');
  const summary = faq.locator('summary');
  if ((await faq.getAttribute('open')) !== null) {
    await summary.click();
    await expect(faq).not.toHaveAttribute('open');
  }
  await summary.click();
  expect(await faq.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => faq.evaluate((element) => element.getAnimations().length)).toBe(0);
  await summary.click();
  await expect(faq).toHaveAttribute('data-closing', 'true');
  await expect(faq).not.toHaveAttribute('open');
  await page.goto('/our-services/');
  const group = page.locator('[data-offer-directory="websites"]');
  await group.locator('summary').click();
  await expect(group.locator('a').first()).toBeVisible();
  await expect.poll(() => group.evaluate((element) => element.getAnimations().length)).toBe(0);
  await group.locator('summary').click();
  await expect(group).not.toHaveAttribute('open');
  // Rapid reversal ends closed with no remaining animation or clipped inline sizing.
  await group.locator('summary').click();
  await group.locator('summary').click();
  await expect(group).not.toHaveAttribute('open');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await group.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(group).toHaveAttribute('open');
  expect(await group.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('specialist links remain usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await installLocalNetworkGuard(context);
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/our-services/`);
    const group = page.locator('[data-offer-directory="websites"]');
    await group.locator('summary').click();
    await expect(group.locator('a').first()).toBeVisible();
    await group.locator('summary').click();
    await expect(group).not.toHaveAttribute('open');
  } finally {
    await context.close();
  }
});
