import { Fragment } from 'react';
import type { DocumentNode } from '../../content/site/schema';
import type { ServiceTheme } from '../../content/services/presentation';
import { DocumentBody, type ContentContext } from './document-body';
import { ServiceArtwork } from './service-artwork';

/** Consecutive capability panels share a layout; source-rich editorial/FAQ sections stay distinct. */
export function ServiceSections({
  nodes,
  context,
  theme,
  indices,
  prefix = 'service',
}: {
  nodes: readonly DocumentNode[];
  context: ContentContext;
  theme?: ServiceTheme;
  indices?: readonly number[];
  prefix?: string;
}) {
  const entries = (indices ?? nodes.map((_, index) => index))
    .map((index) => ({ node: nodes[index]!, index }))
    .filter(({ node }) => node.type !== 'text' || node.text.trim());
  const groups: (typeof entries)[] = [];
  for (const entry of entries) {
    const panel =
      entry.node.type === 'element' && entry.node.attributes['data-service-block'] === 'panel';
    const previous = groups.at(-1);
    const first = previous?.[0]?.node;
    if (
      previous &&
      panel &&
      first?.type === 'element' &&
      first.attributes['data-service-block'] === 'panel'
    )
      previous.push(entry);
    else groups.push([entry]);
  }
  return groups.map((group) => {
    const first = group[0]!;
    const panel =
      first.node.type === 'element' && first.node.attributes['data-service-block'] === 'panel';
    const render = ({ node, index }: typeof first) => {
      const content = (
        <DocumentBody nodes={[node]} prefix={`${prefix}-${index}`} context={context} />
      );
      return (
        <div
          key={index}
          {...(indices ? { 'data-preserved-service-section': index } : {})}
          className={panel ? 'service-panel-slot' : undefined}
        >
          {theme && node.type === 'element' && node.variant === 'service-hero' ? (
            <div className="service-hero-scene">
              {content}
              <ServiceArtwork theme={theme} />
            </div>
          ) : (
            content
          )}
        </div>
      );
    };
    return panel ? (
      <div className="service-panel-grid" key={first.index}>
        {group.map(render)}
      </div>
    ) : (
      <Fragment key={first.index}>{group.map(render)}</Fragment>
    );
  });
}
