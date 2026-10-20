import { readFileSync } from 'node:fs';
import { expect, test } from '../local-test';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { documentSchema } from '../../src/content/site/schema';

// A multi-category, table-heavy English post and an Arabic post with a Latin slug.
for (const path of [
  '/ahrefs-vs-semrush-vs-screaming-frog/',
  '/how-ai-helps-companies-in-saudi-arabia/',
  '/finding-the-best-digital-media-agency-in-pakistan/',
]) {
  const identity = identities.pages.find((page) => page.path === path);
  if (!identity) throw new Error('Missing family representative');
  const sourceDocument = documentSchema.parse(
    JSON.parse(readFileSync(`src/content/site/documents/${identity.id}.json`, 'utf8')),
  );
  const article = sourceDocument.article;
  if (!article) throw new Error('Missing representative presentation');
  test(`${identity.id}: shared article navigation, sharing and responsive controls`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(path);
    await expect(page.locator('.article-site')).toBeVisible();
    await expect(page.locator('.article-heading .article-category')).toHaveText(
      [article.category, ...(article.additionalCategories ?? [])].map((category) => category.label),
    );
    await expect(page.locator('.article-featured img')).toHaveAttribute(
      'alt',
      article.featured.alt,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath('heading.png'), animations: 'disabled' });
    const sharing = page.getByRole('navigation', { name: 'Share this article' });
    for (const [name, parameter] of [
      ['Facebook', 'u'],
      ['X', 'url'],
      ['LinkedIn', 'url'],
      ['email', 'body'],
    ] as const) {
      const link = sharing.getByRole('link', { name: `Share via ${name}`, exact: true });
      expect(new URL((await link.getAttribute('href')) ?? '').searchParams.get(parameter)).toBe(
        identity.seo.canonical ?? new URL(identity.path, 'https://nalksolutions.com').href,
      );
    }
    if (!identity.seo.canonical) {
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        identity.seo.robots ?? '',
      );
    }
    const bodyLink = page.locator('[data-article-body] a').first();
    await bodyLink.focus();
    await expect(bodyLink).toBeFocused();
    expect(
      await bodyLink.evaluate((element) => getComputedStyle(element).textDecorationLine),
    ).toContain('underline');
    const tables = page.getByRole('region', { name: 'Scrollable table', exact: true });
    if (await tables.count()) {
      await tables.first().focus();
      await expect(tables.first()).toBeFocused();
      await page.screenshot({ path: info.outputPath('table.png'), animations: 'disabled' });
    }
    const related = page.getByRole('region', { name: 'Related posts', exact: true });
    await related.scrollIntoViewIfNeeded();
    await related.focus();
    await expect(related).toBeFocused();
    await related.locator('.article-card').last().scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath('related.png'), animations: 'disabled' });
    const adjacent = article.adjacent[0];
    if (!adjacent) throw new Error('Missing adjacent article');
    const destination = identities.pages.find(
      (page) => encodeURI(page.path) === encodeURI(decodeURI(adjacent.href)),
    );
    if (!destination) throw new Error('Adjacent identity is unavailable');
    await page.evaluate(() => document.body.setAttribute('data-article-navigation', 'retained'));
    await page.locator('.article-adjacent a').first().click();
    await expect(page).toHaveTitle(destination.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      destination.locale === 'ar' ? 'rtl' : 'ltr',
    );
    if (destination.locale === identity.locale) {
      await expect(page.locator('body')).toHaveAttribute('data-article-navigation', 'retained');
    } else {
      await expect(page.locator('body')).not.toHaveAttribute('data-article-navigation', 'retained');
    }
    await page.goBack();
    await expect(page).toHaveTitle(identity.seo.title);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      identity.locale === 'ar' ? 'rtl' : 'ltr',
    );
    expect(errors).toEqual([]);
  });
}
