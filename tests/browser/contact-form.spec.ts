import { randomUUID } from 'node:crypto';
import { expect, test, installLocalNetworkGuard } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

for (const locale of ['en', 'ar'] as const) {
  test(`Contact delivery: ${locale} validation, pending, duplicate prevention and acceptance`, async ({
    page,
  }, info) => {
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': `browser-${randomUUID()}` });
    const { errors, attachCancellations } = collectPageDiagnostics(page, [
      '/contacts/',
      '/ar/contacts/',
    ]);
    await page.goto(locale === 'ar' ? '/ar/contacts/' : '/contacts/');
    const form = page.locator('[data-contact-form]');
    await expect(form.locator('[name="website"]')).toHaveJSProperty('readOnly', true);
    await expect(form.locator('[name="website"]')).toHaveValue('');
    await form.scrollIntoViewIfNeeded();
    const submit = form.locator('button[type="submit"]');
    await expect(submit).toBeEnabled();
    let requests = 0;
    let release = () => {};
    const delivery = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/contact/', async (route) => {
      requests++;
      await delivery;
      await route.fulfill({ response: await route.fetch({ maxRedirects: 0 }) });
    });
    await submit.click();
    expect(requests).toBe(0);
    expect(
      await form
        .locator('[name="name-1"]')
        .evaluate((element) => (element as HTMLInputElement).validity.valueMissing),
    ).toBe(true);
    await form
      .locator('[name="name-1"]')
      .fill(locale === 'ar' ? 'عبدالله العتيبي' : 'Project visitor');
    await form.locator('[name="email-1"]').fill('visitor@example.com');
    await form
      .locator('textarea')
      .fill(
        locale === 'ar'
          ? 'نحتاج إلى موقع عربي وإنجليزي لأعمالنا في جدة.'
          : 'We would like a bilingual website for our business.',
      );
    await submit.click();
    await expect(form).toHaveAttribute('aria-busy', 'true');
    await expect(submit).toBeDisabled();
    await form.evaluate((element) => {
      (element as HTMLFormElement).requestSubmit();
    });
    expect(requests).toBe(1);
    release();
    await expect(form.locator('[data-state="success"]')).toBeVisible();
    await expect(form.locator('[role="status"]')).toBeFocused();
    await expect(form.locator('[name="email-1"]')).toHaveValue('');
    expect(requests).toBe(1);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
    await attachCancellations(info);
    await form.screenshot({ path: info.outputPath(`${locale}-accepted.png`) });
  });
}

test('Contact delivery: failure preserves details and retry reuses the same email operation', async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `browser-${randomUUID()}` });
  await page.goto('/contacts/');
  const form = page.locator('[data-contact-form]');
  const ids: string[] = [];
  await page.route('**/api/contact/', async (route) => {
    ids.push(route.request().postDataJSON().submissionId);
    if (ids.length === 1)
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'delivery_failed' }),
      });
    else await route.fulfill({ response: await route.fetch({ maxRedirects: 0 }) });
  });
  await form.locator('[name="name-1"]').fill('Project visitor');
  await form.locator('[name="email-1"]').fill('visitor@example.com');
  await form.locator('textarea').fill('Please discuss our website project.');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-state="delivery_failed"]')).toBeVisible();
  await expect(form.locator('[name="email-1"]')).toHaveValue('visitor@example.com');
  await expect(form.locator('textarea')).toHaveValue('Please discuss our website project.');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-state="success"]')).toBeVisible();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});

test('Contact delivery: no-JavaScript fallback keeps email accessible and personal data out of URLs', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL: baseURL!, javaScriptEnabled: false });
  await installLocalNetworkGuard(context, baseURL!);
  try {
    const page = await context.newPage();
    for (const path of ['/contacts/', '/ar/contacts/']) {
      await page.goto(path);
      const form = page.locator('[data-contact-form]');
      await expect(page.locator('script[src*="challenges.cloudflare.com"]')).toHaveCount(0);
      await expect(form.locator('fieldset')).toBeHidden();
      await expect(form.locator('.contact-email-alternative a')).toHaveAttribute(
        'href',
        'mailto:info@nalksolutions.com',
      );
      await expect(form.locator('.contact-email-alternative a')).toBeVisible();
      await expect(form).toHaveAttribute('method', 'post');
    }
  } finally {
    await context.close();
  }
});
