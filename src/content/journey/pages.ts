/** Stable public identities; page roles do not depend on recovered visual templates. */
export const corePages = {
  home: 'R-91d9b62648d713d4',
  about: 'R-71192976f0e75fcc',
  services: 'R-e83c0ad06ef3deb6',
  blog: 'R-8523d897404fbce9',
  contact: 'R-a0ac0f2631af30d8',
} as const;

export const mainNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/our-services/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact Us', href: '/contacts/' },
] as const;

export const homeIntroduction = [
  'We are Nalk Solutions, a technology and creative company working with businesses across Saudi Arabia.',
  'From Riyadh and Jeddah to Dammam and the Eastern Province, we bring local understanding and connected delivery to your digital presence, supporting the wider goals of Vision 2030.',
] as const;
export const servicesIntroduction =
  'Start with what your business needs. Explore four connected offers, with specialist expertise available when your project needs it.';
export const blogIntroduction =
  'Practical guides to technology, websites and marketing for your business. Browse a topic or explore the latest articles.';
export const aboutServices = [
  'High-performing websites, intuitive interfaces and digital campaigns connect your business with its customers. Our work covers websites and e-commerce, custom software and apps, AI and automation, and digital marketing.',
  'Our marketing capabilities include SEO, paid advertising and Google Business Profile optimization.',
] as const;
