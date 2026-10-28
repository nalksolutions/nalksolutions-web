import { expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';
import { footerOfferPaths } from '../../src/content/journey/footer';

test('brand icon, uncropped Contact photo and complete responsive footer', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page);
  await page.goto('/contacts/');
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute(
    'href',
    '/brand/nalk-mark-32.png',
  );
  const icon = await page.request.get('/brand/nalk-mark-32.png');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/png');
  const photo = page.locator('.contact-hero-media img');
  await photo.evaluate(async (image: HTMLImageElement) => image.decode());
  const shape = await photo.evaluate((image: HTMLImageElement) => ({
    natural: image.naturalWidth / image.naturalHeight,
    displayed: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
  }));
  expect(shape.displayed).toBeCloseTo(shape.natural, 2);
  await page.screenshot({ path: info.outputPath('contact-full-photo.png') });
  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(
    footer.getByRole('navigation', { name: 'Footer company' }).getByRole('link'),
  ).toHaveCount(5);
  for (const href of Object.values(footerOfferPaths)) {
    await expect(footer.locator(`a[href="${href}"]`)).toBeVisible();
  }
  await expect(footer.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(footer.locator('a[href="mailto:info@nalksolutions.com"]')).toBeVisible();
  await expect(footer).toContainText('Bahria Town, Rawalpindi Pakistan');
  await expect(footer).toContainText('Jeddah, Saudi Arabia');
  await expect(footer.getByRole('link', { name: 'Sitemap', exact: true })).toHaveAttribute(
    'href',
    '/nalk-solutions-sitemap/',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await footer.screenshot({ path: info.outputPath('footer.png') });
  await attachCancellations(info);
  expect(errors).toEqual([]);
});
