import { expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

test('Arabic local-client guard @coverage', async ({ page, request, baseURL }) => {
  const response = await request.get('https://nalksolutions.com/ar/contacts/');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('dir="rtl"');
  const initial = await request.get(
    'https://nalksolutions.com/how-ai-helps-companies-in-saudi-arabia/',
    { maxRedirects: 20 },
  );
  expect(initial.status()).toBe(301);
  expect(initial.headers().location).toBe(
    'https://nalksolutions.com/ar/how-ai-helps-companies-in-saudi-arabia/',
  );
  await page.goto('/how-ai-helps-companies-in-saudi-arabia/');
  expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
  await expect(page).toHaveURL(/\/ar\/how-ai-helps-companies-in-saudi-arabia\/$/u);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('Arabic core pages, topic selection and Arabic-only language choices @coverage', async ({
  page,
}, info) => {
  const paths = [
    '/ar/about-us/',
    '/ar/our-services/',
    '/ar/تصميم-وتطوير-المواقع/',
    '/ar/حلول-الذكاء-الاصطناعي/',
    '/ar/تسويق-رقمي/',
    '/ar/blog/',
    '/ar/how-ai-helps-companies-in-saudi-arabia/',
  ];
  const { errors, attachCancellations } = collectPageDiagnostics(page, paths);
  for (const path of paths) {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(
      page.locator('.translation-review-banner,.translation-pending,.navigation-pending'),
    ).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (path === '/ar/our-services/') {
      await expect(page.locator('[data-offer]')).toHaveCount(4);
      expect(
        await page
          .locator('[data-offer] a, a[data-offer]')
          .evaluateAll((links) =>
            links.every((link) => link.getAttribute('href')?.startsWith('/ar/')),
          ),
      ).toBe(true);
      await page.screenshot({ path: info.outputPath('services.png') });
    }
    if (path === '/ar/blog/') {
      const trigger = page.getByRole('button', { name: 'جميع المواضيع', exact: true });
      await trigger.click();
      await expect(page.locator('#blog-topic-picker')).toBeVisible();
      expect(
        await page
          .locator('#blog-topic-picker a')
          .evaluateAll(
            (links) =>
              links.length > 0 &&
              links.every((link) => link.getAttribute('href')?.startsWith('/ar/')),
          ),
      ).toBe(true);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  }
  await expect(page.locator('[data-related-offer="automation"]')).toBeVisible();
  const menu = page.getByRole('button', { name: 'فتح القائمة', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator('.language-menu-option > summary').click();
    await expect(page.locator('.language-choices a[href="/blog/"]')).toBeVisible();
    await expect(page.locator('.language-choices a[href="/our-services/"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
  } else {
    const trigger = page.locator('.desktop-nav .language-trigger');
    await trigger.click();
    await expect(page.locator('.language-dialog[open]')).toBeVisible();
    await expect(page.locator('.language-dialog a[href="/blog/"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('Arabic pilot: complete journey, RTL, normal publication and English return', async ({
  page,
  request,
  browserName,
}, info) => {
  const paths = [
    '/ar/',
    '/ar/services-custom-software-app-development-saudi-arabia/',
    '/ar/contacts/',
  ];
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    ...paths,
    '/',
    '/contacts/',
  ]);
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.site-header')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.locator('.translation-review-banner, .translation-pending, .navigation-pending'),
    ).toHaveCount(0);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toContainText(/[\u0600-\u06ff]/u);
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.locator('link[rel="alternate"][hreflang="ar-SA"]')).toHaveAttribute(
      'href',
      'https://nalksolutions.com' + path,
    );
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: info.outputPath(
        path === '/ar/' ? 'home.png' : path.endsWith('/contacts/') ? 'contact.png' : 'software.png',
      ),
    });
  }
  await expect(page.locator('.contact-form-note input:not([name=website])')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'إرسال الرسالة', exact: true })).toBeEnabled();
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('.desktop-nav a').filter({ hasText: 'English' })).toHaveAttribute(
    'href',
    '/contacts/',
  );
  const menu = page.getByRole('button', { name: 'فتح القائمة', exact: true });
  // Firefox loads both tab icons after the document. Finish those real loads
  // before deliberately going Back, rather than classifying cancelled assets
  // as successful resource checks.
  const englishIcons =
    browserName === 'firefox'
      ? Promise.all(
          ['32', '192'].map(async (size) => {
            const response = await page.waitForResponse(
              (response) =>
                new URL(response.url()).pathname === `/brand/nalk-mark-${size}.png` &&
                response.request().headers()['referer']?.endsWith('/contacts/') === true,
            );
            expect(response.status()).toBe(200);
            await response.finished();
          }),
        )
      : Promise.resolve();
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator('.menu-dialog[open] a[lang="en"]').click();
  } else await page.locator('.desktop-nav a[lang="en"]').click();
  await expect(page).toHaveURL(/\/contacts\/$/u);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await englishIcons;
  await page.goBack();
  await expect(page).toHaveURL(/\/ar\/contacts\/$/u);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const missing = await request.get('/ar/unknown-pilot-page/');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('dir="rtl"');
  const old = await request.get('/%D8%B4%D8%B1%D9%83%D8%A9-%D8%AA%D9%82%D9%86%D9%8A%D8%A9/', {
    maxRedirects: 0,
  });
  expect(old.status()).toBe(301);
  expect(old.headers().location).toBe('https://nalksolutions.com/ar/');
  const font = await request.get('/fonts/noto-sans-arabic.woff2');
  expect(font.status()).toBe(200);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});
