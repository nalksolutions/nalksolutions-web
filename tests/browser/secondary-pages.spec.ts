import { decodePageImages } from './images';
import { expect, test } from '../local-test';
import { secondaryPageLayouts } from '../../src/content/secondary/layouts';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import presentation from '../../tooling/sources/secondary-presentation.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';

for (const [id, layout] of Object.entries(secondaryPageLayouts)) {
  const identity = identities.pages.find((page) => page.id === id);
  if (!identity) throw new Error('Missing secondary identity');
  test(`${id}: secondary layout, source media, controls and responsive geometry`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    const response = await page.goto(identity.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator(`.secondary-layout-${layout}`)).toBeVisible();
    const width = page.viewportSize()?.width ?? 0;
    const profile = width > 1180 ? 'desktop' : width > 767 ? 'tablet' : 'mobile';
    await decodePageImages(page, 'main img');
    if (layout === 'profile') {
      await expect(page.locator('.content-secondary-portrait')).toHaveCSS(
        'height',
        `${{ desktop: 600, tablet: 480, mobile: 400 }[profile]}px`,
      );
      await expect(page.locator('.content-secondary-education-row')).toHaveCount(4);
      await expect(page.locator('.content-secondary-shift')).toHaveCount(6);
      const carousel = page.getByRole('region', { name: 'Author articles' });
      await carousel.focus();
      await expect(carousel).toBeFocused();
      const dimensions = await carousel.evaluate((element) => ({
        width: element.clientWidth,
        full: element.scrollWidth,
        columns: getComputedStyle(element).gridAutoColumns,
      }));
      if (profile === 'desktop') expect(dimensions.full).toBe(dimensions.width);
      else expect(dimensions.full).toBeGreaterThan(dimensions.width);
      const selected = await page
        .locator('.content-fields select')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLSelectElement).value));
      expect(selected).toEqual(['08', '30']);
      await expect(
        page.getByRole('button', { name: 'Request a Consultation', exact: true }),
      ).toBeDisabled();
    } else if (layout === 'team' || layout === 'profile-archive') {
      const cards = page.locator('.content-secondary-team-card');
      expect(await cards.count()).toBe(layout === 'team' ? 6 : 1);
      const columns = await page
        .locator('.content-secondary-team-grid')
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(presentation.teamColumns[profile]);
      if (layout === 'team')
        await expect(
          page.getByRole('button', { name: 'Send Message', exact: true }),
        ).toBeDisabled();
    } else {
      expect(await page.locator('.content-secondary-credit-copy').count()).toBeGreaterThan(0);
      await expect(page.locator('.content-secondary-credit-copy').first()).toHaveCSS(
        'column-count',
        profile === 'desktop' ? '2' : '1',
      );
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: info.outputPath(`${layout}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    expect(errors).toEqual([]);
  });
}
