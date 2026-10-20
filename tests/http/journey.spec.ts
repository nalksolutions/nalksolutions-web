import { expect, test } from '../local-test';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import identities from '../../src/content/site/pages.generated.json' with { type: 'json' };
import scope from '../../docs/registers/navigation-scope.json' with { type: 'json' };
import { offers, topics, otherTopics } from '../../src/content/journey/offers';
import { articleAssignments } from '../../src/content/journey/articles';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
function elements(node: Node): Element[] {
  return [
    ...('tagName' in node ? [node] : []),
    ...('childNodes' in node ? node.childNodes.flatMap(elements) : []),
  ];
}
const attr = (node: Element, name: string) => node.attrs.find((a) => a.name === name)?.value;
const target = (id: string) => identities.pages.find((p) => p.id === id)!;

test('journey graph: all retained identities reachable; all specialist and article connections are server rendered', async ({
  request,
}) => {
  test.setTimeout(180_000);
  const graph = new Map<string, string[]>();
  for (const page of identities.pages) {
    const response = await request.get(encodeURI(page.path));
    expect(response.status(), page.path).toBe(200);
    const nodes = elements(parse(await response.text()));
    const links = nodes
      .filter((n) => n.tagName === 'a')
      .flatMap((n) => {
        const href = attr(n, 'href');
        if (!href) return [];
        const url = new URL(href, 'https://nalksolutions.com');
        return url.origin === 'https://nalksolutions.com' ? [decodeURI(url.pathname)] : [];
      });
    graph.set(page.path, links);
    const parent = offers.find((o) => o.specialists.some((s) => s.pageId === page.id));
    if (parent) {
      const nav = nodes.find((n) => attr(n, 'class') === 'journey-parent');
      expect(nav, page.path).toBeDefined();
      expect(
        elements(nav!)
          .filter((n) => n.tagName === 'a')
          .map((n) => attr(n, 'href')),
      ).toEqual([target(parent.pageId).path, '/contacts/']);
    }
    const offer = articleAssignments[page.id];
    const bridges = nodes.filter((n) => attr(n, 'data-related-offer') !== undefined);
    if (offer) {
      expect(bridges, page.path).toHaveLength(1);
      expect(attr(bridges[0]!, 'data-related-offer')).toBe(offer);
      expect(
        elements(bridges[0]!)
          .filter((n) => n.tagName === 'a')
          .map((n) => attr(n, 'href')),
      ).toEqual([target(offers.find((o) => o.id === offer)!.pageId).path]);
    } else expect(bridges, page.path).toHaveLength(0);
    if (page.path === '/our-services/') {
      const groups = nodes.filter((n) => attr(n, 'data-offer-directory'));
      expect(groups).toHaveLength(4);
      for (const group of groups) {
        expect(attr(group, 'open')).toBeUndefined();
        const offer = offers.find((o) => o.id === attr(group, 'data-offer-directory'))!;
        expect(
          elements(group)
            .filter((n) => n.tagName === 'a')
            .map((n) => attr(n, 'href')),
        ).toEqual(offer.specialists.map((s) => target(s.pageId).path));
      }
    }
    if (page.path === '/blog/') {
      const topicNav = nodes.filter((n) =>
        ['Featured blog topics', 'All blog topics'].includes(attr(n, 'aria-label') ?? ''),
      );
      expect(
        topicNav.flatMap((n) =>
          elements(n)
            .filter((e) => e.tagName === 'a')
            .map((e) => attr(e, 'href')),
        ),
      ).toEqual([...topics, ...otherTopics].map((t) => t.href));
    }
  }
  const reached = new Set<string>();
  const queue = ['/'];
  while (queue.length) {
    const path = queue.shift()!;
    if (reached.has(path)) continue;
    reached.add(path);
    queue.push(...(graph.get(path) ?? []).filter((p) => graph.has(p) && !reached.has(p)));
  }
  // D-16's eleven disconnected archive/demo pages remain compatibility-only.
  expect(
    scope.routes
      .filter((route) => route.disposition === 'in-scope' && !reached.has(route.path))
      .map((route) => route.path),
  ).toEqual([]);
});
