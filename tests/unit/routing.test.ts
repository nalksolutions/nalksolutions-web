import { describe, expect, it } from 'vitest';
import source from '../../src/content/fixtures/pages.json';
import register from '../../docs/registers/legacy-rules.json';
import { validateDataset } from '../../src/content/schema';
import { decodePublicPath, encodePublicPath } from '../../src/lib/routing/path';
import {
  findLegacyRule,
  legacyRules,
  statusRules,
  validateLegacyRules,
  type LegacyRule,
} from '../../src/lib/routing/legacy';
import { resolvePage } from '../../src/lib/routing/resolve';
import { assertFixtureEnvironment } from '../../src/lib/env/config';
import { pageMetadata, serializeJsonLd } from '../../src/lib/seo/metadata';

const dataset = validateDataset(source);

describe('legacy source contracts', () => {
  it('validates all 67 definitions and preserves every recorded first response', () => {
    expect(legacyRules).toHaveLength(67);
    validateLegacyRules(legacyRules);
    validateLegacyRules(statusRules);
    for (const { id, observed } of register.rules) {
      const url = new URL(observed.source_url);
      const rule = findLegacyRule(url.pathname, url.search);
      expect(rule, id).toMatchObject({
        id,
        status: observed.expected_status,
        location: observed.target_url || null,
      });
    }
  });
  it('keeps plugin-specific case, slash and query flags', () => {
    expect(findLegacyRule('/CONTACT-US')?.status).toBe(301);
    expect(findLegacyRule('/cart/')?.status).toBe(410);
    expect(findLegacyRule('/CART/')).toBeUndefined();
    expect(findLegacyRule('/contact-us/', '?utm_source=proof')).toBeUndefined();
    expect(findLegacyRule('/cart/', '?utm_source=proof')).toBeUndefined();
  });
  it('does not expand the literal theme asterisk', () => {
    expect(findLegacyRule('/wp-content/themes/softy-solutions/*')?.status).toBe(410);
    expect(findLegacyRule('/wp-content/themes/softy-solutions/style.css')).toBeUndefined();
  });
  it('rejects conflicts, unsafe origins and redirect cycles', () => {
    const make = (sourcePath: string, location: string): LegacyRule => ({
      id: sourcePath,
      plugin: 'redirection',
      source: sourcePath,
      status: 301,
      location,
      ignoreCase: true,
      ignoreTrailingSlash: true,
      query: 'exact',
    });
    const one = make('/one/', 'https://nalksolutions.com/two/');
    expect(() => validateLegacyRules([one, { ...one, id: 'duplicate' }])).toThrow('Conflicting');
    expect(() =>
      validateLegacyRules([
        one,
        { ...one, id: 'other-plugin', plugin: 'rank-math', source: '/ONE/', ignoreCase: false },
      ]),
    ).toThrow('Conflicting');
    expect(() => validateLegacyRules([make('/one/', 'https://attacker.invalid/')])).toThrow(
      'Unsafe',
    );
    expect(() =>
      validateLegacyRules([one, make('/two/', 'https://nalksolutions.com/one/')]),
    ).toThrow('cycle');
  });
});

describe('public identity and publication', () => {
  it('preserves Arabic and percent escape case without double decoding', () => {
    expect(decodePublicPath('/%d8%b4/')).toBe('/ش/');
    expect(decodePublicPath('/%D8%B4/')).toBe('/ش/');
    expect(decodePublicPath('/%252F/')).toBe('/%2F/');
    expect(encodePublicPath('/شركة-تقنية/')).toBe(
      '/%D8%B4%D8%B1%D9%83%D8%A9-%D8%AA%D9%82%D9%86%D9%8A%D8%A9/',
    );
    for (const path of ['/%ZZ/', '/%2F/', '/%5C/', '/%00/'])
      expect(() => decodePublicPath(path)).toThrow();
  });
  it('returns a canonical 301 only for known slash variants', () => {
    expect(resolvePage('/contacts', dataset.pages)).toEqual({
      kind: 'redirect',
      status: 301,
      location: 'https://nalksolutions.com/contacts/',
    });
    expect(resolvePage('/unknown', dataset.pages)).toEqual({ kind: 'notFound', status: 404 });
    expect(resolvePage('/CONTACTS/', dataset.pages).kind).toBe('notFound');
  });
  it('validates collisions even for drafts and keeps language independent of a slug', () => {
    const first = dataset.pages[0];
    if (!first) throw new Error('Missing source fixture');
    for (const path of [
      '/api/test/',
      '/en/example/',
      '/studio/',
      '/contact-us/',
      '/cart/',
      '/media/home-hero.mp4/',
    ]) {
      expect(() =>
        validateDataset({
          ...dataset,
          pages: [{ ...first, path, seo: { ...first.seo, canonical: null }, status: 'draft' }],
        }),
      ).toThrow('Reserved');
    }
    expect(() => validateDataset({ ...dataset, pages: [first, first] })).toThrow('Duplicate');
    const added = {
      ...first,
      id: 'new-ar',
      path: '/latin-arabic/',
      locale: 'ar' as const,
      seo: { ...first.seo, canonical: null },
    };
    expect(
      resolvePage('/latin-arabic/', validateDataset({ ...dataset, pages: [added] }).pages),
    ).toMatchObject({ kind: 'page', page: { locale: 'ar' } });
  });
  it('cannot start fixture content as production', () => {
    expect(assertFixtureEnvironment({ APP_ENV: 'test' })).toBe('test');
    expect(() => assertFixtureEnvironment({ APP_ENV: 'production' })).toThrow(
      'Production is disabled',
    );
  });
});

describe('SEO boundary', () => {
  it('preserves absent canonical and source noindex without homepage defaults', () => {
    const page = dataset.pages.find((page) => page.kind === 'profile');
    if (!page) throw new Error('Missing profile fixture');
    const metadata = pageMetadata(page);
    expect(metadata.alternates).toBeNull();
    expect(metadata.robots).toContain('noindex');
    expect(metadata.title).toEqual({ absolute: page.seo.title });
  });
  it('rejects foreign canonicals and canonical path mismatches', () => {
    const page = dataset.pages[0];
    if (!page) throw new Error('Missing fixture');
    for (const canonical of ['https://attacker.invalid/', 'https://nalksolutions.com/wrong/']) {
      expect(() =>
        validateDataset({ ...dataset, pages: [{ ...page, seo: { ...page.seo, canonical } }] }),
      ).toThrow();
    }
  });
  it('escapes script-closing text while retaining JSON meaning', () => {
    const value = { text: '</script><img src=x onerror=alert(1)> & \u2028\u2029' };
    const result = serializeJsonLd(value);
    expect(result).not.toContain('<');
    expect(JSON.parse(result)).toEqual(value);
  });
});
