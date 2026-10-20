/** D-20: commercial navigation is authored independently of legacy page themes. */
export type OfferId = 'websites' | 'software' | 'automation' | 'marketing';

export interface Specialist {
  pageId: string;
  label: string;
  area?: boolean;
}

export interface Offer {
  id: OfferId;
  pageId: string;
  label: string;
  action: string;
  audience: string;
  outcome: string;
  description: string;
  aliases: readonly string[];
  problems: readonly string[];
  specialists: readonly Specialist[];
  featured: readonly string[];
}

export const enquiry = { label: 'Discuss Your Project', href: '/contacts/' } as const;

export const offers: readonly Offer[] = [
  {
    id: 'websites',
    pageId: 'R-d37935eb53a2a5dd',
    label: 'Websites & E-commerce',
    action: 'Explore Website Services',
    audience: 'For businesses building or improving their online presence.',
    outcome: 'Turn your website into a useful part of your business.',
    description:
      'Business websites and online stores designed for performance, mobile users and Arabic-English audiences, with ongoing website support.',
    aliases: [
      'website',
      'web design',
      'e-commerce',
      'ecommerce',
      'wordpress',
      'ui/ux',
      'pwa',
      'maintenance',
    ],
    problems: [
      'Your website needs to explain your business clearly.',
      'Customers need a reliable experience on mobile.',
      'Your store, payments and business systems need to work together.',
    ],
    specialists: [
      { pageId: 'R-37f67fcbe0f89e8e', label: 'Custom Website Development' },
      { pageId: 'R-074b5e2a410a5e14', label: 'E-commerce Development' },
      { pageId: 'R-badd60679617635f', label: 'UI/UX Design' },
      { pageId: 'R-df847250b2307366', label: 'Progressive Web Apps' },
      { pageId: 'R-1939954a2017db77', label: 'WordPress Development' },
      { pageId: 'R-a40cf1b87a23cd67', label: 'Website Maintenance & Support' },
      { pageId: 'R-8341c7f01f86e270', label: 'Website Development in Riyadh', area: true },
      { pageId: 'R-008fb5215e727c01', label: 'Website Development in Jeddah', area: true },
      {
        pageId: 'R-ae4b8f2c4557d17c',
        label: 'Website Development in Dammam & Eastern Province',
        area: true,
      },
    ],
    featured: ['R-074b5e2a410a5e14', 'R-badd60679617635f', 'R-a40cf1b87a23cd67'],
  },
  {
    id: 'software',
    pageId: 'R-54ef9c93732551a9',
    label: 'Custom Software & Apps',
    action: 'Explore Software & Apps',
    audience: 'For businesses whose workflows need more than an off-the-shelf tool.',
    outcome: 'Build software around the way your business works.',
    description:
      'Custom business applications, Android and iOS apps, SaaS products and portals that connect your people, processes and existing systems.',
    aliases: ['software', 'app', 'mobile', 'portal', 'saas', 'erp', 'crm', 'b2b'],
    problems: [
      'Separate tools make daily work harder than it needs to be.',
      'Your customers or team need a dedicated application.',
      'Your business needs a portal that fits its processes and access requirements.',
    ],
    specialists: [
      { pageId: 'R-6e7e1d49e2793d9b', label: 'Cloud-Based Portals' },
      { pageId: 'R-1987ffb9e2fcb882', label: 'B2B Portals' },
    ],
    featured: ['R-6e7e1d49e2793d9b', 'R-1987ffb9e2fcb882'],
  },
  {
    id: 'automation',
    pageId: 'R-2ea04bcf8b41b11f',
    label: 'AI & Automation',
    action: 'Explore AI & Automation',
    audience: 'For businesses reducing repetitive work and connecting operations.',
    outcome: 'Give your team more time for work that needs people.',
    description:
      'Business-process automation, connected systems and practical AI applications built around your operations and existing workflows.',
    aliases: [
      'ai',
      'artificial intelligence',
      'automation',
      'workflow',
      'integration',
      'api',
      'process',
    ],
    problems: [
      'Repetitive tasks take time away from your team.',
      'Information needs to move between disconnected systems.',
      'You need a practical use for AI within an existing business process.',
    ],
    specialists: [{ pageId: 'R-3c0c402f82a25de6', label: 'API Integration' }],
    featured: ['R-3c0c402f82a25de6'],
  },
  {
    id: 'marketing',
    pageId: 'R-661faf9de8b4a219',
    label: 'Digital Marketing',
    action: 'Explore Digital Marketing',
    audience: 'For businesses improving visibility, enquiries and customer follow-up.',
    outcome: 'Help the right customers find and choose your business.',
    description:
      'SEO, paid advertising, social media, email, video and marketing automation shaped around how customers search and buy in Saudi Arabia.',
    aliases: [
      'marketing',
      'seo',
      'google ads',
      'advertising',
      'social',
      'email',
      'video',
      'lead',
      'marketing automation',
    ],
    problems: [
      'The right customers are not finding your business.',
      'Campaign activity needs a clearer connection to business results.',
      'Enquiries need consistent, relevant follow-up.',
    ],
    specialists: [
      { pageId: 'R-5246187dfd3b778b', label: 'SEO Services' },
      { pageId: 'R-a11a158e4617d012', label: 'Google Ads Management' },
      { pageId: 'R-4173d39911060952', label: 'Social Media Marketing' },
      { pageId: 'R-a009409174c4c09c', label: 'Email Marketing' },
      { pageId: 'R-2d3c16544074ee82', label: 'Video Marketing' },
      { pageId: 'R-97b60a187fbcf1c5', label: 'Marketing Automation' },
      { pageId: 'R-bf89166f744b9fc3', label: 'Digital Marketing in Riyadh', area: true },
      { pageId: 'R-05879588546b2d6e', label: 'Digital Marketing in Jeddah', area: true },
      {
        pageId: 'R-77d930cacfbddce2',
        label: 'Digital Marketing in Dammam & Eastern Province',
        area: true,
      },
    ],
    featured: ['R-5246187dfd3b778b', 'R-a11a158e4617d012', 'R-4173d39911060952'],
  },
];

export function offerForService(pageId: string) {
  return offers.find(
    (offer) => offer.pageId === pageId || offer.specialists.some((item) => item.pageId === pageId),
  );
}

export const topics = [
  { label: 'Website Development', href: '/category/website-development/' },
  { label: 'Custom Software & Apps', href: '/category/custom-software-apps/' },
  { label: 'AI Automation', href: '/category/ai-automation/' },
  { label: 'Digital Marketing', href: '/category/digital-marketing-strategy/' },
] as const;

export const otherTopics = [
  {
    label: 'Google Ads & Paid Advertising',
    href: '/category/digital-marketing-strategy/google-ads-paid-advertising/',
  },
  {
    label: 'Email Marketing & Marketing Automation',
    href: '/category/digital-marketing-strategy/email-marketing-marketing-automation/',
  },
  { label: 'Content Marketing', href: '/category/digital-marketing-strategy/content-marketing/' },
  { label: 'Marketing Automation', href: '/category/marketing-automation/' },
  { label: 'SEO', href: '/category/digital-marketing-strategy/seo/' },
  { label: 'Video Marketing', href: '/category/digital-marketing-strategy/video-marketing/' },
  { label: 'Uncategorized', href: '/category/uncategorized/' },
] as const;
