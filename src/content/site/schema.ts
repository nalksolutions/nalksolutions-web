import { z } from 'zod';
import { articlePresentationSchema } from '../articles/schema';
import { entranceSchema, type Entrance } from '../motion/schema';
import { secondaryPageLayouts } from '../secondary/layouts';

export const documentTags = [
  'div',
  'section',
  'article',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'p',
  'img',
  'figure',
  'figcaption',
  'strong',
  'b',
  'em',
  'i',
  'br',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'caption',
  'blockquote',
  'code',
  'pre',
  'hr',
  'svg',
  'g',
  'path',
  'circle',
] as const;
export const documentVariants = [
  'secondary-profile-hero',
  'secondary-profile-intro',
  'secondary-portrait',
  'secondary-profile-taxonomy',
  'secondary-profile-contacts',
  'secondary-socials',
  'secondary-profile-body',
  'secondary-appointment',
  'secondary-appointment-card',
  'secondary-profile-content',
  'secondary-education',
  'secondary-education-row',
  'secondary-shifts',
  'secondary-shift-grid',
  'secondary-adjacent',
  'secondary-hero',
  'secondary-team-grid-section',
  'secondary-credits-body',
  'secondary-enquiry',
  'secondary-enquiry-image',
  'secondary-enquiry-copy',
  'secondary-team-image',
  'secondary-team-arrow',
  'secondary-team-name',
  'secondary-team-taxonomy',
  'secondary-team-card',
  'secondary-team-grid',
  'secondary-inner',
  'secondary-heading',
  'secondary-breadcrumbs',
  'secondary-shift',
  'secondary-copy',
  'secondary-articles',
  'secondary-breadcrumb-separator',
  'secondary-arrow',
  'secondary-sr-only',
  'secondary-navigation',
  'secondary-shift-graphic',
  'secondary-shift-description',
  'secondary-credit-copy',
  'secondary-article-carousel',
  'button',
  'regular',
  'plain-quote',
  'inline-image',
  'compact-text',
  'card',
  'section',
  'columns',
  'column',
  'group',
  'cards',
  'pagination',
  'prose',
  'media',
  'statistic',
  'testimonial',
  'feature',
  'excerpt',
  'metadata',
  'tab-heading',
  'service-hero',
  'service-faq-icon',
  'service-faq-open-icon',
  'service-faq-closed-icon',
  'service-statistics',
  'service-section',
  'service-inner',
  'service-columns',
  'service-column-25',
  'service-column-33',
  'service-column-50',
  'service-column-100',
  'service-heading',
  'service-heading-center',
  'service-copy',
  'service-copy-center',
  'service-action',
  'service-action-center',
  'service-counter',
  'service-counter-title',
  'service-counter-number',
  'service-counter-part',
  'service-button',
  'service-feature',
  'service-feature-inner',
  'service-feature-icon',
  'service-feature-copy',
  'service-tabs',
  'service-tabs-list',
  'service-tabs-body',
  'service-tab',
  'service-tab-mobile',
  'service-tab-panel',
  'company-about-hero',
  'company-values',
  'company-values-image',
  'company-statements',
  'company-message',
  'company-hidden',
  'company-offerings',
  'company-showcase',
  'company-reviews-heading',
  'company-testimonials',
  'company-contacts-hero',
  'company-contact-information',
  'company-locations-heading',
  'company-locations',
  'company-enquiry',
  'company-services-hero',
  'company-service-group',
  'company-service-grid',
  'company-services-cta',
  'company-empty',
  'company-ar-intro',
  'company-ar-lead',
  'company-ar-grid',
  'company-ar-cta',
  'company-row',
  'company-inner',
  'company-column',
  'company-column-third',
  'company-badge',
  'company-small-copy',
  'company-contact-details',
  'company-major-card',
  'company-feature',
  'company-feature-graphic',
  'company-feature-description',
  'company-feature-button',
  'company-testimonial',
  'company-testimonial-author',
  'company-heading',
  'company-copy',
  'company-image',
  'company-button',
  'company-icon-shape1',
  'company-icon-shape2',
  'company-icon-shape3',
  'company-icon-shape4',
  'company-icon-shape5',
  'company-icon-solution1',
  'company-icon-solution2',
  'company-icon-solution3',
  'company-icon-solution4',
  'company-highlight',
  'company-inline-18',
  'company-regular',
  'company-sr-only',
  'company-rating',
  'company-quote',
  'company-signature',
  'company-message-divider',
  'company-tablet-hidden-column',
  'listing-hero',
  'listing-body',
  'listing-primary',
  'listing-sidebar',
  'listing-featured',
  'listing-blog-copy',
  'listing-blog-meta',
  'listing-blog-image',
  'listing-taxonomy',
  'listing-date',
  'listing-card-title',
  'listing-action',
  'listing-row',
  'listing-row-image',
  'listing-row-copy',
  'listing-excerpt',
  'listing-byline',
  'listing-featured-image',
  'listing-featured-title',
  'listing-blog-card',
  'listing-row-card',
  'listing-featured-card',
  'listing-blog-grid',
  'listing-grid-widget',
  'listing-divider',
  'listing-arrow',
  'listing-rows',
  'listing-featured-list',
  'listing-pagination',
  'listing-current',
  'listing-title',
  'listing-breadcrumbs',
  'listing-breadcrumb-separator',
  'listing-author',
  'listing-featured-heading',
  'listing-author-inner',
  'listing-read-more',
] as const;

export const companyPageLayouts = {
  'R-71192976f0e75fcc': 'about',
  'R-e83c0ad06ef3deb6': 'services',
  'R-a0ac0f2631af30d8': 'contacts',
  'R-56afdad51c5c96c4': 'arabic-company',
  'R-393cf74e2e96e1c4': 'sitemap',
} as const;

export const listingFamilyLayouts = {
  'blog-listing': 'blog',
  'category-listing': 'category',
  'author-listing': 'author',
} as const;

export function isSafeContentLink(value: string): boolean {
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
}

const attributesByTag: Partial<Record<(typeof documentTags)[number], readonly string[]>> = {
  a: ['href', 'title', 'target', 'rel', 'aria-label', 'aria-current'],
  span: ['aria-current'],
  img: ['src', 'alt', 'title', 'width', 'height', 'srcset', 'sizes'],
  ol: ['start'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
  svg: ['viewbox', 'width', 'height', 'fill'],
  path: ['d', 'fill', 'stroke', 'stroke-width', 'fill-rule', 'clip-rule'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
  g: ['fill', 'stroke', 'transform'],
};

export function isLocalImage(value: string): boolean {
  return (
    /^\/(?:wp-content\/uploads|media\/recovered)\/.+\.(?:png|jpe?g|webp|gif|svg|avif)$/u.test(
      value,
    ) &&
    !/[?#%\\\u0000-\u001f]/u.test(value) &&
    !value.split('/').includes('..')
  );
}

const fieldSchema = z.strictObject({
  label: z.string().min(1),
  name: z.string(),
  kind: z.enum(['text', 'email', 'tel', 'number', 'url', 'textarea', 'select', 'checkbox']),
  required: z.boolean(),
  options: z.array(z.string()),
  defaultValue: z.string().optional(),
});
export type EnquiryField = z.infer<typeof fieldSchema>;
export type DocumentNode =
  | { type: 'text'; text: string }
  | {
      type: 'element';
      tag: (typeof documentTags)[number];
      attributes: Record<string, string>;
      variant: (typeof documentVariants)[number] | null;
      children: DocumentNode[];
      entrance?: Entrance | undefined;
    }
  | {
      type: 'disclosure';
      summary: DocumentNode[];
      children: DocumentNode[];
      open?: boolean | undefined;
    }
  | { type: 'search' }
  | { type: 'enquiry'; fields: EnquiryField[]; buttonLabel: string }
  | { type: 'map'; href: string; title: string };

export const documentNodeSchema: z.ZodType<DocumentNode> = z.lazy(() =>
  z.union([
    z.strictObject({ type: z.literal('text'), text: z.string() }),
    z
      .strictObject({
        type: z.literal('element'),
        tag: z.enum(documentTags),
        attributes: z.record(z.string(), z.string()),
        variant: z.enum(documentVariants).nullable(),
        children: z.array(documentNodeSchema),
        entrance: entranceSchema.optional(),
      })
      .superRefine((node, context) => {
        const allowed = ['id', 'lang', 'dir', ...(attributesByTag[node.tag] ?? [])];
        if (['br', 'hr', 'img'].includes(node.tag) && node.children.length) {
          context.addIssue({
            code: 'custom',
            message: 'Void content elements cannot own children',
          });
        }
        if (Object.keys(node.attributes).some((name) => !allowed.includes(name))) {
          context.addIssue({ code: 'custom', message: 'Unreviewed content attribute' });
        }
        if (node.tag === 'a' && !isSafeContentLink(node.attributes.href ?? '')) {
          context.addIssue({ code: 'custom', message: 'Unsafe content link' });
        }
        if (node.tag === 'img') {
          if (
            !isLocalImage(node.attributes.src ?? '') ||
            (node.attributes.srcset &&
              node.attributes.srcset.split(',').some((part) => {
                const match = /^\s*(\S+)\s+\d+(?:\.\d+)?[wx]\s*$/u.exec(part);
                return !match || !isLocalImage(match[1] ?? '');
              }))
          ) {
            context.addIssue({ code: 'custom', message: 'Unrecovered content image' });
          }
        }
      }),
    z.strictObject({
      type: z.literal('disclosure'),
      summary: z.array(documentNodeSchema),
      children: z.array(documentNodeSchema),
      open: z.boolean().optional(),
    }),
    z.strictObject({ type: z.literal('search') }),
    z.strictObject({
      type: z.literal('enquiry'),
      fields: z.array(fieldSchema),
      buttonLabel: z.string(),
    }),
    z.strictObject({
      type: z.literal('map'),
      href: z.url().refine((value) => {
        const url = new URL(value);
        return url.origin === 'https://maps.google.com' && url.pathname === '/maps';
      }),
      title: z.string(),
    }),
  ]),
);

export const documentSchema = z
  .strictObject({
    id: z.string().regex(/^R-[a-f0-9]{16}$/u),
    path: z.string(),
    locale: z.enum(['en', 'ar']),
    family: z.string().min(1),
    nodes: z.array(documentNodeSchema).min(1),
    article: articlePresentationSchema.optional(),
    serviceLayout: z.literal('service-v1').optional(),
    companyLayout: z
      .enum(['about', 'services', 'contacts', 'arabic-company', 'sitemap'])
      .optional(),
    listingLayout: z.enum(['blog', 'category', 'author']).optional(),
    secondaryLayout: z.enum(['profile', 'profile-archive', 'credits', 'team']).optional(),
    listingViews: z
      .array(
        z.strictObject({
          page: z.number().int().min(2).max(6),
          nodes: z.array(documentNodeSchema).min(1),
        }),
      )
      .optional(),
  })
  .superRefine((document, context) => {
    const expectedSecondaryLayout =
      secondaryPageLayouts[document.id as keyof typeof secondaryPageLayouts];
    if (
      document.secondaryLayout !== expectedSecondaryLayout ||
      (document.secondaryLayout &&
        (document.companyLayout ||
          document.listingLayout ||
          document.article ||
          document.serviceLayout))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Secondary presentation must match its reviewed identity',
      });
    }
    const expectedListingLayout =
      listingFamilyLayouts[document.family as keyof typeof listingFamilyLayouts];
    if (
      document.listingLayout !== expectedListingLayout ||
      (document.listingLayout &&
        (document.article || document.companyLayout || document.serviceLayout)) ||
      (document.listingLayout === 'blog' &&
        (document.id !== 'R-8523d897404fbce9' ||
          document.path !== '/blog/' ||
          document.listingViews?.map((view) => view.page).join(',') !== '2,3,4,5,6')) ||
      (document.listingLayout !== 'blog' && document.listingViews)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Listing presentation must match its family and query views',
      });
    }
    const expectedCompanyLayout =
      companyPageLayouts[document.id as keyof typeof companyPageLayouts];
    if (
      document.companyLayout !== expectedCompanyLayout ||
      (document.companyLayout &&
        (document.serviceLayout ||
          document.article ||
          !['corporate-or-special', 'arabic-marketing'].includes(document.family)))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Company layout must match its reviewed identity and family',
      });
    }
    if ((document.family === 'article') !== Boolean(document.article)) {
      context.addIssue({ code: 'custom', message: 'Article presentation must match its family' });
    }
    if (
      document.serviceLayout &&
      !['service-or-location', 'arabic-marketing'].includes(document.family)
    ) {
      context.addIssue({ code: 'custom', message: 'Service layout must match its family' });
    }
    if (document.family === 'service-or-location' && !document.serviceLayout) {
      context.addIssue({ code: 'custom', message: 'Service presentation is required' });
    }
  });
export type PageDocument = z.infer<typeof documentSchema> & {
  localizedSections?: DocumentNode[] | undefined;
};
