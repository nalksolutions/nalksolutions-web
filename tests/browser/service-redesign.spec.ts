import { test, expect } from '../local-test';
import { readFileSync } from 'node:fs';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';
import { assertSharedActions } from './shared-actions';

const services = identities.pages.filter((page) => {
  if (!('documentId' in page.content)) return false;
  const document = JSON.parse(readFileSync(`src/content/site/documents/${page.id}.json`, 'utf8'));
  return document.serviceLayout === 'service-v1';
});
const representatives = new Set([
  'R-54ef9c93732551a9',
  'R-2ea04bcf8b41b11f',
  'R-6e7e1d49e2793d9b',
  'R-661faf9de8b4a219',
  'R-38a23850594a47d4',
]);

for (const identity of services) {
  test(`service redesign ${identity.id}: responsive content and interactions ${representatives.has(identity.id) ? '@service-family' : '@coverage'}`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    const response = await page.goto(encodeURI(identity.path));
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('h1')).toHaveText(identity.content.heading);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator('.service-hero-scene');
    const header = (await page.locator('.site-header').boundingBox())!;
    const title = (await hero.locator('h1').boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(header.y + header.height + 20);
    await expect(hero.locator('.service-artwork')).toHaveAttribute('aria-hidden', 'true');
    await assertSharedActions(page);
    const buttons = page.locator('main a.content-service-button');
    expect(await buttons.count()).toBeGreaterThan(0);
    for (const action of await buttons.all())
      expect(await action.getAttribute('href')).not.toBe('#');
    for (const section of await page
      .locator('.content-service-statistics,.content-service-section')
      .all()) {
      await section.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        identity.path,
      ).toBe(true);
    }
    const faq = page.locator('details.content-disclosure').first();
    if (await faq.count()) {
      await expect(faq).toHaveAttribute('data-enhanced', 'true');
      const before = await faq.evaluate((el) => (el as HTMLDetailsElement).open);
      await faq.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(faq).toHaveJSProperty('open', !before);
      await page.keyboard.press('Enter');
      await expect(faq).toHaveJSProperty('open', before);
    }
    if (info.project.name === 'chromium-mobile') {
      await page.setViewportSize({ width: 320, height: 844 });
      await hero.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        '320px ' + identity.path,
      ).toBe(true);
      await page.setViewportSize({ width: 390, height: 844 });
    }
    if (info.project.name === 'chromium-desktop' && representatives.has(identity.id)) {
      for (const width of [1601, 1920, 2048]) {
        await page.setViewportSize({ width, height: 1000 });
        const headline = (await hero.locator('h1').boundingBox())!;
        const navigation = (await page.locator('.site-header').boundingBox())!;
        const edge = identity.locale === 'ar' ? headline.x + headline.width : headline.x;
        const navEdge = identity.locale === 'ar' ? navigation.x + navigation.width : navigation.x;
        expect(Math.abs(edge - navEdge), `hero alignment at ${width}`).toBeLessThan(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath('redesigned-service.png') });
    expect(errors).toEqual([]);
  });
}
