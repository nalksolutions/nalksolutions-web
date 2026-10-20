import { expect, test } from '../local-test';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import presentation from '../../tooling/sources/company-presentation.generated.json' with { type: 'json' };

for (const path of [
  '/services-ai-automation-saudi-arabia/',
  '/b2b-portal-website-development-saudi-arabia/',
  '/تسويق-رقمي/',
]) {
  const identity = identities.pages.find((page) => page.path === path);
  if (!identity) throw new Error('Missing service representative');
  test(`${identity.id}: service layout, counters, keyboard and locale navigation`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(encodeURI(path));
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('.service-site')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    await expect(page.locator('.site-header')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('.site-header')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.site-footer')).toHaveAttribute('dir', 'ltr');
    const hero = page.locator('.content-service-hero');
    await expect(hero.locator('h1')).toHaveCount(1);
    const heroBox = await hero.boundingBox();
    const viewport = page.viewportSize();
    if (!heroBox || !viewport) throw new Error('Missing hero/viewport geometry');
    const profile = viewport.width > 1024 ? 'desktop' : viewport.width > 767 ? 'tablet' : 'mobile';
    for (const heading of await page.locator('.service-site h4').all()) {
      if (
        await heading.evaluate((element) =>
          Boolean(element.closest('.service-panel-slot,[data-service-card]')),
        )
      ) {
        const size = await heading.evaluate((element) =>
          parseFloat(getComputedStyle(element).fontSize),
        );
        expect(size).toBeGreaterThanOrEqual(24);
        expect(size).toBeLessThanOrEqual(32);
      } else await expect(heading).toHaveCSS('font-size', `${presentation.headings[profile].h4}px`);
    }
    const headerBox = await page.locator('.site-header').boundingBox();
    expect(headerBox && heroBox.y >= headerBox.y + headerBox.height + 20).toBe(true);
    expect(heroBox.width).toBeLessThan(viewport.width);
    const numbers = page.locator('.content-service-counter-number');
    const centeredParagraph = page.locator('.content-service-copy-center p').first();
    if (await centeredParagraph.count()) {
      const size = await centeredParagraph.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      );
      await expect(centeredParagraph).toHaveCSS('margin-bottom', `${size * 1.5}px`);
    }
    expect((await numbers.allTextContents()).map((value) => value.replace(/\s/gu, ''))).toEqual([
      '15+',
      '200+',
      '98%',
    ]);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await (document.querySelector('.site-logo') as HTMLImageElement).decode();
    });
    await page.screenshot({ path: info.outputPath('hero.png'), animations: 'disabled' });
    if (identity.locale === 'ar' && info.project.name.startsWith('chromium-')) {
      const session = await page.context().newCDPSession(page);
      await session.send('DOM.enable');
      await session.send('CSS.enable');
      const { root } = await session.send('DOM.getDocument');
      const { nodeId } = await session.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: '.content-service-hero h1',
      });
      const fonts = await session.send('CSS.getPlatformFontsForNode', { nodeId });
      await info.attach('arabic-heading-fonts', {
        body: JSON.stringify(fonts, null, 2),
        contentType: 'application/json',
      });
      if (process.platform === 'win32')
        expect(
          fonts.fonts.some((font) => font.familyName === 'Times New Roman' && font.glyphCount > 0),
        ).toBe(true);
      await session.detach();
    }
    await numbers.first().scrollIntoViewIfNeeded();
    const numberBox = await numbers.first().boundingBox();
    const labelBox = await page.locator('.content-service-counter-title').first().boundingBox();
    if (!numberBox || !labelBox) throw new Error('Missing counter geometry');
    expect(numberBox.y + numberBox.height).toBeLessThanOrEqual(labelBox.y + 1);
    if (viewport.width >= 768) {
      const leftEdges = await numbers.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().left),
      );
      if (identity.locale === 'ar') {
        expect(leftEdges[0]).toBeGreaterThan(leftEdges[1] ?? 0);
        expect(leftEdges[1]).toBeGreaterThan(leftEdges[2] ?? 0);
      } else {
        expect(leftEdges[0]).toBeLessThan(leftEdges[1] ?? 0);
        expect(leftEdges[1]).toBeLessThan(leftEdges[2] ?? 0);
      }
    }
    await expect(page.locator('.content-service-statistics h5')).toHaveCSS(
      'font-size',
      viewport.width > 1024 ? '24px' : viewport.width > 767 ? '22px' : '18px',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath('statistics.png'), animations: 'disabled' });
    const faq = page.locator('details.content-disclosure').first();
    if (await faq.count()) {
      const before = await faq.evaluate((element) => (element as HTMLDetailsElement).open);
      const summary = faq.locator('summary');
      for (const icon of await summary.locator('svg').all()) {
        if (!(await icon.isVisible())) continue;
        const iconBox = await icon.boundingBox();
        expect(iconBox?.width).toBeLessThanOrEqual(24);
        expect(iconBox?.height).toBeLessThanOrEqual(24);
      }
      await summary.focus();
      await expect(summary).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(faq).toHaveJSProperty('open', !before);
      await page.keyboard.press('Enter');
      await expect(faq).toHaveJSProperty('open', before);
    }
    await page.evaluate(() => document.body.setAttribute('data-service-navigation', 'retained'));
    await page.locator('.site-header a[aria-label="Nalk Solutions home"]').click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    if (identity.locale === 'ar')
      await expect(page.locator('body')).not.toHaveAttribute('data-service-navigation', 'retained');
    else await expect(page.locator('body')).toHaveAttribute('data-service-navigation', 'retained');
    await page.goBack();
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    await page.reload();
    await expect(page.locator('.service-site')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
