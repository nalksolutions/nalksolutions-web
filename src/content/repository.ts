import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertFixtureEnvironment } from '../lib/env/config';
import { validateDataset } from './schema';
import { resolveArticle } from './articles/resolve';
import { documentSchema } from './site/schema';
import type { ProofPage } from './schema';
import { localizedPages, localizedDocument } from './localization/server';

export class ContentUnavailableError extends Error {
  constructor() {
    super('Public content is unavailable');
  }
}

/** No process cache: the local publication proof must read the current atomic file. */
export async function readPublishedPages() {
  assertFixtureEnvironment();
  try {
    let contents: string;
    if (process.env.FIXTURE_CONTENT_PATH) {
      // The harness owns this tmp file; never trace it into deployment output.
      contents = await readFile(
        /* turbopackIgnore: true */ process.env.FIXTURE_CONTENT_PATH,
        'utf8',
      );
    } else {
      contents = await readFile(
        path.join(process.cwd(), 'src/content/site/pages.generated.json'),
        'utf8',
      );
    }
    const input: unknown = JSON.parse(contents);
    const pages = validateDataset(input).pages.filter((page) => page.status === 'published');
    if (!pages.some((page) => page.content.articleId))
      return [...pages, ...(await localizedPages(pages))];
    const article: unknown = JSON.parse(
      await readFile(path.join(process.cwd(), 'src/content/articles/api.generated.json'), 'utf8'),
    );
    return [
      ...pages.map((page) => (page.content.articleId ? resolveArticle(page, article) : page)),
      ...(await localizedPages(pages)),
    ];
  } catch {
    // Do not expose file paths, validation payloads or draft content to responses/logs.
    throw new ContentUnavailableError();
  }
}

/** Body files are selected by a validated stable ID, never by request input. */
export async function readPageDocument(page: ProofPage, pages: readonly ProofPage[] = []) {
  if (!page.content.documentId) return null;
  try {
    let contents: string;
    if (process.env.FIXTURE_DOCUMENTS_PATH) {
      // File URLs keep the isolated test location explicit. Combining an unknown
      // directory with a *.json suffix makes Proxy tracing include unrelated JSON.
      const directory = pathToFileURL(
        `${path.resolve(process.env.FIXTURE_DOCUMENTS_PATH)}${path.sep}`,
      );
      contents = await readFile(new URL(`${page.content.documentId}.json`, directory), 'utf8');
    } else {
      contents = await readFile(
        path.join(process.cwd(), 'src/content/site/documents', `${page.content.documentId}.json`),
        'utf8',
      );
    }
    const document = documentSchema.parse(JSON.parse(contents));
    if (
      document.id !== page.sourceRouteId ||
      (!page.localization && (document.path !== page.path || document.locale !== page.locale))
    ) {
      throw new Error('Document identity mismatch');
    }
    return page.localization ? await localizedDocument(page, document, pages) : document;
  } catch {
    throw new ContentUnavailableError();
  }
}
