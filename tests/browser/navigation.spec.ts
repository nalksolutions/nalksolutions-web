import { installLocalNetworkGuard, expect, test, type Page } from '../local-test';
import source from '../../src/content/fixtures/pages.json' with { type: 'json' };
import recovery from '../../tooling/sources/site-recovery.generated.json' with { type: 'json' };
import { validateDataset } from '../../src/content/schema';
import { encodePublicPath } from '../../src/lib/routing/path';

const { pages } = validateDataset(source);
const arabic = pages.find((page) => page.locale === 'ar');
if (!arabic) throw new Error('Missing Arabic fixture');

async function homeNavigation(page: Page) {
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await trigger.isVisible()) {
    await trigger.click();
    return page.getByRole('navigation', { name: 'Mobile primary', exact: true });
  }
  return page.getByRole('navigation', { name: 'Primary', exact: true });
}

test('original representative routes retain source identity and geometry', async ({
  page,
  browser,
}, info) => {
  await info.attach('environment', {
    body: JSON.stringify({
      engine: browser.browserType().name(),
      version: browser.version(),
      platform: process.platform,
      architecture: process.arch,
      project: info.project.name,
      viewport: page.viewportSize(),
      locale: 'en-US',
      timezone: 'Asia/Riyadh',
      deviceScaleFactor: 1,
    }),
    contentType: 'application/json',
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) =>
    errors.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`),
  );
  for (const fixture of pages) {
    const response = await page.goto(encodePublicPath(fixture.path));
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(fixture.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      fixture.locale === 'ar' ? 'ar' : 'en-US',
    );
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      fixture.locale === 'ar' ? 'rtl' : 'ltr',
    );
    const sourceDocument = recovery.pages.find((item) => item.id === fixture.id);
    const headings = sourceDocument
      ? sourceDocument.headings
          .filter((heading) => heading.tag === 'h1')
          .map((heading) => heading.text)
      : [fixture.content.heading];
    // D-20 promotes the existing Contact title to its semantic page H1.
    if (fixture.path === '/contacts/') headings.push('Contact Us Online');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(headings);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    // Routing diagnostics need the viewport only. Dedicated home/article suites
    // own full-page capture stability and visual evidence.
    await page.screenshot({
      path: info.outputPath(`${fixture.id}-top.png`),
      animations: 'disabled',
    });
  }
  expect(errors).toEqual([]);
});

test('same-language routing, document language transitions, history and keyboard focus', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.body.setAttribute('data-navigation-marker', 'initial'));
  await (await homeNavigation(page)).getByRole('link', { name: 'Contact Us', exact: true }).click();
  await expect(page).toHaveURL(/\/contacts\/$/u);
  await expect(page).toHaveTitle('Contacts - Nalk Solutions');
  // A retained body marker establishes that this was a client navigation.
  await expect(page.locator('body')).toHaveAttribute('data-navigation-marker', 'initial');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://nalksolutions.com/contacts/',
  );
  await page.goBack();
  await expect(page.locator('main')).toHaveAttribute('data-page-id', 'R-91d9b62648d713d4');
  const target = (await homeNavigation(page)).locator('a[hreflang="ar"]');
  await target.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('body')).not.toHaveAttribute('data-navigation-marker', 'initial');
  await expect(page).toHaveTitle(arabic.seo.title);
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.goForward();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await (await homeNavigation(page)).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await page.reload();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.location.hash)).toBe('#main-content');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore Our Services', exact: true })).toBeFocused();
});

test('public response is useful with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    await page.goto(
      `http://127.0.0.1:${process.env.TEST_PORT ?? '3100'}${encodePublicPath(arabic.path)}`,
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(arabic.content.heading);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle(arabic.seo.title);
  } finally {
    await context.close();
  }
});
