import type { DocumentNode } from '../site/schema';

export type ServiceTheme = 'automation' | 'software' | 'platform' | 'marketing' | 'web';

/** Longer prose keeps a full-width reading measure instead of becoming an oversized card. */
const MAX_PANEL_TEXT_LENGTH = 2400;

const themes: Partial<Record<string, ServiceTheme>> = {
  'R-2ea04bcf8b41b11f': 'automation',
  'R-3c0c402f82a25de6': 'automation',
  'R-97b60a187fbcf1c5': 'automation',
  'R-c8d9e9811ccf1b44': 'automation',
  'R-54ef9c93732551a9': 'software',
  'R-dbe0adc51c0b8222': 'software',
  'R-6e7e1d49e2793d9b': 'platform',
  'R-1987ffb9e2fcb882': 'platform',
  'R-661faf9de8b4a219': 'marketing',
  'R-4173d39911060952': 'marketing',
  'R-2d3c16544074ee82': 'marketing',
  'R-5246187dfd3b778b': 'marketing',
  'R-6192607faaa0163f': 'marketing',
  'R-6bb40d0b6be521cf': 'marketing',
  'R-77d930cacfbddce2': 'marketing',
  'R-05879588546b2d6e': 'marketing',
  'R-bf89166f744b9fc3': 'marketing',
  'R-a009409174c4c09c': 'marketing',
  'R-a11a158e4617d012': 'marketing',
};

export function serviceTheme(id: string): ServiceTheme {
  return themes[id] ?? 'web';
}

function some(nodes: readonly DocumentNode[], predicate: (node: DocumentNode) => boolean): boolean {
  return nodes.some(
    (node) =>
      predicate(node) ||
      (node.type !== 'text' && 'children' in node && some(node.children, predicate)),
  );
}

function meaningful(node: DocumentNode): boolean {
  if (node.type === 'text') return node.text.trim().length > 0;
  if (node.type !== 'element') return true;
  return (
    ['img', 'svg', 'a', 'button', 'input', 'video'].includes(node.tag) ||
    node.children.some(meaningful)
  );
}

/** Normalize legacy spacer/action columns without deleting any meaningful source nodes. */
function normalizeColumns(nodes: DocumentNode[]): DocumentNode[] {
  return nodes.map((node) => {
    if (node.type !== 'element' || node.variant !== 'service-columns') return node;
    const columns = node.children.filter(
      (child) =>
        child.type === 'element' &&
        child.variant?.startsWith('service-column-') &&
        meaningful(child),
    );
    const actionsOnly = (column: DocumentNode) =>
      column.type === 'element' &&
      column.children
        .filter(meaningful)
        .every(
          (child) =>
            child.type === 'element' &&
            ['service-action', 'service-action-center'].includes(child.variant ?? ''),
        );
    const content = columns.filter((column) => !actionsOnly(column));
    const actions = columns.filter(actionsOnly);
    if (!content.length) return node;
    return {
      ...node,
      attributes: { ...node.attributes, 'data-columns': String(Math.min(content.length, 4)) },
      children: [
        ...content,
        ...actions.map((column) =>
          column.type === 'element'
            ? {
                ...column,
                attributes: { ...column.attributes, 'data-service-actions-only': 'true' },
              }
            : column,
        ),
      ],
    };
  });
}

function secondaryActions(nodes: DocumentNode[]): DocumentNode[] {
  return nodes.map((node): DocumentNode => {
    if (node.type === 'text' || !('children' in node)) return node;
    const children = secondaryActions(node.children);
    return node.type === 'element' && node.variant === 'service-button'
      ? { ...node, attributes: { ...node.attributes, 'data-service-secondary': 'true' }, children }
      : { ...node, children };
  });
}

function textLength(nodes: readonly DocumentNode[]): number {
  return nodes.reduce(
    (length, node) =>
      length +
      (node.type === 'text'
        ? node.text.trim().length
        : 'children' in node
          ? textLength(node.children)
          : 0),
    0,
  );
}

/** Presentation only: source facts, substantive text, anchors and assets remain intact. */
export function presentServiceNodes(nodes: readonly DocumentNode[]): DocumentNode[] {
  const lastSection = nodes.reduce(
    (last, node, index) =>
      node.type === 'element' && node.variant === 'service-section' ? index : last,
    -1,
  );
  return nodes.map((node, index): DocumentNode => {
    if (node.type === 'text' || !('children' in node)) return node;
    let children = presentServiceNodes(node.children);
    if (node.type !== 'element') return { ...node, children };
    const attributes = { ...node.attributes };
    if ((node.variant?.startsWith('service-column-') || node.tag === 'p') && !meaningful(node))
      attributes['data-service-empty'] = 'true';
    if (node.variant === 'service-columns') {
      const count = children.filter(
        (child) =>
          child.type === 'element' &&
          child.variant?.startsWith('service-column-') &&
          meaningful(child),
      ).length;
      attributes['data-columns'] = String(Math.max(1, Math.min(count, 4)));
      const columns = children.filter(
        (child) =>
          child.type === 'element' &&
          child.variant?.startsWith('service-column-') &&
          meaningful(child),
      );
      const isLinkedCard = (column: DocumentNode) =>
        column.type === 'element' &&
        ['heading', 'action'].every((role) =>
          column.children.some(
            (child) =>
              child.type === 'element' &&
              [`service-${role}`, `service-${role}-center`].includes(child.variant ?? ''),
          ),
        );
      if (columns.length > 1 && columns.every(isLinkedCard)) {
        attributes['data-service-card-grid'] = 'true';
        for (const column of columns) {
          if (column.type === 'element')
            column.attributes = { ...column.attributes, 'data-service-card': 'true' };
        }
      }
    }
    if (node.variant === 'service-section') {
      children = normalizeColumns(children);
      const has = (variant: string) =>
        some(children, (child) => child.type === 'element' && child.variant === variant);
      attributes['data-service-block'] = some(children, (child) => child.type === 'disclosure')
        ? 'faq'
        : has('service-tabs')
          ? 'tabs'
          : index === lastSection
            ? 'closing'
            : has('service-feature')
              ? 'features'
              : !has('service-copy') && !has('service-copy-center')
                ? 'heading'
                : 'editorial';
      const columns = children.filter(
        (child) => child.type === 'element' && child.variant === 'service-columns',
      );
      const single =
        columns.length === 1 &&
        columns[0]?.type === 'element' &&
        columns[0].attributes['data-columns'] === '1';
      if (
        attributes['data-service-block'] === 'editorial' &&
        single &&
        !has('service-inner') &&
        textLength(children) < MAX_PANEL_TEXT_LENGTH
      )
        attributes['data-service-block'] = 'panel';
      if (
        attributes['data-service-block'] === 'heading' &&
        (has('service-action') || has('service-action-center'))
      )
        attributes['data-service-block'] = 'related';
      if (attributes['data-service-block'] !== 'closing') children = secondaryActions(children);
    }
    return {
      ...node,
      attributes,
      children,
      ...(attributes['data-service-block'] === 'panel'
        ? { entrance: { kind: 'fade' as const, delay: 0, duration: 750 as const } }
        : {}),
    };
  });
}
