import { installLocalNetworkGuard, expect, test } from '../local-test';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';
import { assertSharedActions } from './shared-actions';

const journeys = [
  ['/services-ai-automation-saudi-arabia/', '.content-service-button'],
  ['/locations-website-development-riyadh/', '.content-service-button'],
  ['/تسويق-رقمي/', '.content-service-button'],
  ['/شركة-تقنية/', '.content-company-ar-cta .site-button'],
  ['/contacts/', '.journey-contact-links a[href^="mailto:"]'],
  ['/blog/', '.content-listing-read-more'],
  ['/cmsms_profile/daniel-foster/', '.content-listing-read-more'],
] as const;

test('remaining page actions share feedback and retain language-aware navigation', async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  const paths: string[] = journeys.map(([path]) => path);
  const { errors, attachCancellations } = collectPageDiagnostics(page, paths);
  for (const [path, selector] of journeys) {
    const source = identities.pages.find((item) => item.path === path)!;
    await page.goto(encodeURI(path));
    await page.evaluate(() => document.fonts.ready);
    await assertSharedActions(page);
    const action = page.locator(selector).first();
    if (path === '/contacts/') {
      // D-20 removes the competing About promotion. Contact's next action is a
      // real contact link, not another internal page or an unavailable form.
      await expect(action).toHaveAttribute('href', 'mailto:info@nalksolutions.com');
      await expect(
        page.locator('.journey-contact-links a[href="tel:+923055518777"]'),
      ).toBeVisible();
      await action.focus();
      await expect(action).toBeFocused();
      await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeDisabled();
      continue;
    }
    const href = (await action.getAttribute('href'))!;
    const target = identities.pages.find(
      (item) => item.path === decodeURI(new URL(href, page.url()).pathname),
    );
    if (!target) throw new Error(`Missing action destination: ${href}`);
    paths.push(target.path);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await action.hover();
    await expect(action).toHaveCSS('color', 'rgb(2, 2, 2)');
    await expect
      .poll(() => action.evaluate((e) => getComputedStyle(e, '::before').opacity))
      .toBe('1');
    await expect(action).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)');
    const wrapper = action.locator('..');
    if ((await wrapper.getAttribute('class'))?.includes('content-listing-action'))
      await expect(wrapper).toHaveCSS('transform', 'none');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await action.focus();
    await expect(action).toBeFocused();
    await expect(action).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(action).toHaveCSS('transform', 'none');
    await expect(action).toHaveCSS('transition-duration', '0s');
    await page.evaluate(() => document.body.setAttribute('data-action-navigation', 'retained'));
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toHaveAttribute('data-page-id', target.id);
    await expect(page).toHaveTitle(target.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      target.locale === 'ar' ? 'rtl' : 'ltr',
    );
    if (source.locale !== target.locale)
      await expect(page.locator('body')).not.toHaveAttribute('data-action-navigation', 'retained');
    else await expect(page.locator('body')).toHaveAttribute('data-action-navigation', 'retained');
    await page.goBack();
    await expect(page.locator('main')).toHaveAttribute('data-page-id', source.id);
    if (info.project.use.hasTouch) await page.locator(selector).first().tap();
    else await page.locator(selector).first().click();
    await expect(page.locator('main')).toHaveAttribute('data-page-id', target.id);
  }
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('remaining company layouts keep headings clear and enquiry controls honest', async ({
  page,
}) => {
  for (const path of [
    '/contacts/',
    '/شركة-تقنية/',
    '/nalk-solutions-sitemap/',
    '/our-team/',
    '/cmsms_profile/daniel-foster/',
  ]) {
    await page.goto(encodeURI(path));
    await page.evaluate(() => document.fonts.ready);
    await assertSharedActions(page);
    const heading = await page.locator('main :is(h1,h2,h3)').first().boundingBox();
    // Measure painted controls, not the header's transparent outer padding.
    const headerBottom = await page
      .locator(
        '.site-header :is(.site-logo,.header-navigation,.menu-trigger,.header-cta .site-button)',
      )
      .evaluateAll((elements) =>
        Math.max(
          ...elements.map((element) => {
            const box = element.getBoundingClientRect();
            return box.width && box.height ? box.bottom : 0;
          }),
        ),
      );
    expect(heading!.y).toBeGreaterThanOrEqual(headerBottom);
    for (const button of await page.locator('.content-enquiry > button').all()) {
      await button.hover();
      await expect(button).toHaveCSS('transform', 'none');
      await expect
        .poll(() => button.evaluate((e) => getComputedStyle(e, '::before').opacity))
        .toBe('0');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.goto('/contacts/');
  const details = page.locator('.journey-contact-links');
  await expect(details.locator('a')).toHaveCount(3);
  await expect(details.locator('a').nth(0)).toHaveAttribute('href', 'tel:+966506000843');
  await expect(details.locator('a').nth(1)).toHaveAttribute('href', 'tel:+923055518777');
  await expect(details.locator('a').nth(2)).toHaveAttribute(
    'href',
    'mailto:info@nalksolutions.com',
  );
});

test('remaining service and listing actions work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('Production test base URL is required');
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    for (const [path, selector] of [journeys[0], journeys[3], journeys[5]]) {
      await page.goto(encodeURI(path));
      const action = page.locator(selector).first();
      const href = (await action.getAttribute('href'))!;
      const target = identities.pages.find(
        (item) => item.path === decodeURI(new URL(href, page.url()).pathname),
      )!;
      await action.click();
      await expect(page.locator('main')).toHaveAttribute('data-page-id', target.id);
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        target.locale === 'ar' ? 'rtl' : 'ltr',
      );
    }
  } finally {
    await context.close();
  }
});
