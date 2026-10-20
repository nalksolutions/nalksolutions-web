import { expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';
import { readFileSync } from 'node:fs';
import type { DocumentNode } from '../../src/content/site/schema';

const apiPath = '/services-api-integration-saudi-arabia/';
function fragments(nodes: readonly DocumentNode[]): string[] {
  return nodes
    .flatMap((node): string[] => {
      if (node.type === 'element' && /^(p|h[1-6]|li)$/u.test(node.tag)) {
        const text = (items: readonly DocumentNode[]): string =>
          items
            .map((item) =>
              item.type === 'text' ? item.text : 'children' in item ? text(item.children) : '',
            )
            .join('');
        return [text(node.children).replace(/\s+/gu, ' ').trim()];
      }
      return 'children' in node ? fragments(node.children) : [];
    })
    .filter(Boolean);
}
test('integration capabilities are coherent panels with preserved content and working resources', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page);
  await page.goto(apiPath);
  await expect(
    page.getByRole('heading', { name: 'Common Integration Scenarios Nalk Offers' }),
  ).toBeVisible();
  const grid = page.locator('.service-panel-grid').first();
  await expect(grid.locator('.service-panel-slot')).toHaveCount(6);
  await grid.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const body = ((await page.locator('[data-document-body]').textContent()) ?? '').replace(
    /\s+/gu,
    ' ',
  );
  const source = JSON.parse(
    readFileSync('src/content/site/documents/R-3c0c402f82a25de6.json', 'utf8'),
  );
  for (const fragment of fragments(source.nodes)) expect(body).toContain(fragment);
  await expect(grid.locator('.site-button')).toHaveCount(0);
  await expect(grid.locator('.service-detail-link')).toHaveCount(6);
  const orphan = grid.locator('[data-service-actions-only]');
  await expect(orphan).toHaveCount(1);
  const marketing = page.getByRole('heading', {
    name: 'Marketing Automation Integration',
    exact: true,
  });
  const button = orphan.getByRole('link');
  expect((await button.boundingBox())!.y).toBeGreaterThan((await marketing.boundingBox())!.y);
  await grid.screenshot({ path: info.outputPath('integration-scenarios.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.every(
          (image) =>
            image instanceof HTMLImageElement && (!image.complete || image.naturalWidth > 0),
        ),
      ),
  ).toBe(true);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('shared service design stays readable across offers, specialists and Arabic', async ({
  page,
}) => {
  for (const path of [
    '/services-custom-software-app-development-saudi-arabia/',
    '/services-ai-automation-saudi-arabia/',
    '/services-digital-marketing/',
    '/b2b-portal-website-development-saudi-arabia/',
    '/تسويق-رقمي/',
  ]) {
    const response = await page.goto(encodeURI(path));
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator('.service-artwork svg')).toBeVisible();
    if (path === '/تسويق-رقمي/') await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  }
});

test('odd final capability spans the row while paired cards keep their columns', async ({
  page,
}, info) => {
  await page.goto('/services-ai-automation-saudi-arabia/');
  const card = page.locator('.service-panel-slot').filter({
    has: page.getByRole('heading', { name: 'HR and Employee Operations', exact: true }),
  });
  const grid = card.locator('..');
  await card.scrollIntoViewIfNeeded();
  const last = (await card.boundingBox())!;
  const first = (await grid.locator('.service-panel-slot').first().boundingBox())!;
  const children = await grid.locator('.service-panel-slot').count();
  expect(children % 2).toBe(1);
  const bounds = await grid.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      width: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      left: element.getBoundingClientRect().left + parseFloat(style.paddingLeft),
    };
  });
  expect(last.width).toBeCloseTo(bounds.width, 0);
  expect(last.x).toBeCloseTo(bounds.left, 0);
  if (page.viewportSize()!.width > 767) expect(last.width).toBeGreaterThan(first.width * 1.9);
  else expect(last.width).toBeCloseTo(first.width, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await card.screenshot({ path: info.outputPath('odd-final-card.png') });
});
