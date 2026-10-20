import 'server-only';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProofPage, RecoveredPage } from '../schema';
import { localizedId, plannedArabicPath } from './identity';
import { translationSchema, type TranslationRecord } from './schema';
import { reviewMode } from './review';
import { applyDocumentTranslation } from './blocks';
import type { PageDocument } from '../site/schema';
import { PUBLIC_ORIGIN } from '../../lib/env/config';
import { isReservedPath, decodePublicPath, withoutTrailingSlash } from '../../lib/routing/path';
import { findLegacyRule } from '../../lib/routing/legacy';
import { localizedJsonLd } from './seo';
import register from './register.json';
import { localizedListingDocument, publishListingViews } from './listings';

const entities = [...new Set(register.records.map((record) => record.entityId))];
export async function readTranslation(entityId: string): Promise<TranslationRecord | null> {
  if (!entities.includes(entityId)) return null;
  let contents: string;
  try {
    contents = await readFile(
      path.join(process.cwd(), 'src/content/localization/pages', `${entityId}.json`),
      'utf8',
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      if (
        register.records.some(
          (record) => record.entityId === entityId && record.reviewStatus !== 'draft',
        )
      )
        throw new Error('Registered authored translation is missing');
      return null;
    }
    throw error;
  }
  const input: unknown = JSON.parse(contents);
  const translation = translationSchema.parse(input);
  if (translation.entityId !== entityId || translation.path !== plannedArabicPath(entityId))
    throw new Error('Translation identity/path mismatch');
  return translation;
}
export async function isStale(
  translation: TranslationRecord,
  hashes = new Map<string, Promise<string>>(),
) {
  for (const input of translation.review.sourceInputs) {
    if (!hashes.has(input.path))
      hashes.set(
        input.path,
        readFile(path.join(process.cwd(), input.path)).then((bytes) =>
          createHash('sha256').update(bytes).digest('hex'),
        ),
      );
    if ((await hashes.get(input.path)) !== input.sha256) return true;
  }
  return false;
}
export async function localizedPages(recovered: readonly RecoveredPage[]): Promise<ProofPage[]> {
  const preview = reviewMode();
  const result: ProofPage[] = [];
  const paths = new Set(recovered.map((page) => withoutTrailingSlash(page.path)));
  const hashes = new Map<string, Promise<string>>(); // One repository read, never a cross-request cache.
  const translations = await Promise.all(entities.map(readTranslation));
  for (const entityId of entities) {
    const source = recovered.find((page) => page.id === entityId);
    if (!source) continue; // Isolated fixtures intentionally contain smaller source inventories.
    const translation = translations.find((item) => item?.entityId === entityId);
    if (!translation) continue;
    const base = translation.sourceSnapshot ?? source;
    if (
      base.id !== entityId ||
      base.sourceRouteId !== source.sourceRouteId ||
      base.path !== source.path ||
      base.locale !== source.locale ||
      base.status !== 'published'
    )
      throw new Error('Localized source snapshot identity mismatch');
    const stale =
      (await isStale(translation, hashes)) || JSON.stringify(base) !== JSON.stringify(source);
    const published = translation.publication.ready;
    if (!published && !preview) continue;
    if (source.content.articleId && !translation.articleContent)
      throw new Error('Missing localized typed article body');
    // Editorial acceptance is owner-managed; publication never fabricates native approval.
    const decoded = decodePublicPath(translation.path);
    if (
      decoded !== translation.path ||
      !decoded.endsWith('/') ||
      isReservedPath(decoded.slice(3)) ||
      findLegacyRule(encodeURI(decoded)) ||
      paths.has(withoutTrailingSlash(decoded))
    )
      throw new Error('Invalid localized public path');
    paths.add(withoutTrailingSlash(decoded));
    const canonical = base.seo.canonical === null ? null : PUBLIC_ORIGIN + encodeURI(decoded);
    const social = base.seo.social.map(({ property, content }) => ({
      property,
      content: property.endsWith(':title')
        ? translation.seo.title
        : property.endsWith(':description')
          ? translation.seo.description
          : property === 'og:image:alt'
            ? translation.heading
            : property === 'og:url'
              ? PUBLIC_ORIGIN + encodeURI(decoded)
              : property === 'og:locale'
                ? 'ar_SA'
                : content,
    }));
    result.push({
      ...base,
      id: localizedId(entityId),
      path: decoded,
      locale: 'ar',
      localization: {
        entityId,
        presentationId: entityId,
        reviewStatus: translation.review.status,
        translationRevision: translation.review.translationRevision,
        stale,
        preview: !published,
        ...(translation.listing ? { listing: translation.listing } : {}),
      },
      provenance: {
        kind: 'localized',
        sourceEntityId: entityId,
        translationRevision: translation.review.translationRevision,
      },
      content: {
        ...base.content,
        heading: translation.heading,
        paragraphs: [translation.heading],
        articleId: undefined,
        article: translation.articleContent,
      },
      seo: {
        ...base.seo,
        ...translation.seo,
        canonical,
        social,
        jsonLd: localizedJsonLd(base, translation),
      },
    });
  }
  return publishListingViews(result);
}
export async function localizedDocument(
  page: ProofPage,
  source: PageDocument,
  pages: readonly ProofPage[] = [],
): Promise<PageDocument> {
  if (!page.localization) return source;
  const translation = await readTranslation(page.localization.entityId);
  if (!translation) throw new Error('Missing localized document');
  if (translation.listing) return localizedListingDocument(page, pages, source, readTranslation);
  if (translation.document)
    return { ...source, ...translation.document, path: page.path, locale: 'ar' };
  // Contacts use an explicit authored composition; the source supplies only media/map/form structure.
  function contactAssets(nodes: PageDocument['nodes']): PageDocument['nodes'] {
    return nodes.map((node) =>
      node.type === 'element' && node.tag === 'img'
        ? {
            ...node,
            attributes: {
              ...node.attributes,
              alt: translation!.imageAlts[node.attributes.src ?? ''] ?? '',
            },
          }
        : 'children' in node
          ? { ...node, children: contactAssets(node.children) }
          : node,
    );
  }
  const nodes =
    source.companyLayout === 'contacts'
      ? contactAssets(source.nodes)
      : applyDocumentTranslation(source.nodes, translation);
  return { ...source, path: page.path, locale: 'ar', nodes };
}
