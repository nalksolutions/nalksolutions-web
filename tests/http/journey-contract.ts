import { expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { DocumentNode } from '../../src/content/site/schema';
import editorial from '../../docs/page-reviews/customer-journey-editorial.json' with { type: 'json' };

const normalize = (text: string) => text.replace(/\s+/gu, ' ').trim();
function sourceText(node: DocumentNode): string {
  return node.type === 'text'
    ? node.text
    : 'children' in node
      ? node.children.map(sourceText).join('')
      : '';
}

/** Independent source-fragment preservation with a finite, reviewed editorial exception list. */
export function expectRevisedContent(id: string, body: string) {
  const record = editorial.pages.find((page) => page.id === id);
  if (!record) throw new Error(`No D-20 editorial record for ${id}`);
  const document = JSON.parse(readFileSync(`src/content/site/documents/${id}.json`, 'utf8')) as {
    nodes: DocumentNode[];
  };
  const fragments: string[] = [];
  function visit(node: DocumentNode) {
    if (node.type === 'element' && /^(?:p|li|h[1-6])$/u.test(node.tag)) {
      const text = normalize(sourceText(node));
      if (text) fragments.push(text);
    }
    if ('children' in node) node.children.forEach(visit);
  }
  document.nodes.forEach(visit);
  for (const change of record.rewritten)
    expect(fragments, `Editorial source: ${id}`).toContain(change.text);
  const rewritten = new Set(record.rewritten.map((change) => change.text));
  for (const fragment of new Set(fragments)) {
    if (!rewritten.has(fragment))
      expect(normalize(body), `Preserved source fragment: ${id}: ${fragment}`).toContain(fragment);
  }
  for (const expected of record.required)
    expect(normalize(body), `Authored content: ${id}`).toContain(expected);
  expect(normalize(body)).not.toContain('Lorem ipsum dolor sit amet');
}
