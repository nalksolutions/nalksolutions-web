import { expect, test } from '../local-test';
import source from '../../tooling/sources/article-body-presentation.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';

for (const path of [
  '/ahrefs-vs-semrush-vs-screaming-frog/',
  '/custom-web-app-development-guide/',
  '/how-to-hire-developers-for-your-startup/',
]) {
  test(`${path}: article tables, quotations and source heading typography`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    await page.goto(path);
    const width = page.viewportSize()?.width ?? 0;
    const profile = width > 1024 ? 'desktop' : width > 767 ? 'tablet' : 'mobile';
    const body = page.locator('[data-article-body]');
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const image of document.querySelectorAll<HTMLImageElement>('[data-article-body] img')) {
        image.loading = 'eager';
        await image.decode();
      }
    });
    if (path.includes('ahrefs')) {
      const table = body.locator('table').first();
      await table.scrollIntoViewIfNeeded();
      await expect(table.locator('td').first()).toHaveCSS(
        'font-size',
        `${source.small[profile]}px`,
      );
      await expect(table.locator('td').first()).toHaveCSS('padding', source.tableCellPadding);
      await expect(table.locator('th').first()).toHaveCSS(
        'font-size',
        `${source.headings[profile].h6}px`,
      );
      expect(source.tableHeadingAlignment).toBe('inherit');
      await expect(table.locator('th').first()).toHaveCSS(
        'text-align',
        await table.evaluate((element) => getComputedStyle(element).textAlign),
      );
      await expect(table.locator('th').first()).toHaveCSS(
        'border-left-width',
        source.tableHeadingFirstLeftBorder,
      );
      await expect(table.locator('th').nth(1)).toHaveCSS(
        'border-right-width',
        source.tableHeadingLastRightBorder,
      );
      await body.getByRole('region', { name: 'Scrollable table' }).first().focus();
      await expect(body.getByRole('region', { name: 'Scrollable table' }).first()).toBeFocused();
    } else if (path.includes('custom-web')) {
      const quote = body.locator('blockquote').first();
      await quote.scrollIntoViewIfNeeded();
      await expect(quote).toHaveCSS('font-size', `${source.quote[profile]}px`);
      await expect(quote).toHaveCSS('padding', source.quotePadding);
      await expect(quote).toHaveCSS('background-color', 'rgb(39, 39, 39)');
    } else {
      await expect(body.locator('h5').first()).toHaveCSS(
        'font-size',
        `${source.headings[profile].h5}px`,
      );
      await expect(body.locator('h5').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(body.locator('h5 .content-regular').first()).toHaveCSS('font-weight', '400');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath('article-body.png'), animations: 'disabled' });
    expect(errors).toEqual([]);
  });
}

for (const path of [
  '/12-types-of-digital-ads-that-drive-sales-2026/',
  '/edm-marketing-for-saudi-businesses/',
  '/how-web-development-and-digital-marketing/',
]) {
  test(`${path}: article exceptions retain source image, table and plain quotation spacing`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const width = page.viewportSize()!.width;
    const size = width > 1024 ? 18 : width > 767 ? 17 : 16;
    const body = page.locator('[data-article-body]');
    if (path.includes('how-web-development')) {
      const plain = body.locator('.content-plain-quote');
      await expect(plain).toHaveCount(1);
      await expect(plain).toHaveCSS('font-size', `${size}px`);
      await expect(plain).toHaveCSS('padding', '0px');
      await expect(plain).toHaveCSS('margin-left', '40px');
      await expect(plain).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(body.locator('blockquote:not(.content-plain-quote)')).toHaveCSS(
        'padding',
        '60px',
      );
      await plain.scrollIntoViewIfNeeded();
    } else {
      const image = body.locator('h2 img');
      await expect(image).toHaveCount(1);
      await expect(image).toHaveCSS('margin-top', `${size * 3}px`);
      await expect(image).toHaveCSS('margin-bottom', `${size * 3}px`);
      if (path.includes('12-types')) {
        const paragraph = body.locator('td p');
        await expect(paragraph).toHaveCount(1);
        await expect(paragraph).toHaveCSS('margin-top', `${size * 1.5}px`);
        await expect(paragraph).toHaveCSS('margin-bottom', `${size * 1.5}px`);
      }
      await image.scrollIntoViewIfNeeded();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: info.outputPath('article-exception.png'),
      animations: 'disabled',
    });
    expect(errors).toEqual([]);
  });
}
