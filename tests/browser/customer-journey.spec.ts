import { installLocalNetworkGuard, expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';
import { offers } from '../../src/content/journey/offers';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };

test('customer journey: four offers, direct enquiry and section-aware navigation', async ({
  page,
}, info) => {
  const offer = offers[0]!;
  const path = identities.pages.find((p) => p.id === offer.pageId)!.path;
  const { errors, attachCancellations } = collectPageDiagnostics(page, ['/', path, '/contacts/']);
  await page.goto('/');
  const location = await page.locator('.journey-brands .home-locations p').boundingBox();
  const services = await page.locator('.home-services .section-label').first().boundingBox();
  expect(services!.y - location!.y - location!.height).toBeGreaterThanOrEqual(40);
  await page.locator('.home-hero-actions a').first().click();
  await expect(page).toHaveURL(/\/#services$/u);
  await page.locator(`[data-offer="${offer.id}"]`).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(path));
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  const nav = page.getByRole('navigation', {
    name: (await menu.isVisible()) ? 'Mobile primary' : 'Primary',
    exact: true,
  });
  await expect(nav.locator('a[data-active-section="true"]')).toHaveText('Services');
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
  await expect(nav.locator('details')).toHaveCount(0);
  if (await menu.isVisible()) await page.keyboard.press('Escape');
  await page.locator('.journey-actions a').first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/contacts\/$/u);
  await expect(page.locator('h1')).toHaveText('Contact Us Online');
  const links = page.locator('.journey-contact-links');
  await expect(links.locator('a[href="mailto:info@nalksolutions.com"]')).toBeVisible();
  await expect(links.locator('a[href="tel:+923055518777"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await expect(page.locator('.content-company-contacts-hero a[href="/about-us/"]')).toHaveCount(0);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('customer journey: enquiry panels retain the rounded glass treatment', async ({ page }) => {
  await page.goto('/our-services/');
  await expect(page.locator('.journey-contact.home-glass-card')).toHaveCSS('border-radius', '24px');
  await page.goto('/about-us/');
  await expect(page.locator('.journey-about-summary')).toHaveCSS('border-radius', '24px');
  await page.goto('/how-to-build-an-api-from-scratch-a-step-by-step-guide/');
  await expect(page.locator('.journey-article-offer')).toHaveCSS('border-radius', '24px');
});

test('customer journey: explicit article recommendation precedes related navigation', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    '/how-to-build-an-api-from-scratch-a-step-by-step-guide/',
    '/services-custom-software-app-development-saudi-arabia/',
    '/contacts/',
  ]);
  await page.goto('/how-to-build-an-api-from-scratch-a-step-by-step-guide/');
  const bridge = page.locator('[data-related-offer="software"]');
  await expect(bridge).toBeVisible();
  expect(
    await bridge.evaluate((el) =>
      Boolean(
        el.compareDocumentPosition(document.querySelector('.article-adjacent')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ),
  ).toBe(true);
  await bridge.getByRole('link').click();
  await expect(page).toHaveURL(/\/services-custom-software-app-development-saudi-arabia\/$/u);
  await page.locator('.journey-actions a').first().click();
  await expect(page).toHaveURL(/\/contacts\/$/u);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('customer journey: local search prioritizes offers and reveals every match six at a time', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/blog/');
  const search = page.locator('.content-search').first();
  const input = search.getByRole('searchbox');
  await expect(input).toBeEnabled();
  await input.fill('ecommerce');
  await expect(search.locator('li a').first()).toHaveAttribute(
    'href',
    '/professional-website-development-company-in-saudi-arabia/',
  );
  await input.fill('marketing');
  await expect(search.locator('li a')).toHaveCount(6);
  await expect(search.locator('li a').first()).toHaveAttribute(
    'href',
    '/services-digital-marketing/',
  );
  await search.getByRole('button', { name: 'Show More', exact: true }).click();
  await expect(search.locator('li a')).toHaveCount(12);
  while (await search.getByRole('button', { name: 'Show More', exact: true }).count())
    await search.getByRole('button', { name: 'Show More', exact: true }).click();
  const count = Number((await search.getByRole('status').innerText()).split(' ')[0]);
  await expect(search.locator('li a')).toHaveCount(count);
  await input.fill('website');
  await input.fill('marketing');
  await expect(search.locator('li a')).toHaveCount(6);
  await input.fill('Daniel Foster');
  await expect(search.locator('a[href="/cmsms_profile/daniel-foster/"]')).toHaveCount(0);
  await input.fill('شركة');
  expect(await search.locator('li a').count()).toBeGreaterThan(0);
  await input.fill('no-such-customer-journey-result');
  await expect(search.getByRole('status')).toHaveText('0 results');
  await expect(search.locator('li')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('customer journey: header search expands results and restores focus; mobile retains Blog search', async ({
  page,
}) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/blog/');
  const trigger = page.locator('.search-trigger');
  if (await page.locator('.search-trigger').isVisible()) {
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Search', exact: true });
    await dialog.getByRole('searchbox').fill('marketing');
    await expect(dialog.locator('li a')).toHaveCount(6);
    await expect(dialog.locator('li a').first()).toHaveAttribute(
      'href',
      '/services-digital-marketing/',
    );
    await dialog.getByRole('button', { name: 'Show More', exact: true }).click();
    await expect(dialog.locator('li a')).toHaveCount(12);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  } else {
    await expect(page.locator('.menu-trigger')).toBeVisible();
    await expect(page.locator('.journey-topics .content-search input')).toBeEnabled();
  }
  expect(errors).toEqual([]);
});

test('customer journey: optional topics and specialist groups work without JavaScript', async ({
  browser,
  baseURL,
}, info) => {
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: info.project.use.viewport ?? { width: 1440, height: 1000 },
  });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    await page.goto('/blog/');
    await expect(
      page.getByRole('navigation', { name: 'Featured blog topics' }).locator('a'),
    ).toHaveCount(4);
    const topics = page.getByRole('navigation', { name: 'All blog topics without JavaScript' });
    await expect(topics.locator('a')).toHaveCount(11);
    await topics.locator('a').first().click();
    await expect(page.locator('h1')).toBeVisible();
    await page.goto('/our-services/');
    await expect(page.locator('.journey-directory a')).toHaveCount(21);
    await expect(page.locator('.journey-directory details[open]')).toHaveCount(0);
    const group = page.locator('[data-offer-directory="software"]');
    await group.locator('summary').focus();
    await page.keyboard.press('Enter');
    await group.locator('a').first().click();
    await expect(page.locator('.journey-parent a').first()).toHaveAttribute(
      'href',
      '/services-custom-software-app-development-saudi-arabia/',
    );
    await page.locator('.journey-parent a').last().click();
    await expect(page).toHaveURL(/\/contacts\/$/u);
  } finally {
    await context.close();
  }
});

test('customer journey: core content fits at 200 percent text zoom', async ({ page }) => {
  const { errors } = collectPageDiagnostics(page);
  // 720 CSS pixels gives the layout width of a 1440px window at 200% browser zoom;
  // doubling root text additionally exercises text-only enlargement.
  await page.setViewportSize({ width: 720, height: 500 });
  for (const path of [
    '/',
    '/our-services/',
    '/about-us/',
    '/contacts/',
    ...offers.map((o) => identities.pages.find((p) => p.id === o.pageId)!.path),
    '/blog/',
  ]) {
    await page.goto(path);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
    for (const link of await page.locator('.journey-actions a,.journey-contact-links a').all()) {
      const box = await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(721);
    }
  }
  expect(errors).toEqual([]);
});
