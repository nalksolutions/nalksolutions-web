import { decodePageImages } from './images';
import { expect, test, type Page, type Locator } from '../local-test';
import recovery from '../../tooling/sources/site-recovery.generated.json' with { type: 'json' };
import presentation from '../../tooling/sources/listing-presentation.generated.json' with { type: 'json' };
import query from '../../tooling/sources/blog-query-recovery.generated.json' with { type: 'json' };
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import { listingFamilyLayouts } from '../../src/content/site/schema';
import { collectPageDiagnostics } from './diagnostics';

const listings = recovery.pages.filter((page) => 'listingStylesheet' in page);
async function navigate(page: Page, path: string, link: Locator) {
  const destination = new URL(path, page.url()).href;
  await Promise.all([page.waitForURL((url) => url.href === destination), link.click()]);
}

async function decodeMainImages(page: Page) {
  await decodePageImages(page, 'main img');
}

for (const source of listings) {
  test(`${source.id}: listing layout, card order and source dimensions @coverage`, async ({
    page,
  }, info) => {
    const { errors } = collectPageDiagnostics(page);
    const identity = identities.pages.find((page) => page.id === source.id);
    if (!identity || !('listingCards' in source))
      throw new Error('Missing listing source expectation');
    const layout = listingFamilyLayouts[source.family as keyof typeof listingFamilyLayouts];
    const response = await page.goto(identity.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.listing-layout-${layout}`)).toBeVisible();
    await expect(page).toHaveTitle(identity.seo.title);
    const main = page.locator('[data-document-body]');
    await expect(main.locator('h1')).toHaveText(
      source.headings.filter((item) => item.tag === 'h1').map((item) => item.text),
    );
    for (const [template, count] of Object.entries(source.listingCards))
      await expect(
        main.locator(
          `.content-listing-${template === '110' ? 'blog' : template === '152' ? 'row' : 'featured'}-card`,
        ),
      ).toHaveCount(count);
    expect(
      await main
        .locator('.content-listing-card-title a, .content-listing-featured-title a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual(source.listingTargets);
    const width = page.viewportSize()?.width ?? 0;
    const profile = width > 1180 ? 'desktop' : width > 767 ? 'tablet' : 'mobile';
    expect(await main.locator('h1').evaluate((el) => getComputedStyle(el).fontSize)).toBe(
      `${presentation.headings[profile].h1}px`,
    );
    const cardTitle = main.locator('.content-listing-card-title').first().locator('h4, h5');
    expect(await cardTitle.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
      `${presentation.headings[profile][layout === 'blog' ? 'h5' : 'h4']}px`,
    );
    expect(await cardTitle.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('500');
    expect(
      await main
        .locator('.content-listing-taxonomy a')
        .first()
        .evaluate((el) => getComputedStyle(el).fontSize),
    ).toBe(`${presentation.taxonomySize[profile]}px`);
    expect(
      await main.locator('.content-listing-hero').evaluate((el) => getComputedStyle(el).paddingTop),
    ).toBe(`${presentation.heroPaddingTop[profile]}px`);
    await decodeMainImages(page);
    if (layout === 'blog') {
      const boxes = await main
        .locator('.content-listing-blog-card')
        .evaluateAll((items) => items.map((el) => ({ y: el.getBoundingClientRect().y })));
      // The light tidy pass adds two tablet columns; archived source evidence stays frozen.
      const columns = profile === 'tablet' ? 2 : presentation.blogColumns[profile];
      expect(boxes.slice(0, columns).map((box) => box.y)).toEqual(Array(columns).fill(boxes[0]?.y));
      expect(boxes[columns]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
    } else {
      const row = await main.locator('.content-listing-row').first().boundingBox();
      const photo = await main.locator('.content-listing-row-image').first().boundingBox();
      const copy = await main.locator('.content-listing-row-copy').first().boundingBox();
      expect(photo?.height).toBe(presentation.rowImageHeight);
      if (profile === 'mobile')
        expect(copy?.y).toBeGreaterThan((photo?.y ?? 0) + (photo?.height ?? 0));
      else expect(copy?.y).toBe(row?.y);
      const primary = await main.locator('.content-listing-primary').boundingBox();
      const sidebar = await main.locator('.content-listing-sidebar').boundingBox();
      if (profile === 'desktop') expect(sidebar?.x).toBeGreaterThan(primary?.x ?? 0);
      else expect(sidebar?.y).toBeGreaterThan((primary?.y ?? 0) + (primary?.height ?? 0));
      await expect(main.getByRole('region', { name: 'Site search', exact: true })).toBeVisible();
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.locator('.site-footer').evaluate(async (footer) => {
      for (const image of footer.querySelectorAll<HTMLImageElement>('img')) await image.decode();
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: info.outputPath(`${source.id}-listing-full.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}

test('Blog query pagination preserves cards, history, refresh and canonical', async ({
  page,
}, info) => {
  const { errors, attachCancellations } = collectPageDiagnostics(page, ['/blog/']);
  await page.goto('/blog/');
  await decodeMainImages(page);
  for (const number of [2, 3, 4, 5]) {
    const path = `/blog/?cmsmasters-page-c1619d2=${number}`;
    await navigate(
      page,
      path,
      page.locator(`.content-listing-pagination a[href="${path}"]`).first(),
    );
    const expected = query.pages.find((item) => item.page === number);
    if (!expected) throw new Error('Missing Blog view source');
    await expect(page.locator('.content-listing-blog-card')).toHaveCount(expected.cards.length);
    expect(
      await page
        .locator('.content-listing-blog-card')
        .evaluateAll((cards) => cards.map((card) => card.id)),
    ).toEqual(expected.cards);
    await expect(page.locator('.content-listing-pagination [aria-current="page"]')).toHaveText(
      String(number),
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected.canonical);
    await decodeMainImages(page);
  }
  await page.goBack();
  await expect(page.locator('.content-listing-pagination [aria-current="page"]')).toHaveText('4');
  await decodeMainImages(page);
  await page.reload();
  await expect(page.locator('.content-listing-pagination [aria-current="page"]')).toHaveText('4');
  await decodeMainImages(page);
  await page.goForward();
  await expect(page.locator('.content-listing-pagination [aria-current="page"]')).toHaveText('5');
  await decodeMainImages(page);
  await attachCancellations(info);
  expect(errors).toEqual([]);
});

for (const [kind, path, destination] of [
  [
    'category',
    '/category/digital-marketing-strategy/',
    '/category/digital-marketing-strategy/page/2/',
  ],
  ['author', '/author/uhj1984yahoo-com/', '/author/uhj1984yahoo-com/page/2/'],
] as const) {
  test(`${kind} listing keyboard, search, pagination and Arabic article journey`, async ({
    page,
  }, info) => {
    const { errors, attachCancellations } = collectPageDiagnostics(page, [path, destination]);
    await page.goto(path);
    await decodeMainImages(page);
    // Compare against the configured viewport: mobile overflow can expand innerWidth.
    const viewportWidth = page.viewportSize()?.width;
    if (!viewportWidth) throw new Error('Listing viewport is required');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewportWidth,
    );
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const search = page.getByRole('region', { name: 'Site search', exact: true });
    await search.getByRole('searchbox').fill('API from scratch');
    await search.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(search.getByRole('link', { name: /API from scratch/iu })).toBeVisible();
    await navigate(
      page,
      destination,
      page.locator(`.content-listing-pagination a[href="${destination}"]`).first(),
    );
    await expect(page.locator('.content-listing-pagination [aria-current="page"]')).toHaveText('2');
    await decodeMainImages(page);
    await page.reload();
    await decodeMainImages(page);
    const destinationIdentity = identities.pages.find((identity) => identity.path === destination);
    if (!destinationIdentity) throw new Error('Missing listing destination identity');
    if (destinationIdentity.seo.canonical)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        destinationIdentity.seo.canonical,
      );
    else await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    if (destinationIdentity.seo.robots)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        destinationIdentity.seo.robots,
      );
    const arabic = '/how-ai-helps-companies-in-saudi-arabia/';
    await navigate(
      page,
      arabic,
      page.locator(`.content-listing-featured-title a[href="${arabic}"]`).first(),
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await decodeMainImages(page);
    await page.goBack();
    await expect(page.locator(`.listing-layout-${kind}`)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await decodeMainImages(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await attachCancellations(info);
    expect(errors).toEqual([]);
  });
}
