import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import recovery from '../../tooling/sources/site-recovery.generated.json' with { type: 'json' };
import { validateDataset } from '../../src/content/schema';
import { documentSchema } from '../../src/content/site/schema';
import { offers, offerForService } from '../../src/content/journey/offers';
import { articleAssignments, offerForArticle } from '../../src/content/journey/articles';
import {
  publishedTarget,
  validateJourney,
  navigationSection,
} from '../../src/content/journey/resolve';
import { searchPages } from '../../src/content/journey/search';
import { serviceSections } from '../../src/content/journey/service-content';
import { footerOfferPaths } from '../../src/content/journey/footer';
import { corePages, mainNavigation } from '../../src/content/journey/pages';
import { topics, otherTopics } from '../../src/content/journey/offers';
import { resolveLegacy, resolvePage } from '../../src/lib/routing/resolve';
import { encodePublicPath } from '../../src/lib/routing/path';

const { pages } = validateDataset(identities);

describe('D-20 authored journeys', () => {
  it('footer destinations match the four retained offer identities', () => {
    for (const offer of offers) {
      expect(footerOfferPaths[offer.id]).toBe(publishedTarget(pages, offer.pageId).path);
    }
  });
  it('resolves all core identities, navigation and topic links directly', () => {
    expect(Object.values(corePages)).toHaveLength(5);
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(4);
    for (const id of Object.values(corePages)) publishedTarget(pages, id);
    for (const item of [...mainNavigation, ...topics, ...otherTopics]) {
      const page = pages.find((page) => page.path === item.href);
      expect(page?.locale).toBe('en');
      expect(resolveLegacy(encodePublicPath(item.href), '')).toBeNull();
    }
  });
  it('covers every English service exactly once with four direct published offers', () => {
    validateJourney(pages);
    const members = offers.flatMap((offer) => [
      offer.pageId,
      ...offer.specialists.map((item) => item.pageId),
    ]);
    expect(members).toHaveLength(25);
    expect(new Set(members).size).toBe(25);
    expect([...members].sort()).toEqual(
      recovery.pages
        .filter((page) => page.locale === 'en' && 'serviceStylesheet' in page)
        .map((page) => page.id)
        .sort(),
    );
    for (const id of members) {
      const target = publishedTarget(pages, id);
      expect(resolveLegacy(encodePublicPath(target.path), '')).toBeNull();
      expect(resolvePage(encodePublicPath(target.path), pages).kind).toBe('page');
    }
    expect(offerForService('R-97b60a187fbcf1c5')?.id).toBe('marketing');
  });
  it('assigns all 35 English articles explicitly and never guesses new or Arabic identities', () => {
    expect(Object.keys(articleAssignments).sort()).toEqual(
      pages
        .filter((page) => page.kind === 'article' && page.locale === 'en')
        .map((page) => page.id)
        .sort(),
    );
    expect(Object.values(articleAssignments).filter((id) => id === 'marketing')).toHaveLength(19);
    expect(Object.values(articleAssignments).filter((id) => id === 'websites')).toHaveLength(4);
    expect(Object.values(articleAssignments).filter((id) => id === 'software')).toHaveLength(8);
    expect(Object.values(articleAssignments).filter((id) => id === 'automation')).toHaveLength(4);
    expect(offerForArticle('new-article')).toBeUndefined();
    for (const page of pages.filter((page) => page.locale === 'ar'))
      expect(offerForArticle(page.id)).toBeUndefined();
  });
  it('rejects missing, draft and wrong-language targets', () => {
    const id = offers[0]!.pageId;
    expect(() => publishedTarget([], id)).toThrow();
    const target = publishedTarget(pages, id);
    expect(() => publishedTarget([{ ...target, status: 'draft' }], id)).toThrow();
    expect(() => publishedTarget([{ ...target, locale: 'ar' }], id)).toThrow();
  });
  it('keeps Blog descendants active without inventing an Arabic offer recommendation', () => {
    for (const page of pages.filter((page) => page.kind === 'article'))
      expect(navigationSection(page)).toBe('/blog/');
    for (const page of pages.filter((page) => page.locale === 'ar'))
      expect(offerForArticle(page.id)).toBeUndefined();
  });
  it('retains every non-hero source section once in each authored offer composition', () => {
    for (const offer of offers) {
      const source = documentSchema.parse(
        JSON.parse(readFileSync(`src/content/site/documents/${offer.pageId}.json`, 'utf8')),
      );
      const elements = source.nodes.filter((node) => node.type === 'element');
      const indices = Object.values(serviceSections[offer.id]).flat();
      expect(indices.sort((a, b) => a - b)).toEqual(
        Array.from({ length: elements.length - 1 }, (_, index) => index + 1),
      );
    }
  });
  it('prioritizes matching offers, retains title and Arabic matches, and leaves inputs unchanged', () => {
    const input = pages
      .filter((page) => !page.seo.robots?.includes('noindex'))
      .map(({ id, path, locale, seo }) => ({ id, path, locale, title: seo.title }));
    const original = input.map((page) => page.id);
    expect(searchPages(input, 'seo')[0]?.id).toBe('R-661faf9de8b4a219');
    expect(
      searchPages(input, 'API from Scratch').some((page) => page.id === 'R-fbbead80b209e23c'),
    ).toBe(true);
    expect(searchPages(input, 'السعودية').some((page) => page.locale === 'ar')).toBe(true);
    expect(searchPages(input, '   ')).toEqual([]);
    expect(input.map((page) => page.id)).toEqual(original);
  });
});
