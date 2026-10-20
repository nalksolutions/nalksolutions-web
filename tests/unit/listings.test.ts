import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { documentSchema, listingFamilyLayouts } from '../../src/content/site/schema';
import { blogPageQuery, selectListingView } from '../../src/content/site/listing-view';
import recovery from '../../tooling/sources/site-recovery.generated.json';
import assets from '../../src/content/site/assets.generated.json';
import backgrounds from '../../src/content/listings/assets.generated.json';

function document(id: string) {
  return documentSchema.parse(
    JSON.parse(readFileSync(`src/content/site/documents/${id}.json`, 'utf8')),
  );
}
describe('reviewed listing presentation', () => {
  it('requires matching layouts for all twenty listing identities and allowlists backgrounds', () => {
    const listings = recovery.pages.filter((page) => page.family in listingFamilyLayouts);
    expect(listings).toHaveLength(20);
    for (const listing of listings) {
      const page = document(listing.id);
      expect(page.listingLayout).toBe(
        listingFamilyLayouts[page.family as keyof typeof listingFamilyLayouts],
      );
      expect(documentSchema.safeParse({ ...page, listingLayout: undefined }).success).toBe(false);
      expect(documentSchema.safeParse({ ...page, companyLayout: 'about' }).success).toBe(false);
      expect(documentSchema.safeParse({ ...page, family: 'profile-detail' }).success).toBe(false);
    }
    const allowlist = new Set(assets.map((asset) => asset.path));
    for (const path of Object.values(backgrounds.backgrounds))
      expect(allowlist.has(path)).toBe(true);
  });
  it('selects only validated Blog query views without changing source identity or SEO', () => {
    const page = document('R-8523d897404fbce9');
    const original = JSON.stringify(page);
    for (const number of [2, 3, 4, 5, 6, 999]) {
      const selected = selectListingView(page, { [blogPageQuery]: String(number) });
      expect(selected.nodes).toBe(
        page.listingViews?.find((view) => view.page === Math.min(number, 6))?.nodes,
      );
      expect(selected.id).toBe(page.id);
      expect(selected.path).toBe('/blog/');
      expect(selectListingView(page, { [blogPageQuery]: ['1', String(number)] }).nodes).toBe(
        selected.nodes,
      );
    }
    for (const value of [undefined, '', '0', '1', 'bad', '../secret'])
      expect(selectListingView(page, { [blogPageQuery]: value })).toBe(page);
    expect(JSON.stringify(page)).toBe(original);
    const category = document('R-4cd90575d3ca57e7');
    expect(selectListingView(category, { [blogPageQuery]: '2' })).toBe(category);
  });
  it('rejects incomplete, duplicate, injected and misplaced query-view content', () => {
    const blog = document('R-8523d897404fbce9');
    for (const listingViews of [
      [],
      blog.listingViews?.slice(1),
      [...(blog.listingViews ?? []), blog.listingViews?.[0]],
      [
        {
          page: 2,
          nodes: [{ type: 'element', tag: 'script', attributes: {}, variant: null, children: [] }],
        },
      ],
    ])
      expect(documentSchema.safeParse({ ...blog, listingViews }).success).toBe(false);
    expect(documentSchema.safeParse({ ...blog, path: '/other/' }).success).toBe(false);
    const category = document('R-4cd90575d3ca57e7');
    expect(documentSchema.safeParse({ ...category, listingViews: blog.listingViews }).success).toBe(
      false,
    );
  });
});
