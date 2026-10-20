import { expect, test } from '../local-test';
import { articleSource } from '../article-source';
import { inspectHtml } from './html';

test('complete article body and code survive raw production HTML rendering', async ({
  request,
}) => {
  const response = await request.get(articleSource.path);
  expect(response.status()).toBe(200);
  const html = inspectHtml(await response.text());
  expect(html.articleBodyText).toBe(articleSource.bodyText);
  expect(html.articleCode).toEqual(articleSource.code);
  expect(html.headings).toEqual([articleSource.title]);
});
