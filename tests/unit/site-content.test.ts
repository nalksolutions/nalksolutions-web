import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateDataset } from '../../src/content/schema';
import {
  companyPageLayouts,
  documentNodeSchema,
  documentSchema,
} from '../../src/content/site/schema';
import companyAssets from '../../src/content/company/assets.generated.json';
import pages from '../../src/content/site/pages.generated.json';
import recovery from '../../tooling/sources/site-recovery.generated.json';
import routes from '../../docs/registers/routes.json';
import assets from '../../src/content/site/assets.generated.json';

describe('complete local content baseline', () => {
  it('restricts company layouts to the five reviewed pages and allowlists their backgrounds', () => {
    for (const [id, layout] of Object.entries(companyPageLayouts)) {
      const document = documentSchema.parse(
        JSON.parse(readFileSync(`src/content/site/documents/${id}.json`, 'utf8')),
      );
      expect(document.companyLayout).toBe(layout);
      expect(documentSchema.safeParse({ ...document, companyLayout: undefined }).success).toBe(
        false,
      );
      expect(documentSchema.safeParse({ ...document, id: 'R-1111111111111111' }).success).toBe(
        false,
      );
      expect(documentSchema.safeParse({ ...document, serviceLayout: 'service-v1' }).success).toBe(
        false,
      );
    }
    expect(Object.values(companyAssets.roles)).toHaveLength(7);
    for (const path of Object.values(companyAssets.roles))
      expect(assets.some((asset) => asset.path === path)).toBe(true);
  });
  it('accounts for every retained route exactly once without changing its identity or locale', () => {
    const dataset = validateDataset(pages);
    const retained = routes.routes.filter((route) => route.observed.initial_status === 200);
    expect(dataset.pages).toHaveLength(118);
    expect(dataset.pages.map((page) => page.id).sort()).toEqual(
      retained.map((route) => route.id).sort(),
    );
    for (const route of retained) {
      expect(dataset.pages.find((page) => page.id === route.id)).toMatchObject({
        sourceRouteId: route.id,
        path: decodeURIComponent(route.observed.path),
        locale: route.plan.locale_hint,
      });
    }
    // Several Arabic articles deliberately have Latin slugs.
    expect(
      dataset.pages.find((page) => page.path === '/how-ai-helps-companies-in-saudi-arabia/')
        ?.locale,
    ).toBe('ar');
  });
  it('validates every recovered body independently and matches its published identity', () => {
    expect(recovery.pages).toHaveLength(116);
    for (const page of pages.pages) {
      if (!('documentId' in page.content)) continue;
      const document = documentSchema.parse(
        JSON.parse(readFileSync(`src/content/site/documents/${page.id}.json`, 'utf8')),
      );
      expect(document).toMatchObject({ id: page.id, path: page.path, locale: page.locale });
      expect(page.provenance.excerpt).toBe(false);
    }
  });
  it('rejects executable attributes, unsafe schemes, active SVG and unallowlisted images', () => {
    const node = {
      type: 'element',
      tag: 'a',
      variant: null,
      children: [],
      attributes: { href: '/contacts/' },
    };
    expect(documentNodeSchema.safeParse(node).success).toBe(true);
    for (const attributes of [
      { href: 'javascript:alert(1)' },
      { href: '//attacker.example/' },
      { href: '/contacts/', onclick: 'alert(1)' },
      { href: '/contacts/', style: 'color:red' },
    ]) {
      expect(documentNodeSchema.safeParse({ ...node, attributes }).success).toBe(false);
    }
    expect(documentNodeSchema.safeParse({ ...node, tag: 'script' }).success).toBe(false);
    for (const src of [
      'https://nalksolutions.com/photo.jpg',
      '/wp-content/uploads/../secret.jpg',
      '/private.png',
    ]) {
      expect(
        documentNodeSchema.safeParse({ ...node, tag: 'img', attributes: { src } }).success,
      ).toBe(false);
    }
    expect(
      documentNodeSchema.safeParse({
        type: 'map',
        href: 'https://maps.google.com.attacker.example/maps',
        title: 'Map',
      }).success,
    ).toBe(false);
  });
  it('covers all remaining articles with typed presentation and recovered media', () => {
    const articles = recovery.pages.filter((page) => page.family === 'article');
    expect(articles).toHaveLength(42);
    expect(articles.filter((page) => page.locale === 'ar')).toHaveLength(8);
    const allowlist = new Set(assets.map((asset) => asset.path));
    for (const source of articles) {
      const document = documentSchema.parse(
        JSON.parse(readFileSync(`src/content/site/documents/${source.id}.json`, 'utf8')),
      );
      expect(source.renderTextScope).toBe('article-body');
      const presentation = document.article;
      if (!presentation) throw new Error('Missing article presentation');
      for (const image of [
        presentation.featured,
        ...presentation.adjacent.map((link) => link.image),
        ...presentation.related.map((post) => post.image),
      ]) {
        for (const src of [image.src, ...image.variants.map((variant) => variant.src)])
          expect(allowlist.has(src), src).toBe(true);
      }
      expect(documentSchema.safeParse({ ...document, article: undefined }).success).toBe(false);
      expect(documentSchema.safeParse({ ...document, family: 'corporate' }).success).toBe(false);
    }
  });
  it('accounts for every service layout with a valid hero, statistics and source stylesheet', () => {
    const servicePages = recovery.pages.filter((page) => 'serviceStylesheet' in page);
    expect(servicePages).toHaveLength(30);
    expect(servicePages.filter((page) => page.locale === 'ar')).toHaveLength(5);
    for (const source of servicePages) {
      const document = documentSchema.parse(
        JSON.parse(readFileSync(`src/content/site/documents/${source.id}.json`, 'utf8')),
      );
      expect(document.serviceLayout).toBe('service-v1');
      const roles = document.nodes
        .filter((node) => node.type === 'element')
        .map((node) => node.variant);
      expect(roles.slice(0, 2)).toEqual(['service-hero', 'service-statistics']);
      expect(documentSchema.safeParse({ ...document, family: 'article' }).success).toBe(false);
      if (document.family === 'service-or-location')
        expect(documentSchema.safeParse({ ...document, serviceLayout: undefined }).success).toBe(
          false,
        );
    }
  });
});
