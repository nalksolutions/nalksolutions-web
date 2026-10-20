import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { articleContentSchema, articleNodeSchema } from '../../src/content/articles/schema';
import { resolveArticle } from '../../src/content/articles/resolve';
import { ArticleBody } from '../../src/components/article/article-body';
import { validateDataset } from '../../src/content/schema';
import fixture from '../../src/content/fixtures/pages.json';
import article from '../../src/content/articles/api.generated.json';
import { articleShareUrls } from '../../src/lib/seo/article-sharing';

describe('article rendering contract', () => {
  it('shares the canonical identity and escaped title, rejecting unapproved origins', () => {
    const canonical = `https://nalksolutions.com${article.path}`;
    const title = 'API & Arabic: مثال';
    const urls = articleShareUrls(canonical, title);
    expect(new URL(urls.x ?? '').searchParams.get('text')).toBe(title);
    expect(new URL(urls.email ?? '').searchParams.get('subject')).toBe(title);
    expect(new URL(urls.linkedin ?? '').searchParams.get('url')).toBe(canonical);
    expect(() => articleShareUrls('https://forged.example/article/', title)).toThrow();
  });
  it('validates the recovered body and resolves matching content and metadata together', () => {
    const page = validateDataset(fixture).pages.find((page) => page.content.articleId);
    if (!page) throw new Error('Missing article identity');
    const resolved = resolveArticle(page, article);
    expect(resolved.content.article?.body).toEqual(
      articleContentSchema.parse({ body: article.body, presentation: article.presentation }).body,
    );
    expect(resolved.seo.jsonLd).toEqual(article.seo.jsonLd);
    expect(resolved.provenance.excerpt).toBe(false);
    expect(() => resolveArticle({ ...page, path: '/wrong/' }, article)).toThrow(
      'identity mismatch',
    );
  });
  it('rejects unsupported nodes, unsafe links and non-public image paths', () => {
    expect(articleNodeSchema.safeParse({ type: 'script', children: [] }).success).toBe(false);
    expect(
      articleNodeSchema.safeParse({
        type: 'link',
        href: 'javascript:alert(1)',
        title: null,
        children: [],
      }).success,
    ).toBe(false);
    expect(
      articleNodeSchema.safeParse({
        type: 'image',
        src: '/wp-content/uploads/../secret.png',
        alt: '',
        width: 1,
        height: 1,
        variants: [],
      }).success,
    ).toBe(false);
  });
  it('escapes source text and preserves literal code whitespace without HTML injection', () => {
    const node = articleNodeSchema.parse({
      type: 'codeBlock',
      language: 'html',
      text: '\n  <script>alert(1)</script>\n',
    });
    const html = renderToStaticMarkup(createElement(ArticleBody, { nodes: [node] }));
    expect(html).toContain('\n  &lt;script&gt;alert(1)&lt;/script&gt;\n');
    expect(html).not.toContain('<script>');
  });
});
