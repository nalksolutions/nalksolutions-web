import { installLocalNetworkGuard, expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

const representative = '/professional-website-development-company-in-saudi-arabia/';
for (const path of [representative, '/services-api-integration-saudi-arabia/']) {
  test(`${path}: source process panels support responsive pointer and keyboard selection`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    await page.goto(path);
    const tabs = page.locator('.content-service-tabs');
    await expect(tabs).toHaveAttribute('data-enhanced', 'true');
    const panels = tabs.locator('.content-service-tab-panel');
    const count = await panels.count();
    expect(count).toBeGreaterThanOrEqual(5);
    await expect(panels.first()).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();
    const mobile = (page.viewportSize()?.width ?? 0) <= 767;
    if (mobile) {
      const buttons = tabs.locator('.content-service-tab-mobile');
      await buttons.nth(1).focus();
      await page.keyboard.press('Enter');
      await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
      await expect(panels.first()).toBeHidden();
      await expect(panels.nth(1)).toBeVisible();
      await page.keyboard.press('Space');
      await expect(panels.nth(1)).toBeHidden();
      await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'false');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await expect(panels.first()).toBeVisible();
    } else {
      const controls = tabs.getByRole('tab');
      await controls.first().focus();
      await page.keyboard.press('ArrowRight');
      await expect(controls.nth(1)).toBeFocused();
      await expect(controls.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(panels.nth(1)).toBeVisible();
      await expect(panels.first()).toBeHidden();
      await page.keyboard.press('End');
      await expect(controls.last()).toBeFocused();
      await expect(panels.last()).toBeVisible();
      await page.keyboard.press('Home');
      await expect(panels.first()).toBeVisible();
    }
    await expect(tabs.locator('.content-service-tab-panel:not([hidden])')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await tabs.screenshot({ path: info.outputPath('process-panels.png') });
    await page.reload();
    await expect(page.locator('.content-service-tabs')).toHaveAttribute('data-enhanced', 'true');
    await expect(page.locator('.content-service-tab-panel').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('process content remains entirely readable without JavaScript', async ({ browser }, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: info.project.use.viewport ?? { width: 1440, height: 1000 },
  });
  await installLocalNetworkGuard(context);
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:${process.env.TEST_PORT ?? '3100'}${representative}`);
    const panels = page.locator('.content-service-tab-panel');
    await expect(panels).toHaveCount(6);
    for (const panel of await panels.all()) await expect(panel).toBeVisible();
  } finally {
    await context.close();
  }
});
