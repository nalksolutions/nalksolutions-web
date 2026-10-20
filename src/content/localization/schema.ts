import { z } from 'zod';
import { documentNodeSchema } from '../site/schema';
import { articlePresentationSchema, articleContentSchema } from '../articles/schema';
import { pageSchema } from '../schema';
import { reviewSchema } from './review';
import { untranslatedProse } from './blocks';

export const translationSchema = z
  .strictObject({
    entityId: z.string().min(1),
    path: z.string().startsWith('/ar/'),
    review: reviewSchema,
    publication: z.strictObject({ ready: z.boolean(), acceptance: z.literal('ownerManaged') }),
    sourceSnapshot: pageSchema.optional(),
    articleContent: articleContentSchema.optional(),
    listing: z
      .strictObject({
        family: z.enum(['blog', 'category', 'author']),
        basePath: z.string().startsWith('/'),
        number: z.number().int().positive(),
      })
      .optional(),
    seo: z.strictObject({ title: z.string().min(1), description: z.string().min(1) }),
    heading: z.string().min(1),
    blocks: z.record(z.string().regex(/^[a-f0-9]{64}$/u), z.array(documentNodeSchema).min(1)),
    imageAlts: z.record(z.string(), z.string()),
    issues: z.array(z.string()),
    document: z
      .strictObject({
        nodes: z.array(documentNodeSchema).min(1),
        localizedSections: z.array(documentNodeSchema).optional(),
        article: articlePresentationSchema.optional(),
        listingViews: z
          .array(
            z.strictObject({
              page: z.number().int().min(2),
              nodes: z.array(documentNodeSchema).min(1),
            }),
          )
          .optional(),
      })
      .optional(),
  })
  .superRefine((record, context) => {
    if (!record.publication.ready) return;
    if (
      untranslatedProse([
        ...(record.document?.nodes ?? []),
        ...(record.document?.localizedSections ?? []),
        ...(record.articleContent?.body ?? []),
      ]).length
    )
      context.addIssue({
        code: 'custom',
        message: 'Untranslated English prose cannot be published as an Arabic body',
      });
    if (!record.sourceSnapshot)
      context.addIssue({
        code: 'custom',
        message: 'Published translations require a source snapshot',
      });
    if (record.sourceSnapshot?.content.articleId && !record.articleContent)
      context.addIssue({
        code: 'custom',
        message: 'Published typed articles require a complete Arabic body',
      });
    if (
      record.sourceSnapshot?.content.documentId &&
      !record.document &&
      !Object.keys(record.blocks).length
    )
      context.addIssue({
        code: 'custom',
        message: 'Published translations require localized document content',
      });
  });
export type TranslationRecord = z.infer<typeof translationSchema>;
