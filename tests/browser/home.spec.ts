import { expect, test } from '../local-test';
import content from '../../src/content/home/home.generated.json' with { type: 'json' };
import { writeFile } from 'node:fs/promises';
import { contacts } from '../../src/content/home/site';
import { offers } from '../../src/content/journey/offers';
import { homepageReviews } from '../../src/content/home/testimonials';

test('testimonial video loads on request, closes cleanly and restores keyboard focus', async ({
  page,
}, info) => {
  const requests: string[] = [];
  await page.route('https://www.youtube.com/**', async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Video provider fixture</title><p>Test video frame</p>',
    });
  });
  await page.goto('/');
  const trigger = page.getByRole('link', { name: 'Watch the client testimonial', exact: true });
  await expect(trigger).toHaveAttribute('href', content.testimonialVideo.watchUrl);
  await expect(page.locator('.testimonial-dialog iframe')).toHaveCount(0);
  expect(requests).toEqual([]);

  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Client testimonial', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', content.testimonialVideo.embedUrl);
  await expect(
    page.frameLocator('.testimonial-dialog iframe').getByText('Test video frame'),
  ).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close video' })).toBeFocused();
  await page.screenshot({ path: info.outputPath('testimonial-dialog-provider-fixture.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('iframe')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(
    page.frameLocator('.testimonial-dialog iframe').getByText('Test video frame'),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Close video' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('iframe')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(requests).toEqual([content.testimonialVideo.embedUrl, content.testimonialVideo.embedUrl]);
});

test('homepage content, local assets, responsive geometry and source fonts', async ({
  page,
}, info) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => failures.push(request.url()));
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(content.hero.heading);
  for (const item of [...content.features, ...content.benefits]) {
    await expect(page.getByRole('heading', { name: item.title, exact: true })).toBeVisible();
    await expect(page.getByText(item.description, { exact: true })).toBeVisible();
  }
  for (const offer of offers) {
    await expect(page.locator(`[data-offer="${offer.id}"] h3`)).toHaveText(offer.label);
    await expect(page.locator(`[data-offer="${offer.id}"]`)).toContainText(offer.description);
  }
  for (const review of homepageReviews)
    await expect(page.getByText(review.quote, { exact: true })).toBeVisible();
  for (const faq of content.faq) {
    const control = page.locator('.home-faq summary').filter({ hasText: faq.question });
    await control.click();
    await expect(page.getByText(faq.answer, { exact: true })).toBeVisible();
    await control.click();
    await expect(page.getByText(faq.answer, { exact: true })).not.toBeVisible();
  }
  for (const contact of Object.values(contacts)) {
    await expect(
      page.locator('footer').getByRole('link', { name: contact.label, exact: true }),
    ).toHaveAttribute('href', contact.href);
  }
  // Wait for the streamed page content before collecting its lazy images.
  await expect(page.locator('.home-feature-image')).toHaveCount(content.features.length);
  await expect(page.locator('.home-ring')).toHaveCount(1);
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
  });
  expect(
    await page.evaluate(() =>
      Array.from(document.images)
        .filter((image) => !image.complete || !image.naturalWidth || !image.currentSrc)
        .map((image) => image.getAttribute('src')),
    ),
    'Every image must be loaded before geometry and screenshot capture',
  ).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        document.fonts.check('400 42px "Space Grotesk"') &&
        document.fonts.check('500 20px Manrope'),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    await page
      .locator('main h1, main h2, main h3')
      .evaluateAll((headings) =>
        headings
          .filter((heading) => heading.scrollWidth > heading.clientWidth + 1)
          .map((heading) => heading.textContent),
      ),
    'Heading text must fit its own box, including narrow tablet feature columns',
  ).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  const geometry = await page
    .locator('main > section, main > div, .site-header, .site-footer')
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.className,
        box: node.getBoundingClientRect().toJSON(),
      })),
    );
  await info.attach('homepage-geometry', {
    body: JSON.stringify(geometry, null, 2),
    contentType: 'application/json',
  });
  await writeFile(info.outputPath('homepage-geometry.json'), JSON.stringify(geometry, null, 2));
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath('homepage.png'),
    fullPage: true,
    animations: 'disabled',
  });
  expect(failures).toEqual([]);
  const origins = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => new URL(entry.name).origin),
  );
  expect([...new Set(origins)]).toEqual([new URL(page.url()).origin]);
  if (info.project.name === 'chromium-desktop') {
    for (const width of [320, 390, 767, 768, 1180, 1181, 1600, 1601, 1707, 1920, 2048]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `width ${width}`,
      ).toBe(true);
      if (width > 1180) {
        const hero = await page.locator('.home-hero-content').boundingBox();
        const header = await page.locator('.site-header').boundingBox();
        expect(
          hero && header && Math.abs(hero.x - header.x),
          `hero/navbar alignment at ${width}`,
        ).toBeLessThan(0.1);
      }
      const heading = await page.locator('h1').boundingBox();
      expect(
        heading && heading.x >= 0 && heading.x + heading.width <= width,
        `heading at ${width}`,
      ).toBe(true);
    }
  }
});

test('homepage service cards retain source gradient buttons and accessible hover states', async ({
  page,
}) => {
  await page.goto('/');
  const buttons = page.locator('.home-card-action');
  await expect(buttons).toHaveCount(4);
  for (const button of await buttons.all()) {
    await expect(button).toHaveCSS('border-radius', '10px');
    await expect(button).toHaveCSS(
      'background-image',
      'linear-gradient(70deg, rgb(0, 140, 255) 0%, rgb(109, 39, 133) 70%)',
    );
  }
  const card = page.locator('.home-service-card').first();
  await card.focus();
  await expect(buttons.first()).toHaveCSS('color', 'rgb(2, 2, 2)');
  expect(await buttons.first().evaluate((e) => getComputedStyle(e, '::before').opacity)).toBe('1');
  await expect(card).toHaveCSS('outline-style', 'solid');
});

test('homepage ribbons retain source typography, directions and reduced-motion behavior', async ({
  page,
}) => {
  await page.goto('/');
  const marquee = page.locator('.home-marquee');
  await expect(marquee).toHaveAttribute('data-enhanced', 'true');
  await marquee.scrollIntoViewIfNeeded();
  const ribbon = page.locator('.home-marquee-ribbon').first();
  const width = page.viewportSize()!.width;
  await expect(ribbon).toHaveCSS(
    'font-size',
    width <= 767 ? '24px' : width <= 1180 ? '28px' : '32px',
  );
  await expect(ribbon.locator('.site-icon').first()).toHaveText('\ue915');
  const tracks = page.locator('.home-marquee-track');
  await expect(tracks.first()).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(tracks.first()).toHaveCSS('animation-direction', 'reverse');
  await expect(tracks.nth(1)).toHaveCSS('animation-direction', 'normal');
  await expect(tracks.first()).toHaveCSS('animation-play-state', 'running');
  const before = await tracks.first().evaluate((e) => getComputedStyle(e).transform);
  await expect
    .poll(() => tracks.first().evaluate((e) => getComputedStyle(e).transform))
    .not.toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(tracks.first()).toHaveCSS('animation-name', 'none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('responsive header controls preserve navigation, contacts and dialog focus', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await trigger.isVisible()) {
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
    await expect(dialog).toBeVisible();
    for (const contact of Object.values(contacts))
      await expect(dialog.getByRole('link', { name: contact.label, exact: true })).toHaveAttribute(
        'href',
        contact.href,
      );
    expect(await dialog.textContent()).not.toContain('softy-solutions');
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() =>
        document.querySelector('dialog[open]')?.contains(document.activeElement),
      ),
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  } else {
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Search', exact: true });
    await dialog.getByRole('searchbox', { name: 'Search pages' }).fill('Contacts');
    await expect(dialog.getByRole('status')).toHaveText('1 result');
    await expect(
      dialog.getByRole('link', { name: 'Contacts - Nalk Solutions', exact: true }),
    ).toHaveAttribute('href', '/contacts/');
    await dialog.getByRole('searchbox').fill('unpublished unmatched content');
    await expect(dialog.getByRole('status')).toHaveText('0 results');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole('searchbox').fill('Contacts');
    await dialog.getByRole('link', { name: 'Contacts - Nalk Solutions', exact: true }).click();
    await expect(page).toHaveTitle('Contacts - Nalk Solutions');
  }
});
