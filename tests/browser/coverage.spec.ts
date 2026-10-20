import { expect, test } from '../local-test';
import pages from '../../src/content/site/pages.generated.json' with { type: 'json' };
import recovery from '../../tooling/sources/site-recovery.generated.json' with { type: 'json' };
import { assertSharedActions } from './shared-actions';
import navigationScope from '../../docs/registers/navigation-scope.json' with { type: 'json' };

const activeIds = new Set(
  navigationScope.routes
    .filter((route) => route.disposition === 'in-scope')
    .map((route) => route.route_id),
);

const representatives = new Set<string>();
const seen = new Set<string>();
for (const page of recovery.pages) {
  const key = `${page.family}-${page.locale}`;
  if (!seen.has(key)) {
    seen.add(key);
    representatives.add(page.id);
  }
}

for (const source of recovery.pages) {
  test(`${source.id}: complete captured content is browsable ${representatives.has(source.id) ? '@family' : '@coverage'}`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('requestfailed', (request) =>
      errors.push(`${request.url()}: ${request.failure()?.errorText}`),
    );
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    const identity = pages.pages.find((item) => item.id === source.id);
    if (!identity) throw new Error('Missing page identity');
    const response = await page.goto(encodeURI(identity.path));
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      identity.locale === 'ar' ? 'ar' : 'en-US',
    );
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    await expect(page.locator('main')).toHaveAttribute('data-page-id', identity.id);
    await expect(page.locator('[data-document-body]')).not.toHaveText('');
    await page.evaluate(() => document.fonts.ready);
    await assertSharedActions(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    if (activeIds.has(source.id)) {
      const logo = await page.locator('.footer-logo').boundingBox();
      expect(logo!.width, 'Footer branding must remain bounded').toBeLessThanOrEqual(260);
      const cards = await page
        .locator('.content-listing-blog-grid .content-listing-blog-card')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const box = element.getBoundingClientRect();
            const action = element
              .querySelector('.content-listing-read-more')!
              .getBoundingClientRect();
            const image = element
              .querySelector('.content-listing-blog-image')!
              .getBoundingClientRect();
            return {
              top: box.top,
              bottom: box.bottom,
              action: action.bottom,
              ratio: image.width / image.height,
            };
          }),
        );
      for (const card of cards) {
        const row = cards.filter((other) => Math.abs(other.top - card.top) < 1);
        expect(
          Math.max(...row.map((other) => other.bottom)) -
            Math.min(...row.map((other) => other.bottom)),
        ).toBeLessThan(1);
        expect(
          Math.max(...row.map((other) => other.action)) -
            Math.min(...row.map((other) => other.action)),
        ).toBeLessThan(1);
        expect(card.ratio).toBeCloseTo(1.5, 1);
      }
      for (const control of await page.locator('.content-listing-pagination a').all()) {
        const box = await control.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`${identity.id}-top.png`) });
    expect(errors).toEqual([]);
  });
}

test('Latin-slug Arabic article transitions preserve document attributes and history', async ({
  page,
}) => {
  await page.goto('/ar/how-ai-helps-companies-in-saudi-arabia/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page
    .locator('.article-heading a[href="/ar/category/custom-software-apps/"]')
    .first()
    .click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.goBack();
  const menu = page.getByRole('button', {
    name: '\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
    exact: true,
  });
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator('.language-menu-option > summary').click();
    await page.locator('.language-choices a[href="/"]').click();
  } else {
    await page.locator('.desktop-nav .language-trigger').click();
    await page.locator('.language-dialog a[href="/"]').click();
  }
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
});

test('listing search, pagination and enquiry state are deliberate', async ({ page }) => {
  await page.goto('/category/digital-marketing-strategy/');
  const search = page.getByRole('region', { name: 'Site search', exact: true });
  await search.getByRole('searchbox').fill('API from scratch');
  await expect(search.getByRole('link', { name: /API from scratch/iu })).toBeVisible();
  const pagination = page
    .locator('[data-document-body] a[href="/category/digital-marketing-strategy/page/2/"]')
    .first();
  // Link navigation can commit after the generic assertion window under browser load.
  // Wait for the navigation itself within the test deadline, then assert its identity.
  await Promise.all([
    page.waitForURL('**/category/digital-marketing-strategy/page/2/'),
    pagination.click(),
  ]);
  await expect(page).toHaveURL(/\/page\/2\/$/u);
  const secondPage = pages.pages.find(
    (item) => item.path === '/category/digital-marketing-strategy/page/2/',
  );
  if (!secondPage) throw new Error('Missing category pagination identity');
  await expect(page.locator('main')).toHaveAttribute('data-page-id', secondPage.id);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://nalksolutions.com/category/digital-marketing-strategy/page/2/',
  );
  await page.goto('/contacts/');
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await expect(page.getByText('Prefer email? Write to', { exact: false })).toBeVisible();
});

test('search accepts input only after its JavaScript handler is ready', async ({ page }) => {
  let releaseScripts = () => {};
  const scripts = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/u, async (route) => {
    await scripts;
    await route.continue();
  });
  try {
    await page.goto('/category/digital-marketing-strategy/', { waitUntil: 'commit' });
    const search = page.getByRole('region', { name: 'Site search', exact: true });
    const input = search.getByRole('searchbox');
    await expect(input).toBeDisabled();
    releaseScripts();
    await expect(input).toBeEnabled();
    await input.fill('API from scratch');
    await expect(search.getByRole('link', { name: /API from scratch/iu })).toBeVisible();
    await expect(input).toHaveValue('API from scratch');
  } finally {
    releaseScripts();
  }
});
