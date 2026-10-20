import { z } from 'zod';

const safeLink = z
  .string()
  .min(1)
  .refine((value) => {
    if (/[\u0000-\u001f\u007f\\]/u.test(value) || value.startsWith('//')) return false;
    try {
      const url = new URL(value, 'https://nalksolutions.com');
      return (
        ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, 'Unsafe article link');
const imagePath = z
  .string()
  .regex(/^\/wp-content\/uploads\/.+\.(?:png|jpe?g|webp|gif|avif)$/u)
  .refine(
    (value) => !/[?#%\\\u0000-\u001f\u007f]/u.test(value) && !value.split('/').includes('..'),
  );
export const articleImageSchema = z.strictObject({
  type: z.literal('image'),
  src: imagePath,
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  variants: z.array(z.strictObject({ src: imagePath, width: z.number().int().positive() })),
  sizes: z.string().max(512).nullable().optional(),
});
export type ArticleImage = z.infer<typeof articleImageSchema>;
const containers = [
  'paragraph',
  'strong',
  'emphasis',
  'listItem',
  'quote',
  'table',
  'tableHead',
  'tableBody',
  'tableFoot',
  'tableRow',
  'caption',
  'figure',
  'figureCaption',
] as const;
type Container = (typeof containers)[number];
export type ArticleNode =
  | { type: 'text'; text: string }
  | { type: 'codeBlock'; text: string; language: string | null }
  | { type: 'heading'; level: 2 | 3 | 4 | 5 | 6; children: ArticleNode[] }
  | { type: 'list'; ordered: boolean; start?: number | undefined; children: ArticleNode[] }
  | { type: 'link'; href: string; title: string | null; children: ArticleNode[] }
  | { type: 'inlineCode'; language: string | null; children: ArticleNode[] }
  | {
      type: 'tableCell' | 'tableHeader';
      colspan?: number | undefined;
      rowspan?: number | undefined;
      scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | undefined;
      children: ArticleNode[];
    }
  | { type: 'break'; children: ArticleNode[] }
  | { type: Container; children: ArticleNode[] }
  | ArticleImage;

export const articleNodeSchema: z.ZodType<ArticleNode> = z.lazy(() =>
  z.union([
    z.strictObject({ type: z.literal('text'), text: z.string() }),
    z.strictObject({
      type: z.literal('codeBlock'),
      text: z.string(),
      language: z.string().nullable(),
    }),
    z.strictObject({
      type: z.literal('heading'),
      level: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
      children: z.array(articleNodeSchema),
    }),
    z.strictObject({
      type: z.literal('list'),
      ordered: z.boolean(),
      start: z.number().int().optional(),
      children: z.array(articleNodeSchema),
    }),
    z.strictObject({
      type: z.literal('link'),
      href: safeLink,
      title: z.string().nullable(),
      children: z.array(articleNodeSchema),
    }),
    z.strictObject({
      type: z.literal('inlineCode'),
      language: z.string().nullable(),
      children: z.array(articleNodeSchema),
    }),
    z.strictObject({
      type: z.enum(['tableCell', 'tableHeader']),
      colspan: z.number().int().positive().optional(),
      rowspan: z.number().int().positive().optional(),
      scope: z.enum(['row', 'col', 'rowgroup', 'colgroup']).optional(),
      children: z.array(articleNodeSchema),
    }),
    z.strictObject({
      type: z.enum([...containers, 'break']),
      children: z.array(articleNodeSchema),
    }),
    articleImageSchema,
  ]),
);
const titleLink = z.strictObject({ title: z.string(), href: safeLink });
export const articlePresentationSchema = z.strictObject({
  excerpt: z.string(),
  dateLabel: z.string(),
  category: z.strictObject({ label: z.string(), href: safeLink }),
  additionalCategories: z.array(z.strictObject({ label: z.string(), href: safeLink })).optional(),
  featured: articleImageSchema,
  footer: z.strictObject({ owner: z.string().min(1), notice: z.string().min(1) }),
  adjacent: z.array(titleLink.extend({ label: z.string(), image: articleImageSchema })).length(2),
  related: z
    .array(
      titleLink.extend({
        image: articleImageSchema,
        category: z.strictObject({ label: z.string(), href: safeLink }),
        dateLabel: z.string(),
        actionLabel: z.string(),
      }),
    )
    .min(1),
});
export const articleContentSchema = z.strictObject({
  body: z.array(articleNodeSchema).min(1),
  presentation: articlePresentationSchema,
});
export type ArticlePresentation = z.infer<typeof articlePresentationSchema>;
export type ArticleContent = z.infer<typeof articleContentSchema>;
