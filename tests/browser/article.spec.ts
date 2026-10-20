import { expect, test } from '../local-test';
import { articleSource } from '../article-source';
import article from '../../src/content/articles/api.generated.json' with { type: 'json' };
import articleAssets from '../../src/content/articles/assets.generated.json' with { type: 'json' };
import { captureArticleEvidence } from './article-evidence';
import { contacts } from '../../src/content/home/site';

test('complete article preserves text, code, images and keyboard access at each viewport', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) => errors.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(articleSource.path);
  const body = page.locator('[data-article-body]');
  await expect(body).toBeVisible();
  expect(
    await page.locator('.article-site').evaluate((element) => element.getBoundingClientRect().top),
  ).toBe(0);
  const headerBox = await page.locator('.site-header').boundingBox();
  const categoryBox = await page.locator('.article-heading .article-category').boundingBox();
  expect(headerBox).not.toBeNull();
  expect(categoryBox).not.toBeNull();
  if (!headerBox || !categoryBox) throw new Error('Missing article heading geometry');
  expect(categoryBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  const sharing = page.getByRole('navigation', { name: 'Share this article' });
  const canonical = `https://nalksolutions.com${articleSource.path}`;
  for (const [name, parameter] of [
    ['Facebook', 'u'],
    ['X', 'url'],
    ['LinkedIn', 'url'],
  ] as const) {
    const link = sharing.getByRole('link', { name: `Share via ${name}`, exact: true });
    const href = await link.getAttribute('href');
    expect(new URL(href ?? '').searchParams.get(parameter)).toBe(canonical);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  const email = await sharing.getByRole('link', { name: 'Share via email' }).getAttribute('href');
  expect(new URL(email ?? '').searchParams.get('body')).toBe(canonical);
  expect(await body.textContent()).toBe(articleSource.bodyText);
  await expect(body.locator('a')).toHaveCount(4);
  expect(
    await body.locator('a').evaluateAll((links) =>
      links.every((link) => {
        const style = getComputedStyle(link);
        return (
          style.textDecorationLine.includes('underline') && style.color === 'rgb(255, 251, 189)'
        );
      }),
    ),
    'D-15: body links retain their approved readable, underlined treatment',
  ).toBe(true);
  expect(await body.locator('pre').allTextContents()).toEqual(articleSource.code);
  expect(await body.locator('h2,h3,h4,h5,h6').allTextContents()).toEqual(
    articleSource.headings.map((heading) => heading.text),
  );
  await expect(body.locator('img')).toHaveCount(3);
  const adjacent = page.getByRole('navigation', { name: 'Adjacent articles' });
  await expect(adjacent.locator('img')).toHaveCount(2);
  for (const [index, link] of article.presentation.adjacent.entries()) {
    const actual = adjacent.locator('a').nth(index);
    await expect(actual).toHaveAttribute('href', link.href);
    await expect(actual).toContainText(link.title);
    await expect(actual.locator('img')).toHaveAttribute('alt', link.image.alt);
  }
  const track = page.getByRole('region', { name: 'Related posts', exact: true });
  await expect(track.locator('.article-card')).toHaveCount(article.presentation.related.length);
  for (const [index, post] of article.presentation.related.entries()) {
    const card = track.locator('.article-card').nth(index);
    await expect(card.getByRole('heading')).toHaveText(post.title);
    await expect(card.getByRole('heading').locator('a')).toHaveAttribute('href', post.href);
    await expect(
      card.getByRole('link', { name: post.category.label, exact: true }),
    ).toHaveAttribute('href', post.category.href);
    await expect(card).toContainText(post.dateLabel);
    await expect(card.getByRole('link', { name: post.actionLabel, exact: true })).toHaveAttribute(
      'href',
      post.href,
    );
  }
  await expect(
    page.getByRole('navigation', { name: 'Primary', exact: true }).locator('[aria-current]'),
  ).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => {
    scrollTo(0, 0);
    // Allow layout and responsive image selection to settle before static capture.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
  });
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.every(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  await expect(page.locator('.footer-copyright p').first()).toHaveText(
    article.presentation.footer.owner,
  );
  await expect(page.locator('.footer-copyright p').last()).toHaveText(
    article.presentation.footer.notice,
  );
  for (const contact of Object.values(contacts)) {
    await expect(
      page.locator('footer').getByRole('link', { name: contact.label, exact: true }),
    ).toHaveAttribute('href', contact.href);
  }
  const footerBackground =
    page.viewportSize()!.width <= articleAssets.footer.mobileMaxWidth
      ? articleAssets.footer.mobile
      : articleAssets.footer.desktop;
  expect(
    await page
      .locator('.site-footer')
      .evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toContain(footerBackground);
  await captureArticleEvidence(page, info);
  // Keep the static baseline free of focus rings; keyboard states are exercised afterward.
  const code = body.locator('pre').first();
  await code.focus();
  await expect(code).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(code).not.toBeFocused();
  const lastCardLink = track.locator('.article-card').last().getByRole('heading').locator('a');
  await lastCardLink.focus();
  await expect(lastCardLink).toBeFocused();
  expect(
    await lastCardLink.evaluate((element) => {
      const card = element.closest('.article-card')?.getBoundingClientRect();
      const region = element.closest('.article-related-track')?.getBoundingClientRect();
      return !!card && !!region && card.left >= region.left - 1 && card.right <= region.right + 1;
    }),
  ).toBe(true);
  await track.focus();
  await expect(track).toBeFocused();
  expect(errors).toEqual([]);
});

test('article header dialogs, categories and related-strip scrolling remain usable', async ({
  page,
  browserName,
  isMobile,
}) => {
  await page.goto(articleSource.path);
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
    await expect(dialog).toBeVisible();
    for (const contact of Object.values(contacts))
      await expect(dialog.getByRole('link', { name: contact.label, exact: true })).toHaveAttribute(
        'href',
        contact.href,
      );
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(menu).toBeFocused();
  } else {
    // Topics now live on Blog; the primary link is deliberately a simple link.
    await expect(page.locator('.desktop-nav a[href="/blog/"]')).toHaveText('Blog');
    await expect(page.locator('.desktop-nav details')).toHaveCount(0);
    const search = page.getByRole('button', { name: 'Search', exact: true });
    await search.click();
    const dialog = page.getByRole('dialog', { name: 'Search', exact: true });
    await dialog.getByRole('searchbox').fill('Build an API');
    await expect(
      dialog.getByRole('link', { name: article.seo.title, exact: true }),
    ).toHaveAttribute('href', articleSource.path);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(search).toBeFocused();
  }
  const track = page.getByRole('region', { name: 'Related posts', exact: true });
  await track.scrollIntoViewIfNeeded();
  if (!isMobile) {
    const button = track.getByRole('link', { name: 'Read More', exact: true }).first();
    await button.scrollIntoViewIfNeeded();
    const initial = await button.boundingBox();
    if (!initial) throw new Error('Missing related action bounds');
    await button.hover();
    await expect
      .poll(() =>
        button.evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
      )
      .toBe('rgb(255, 251, 189)');
    await expect
      .poll(() => button.evaluate((element) => getComputedStyle(element, '::before').opacity))
      .toBe('1');
    await expect(button).toHaveCSS('color', 'rgb(2, 2, 2)');
    // This suite uses reduced motion; the normal 5px shift is exercised in motion.spec.ts.
    await expect(button).toHaveCSS('transform', 'none');
    expect((await button.boundingBox())!.x - initial.x).toBe(0);
    await page.mouse.move(1, 1);
    await track.getByRole('heading').first().locator('a').focus();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect
      .poll(() => button.evaluate((element) => getComputedStyle(element, '::before').opacity))
      .toBe('1');
    await expect(button).toHaveCSS('outline-style', 'solid');
    await button.evaluate((element) => element.blur());
  }
  const overflow = await track.evaluate((element) => element.scrollWidth > element.clientWidth);
  if (overflow) {
    const bounds = await track.boundingBox();
    if (!bounds) throw new Error('Missing related strip bounds');
    if (isMobile && browserName === 'chromium') {
      const session = await page.context().newCDPSession(page);
      const start = bounds.x + bounds.width - 30;
      const end = bounds.x + 30;
      const y = bounds.y + Math.min(100, bounds.height / 2);
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: start, y }],
      });
      for (let step = 1; step <= 8; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: start + ((end - start) * step) / 8, y }],
        });
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await session.detach();
    } else {
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 100);
      await page.mouse.wheel(bounds.width, 0);
    }
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect
      .poll(() =>
        track.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.children]
            .filter((child) => {
              const box = child.getBoundingClientRect();
              return box.right > bounds.left + 1 && box.left < bounds.right - 1;
            })
            .every((child) => child.getBoundingClientRect().bottom <= bounds.bottom + 1);
        }),
      )
      .toBe(true);
    // Native scrolling keeps all source cards available without rendering cloned content.
    await track.evaluate((element) => {
      element.scrollLeft = 0;
    });
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBe(0);
  }
  await expect(track.locator('.article-card')).toHaveCount(article.presentation.related.length);
  if (browserName === 'chromium' && !isMobile) {
    for (const width of [1181, 1180, 1025, 1024, 768, 767, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const background =
        width <= articleAssets.footer.mobileMaxWidth
          ? articleAssets.footer.mobile
          : articleAssets.footer.desktop;
      expect(
        await page
          .locator('.site-footer')
          .evaluate((element) => getComputedStyle(element).backgroundImage),
      ).toContain(background);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Article layout must fit the ${width}px viewport`,
      ).toBe(true);
      await expect(menu).toBeVisible({ visible: width <= 1180 });
      if (width > 1024) {
        const logoWidth = await page
          .locator('.footer-logo')
          .evaluate((element) => element.getBoundingClientRect().width);
        expect(logoWidth).toBeGreaterThan(100);
        expect(logoWidth).toBeLessThanOrEqual(260);
      }
      await expect
        .poll(() =>
          track.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            const visible = [...element.children]
              .map((child) => child.getBoundingClientRect())
              .filter((box) => box.right > bounds.left + 1 && box.left < bounds.right - 1);
            return (
              visible.length > 0 &&
              Math.abs(Math.max(...visible.map((box) => box.bottom)) - bounds.bottom) <= 1
            );
          }),
        )
        .toBe(true);
    }
  }
});
