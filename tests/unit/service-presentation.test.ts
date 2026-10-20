import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import source from '../../src/content/site/documents/R-d37935eb53a2a5dd.json' with { type: 'json' };
import { documentSchema, type DocumentNode } from '../../src/content/site/schema';
import { presentServiceNodes } from '../../src/content/services/presentation';

function content(nodes: readonly DocumentNode[]): unknown[] {
  return nodes.flatMap((node): unknown[] => {
    if (node.type === 'text') return node.text.trim() ? [node.text] : [];
    if (node.type === 'element')
      return [
        ...(node.attributes.href || node.attributes.src || node.attributes.id
          ? [[node.tag, node.attributes.href ?? node.attributes.src ?? node.attributes.id]]
          : []),
        ...content(node.children),
      ];
    if ('children' in node) return content(node.children);
    return [];
  });
}
it('annotates regional cards without mutating source content or links', () => {
  const document = documentSchema.parse(source);
  const original = JSON.stringify(document);
  const presented = presentServiceNodes(document.nodes);
  expect(JSON.stringify(document)).toBe(original);
  expect(content(presented)).toEqual(content(document.nodes));
  expect(JSON.stringify(presented).match(/data-service-card-grid/g)).toHaveLength(1);
  expect(JSON.stringify(presented).match(/"data-service-card":/g)).toHaveLength(3);
});

for (const file of readdirSync('src/content/site/documents').filter((file) =>
  file.endsWith('.json'),
)) {
  const raw = JSON.parse(readFileSync(`src/content/site/documents/${file}`, 'utf8'));
  if (!raw.serviceLayout) continue;
  it(`${file}: service composition retains source text, links and media`, () => {
    const document = documentSchema.parse(raw);
    const frozen = JSON.stringify(document);
    const presented = presentServiceNodes(document.nodes);
    const facts = (nodes: readonly DocumentNode[]) =>
      content(nodes)
        .map((item) => JSON.stringify(item))
        .sort();
    expect(facts(presented)).toEqual(facts(document.nodes));
    expect(JSON.stringify(document)).toBe(frozen);
  });
}
