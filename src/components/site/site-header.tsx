import { ui } from '../../i18n/messages';
import { entityId, localizedTarget, localizedHref } from '../../content/localization/identity';
import { LanguageSwitch } from './language-switch';
import type { ProofPage } from '../../content/schema';
import { entranceAttributes } from './entrance';
import assets from '../../content/home/assets.generated.json';
import { navigation } from '../../content/home/site';
import { ArchiveImage } from './archive-image';
import { ButtonLink } from './button-link';
import { HeaderDialogs } from './header-dialogs';
import { LocaleLink } from './locale-link';
import { navigationSection } from '../../content/journey/resolve';

export function SiteHeader({
  pages,
  locale = 'en',
  currentPath = '/',
}: {
  pages: readonly ProofPage[];
  locale?: 'en' | 'ar';
  currentPath?: string;
}) {
  const t = ui(locale);
  const current = pages.find((item) => item.path === currentPath);
  const opposite = locale === 'ar' ? 'en' : 'ar';
  const languageHref = current
    ? (localizedTarget(pages, entityId(current), opposite)?.path ?? null)
    : null;
  const homeHref =
    locale === 'ar' ? '/' : (localizedTarget(pages, 'R-91d9b62648d713d4', 'ar')?.path ?? null);
  const navKeys = ['home', 'services', 'about', 'blog', 'contact'] as const;
  const items = navigation.map((item, index) => ({
    ...item,
    label: t(`nav.${navKeys[index]!}`),
    href: localizedHref(pages, item.href, locale),
  }));
  const source = current && pages.find((item) => item.id === entityId(current));
  const section = navigationSection(source ?? current);
  const activeSection = section ? (localizedHref(pages, section, locale) ?? undefined) : undefined;
  const searchable = pages
    .filter((page) => page.locale === locale && !page.seo.robots?.includes('noindex'))
    .map((page) => ({
      id: page.id,
      title: page.seo.title,
      path: page.path,
      locale: page.locale,
      entityId: entityId(page),
    }));
  return (
    <header lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="site-header">
      <LocaleLink
        locale={locale}
        href={locale === 'ar' ? '/ar/' : '/'}
        targetLocale={locale}
        aria-label={t('nav.homeLabel')}
        tabIndex={0}
        {...entranceAttributes({ kind: 'fade', delay: 0 })}
      >
        <ArchiveImage src={assets.roles.logo} alt="Nalk Solutions" priority className="site-logo" />
      </LocaleLink>
      <div className="header-navigation" {...entranceAttributes({ kind: 'fade', delay: 0 })}>
        <nav className="desktop-nav" aria-label={t('nav.primary')}>
          {items.map((item) =>
            item.href ? (
              <LocaleLink
                locale={locale}
                targetLocale={locale}
                key={item.label}
                href={item.href}
                aria-current={item.href === currentPath ? 'page' : undefined}
                data-active-section={item.href === activeSection ? 'true' : undefined}
              >
                {item.label}
              </LocaleLink>
            ) : null,
          )}
          <LanguageSwitch locale={locale} href={languageHref} homeHref={homeHref} />
        </nav>
        <HeaderDialogs
          locale={locale}
          items={items}
          languageHref={languageHref}
          homeHref={homeHref}
          searchable={searchable}
          currentPath={currentPath}
          activeSection={activeSection}
        />
      </div>
      <div className="header-cta" {...entranceAttributes({ kind: 'fade', delay: 0 })}>
        <ButtonLink href={locale === 'ar' ? '/ar/contacts/' : '/contacts/'}>
          {t('nav.enquiry')}
        </ButtonLink>
      </div>
    </header>
  );
}
