import { installLocalNetworkGuard, expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';
import { contactOffices } from '../../src/content/journey/contact';
import { expectRevisedContent } from '../http/journey-contract';

// This short smoke is intentionally runnable independently of the broader regression cases below.
test('UI polish: quick smoke for layout, card actions, Contact and topics', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    '/',
    '/contacts/',
    '/blog/',
  ]);
  await page.goto('/');
  await expect(page.locator('.menu-trigger')).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  const nav = page.locator('.desktop-nav a').filter({ hasNotText: /[\u0600-\u06ff]/u });
  expect(await nav.allTextContents()).toEqual([
    'Home',
    'Services',
    'About Us',
    'Blog',
    'Contact Us',
  ]);
  const cards = await page
    .locator('.home-feature:not(:first-child) .site-button')
    .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().toJSON()));
  if (page.viewportSize()!.width > 767)
    expect(Math.abs(cards[0]!.bottom - cards[1]!.bottom)).toBeLessThanOrEqual(1);
  const sections = await page
    .locator('.home-service-grid, .home-feature-grid')
    .evaluateAll((elements) =>
      elements.map((el) => ({
        left: el.getBoundingClientRect().left,
        right: el.getBoundingClientRect().right,
      })),
    );
  expect(Math.abs(sections[0]!.left - sections[1]!.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(sections[0]!.right - sections[1]!.right)).toBeLessThanOrEqual(1);
  await page.goto('/contacts/');
  await expect(page.locator('h1')).toHaveText('Contact Us Online');
  expectRevisedContent(
    'R-a0ac0f2631af30d8',
    await page.locator('[data-document-body]').innerText(),
  );
  await expect(page.locator('.contact-methods a')).toHaveCount(3);
  for (const office of contactOffices) {
    await expect(page.locator('.contact-office').filter({ hasText: office.city })).toContainText(
      office.address,
    );
    await expect(page.locator('.contact-office').filter({ hasText: office.city })).toContainText(
      office.hours,
    );
  }
  await expect(page.locator('.contact-hero .site-button').first()).toHaveAttribute(
    'href',
    'mailto:info@nalksolutions.com',
  );
  await expect(page.locator('.contact-office img')).toHaveCount(2);
  const media = (await page.locator('.contact-hero-media').boundingBox())!;
  const brief = (await page.locator('.contact-brief-copy h2').boundingBox())!;
  expect(brief.y).toBeGreaterThanOrEqual(media.y + media.height);
  const image = (await page.locator('.contact-hero-media img').boundingBox())!;
  expect(image.height).toBeLessThanOrEqual(media.height);

  await expect(page.locator('.contact-form-note input:not([name=website])')).toHaveCount(3);
  await expect(page.locator('.contact-form-note textarea')).toBeVisible();
  await expect(page.locator('.contact-form-note input:not([name=website])').first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('contact-top.png'), caret: 'initial' });
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await page.goto('/blog/');
  const trigger = page.getByRole('button', { name: 'All Topics', exact: true });
  await expect(trigger).toBeEnabled();
  const before = (await page.locator('.content-listing-blog-grid').boundingBox())!.y;
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Browse all topics' });
  await expect(dialog.getByRole('link')).toHaveCount(11);
  expect((await page.locator('.content-listing-blog-grid').boundingBox())!.y).toBeCloseTo(
    before,
    0,
  );
  await page.screenshot({ path: info.outputPath('topics-open.png'), caret: 'initial' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('UI polish: shared section edges across company and service layouts', async ({ page }) => {
  for (const [path, selectors] of [
    ['/our-services/', ['.journey-offer-grid', '.journey-directory', '.journey-contact']],
    [
      '/about-us/',
      ['.content-company-values', '.journey-about-summary', '.content-company-testimonials'],
    ],
  ] as const) {
    await page.goto(path);
    const edges = [];
    for (const selector of selectors) {
      const box = await page.locator(selector).first().boundingBox();
      expect(box).not.toBeNull();
      edges.push(box!);
    }
    // Plain wrappers contain gutters; surfaced panels align to their inner content edge.
    const inset =
      path === '/about-us/'
        ? await page
            .locator('.content-company-values')
            .evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft))
        : 0;
    expect(Math.abs(edges[0]!.x + inset - edges[1]!.x)).toBeLessThanOrEqual(1);
    if (path === '/our-services/')
      expect(Math.abs(edges[0]!.x - edges[2]!.x)).toBeLessThanOrEqual(1);
  }
});

test('UI polish: related images, card heights and actions align without a height script', async ({
  page,
}) => {
  await page.goto('/how-to-build-an-api-from-scratch-a-step-by-step-guide/');
  const cards = page.locator('.article-card');
  const heights = await cards.evaluateAll((elements) =>
    elements.map((el) => el.getBoundingClientRect().height),
  );
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  const buttons = await cards
    .locator('.site-button')
    .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().bottom));
  expect(Math.max(...buttons) - Math.min(...buttons)).toBeLessThanOrEqual(1);
  await expect(page.locator('.article-related-track')).not.toHaveAttribute('style');
});

test('UI polish: topic keyboard loop and no-JavaScript category access', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/blog/');
  const trigger = page.getByRole('button', { name: 'All Topics', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Browse all topics' });
  await dialog.getByRole('link').last().focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close topics' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link').last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await installLocalNetworkGuard(context);
  try {
    const fallback = await context.newPage();
    await fallback.goto('/blog/');
    await expect(
      fallback.getByRole('navigation', { name: 'All blog topics without JavaScript' }).locator('a'),
    ).toHaveCount(11);
  } finally {
    await context.close();
  }
});
