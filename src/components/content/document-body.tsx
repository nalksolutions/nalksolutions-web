import { ui } from '../../i18n/messages';
import { createElement, Fragment, type ReactNode } from 'react';
import type { DocumentNode } from '../../content/site/schema';
import { LocaleLink } from '../site/locale-link';
import { EnquiryFields } from './enquiry-fields';
import { ContentSearch, type SearchPage } from './content-search';
import { entranceAttributes } from '../site/entrance';
import { ContentTabs } from './content-tabs';
import { ButtonLink } from '../site/button-link';
import { buttonClassName } from '../site/button-styles';
import { AnimatedDisclosure } from '../site/animated-disclosure';
import { canonicalContentHref } from '../../content/localization/identity';

export interface ContentContext {
  locale: 'en' | 'ar';
  localized?: boolean;
  identities: readonly { path: string; locale: 'en' | 'ar'; entityId?: string }[];
  searchable: readonly SearchPage[];
  enquiryPlaceholders?: boolean;
  contactDelivery?: boolean;
  searchAppearance?: 'listing';
  sharedButtons?: boolean;
}
const reactAttributes: Record<string, string> = {
  srcset: 'srcSet',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  viewbox: 'viewBox',
  'stroke-width': 'strokeWidth',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
};

function renderNode(node: DocumentNode, context: ContentContext, id: string): ReactNode {
  const render = (nodes: readonly DocumentNode[]) => (
    <DocumentBody nodes={nodes} context={context} prefix={id} />
  );
  switch (node.type) {
    case 'text':
      return node.text;
    case 'search':
      return (
        <ContentSearch
          pages={context.searchable}
          locale={context.locale}
          appearance={context.searchAppearance}
        />
      );
    case 'enquiry':
      return (
        <EnquiryFields
          locale={context.locale}
          fields={node.fields}
          buttonLabel={node.buttonLabel}
          id={`enquiry-${id}`}
          showPlaceholders={context.enquiryPlaceholders ?? false}
          contactDelivery={context.contactDelivery ?? false}
        />
      );
    case 'map':
      return (
        <p className="content-map" data-recovered-control>
          <a href={node.href} target="_blank" rel="noopener noreferrer">
            {node.title} — Google Maps
          </a>
        </p>
      );
    case 'disclosure':
      return (
        <AnimatedDisclosure
          className="content-disclosure"
          bodyClassName="content-disclosure-body"
          initialOpen={node.open ?? false}
          summary={render(node.summary)}
        >
          {render(node.children)}
        </AnimatedDisclosure>
      );
    case 'element': {
      if (context.sharedButtons && node.variant === 'company-button' && node.tag === 'a') {
        const href = canonicalContentHref(
          context.identities,
          node.attributes.href ?? '#',
          context.locale,
        );
        const target = context.identities.find(
          (page) =>
            page.path === decodeURIComponent(new URL(href, 'https://nalksolutions.com').pathname),
        );
        const icons = node.children.filter(
          (child) => child.type === 'element' && child.tag === 'svg',
        );
        return (
          <ButtonLink
            href={href}
            documentNavigation={target !== undefined && target.locale !== context.locale}
            className="content-company-button"
            icon={icons.length ? render(icons) : null}
            {...(node.entrance ? { entrance: node.entrance } : {})}
          >
            {render(
              node.children.filter((child) => child.type !== 'element' || child.tag !== 'svg'),
            )}
          </ButtonLink>
        );
      }
      if (node.variant === 'service-tabs')
        return (
          <ContentTabs id={node.attributes.id} {...entranceAttributes(node.entrance)}>
            {render(node.children)}
          </ContentTabs>
        );
      const props: Record<string, unknown> = entranceAttributes(node.entrance);
      for (const [name, value] of Object.entries(node.attributes))
        props[reactAttributes[name] ?? name] = value;
      if (node.variant) props.className = `content-${node.variant}`;
      if (
        context.sharedButtons &&
        node.tag === 'a' &&
        (node.variant === 'service-button' || node.variant === 'listing-read-more')
      )
        props.className = buttonClassName({
          outline: node.variant === 'listing-read-more',
          className: `content-${node.variant}`,
        });
      if (node.attributes['data-service-secondary'] === 'true')
        props.className = 'content-service-button service-detail-link';
      if (node.attributes['data-service-block'] === 'panel') props.className += ' home-glass-card';
      if (node.attributes['data-service-card'] === 'true') props.className += ' home-glass-card';
      if (context.sharedButtons && node.variant === 'company-feature-button')
        props.className = buttonClassName({
          appearance: 'blue',
          className: `content-${node.variant}`,
        });
      if (
        context.sharedButtons &&
        node.tag === 'a' &&
        node.children.some(
          (child) => child.type === 'element' && child.variant === 'company-feature-button',
        )
      )
        props.className = 'site-button-card';
      if (node.variant === 'service-tab' || node.variant === 'service-tab-mobile')
        return createElement('button', { ...props, type: 'button' }, render(node.children));
      if (node.variant?.startsWith('company-icon-')) props['aria-hidden'] = 'true';
      if (node.variant === 'secondary-arrow' || node.variant === 'listing-arrow')
        props['aria-hidden'] = 'true';
      if (node.variant === 'secondary-article-carousel') {
        props.tabIndex = 0;
        props.role = 'region';
        props['aria-label'] = ui(context.locale)('common.authorArticles');
      }
      const children =
        context.sharedButtons &&
        node.variant === 'service-button' &&
        !node.children.some((child) => child.type === 'element' && child.tag === 'svg') ? (
          <>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
            {render(node.children)}
          </>
        ) : (
          render(node.children)
        );
      if (node.tag === 'a') {
        const href = canonicalContentHref(
          context.identities,
          node.attributes.href ?? '#',
          context.locale,
        );
        if (href.startsWith('/') && !href.startsWith('//')) {
          const destination = new URL(href, 'https://nalksolutions.com');
          const target = context.identities.find(
            (page) => page.path === decodeURIComponent(destination.pathname),
          );
          if (context.localized && context.locale === 'ar' && target?.locale === 'en') {
            const localized = context.identities.find(
              (item) =>
                item.entityId === target.entityId &&
                item.locale === 'ar' &&
                item.path.startsWith('/ar/'),
            );
            if (localized)
              return (
                <LocaleLink
                  {...props}
                  href={localized.path + destination.search + destination.hash}
                  locale="ar"
                  targetLocale="ar"
                >
                  {children}
                </LocaleLink>
              );
          }
          return (
            <LocaleLink
              {...props}
              href={href}
              locale={context.locale}
              targetLocale={target?.locale ?? context.locale}
            >
              {children}
            </LocaleLink>
          );
        }
      }
      if (node.tag === 'img') {
        props.loading = 'lazy';
        props.decoding = 'async';
        return createElement('img', props);
      }
      if (node.tag === 'svg') {
        props['aria-hidden'] = 'true';
        props.focusable = 'false';
      }
      if (node.tag === 'pre') props.tabIndex = 0;
      if (node.tag === 'br' || node.tag === 'hr' || node.tag === 'path' || node.tag === 'circle')
        return createElement(node.tag, props);
      const element = createElement(node.tag, props, children);
      return node.tag === 'table' ? (
        <div
          className="content-table"
          tabIndex={0}
          role="region"
          aria-label={ui(context.locale)('common.scrollableTable')}
        >
          {element}
        </div>
      ) : (
        element
      );
    }
  }
}

/** Only validated semantic nodes reach React. No captured HTML or scripts execute. */
export function DocumentBody({
  nodes,
  context,
  prefix = 'body',
}: {
  nodes: readonly DocumentNode[];
  context: ContentContext;
  prefix?: string;
}) {
  return nodes.map((node, index) => (
    <Fragment key={index}>{renderNode(node, context, `${prefix}-${index}`)}</Fragment>
  ));
}
