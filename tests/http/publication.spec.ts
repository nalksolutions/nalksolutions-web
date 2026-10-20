import { expect, test } from '../local-test';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import source from '../../src/content/site/pages.generated.json' with { type: 'json' };
import {
  validateDataset,
  type FixtureDataset,
  type RecoveredPage as ProofPage,
} from '../../src/content/schema';
import { inspectHtml } from './html';

const configuredFile = process.env.FIXTURE_CONTENT_PATH;
const reportDirectory = process.env.CHUNK_RUN_DIR;
if (
  !configuredFile ||
  !reportDirectory ||
  path.resolve(configuredFile) !== path.resolve(reportDirectory, '../fixtures.json') ||
  path.resolve(configuredFile) === path.resolve('src/content/fixtures/pages.json')
)
  throw new Error('Publication tests require an isolated temporary fixture file.');
const file = path.resolve(configuredFile);

async function replace(data: unknown) {
  const next = `${file}.next`;
  await writeFile(next, JSON.stringify(data), 'utf8');
  await rename(next, file);
}

test('the same production build reads new, edited, unpublished and draft articles', async ({
  request,
}) => {
  const dataset = validateDataset(source);
  const base = dataset.pages.find((page) => page.kind === 'article');
  if (!base) throw new Error('Missing article fixture');
  const article = (
    path: string,
    locale: 'en' | 'ar',
    status: 'draft' | 'published' = 'published',
  ): ProofPage => ({
    ...base,
    id: path,
    path,
    locale,
    status,
    seo: {
      ...base.seo,
      title: locale === 'ar' ? 'مقال تجريبي جديد' : 'New publication proof',
      canonical: `https://nalksolutions.com${path}`,
      social: [],
      jsonLd: [],
    },
    content: {
      heading: locale === 'ar' ? 'مقال تجريبي جديد' : 'New publication proof',
      paragraphs: ['Temporary automated publication test content.'],
    },
  });
  const english = article('/proof-new-english/', 'en');
  const arabic = article('/proof-latin-arabic/', 'ar');
  const draft = article('/proof-private-draft/', 'en', 'draft');
  let current: FixtureDataset = { ...dataset, pages: [...dataset.pages, english, arabic, draft] };
  try {
    await replace(current);
    for (const page of [english, arabic]) {
      const response = await request.get(page.path);
      expect(response.status()).toBe(200);
      const html = inspectHtml(await response.text());
      expect(html.title).toBe(page.seo.title);
      expect(html.dir).toBe(page.locale === 'ar' ? 'rtl' : 'ltr');
      expect(html.canonical).toEqual([page.seo.canonical]);
    }
    expect((await request.get(draft.path)).status()).toBe(404);
    current = {
      ...current,
      pages: current.pages.map((page) =>
        page.id === english.id
          ? {
              ...page,
              seo: { ...page.seo, title: 'Edited publication proof' },
              content: { ...page.content, heading: 'Edited publication proof' },
            }
          : page,
      ),
    };
    await replace(current);
    expect(inspectHtml(await (await request.get(english.path)).text()).title).toBe(
      'Edited publication proof',
    );
    current = {
      ...current,
      pages: current.pages.map((page) =>
        page.id === english.id ? { ...page, status: 'draft' } : page,
      ),
    };
    await replace(current);
    expect((await request.get(english.path)).status()).toBe(404);
    current = { ...current, pages: current.pages.filter((page) => page.id !== arabic.id) };
    await replace(current);
    expect((await request.get(arabic.path)).status()).toBe(404);
  } finally {
    await replace(source);
  }
});

test('invalid and colliding content yields recoverable 503, never 404', async ({ request }) => {
  const dataset = validateDataset(source);
  const first = dataset.pages[0];
  if (!first) throw new Error('Missing fixture');
  try {
    await replace({
      ...dataset,
      pages: [...dataset.pages, { ...first, id: 'collision', path: '/api/private/' }],
    });
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch('/', { method });
      expect(response.status()).toBe(503);
      expect(response.headers()['retry-after']).toBe('5');
      const text = await response.text();
      expect(text).not.toContain('ZodError');
      expect(text).not.toContain('FIXTURE_CONTENT_PATH');
      if (method === 'HEAD') expect(text).toBe('');
    }
    await writeFile(`${file}.next`, '{invalid JSON', 'utf8');
    await rename(`${file}.next`, file);
    expect((await request.get('/')).status()).toBe(503);
    // Legacy dispositions do not depend on editorial content availability.
    expect((await request.get('/arabic/')).status()).toBe(410);
  } finally {
    await replace(source);
  }
  expect((await request.get('/')).status()).toBe(200);
});

test('a failed requested body returns controlled 503 and recovers without rebuilding', async ({
  request,
}) => {
  const directory = process.env.FIXTURE_DOCUMENTS_PATH;
  if (!directory || path.resolve(directory) !== path.resolve(file, '../documents')) {
    throw new Error('Body failure test requires an owned temporary document directory');
  }
  const document = path.join(directory, 'R-a0ac0f2631af30d8.json');
  const original = await readFile(document, 'utf8');
  try {
    await writeFile(`${document}.next`, '{broken JSON', 'utf8');
    await rename(`${document}.next`, document);
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch('/contacts/', { method });
      expect(response.status()).toBe(503);
      expect(response.headers()['retry-after']).toBe('5');
      if (method === 'HEAD') expect(await response.body()).toHaveLength(0);
    }
    expect((await request.get('/about-us/')).status()).toBe(200);
    expect((await request.get('/arabic/')).status()).toBe(410);
  } finally {
    await writeFile(`${document}.next`, original, 'utf8');
    await rename(`${document}.next`, document);
  }
  expect((await request.get('/contacts/')).status()).toBe(200);
});
