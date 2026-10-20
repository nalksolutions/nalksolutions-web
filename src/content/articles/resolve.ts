import { z } from 'zod';
import { pageSchema, type RecoveredPage } from '../schema';
import { articleContentSchema } from './schema';
import type { ArticleNode } from './schema';

function plainText(node: ArticleNode): string {
  if ('text' in node) return node.text;
  return 'children' in node ? node.children.map(plainText).join('') : '';
}

const runtimeSchema = articleContentSchema
  .extend({
    id: z.literal('wordpress-post-59034'),
    sourceRouteId: z.string(),
    path: z.string(),
    locale: z.literal('en'),
    title: z.string(),
    seo: pageSchema.shape.seo,
  })
  .strict();

/** Attach only to an explicitly selected, matching published identity. */
export function resolveArticle(page: RecoveredPage, input: unknown): RecoveredPage {
  const article = runtimeSchema.parse(input);
  if (
    page.content.articleId !== article.id ||
    page.sourceRouteId !== article.sourceRouteId ||
    page.path !== article.path ||
    page.locale !== article.locale ||
    page.kind !== 'article' ||
    page.content.heading !== article.title ||
    page.seo.canonical !== article.seo.canonical
  ) {
    throw new Error('Article identity mismatch');
  }
  return pageSchema.parse({
    ...page,
    seo: article.seo,
    content: {
      ...page.content,
      paragraphs: article.body
        .filter((node) => node.type === 'paragraph')
        .map(plainText)
        .filter((text) => text.length > 0),
      article: { body: article.body, presentation: article.presentation },
    },
    provenance: { ...page.provenance, excerpt: false },
  });
}
