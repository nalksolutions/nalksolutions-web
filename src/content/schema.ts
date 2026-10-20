import { z } from 'zod';
import { articleContentSchema } from './articles/schema';
import { PUBLIC_ORIGIN } from '../lib/env/config';
import { findLegacyRule } from '../lib/routing/legacy';
import { decodePublicPath, isReservedPath, withoutTrailingSlash } from '../lib/routing/path';

const publicUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.origin === PUBLIC_ORIGIN && !url.username && !url.password && !url.search && !url.hash;
}, 'Expected a canonical public URL');

export const pageSchema = z.object({
  id: z.string().min(1),
  sourceRouteId: z.string().min(1),
  path: z.string().min(1),
  kind: z.enum(['marketing', 'article', 'archive', 'profile']),
  locale: z.enum(['en', 'ar']),
  status: z.enum(['published', 'draft']),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().nullable(),
    canonical: publicUrl.nullable(),
    robots: z.string().nullable(),
    googlebot: z.string().nullable(),
    social: z.array(z.object({ property: z.string(), content: z.string() })),
    jsonLd: z.array(z.record(z.string(), z.json())),
  }),
  content: z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    articleId: z.literal('wordpress-post-59034').optional(),
    article: articleContentSchema.optional(),
    documentId: z
      .string()
      .regex(/^R-[a-f0-9]{16}$/u)
      .optional(),
  }),
  provenance: z.object({
    sourceHtml: z.string(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u),
    pageRecord: z.string(),
    pageRecordSha256: z.string().regex(/^[a-f0-9]{64}$/u),
    excerpt: z.boolean(),
    headingFallback: z.boolean(),
  }),
});

const datasetSchema = z.object({
  schemaVersion: z.literal(1),
  baselineId: z.literal('nalk-wordpress-2026-10-15'),
  pages: z.array(pageSchema).min(1),
});

export type RecoveredPage = z.infer<typeof pageSchema>;
export interface LocalizationIdentity {
  entityId: string;
  presentationId: string;
  reviewStatus: 'draft' | 'inReview' | 'approved';
  translationRevision: string;
  stale: boolean;
  preview: boolean;
  listing?: { family: 'blog' | 'category' | 'author'; basePath: string; number: number };
}
/** Authored identities reference real recovered sources without claiming WordPress provenance. */
export type ProofPage =
  | (RecoveredPage & { localization?: undefined })
  | (Omit<RecoveredPage, 'provenance'> & {
      localization: LocalizationIdentity;
      provenance: { kind: 'localized'; sourceEntityId: string; translationRevision: string };
    });
export type FixtureDataset = z.infer<typeof datasetSchema>;

export function validateDataset(input: unknown): FixtureDataset {
  const dataset = datasetSchema.parse(input);
  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const page of dataset.pages) {
    const decoded = decodePublicPath(page.path);
    const key = withoutTrailingSlash(decoded);
    if (decoded !== page.path || (decoded !== '/' && !decoded.endsWith('/'))) {
      throw new Error(`Noncanonical fixture path: ${page.id}`);
    }
    if (ids.has(page.id) || paths.has(key))
      throw new Error(`Duplicate fixture identity: ${page.id}`);
    if (isReservedPath(decoded) || findLegacyRule(encodeURI(decoded))) {
      throw new Error(`Reserved fixture path: ${page.id}`);
    }
    if (page.seo.canonical && decodePublicPath(new URL(page.seo.canonical).pathname) !== decoded) {
      throw new Error(`Canonical path mismatch: ${page.id}`);
    }
    ids.add(page.id);
    paths.add(key);
    if (page.content.documentId && page.content.documentId !== page.sourceRouteId) {
      throw new Error(`Document identity mismatch: ${page.id}`);
    }
  }
  return dataset;
}
