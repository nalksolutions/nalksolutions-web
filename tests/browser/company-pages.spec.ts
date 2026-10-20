import { decodePageImages } from './images';
import { expect, test } from '../local-test';
import { companyPageLayouts } from '../../src/content/site/schema';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };

import { collectPageDiagnostics } from './diagnostics';

const blog = identities.pages.find((page) => page.path === '/blog/');
if (!blog) throw new Error('Missing blog navigation identity');

for (const [id, layout] of Object.entries(companyPageLayouts)) {
  const identity = identities.pages.find((page) => page.id === id);
  if (!identity) throw new Error('Missing company identity');
  test(`${id}: company structure, local assets, responsive navigation and source states`, async ({
    page,
  }, info) => {
    const { errors, attachCancellations } = collectPageDiagnostics(page, [identity.path, '/blog/']);
    const response = await page.goto(encodeURI(identity.path));
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.company-layout-${layout}`)).toBeVisible();
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    await expect(page.locator('.site-header')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.site-footer')).toHaveAttribute('dir', 'ltr');
    await decodePageImages(page, '[data-document-body] img');
    const main = page.locator('[data-document-body]');
    const width = page.viewportSize()?.width ?? 0;
    const profile = width > 1180 ? 'desktop' : width > 767 ? 'tablet' : 'mobile';
    if (layout === 'about') {
      await expect(main.locator('h1')).toHaveCount(1);
      await expect(main.locator('.content-company-hidden')).toBeHidden();
      await expect(main.getByText('Our Values', { exact: true })).toBeVisible();
      const background = await main
        .locator('.content-company-values-image')
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(background).toContain('3524367-scaled.jpg');
      await expect(main.locator('.content-company-testimonial')).toHaveCount(3);
      await expect(main.locator('.content-company-testimonial:visible')).toHaveCount(3);
      expect(
        await main
          .locator('.content-company-values')
          .evaluate((el) => getComputedStyle(el).flexDirection),
      ).toBe(profile === 'desktop' ? 'row' : 'column');
      await expect(main.locator('.content-company-signature')).toHaveCount(3);
      await expect(main.locator('.journey-about-summary .site-button')).toBeVisible();
    } else if (layout === 'services') {
      await expect(main.locator('.journey-offer-card')).toHaveCount(4);
      await expect(main.locator('.journey-directory details')).toHaveCount(4);
      await expect(main.locator('.journey-directory a')).toHaveCount(21);
      await expect(main.locator('.journey-directory details[open]')).toHaveCount(0);
      const cards = main.locator('.journey-offer-card');
      const boxes = await cards.evaluateAll((elements) =>
        elements.map((el) => el.getBoundingClientRect().toJSON()),
      );
      const columns = width > 767 ? 2 : 1;
      expect(boxes.slice(0, columns).map((box) => box.y)).toEqual(Array(columns).fill(boxes[0]!.y));
      expect(boxes[columns]!.y).toBeGreaterThan(boxes[0]!.y);
    } else if (layout === 'contacts') {
      await expect(main.locator('h1')).toHaveCount(1);
      await expect(main.locator('.contact-methods a')).toHaveCount(3);
      await expect(main.locator('.contact-office')).toHaveCount(2);
      await expect(main.locator('.contact-map-link')).toHaveAttribute(
        'href',
        /^https:\/\/maps\.google\.com\/maps/u,
      );
      await expect(main.getByRole('button', { name: 'Send Message', exact: true })).toBeDisabled();
      await expect(main.getByText('To send your enquiry, email')).toBeVisible();
      await expect(main.locator('.content-fields :is(input, textarea)')).toHaveCount(4);
    } else if (layout === 'arabic-company') {
      await expect(main.locator('.content-company-feature')).toHaveCount(6);
      await expect(main.getByText('جاهز للبدء؟', { exact: true })).toBeVisible();
      const cta = await main
        .locator('.content-company-ar-cta .content-company-button')
        .boundingBox();
      expect(cta).not.toBeNull();
      if (cta)
        expect(
          Math.abs(cta.x + cta.width / 2 - (page.viewportSize()?.width ?? 0) / 2),
        ).toBeLessThan(1);
    } else {
      await expect(main.locator('h2')).toHaveText(['Posts', 'Pages', 'Categories']);
      await expect(main.locator('a[href="/our-team/"]')).toBeVisible();
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`${layout}-full.png`), fullPage: true });
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe('#main-content');
    await expect(page.locator('main')).toBeFocused();
    await page.locator('.site-footer a[href="/blog/"]').click();
    await expect(page).toHaveURL(/\/blog\/$/u);
    await expect(page.locator('main')).toHaveAttribute('data-page-id', blog.id);
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.goBack();
    await expect(page.locator(`.company-layout-${layout}`)).toBeVisible();
    await page.goForward();
    await expect(page.locator('main')).toHaveAttribute('data-page-id', blog.id);
    await page.goBack();
    await expect(page.locator(`.company-layout-${layout}`)).toBeVisible();
    await page.reload();
    await expect(page).toHaveTitle(identity.seo.title);
    await attachCancellations(info);
    expect(errors).toEqual([]);
  });
}
