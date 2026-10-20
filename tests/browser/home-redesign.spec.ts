import { installLocalNetworkGuard, expect, test, type Page } from '../local-test';
import content from '../../src/content/home/home.generated.json' with { type: 'json' };
import assets from '../../src/content/home/assets.generated.json' with { type: 'json' };
import { offers } from '../../src/content/journey/offers';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { collectPageDiagnostics } from './diagnostics';

async function serviceGeometry(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const cards = await page.locator('.home-service-card').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        height: box.height,
        rows: [...element.children].map((child) => {
          const rect = child.getBoundingClientRect();
          return { top: rect.top, right: rect.right, bottom: rect.bottom };
        }),
      };
    }),
  );
  expect(cards).toHaveLength(4);
  const width = page.viewportSize()!.width;
  const columns = width > 1180 ? 4 : width >= 768 ? 2 : 1;
  for (let start = 0; start < cards.length; start += columns) {
    const row = cards.slice(start, start + columns);
    for (const card of row) {
      expect(card.x).toBeGreaterThanOrEqual(20);
      expect(card.right).toBeLessThanOrEqual(width - 20);
      expect(card.rows).toHaveLength(5);
      expect(Math.abs(card.top - row[0]!.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(card.height - row[0]!.height)).toBeLessThanOrEqual(1);
      for (const [index, child] of card.rows.entries()) {
        expect(Math.abs(child.top - row[0]!.rows[index]!.top)).toBeLessThanOrEqual(1);
        expect(child.right).toBeLessThanOrEqual(card.right - 20);
        expect(child.bottom).toBeLessThanOrEqual(card.bottom - 20);
      }
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('homepage redesign aligns service content and actions across responsive rows', async ({
  page,
}, info) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/');
  await serviceGeometry(page);
  for (const [index, service] of offers.entries()) {
    const card = page.locator('.home-service-card').nth(index);
    await expect(card).toHaveAttribute(
      'href',
      identities.pages.find((p) => p.id === service.pageId)!.path,
    );
    await expect(card.locator('h3')).toHaveText(service.label);
    await expect(card.locator('p')).toHaveText([service.outcome, service.description]);
  }
  await page.locator('.home-services').screenshot({ path: info.outputPath('services.png') });
  if (info.project.name === 'chromium-desktop') {
    for (const width of [320, 639, 640, 767, 768, 1024, 1025, 1180, 1181, 1920, 2048]) {
      await page.setViewportSize({ width, height: 1000 });
      await serviceGeometry(page);
    }
  }
  expect(errors).toEqual([]);
});

test('homepage redesign contains feature cards and retains their images on small screens', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, [
    '/services-ai-automation-saudi-arabia/',
  ]);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const [index, feature] of content.features.entries()) {
    const card = page.locator('.home-feature').nth(index);
    await expect(card.getByRole('heading', { name: feature.title, exact: true })).toBeVisible();
    await expect(card.locator('.home-feature-copy > p').last()).toHaveText(feature.description);
    const image = card.locator('.home-feature-image');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    const bounds = (await card.boundingBox())!;
    const picture = (await image.boundingBox())!;
    const copy = (await card.locator('.home-feature-copy').boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(20);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width - 20);
    expect(bounds.width).toBeLessThanOrEqual(1280);
    expect(picture.width).toBeGreaterThan(100);
    expect(picture.height).toBeGreaterThan(100);
    expect(picture.x).toBeGreaterThanOrEqual(bounds.x + 20);
    expect(picture.x + picture.width).toBeLessThanOrEqual(bounds.x + bounds.width - 20);
    expect(picture.y + picture.height).toBeLessThanOrEqual(bounds.y + bounds.height - 20);
    if (page.viewportSize()!.width > 1024 && index === 0)
      expect(picture.x).toBeGreaterThanOrEqual(copy.x + copy.width + 20);
    else expect(copy.y).toBeGreaterThanOrEqual(picture.y + picture.height + 20);
    const offer = offers[index === 0 ? 2 : 1]!;
    await expect(card.getByRole('link', { name: offer.action })).toHaveAttribute(
      'href',
      identities.pages.find((p) => p.id === offer.pageId)!.path,
    );
  }
  await page.locator('.home-features').screenshot({ path: info.outputPath('features.png') });
  await page.locator('.home-feature').first().getByRole('link').click();
  await expect(page).toHaveURL(new RegExp('/services-ai-automation-saudi-arabia/'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(content.hero.heading);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('homepage redesign retains one featured testimonial and three specific supporting quotes', async ({
  page,
}, info) => {
  const { errors } = collectPageDiagnostics(page);
  await page.goto('/');
  const expectedIds = ['e925188', '187bcc8', '089b3bd', '1c6e845'];
  const section = page.locator('.home-testimonials');
  await expect(section.locator('blockquote')).toHaveCount(4);
  await expect(section.locator('.home-review-card')).toHaveCount(3);
  for (const review of content.reviews) {
    if (expectedIds.includes(review.sourceId)) {
      await expect(section.getByText(review.quote, { exact: true })).toBeVisible();
      await expect(section.getByText(review.author, { exact: true })).toBeVisible();
    } else await expect(section.getByText(review.quote, { exact: true })).toHaveCount(0);
  }
  const boxes = await section.locator('.home-review-card').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, top: box.top, height: box.height };
    }),
  );
  if (page.viewportSize()!.width > 1024) {
    for (const box of boxes) expect(box.top).toBe(boxes[0]!.top);
  } else {
    for (const box of boxes) expect(box.x).toBe(boxes[0]!.x);
    expect(boxes[1]!.top).toBeGreaterThan(boxes[0]!.top + boxes[0]!.height);
  }
  await section.screenshot({ path: info.outputPath('testimonials.png') });
  expect(errors).toEqual([]);
});

test('homepage brand strip moves smoothly without a button, with hover, focus and reduced-motion support', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const slider = page.locator('.home-brand-slider');
  const track = slider.locator('.home-brand-track');
  await expect(slider).toHaveAttribute('data-enhanced', 'true');
  await slider.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(slider).toHaveAttribute('data-visible', 'true');
  await expect(track).toHaveCSS('animation-play-state', 'running');
  const images = slider.locator('.home-brand-group').first().locator('img');
  await expect(images).toHaveCount(assets.logos.length);
  expect(
    await images.evaluateAll((elements) => elements.map((image) => image.getAttribute('src'))),
  ).toEqual(assets.logos);
  const before = await track.evaluate((element) => getComputedStyle(element).transform);
  await expect
    .poll(() => track.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);
  await expect(slider.getByRole('button')).toHaveCount(0);
  await slider.locator('.home-brand-viewport').focus();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await slider
    .locator('.home-brand-viewport')
    .evaluate((element) => (element as HTMLElement).blur());
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await page.locator('.home-faq').scrollIntoViewIfNeeded();
  await expect(slider).toHaveAttribute('data-visible', 'false');
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(slider.getByRole('button')).toHaveCount(0);
  await expect(slider.locator('.home-brand-group[aria-hidden]')).not.toBeVisible();
  await expect(slider.locator('.home-brand-group').first()).toHaveCSS('display', 'grid');
  await slider.screenshot({ path: info.outputPath('brands-reduced-motion.png') });
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

test('homepage brand strip and curated content remain usable without JavaScript', async ({
  browser,
  baseURL,
}, info) => {
  if (!baseURL) throw new Error('A local test base URL is required');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: info.project.use.viewport ?? { width: 1440, height: 1000 },
    baseURL,
    reducedMotion: 'no-preference',
  });
  await installLocalNetworkGuard(context);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    const disabledScripts: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => {
      // Disabling JavaScript intentionally blocks script execution. Keep that
      // browser CSP outcome visible; CSS, fonts, images and other failures fail.
      if (request.resourceType() === 'script' && request.failure()?.errorText === 'csp')
        disabledScripts.push(request.url());
      else errors.push(`${request.url()}: ${request.failure()?.errorText}`);
    });
    await page.goto('/');
    const slider = page.locator('.home-brand-slider');
    await expect(slider).not.toHaveAttribute('data-enhanced', 'true');
    await expect(slider.locator('.home-brand-group').first().locator('img')).toHaveCount(12);
    await expect(slider.getByRole('button')).toHaveCount(0);
    const viewport = slider.locator('.home-brand-viewport');
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(page.locator('.home-testimonials blockquote')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await info.attach('scripts-blocked-with-javascript-disabled', {
      body: JSON.stringify(disabledScripts),
      contentType: 'application/json',
    });
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
