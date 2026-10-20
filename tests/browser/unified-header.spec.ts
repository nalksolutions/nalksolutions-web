import { expect, test } from '../local-test';
import { collectPageDiagnostics } from './diagnostics';

const routes = [
  '/',
  '/about-us/',
  '/our-services/',
  '/services-ai-automation-saudi-arabia/',
  '/services-cloud-portal-development-saudi-arabia/',
  '/blog/',
  '/how-to-build-an-api-from-scratch-a-step-by-step-guide/',
  '/contacts/',
  '/شركة-تقنية/',
];

test('unified header: consistent geometry, readable glass and clearance across page families', async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  const { errors, attachCancellations } = collectPageDiagnostics(page, routes);
  const geometries: {
    route: string;
    left: number;
    right: number;
    top: number;
    height: number;
    logoWidth: number;
  }[] = [];
  for (const [index, route] of routes.entries()) {
    const response = await page.goto(route);
    expect(response!.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', index === 8 ? 'ar' : 'en-US');
    await expect(page.locator('.menu-trigger')).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.locator('.site-header').evaluate((header) => {
      const bounds = header.getBoundingClientRect();
      const title = document.querySelector('h1')!.getBoundingClientRect();
      const logo = header.querySelector('.site-logo')!.getBoundingClientRect();
      const style = getComputedStyle(header);
      const children = [
        ...header.querySelectorAll(
          '.site-logo, .desktop-nav a, .search-trigger, .header-cta, .menu-trigger',
        ),
      ]
        .filter((element) => element.getClientRects().length)
        .map((element) => element.getBoundingClientRect());
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        height: bounds.height,
        logoWidth: logo.width,
        titleTop: title.top,
        position: style.position,
        background: style.backgroundColor,
        backgroundOpacity: style.backgroundColor.startsWith('rgba')
          ? Number(style.backgroundColor.slice(5, -1).split(',').at(-1))
          : 1,
        radius: style.borderRadius,
        childrenFit: children.every(
          (box) =>
            box.left >= bounds.left &&
            box.right <= bounds.right &&
            box.top >= bounds.top &&
            box.bottom <= bounds.bottom,
        ),
        overflow: document.documentElement.scrollWidth > innerWidth,
        navCenter: (() => {
          const nav = header.querySelector('.header-navigation')!.getBoundingClientRect();
          return Math.abs((nav.left + nav.right) / 2 - (bounds.left + bounds.right) / 2);
        })(),
      };
    });
    geometries.push({ route, ...dimensions });
    expect(dimensions.position).toBe('absolute');
    expect(dimensions.radius).toBe('14px');
    expect(dimensions.backgroundOpacity).toBeGreaterThanOrEqual(0.8);
    expect(dimensions.childrenFit, route).toBe(true);
    expect(dimensions.overflow, route).toBe(false);
    expect(dimensions.titleTop, route).toBeGreaterThanOrEqual(dimensions.top + dimensions.height);
    if (page.viewportSize()!.width > 1180) expect(dimensions.navCenter).toBeLessThanOrEqual(1);
    await expect(page.locator('.header-cta a')).toHaveAttribute('href', '/contacts/');
    await expect(page.locator('.site-header')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.site-header')).toHaveAttribute('dir', 'ltr');
    if (index === 0 || index === 1 || index === 3 || index === 6 || index === 8)
      await page.screenshot({ path: info.outputPath(`header-${index}.png`), caret: 'initial' });
  }
  const values = geometries;
  for (const geometry of values.slice(1)) {
    expect(geometry.left).toBeCloseTo(values[0]!.left, 0);
    expect(geometry.right).toBeCloseTo(values[0]!.right, 0);
    expect(geometry.top).toBeCloseTo(values[0]!.top, 0);
    expect(geometry.height).toBeCloseTo(values[0]!.height, 0);
    expect(geometry.logoWidth).toBeCloseTo(values[0]!.logoWidth, 0);
  }
  await info.attach('header-geometry.json', {
    body: JSON.stringify(geometries, null, 2),
    contentType: 'application/json',
  });
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('unified header: one breakpoint and no colliding controls at boundary widths', async ({
  page,
}) => {
  await page.goto('/about-us/');
  for (const width of [1440, 1181, 1180, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.desktop-nav')).toBeVisible({ visible: width > 1180 });
    await expect(page.locator('.search-trigger')).toBeVisible({ visible: width > 1180 });
    await expect(page.locator('.menu-trigger')).toBeVisible({ visible: width <= 1180 });
    await expect(page.locator('.header-cta')).toBeVisible({ visible: width >= 768 });
    expect(
      await page.locator('.site-header').evaluate((header) => {
        const children = ['.site-logo', '.header-navigation', '.header-cta', '.menu-trigger']
          .map((selector) => header.querySelector(selector)!)
          .filter((element) => element.getClientRects().length)
          .map((element) => element.getBoundingClientRect())
          .sort((a, b) => a.left - b.left);
        return children.every((box, index) => !index || box.left >= children[index - 1]!.right);
      }),
      `${width}px controls must not overlap`,
    ).toBe(true);
  }
});

test('unified header: short-screen menu scrolls independently with a reachable close button', async ({
  page,
}, info) => {
  const { errors } = collectPageDiagnostics(page);
  await page.setViewportSize({ width: 320, height: 360 });
  await page.goto('/');
  for (const [width, height] of [
    [320, 360],
    [740, 320],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
    const content = dialog.locator('.menu-dialog-content');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.locator('[aria-current="page"]')).toHaveText('Home');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const bounds = await dialog.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height!);
    const close = dialog.getByRole('button', { name: 'Close menu' });
    const heading = await close.boundingBox();
    expect(await content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      true,
    );
    await close.focus();
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      );
    }
    const cta = dialog.getByRole('link', { name: 'Discuss Your Project', exact: true });
    await cta.focus();
    await expect(cta).toBeInViewport();
    expect(await content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect((await close.boundingBox())!.y).toBeCloseTo(heading!.y, 0);
    await expect(close).toBeInViewport();
    await page.screenshot({
      path: info.outputPath(`menu-${width}x${height}.png`),
      caret: 'initial',
    });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  }
  expect(errors).toEqual([]);
});

test('unified header: subtle open and close motion retains modality and handles interruption', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await expect(trigger).toBeEnabled();
  const opening = await trigger.evaluate((button) => {
    (button as HTMLButtonElement).click();
    const dialog = document.querySelector<HTMLDialogElement>('.menu-dialog')!;
    return dialog
      .getAnimations()
      .filter((animation) => animation instanceof Animation && !(animation instanceof CSSAnimation))
      .map((animation) => ({
        duration: animation.effect!.getTiming().duration,
        frames: (animation.effect as KeyframeEffect).getKeyframes(),
      }));
  });
  expect(opening).toHaveLength(1);
  expect(opening[0]!.duration).toBe(200);
  expect(opening[0]!.frames[0]!.transform).toBe('translateY(8px)');
  const dialog = page.locator('.menu-dialog');
  const closing = await dialog.evaluate((element) => {
    element.querySelector<HTMLButtonElement>('[aria-label="Close menu"]')!.click();
    element.dispatchEvent(new Event('cancel', { cancelable: true }));
    return {
      open: (element as HTMLDialogElement).open,
      modal: element.matches(':modal'),
      closing: element.getAttribute('data-closing'),
    };
  });
  expect(closing).toEqual({ open: true, modal: true, closing: 'true' });
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  expect(await dialog.evaluate((element) => element.getAnimations().length)).toBe(0);
  // Close events are queued by the platform; reopening before delivery must stay open.
  await dialog.evaluate((element) => {
    element.querySelector<HTMLButtonElement>('[aria-label="Close menu"]')!.click();
    document.querySelector<HTMLButtonElement>('.menu-trigger')!.click();
  });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('unified header: menu navigation and history preserve current-page identity', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { errors, attachCancellations } = collectPageDiagnostics(page, ['/', '/about-us/']);
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await trigger.click();
  await page
    .getByRole('navigation', { name: 'Mobile primary' })
    .getByRole('link', { name: 'About Us', exact: true })
    .click();
  await expect(page).toHaveURL(/\/about-us\/$/u);
  await expect(page.locator('.menu-dialog')).not.toBeVisible();
  await trigger.click();
  await expect(page.locator('.menu-dialog [aria-current="page"]')).toHaveText('About Us');
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-dialog')).not.toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/u);
  await trigger.click();
  await expect(page.locator('.menu-dialog [aria-current="page"]')).toHaveText('Home');
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-dialog')).not.toBeVisible();
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('unified header: 200 percent equivalent reflow keeps menu and actions usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 500 });
  await page.goto('/about-us/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
  const cta = dialog.getByRole('link', { name: 'Discuss Your Project', exact: true });
  await cta.focus();
  await expect(cta).toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close menu' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cta).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
