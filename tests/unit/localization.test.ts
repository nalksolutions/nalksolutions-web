import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
vi.mock('server-only', () => ({}));
import register from '../../src/content/localization/register.json';
import redirects from '../../src/content/localization/redirects.json';
import source from '../../src/content/site/pages.generated.json';
import scope from '../../docs/registers/navigation-scope.json';
import font from '../../src/content/localization/font.json';
import { validateDataset, type ProofPage } from '../../src/content/schema';
import {
  localizedPages,
  readTranslation,
  localizedDocument,
} from '../../src/content/localization/server';
import { localizedId } from '../../src/content/localization/identity';
import { resolveLocalizedRedirect } from '../../src/content/localization/redirect';
import { resolveLegacy } from '../../src/lib/routing/resolve';
import { reviewMode, reviewSchema } from '../../src/content/localization/review';
import { applyDocumentTranslation, untranslatedProse } from '../../src/content/localization/blocks';
import { documentSchema } from '../../src/content/site/schema';
import { normalizeSearch } from '../../src/content/localization/search';
import { pageMetadata } from '../../src/lib/seo/metadata';
import { messages, ui } from '../../src/i18n/messages';
import {
  listingMembers,
  publishListingViews,
  localizedListingDocument,
} from '../../src/content/localization/listings';
import { arabicDateLabel } from '../../src/content/localization/format';
import retainedLabels from '../../src/content/localization/copy/retained-labels-ar.json';

const pages = validateDataset(source).pages;
afterEach(() => vi.unstubAllEnvs());
it('accounts for exactly the 107 active source identities and 14 unique compatibility moves', () => {
  expect(register.records.map((record) => record.sourceId).sort()).toEqual(
    scope.routes
      .filter((route) => route.disposition === 'in-scope')
      .map((route) => route.route_id)
      .sort(),
  );
  expect(register.records).toHaveLength(107);
  expect(new Set(register.records.map((record) => record.entityId)).size).toBe(102);
  expect(redirects.rules).toHaveLength(14);
  expect(new Set(redirects.rules.map((rule) => rule.source)).size).toBe(14);
  for (const rule of redirects.rules) {
    expect(rule.target.startsWith('/ar/')).toBe(true);
    expect(resolveLegacy(encodeURI(rule.source), '')).toBeNull();
    expect(
      register.records.some(
        (record) => record.sourceId === rule.sourceId && record.arabicPath === rule.target,
      ),
    ).toBe(true);
  }
});
it('publishes ready content without a reviewer nomination and keeps developer preview local', async () => {
  vi.stubEnv('ARABIC_REVIEW_MODE', '0');
  const published = await localizedPages(pages);
  expect(published.length).toBeGreaterThanOrEqual(3);
  expect(published.every((page) => !page.localization?.preview)).toBe(true);
  expect(() => reviewMode({ APP_ENV: 'production', ARABIC_REVIEW_MODE: '1' })).toThrow();
});
it('retains honest authored identities without changing recovered records or inventing approval', async () => {
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('ARABIC_REVIEW_MODE', '0');
  const before = JSON.stringify(pages);
  const localized = await localizedPages(pages);
  expect(localized.length).toBeGreaterThanOrEqual(3);
  expect(JSON.stringify(pages)).toBe(before);
  for (const page of localized) {
    expect(page.localization?.preview).toBe(false);
    expect(page.localization?.reviewStatus).toBe('inReview');
    expect(page.provenance).toHaveProperty('kind', 'localized');
    expect(page.provenance).not.toHaveProperty('sourceHtml');
    expect(pageMetadata(page, [...pages, ...localized]).robots).toBe(page.seo.robots);
    const translation = (await readTranslation(page.localization!.entityId))!;
    expect(translation.review.reviewer).toBeNull();
    expect(translation.review.approvedAt).toBeNull();
    expect(translation.publication).toEqual({ ready: true, acceptance: 'ownerManaged' });
  }
});
it('activates only exact publishable compatibility targets and preserves slash/query behavior', () => {
  for (const rule of redirects.rules) {
    const original = pages.find((page) => page.id === rule.entityId)!;
    // Explicit in-memory approval fixture; no authored content is approved by this test.
    const approved: ProofPage = {
      ...original,
      id: localizedId(rule.entityId),
      path: rule.target,
      locale: 'ar',
      localization: {
        entityId: rule.entityId,
        presentationId: rule.entityId,
        reviewStatus: 'approved',
        translationRevision: 'test-only',
        stale: false,
        preview: false,
      },
      provenance: {
        kind: 'localized',
        sourceEntityId: rule.entityId,
        translationRevision: 'test-only',
      },
    };
    for (const path of [rule.source, rule.source.slice(0, -1)])
      expect(resolveLocalizedRedirect(encodeURI(path), '?utm_source=test&x=1', [approved])).toEqual(
        {
          kind: 'redirect',
          status: 301,
          location: 'https://nalksolutions.com' + encodeURI(rule.target) + '?utm_source=test&x=1',
        },
      );
    expect(
      resolveLocalizedRedirect(rule.source, '', [
        { ...approved, localization: { ...approved.localization!, preview: true } },
      ]),
    ).toBeNull();
  }
});
it('requires named native approval and complete translated software blocks', async () => {
  const translation = (await readTranslation('R-54ef9c93732551a9'))!;
  expect(reviewSchema.safeParse({ ...translation.review, status: 'approved' }).success).toBe(false);
  const document = documentSchema.parse(
    JSON.parse(readFileSync('src/content/site/documents/R-54ef9c93732551a9.json', 'utf8')),
  );
  expect(() => applyDocumentTranslation(document.nodes, translation)).not.toThrow();
  expect(() => applyDocumentTranslation(document.nodes, { ...translation, blocks: {} })).toThrow(
    'Missing translated block',
  );
  const localized = await localizedDocument(
    {
      ...pages.find((page) => page.id === translation.entityId)!,
      id: localizedId(translation.entityId),
      path: translation.path,
      locale: 'ar',
      localization: {
        entityId: translation.entityId,
        presentationId: translation.entityId,
        reviewStatus: 'inReview',
        translationRevision: 'pilot-1',
        stale: false,
        preview: true,
      },
      provenance: {
        kind: 'localized',
        sourceEntityId: translation.entityId,
        translationRevision: 'pilot-1',
      },
    },
    document,
  );
  expect(localized.path).toBe(translation.path);
  expect(localized.locale).toBe('ar');
});
it('has typed-equivalent messages, Saudi plurals, query-only normalization and the licensed local font', () => {
  const keys = (value: object, prefix = ''): string[] =>
    Object.entries(value).flatMap(([key, item]) =>
      typeof item === 'string' ? [prefix + key] : keys(item, prefix + key + '.'),
    );
  expect(keys(messages.ar).sort()).toEqual(keys(messages.en).sort());
  expect(ui('ar')('search.count', { count: 2 })).toBe('نتيجتان');
  expect(ui('ar')('search.count', { count: 12 })).toContain('12');
  expect(normalizeSearch('أَتْـمَتَة ١٢')).toBe('اتمتة 12');
  expect(
    createHash('sha256')
      .update(readFileSync('public' + font.path))
      .digest('hex'),
  ).toBe(font.sha256);
  expect(readFileSync('public/fonts/noto-sans-arabic-OFL.txt', 'utf8')).toContain(
    'SIL OPEN FONT LICENSE',
  );
});
it('preserves existing Arabic bodies and migrates their own graph URLs without inventing counterparts', async () => {
  const localized = await localizedPages(pages);
  for (const record of register.records.filter(
    (item) => item.sourceLocale === 'ar' && item.sourceId === item.entityId,
  )) {
    const translation = (await readTranslation(record.entityId))!;
    const sourceDocument = JSON.parse(
      readFileSync(`src/content/site/documents/${record.entityId}.json`, 'utf8'),
    );
    {
      const normalize = (nodes: typeof sourceDocument.nodes) => {
        for (const node of nodes) {
          if (sourceDocument.article && node.tag === 'h1') node.tag = 'h2';
          if (node.type === 'text') {
            const label = retainedLabels[node.text.trim() as keyof typeof retainedLabels];
            if (label) node.text = node.text.replace(node.text.trim(), label);
          }
          if (node.children) normalize(node.children);
        }
      };
      normalize(sourceDocument.nodes);
    }
    expect(translation.document?.nodes).toEqual(sourceDocument.nodes);
    const page = localized.find((item) => item.localization?.entityId === record.entityId)!;
    expect(page.path).toBe(record.arabicPath);
    expect(pageMetadata(page, [...pages, ...localized]).alternates).not.toHaveProperty('languages');
    const graph = JSON.stringify(page.seo.jsonLd);
    expect(graph).toContain('ar-SA');
    expect(graph).toContain('https://nalksolutions.com/ar/');
  }
});
it('derives Arabic listings only from published articles and does not generate an out-of-range page', async () => {
  const localized = await localizedPages(pages);
  const blog = localized.find((item) => item.path === '/ar/blog/')!;
  const members = listingMembers(blog.localization!.listing!, localized);
  expect(members).toHaveLength(8);
  expect(new Set(members.map((item) => item.id)).size).toBe(8);
  expect(publishListingViews(localized).some((item) => item.path === '/ar/blog/page/2/')).toBe(
    false,
  );
  const sourceDocument = documentSchema.parse(
    JSON.parse(readFileSync('src/content/site/documents/R-8523d897404fbce9.json', 'utf8')),
  );
  const document = await localizedListingDocument(blog, localized, sourceDocument, readTranslation);
  expect(document.listingViews).toBeUndefined();
  const serialized = JSON.stringify(document.nodes);
  for (const member of members) expect(serialized).toContain(member.path);
  expect(serialized).not.toContain('cmsmasters-page-c1619d2');
  expect(arabicDateLabel('September 2, 2026')).toContain('2026');
  expect(arabicDateLabel('September 2, 2026')).not.toMatch(/[\u0660-\u0669]/u);
});
it('rejects English-body fallback while preserving technical names and literal code', () => {
  expect(
    untranslatedProse([
      { type: 'text', text: 'This is an untranslated English paragraph with many words.' },
    ]),
  ).toHaveLength(1);
  expect(
    untranslatedProse([
      { type: 'text', text: 'Nalk Solutions' },
      {
        type: 'codeBlock',
        text: 'const value = await client.request(data); // original source code stays unchanged',
      },
    ]),
  ).toEqual([]);
});
it('keeps the published Arabic snapshot while flagging a changed English source', async () => {
  const before = await localizedPages(pages);
  const entity = 'R-54ef9c93732551a9';
  const changed = pages.map((page) =>
    page.id === entity
      ? {
          ...page,
          content: { ...page.content, heading: 'Updated English heading' },
          seo: { ...page.seo, title: 'Updated English metadata' },
        }
      : page,
  );
  const after = await localizedPages(changed);
  const original = before.find((page) => page.localization?.entityId === entity)!;
  const retained = after.find((page) => page.localization?.entityId === entity)!;
  expect(retained.localization?.stale).toBe(true);
  expect(retained.localization?.preview).toBe(false);
  expect(retained.content).toEqual(original.content);
  expect(retained.seo).toEqual(original.seo);
});
