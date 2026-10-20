import { z } from 'zod';

export const reviewSchema = z
  .strictObject({
    status: z.enum(['draft', 'inReview', 'approved']),
    reviewer: z.string().min(1).nullable(),
    approvedAt: z.iso.datetime().nullable(),
    translationRevision: z.string().min(1),
    sourceInputs: z
      .array(
        z.strictObject({
          path: z
            .string()
            .regex(/^src\/content\/[a-zA-Z0-9_./-]+$/u)
            .refine((value) => !value.split('/').includes('..')),
          sha256: z.string().regex(/^[a-f0-9]{64}$/u),
        }),
      )
      .min(1),
  })
  .superRefine((review, context) => {
    if (review.status === 'approved' && (!review.reviewer || !review.approvedAt))
      context.addIssue({
        code: 'custom',
        message: 'Native approval requires a reviewer and timestamp',
      });
  });
export type TranslationReview = z.infer<typeof reviewSchema>;

/** Draft preview is a local authoring capability, never an alternative production publisher. */
export function reviewMode(env: Readonly<Record<string, string | undefined>> = process.env) {
  if (env.ARABIC_REVIEW_MODE !== '1') return false;
  if (!['local', 'test'].includes(env.APP_ENV ?? 'local'))
    throw new Error('Arabic review mode is local/test only');
  return true;
}
