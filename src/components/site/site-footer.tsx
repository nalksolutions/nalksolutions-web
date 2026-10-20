import type { ReactNode } from 'react';
import type { ProofPage } from '../../content/schema';
import { ui } from '../../i18n/messages';
import { localizedHref } from '../../content/localization/identity';
import type { CSSProperties } from 'react';
import assets from '../../content/home/assets.generated.json';
import { contactOffices, ksaPhone } from '../../content/journey/contact';
import { mainNavigation } from '../../content/journey/pages';
import { offers } from '../../content/journey/offers';
import { footerOfferPaths } from '../../content/journey/footer';
import { contacts } from '../../content/home/site';
import { ArchiveImage } from './archive-image';
import { SocialLinks } from './social-links';
import { LocaleLink } from './locale-link';
import { footerEntranceAttributes } from './source-entrance';

function FooterLink({
  href,
  children,
  className,
  locale,
  pages,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  locale: 'en' | 'ar';
  pages: readonly ProofPage[];
}) {
  const target = localizedHref(pages, href, locale);
  return target ? (
    <LocaleLink locale={locale} targetLocale={locale} href={target} className={className}>
      {children}
    </LocaleLink>
  ) : null;
}

export function SiteFooter({
  mobileBackground,
  copyright,
  locale = 'en',
  pages = [],
}: {
  mobileBackground?: string;
  copyright?: { owner: string; notice: string };
  locale?: 'en' | 'ar';
  pages?: readonly ProofPage[];
}) {
  const t = ui(locale);
  const navKeys = ['home', 'services', 'about', 'blog', 'contact'] as const;
  const style: CSSProperties & {
    '--footer-background': string;
    '--footer-mobile-background'?: string;
  } = {
    '--footer-background': `url("${assets.roles.footer}")`,
    ...(mobileBackground ? { '--footer-mobile-background': `url("${mobileBackground}")` } : {}),
  };
  return (
    <footer
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="site-footer"
      style={style}
    >
      <div className="footer-main">
        <div className="footer-brand" {...footerEntranceAttributes('logo')}>
          <LocaleLink
            locale={locale}
            targetLocale={locale}
            href={locale === 'ar' ? '/ar/' : '/'}
            aria-label={t('nav.homeLabel')}
          >
            <ArchiveImage
              src={assets.roles.footerLogo}
              alt="Nalk Solutions"
              className="footer-logo"
            />
          </LocaleLink>
          <p>{t('footer.summary')}</p>
          <SocialLinks />
        </div>
        <nav
          className="footer-links"
          aria-label={t('footer.company')}
          {...footerEntranceAttributes('links')}
        >
          <h2>{t('footer.company')}</h2>
          {mainNavigation.map((item, index) => (
            <FooterLink locale={locale} pages={pages} key={item.href} href={item.href}>
              {t(`nav.${navKeys[index]!}`)}
            </FooterLink>
          ))}
        </nav>
        <nav
          className="footer-links"
          aria-label={t('footer.services')}
          {...footerEntranceAttributes('blog')}
        >
          <h2>{t('footer.services')}</h2>
          {offers.map((offer) => (
            <FooterLink
              locale={locale}
              pages={pages}
              key={offer.id}
              href={footerOfferPaths[offer.id]}
            >
              {t(`offers.${offer.id}`)}
            </FooterLink>
          ))}
        </nav>
        <div className="footer-contact" {...footerEntranceAttributes('contact')}>
          <h2>{t('footer.contact')}</h2>
          <address>
            <a href={contacts.email.href} dir="ltr">
              {contacts.email.label}
            </a>
            <a href={ksaPhone.href}>
              <span>{t('footer.ksa')}</span> <bdi dir="ltr">{ksaPhone.label}</bdi>
            </a>
            <a href={contacts.phone.href}>
              <span>{t('footer.pakistan')}</span> <bdi dir="ltr">{contacts.phone.label}</bdi>
            </a>
          </address>
          <LocaleLink
            locale={locale}
            targetLocale={locale}
            href={locale === 'ar' ? '/ar/contacts/' : '/contacts/'}
            className="footer-enquiry"
          >
            {t('nav.enquiry')} <span aria-hidden="true">→</span>
          </LocaleLink>
        </div>
      </div>
      <div className="footer-offices">
        {contactOffices.map((office) => (
          <div key={office.country}>
            <h2>{t(office.country === 'Saudi Arabia' ? 'footer.ksa' : 'footer.pakistan')}</h2>
            <address>
              {t(
                office.country === 'Saudi Arabia' ? 'footer.ksaAddress' : 'footer.pakistanAddress',
              )}
            </address>
            <p>
              {t(office.country === 'Saudi Arabia' ? 'footer.ksaHours' : 'footer.pakistanHours')}
            </p>
          </div>
        ))}
      </div>
      <div className="footer-copyright" {...footerEntranceAttributes('copyright')}>
        <p>{copyright?.owner ?? 'NALK SOLUTION pvt Ltd'}</p>
        <p>{copyright?.notice ?? t('footer.rights')}</p>
        <FooterLink locale={locale} pages={pages} href="/nalk-solutions-sitemap/">
          {t('footer.sitemap')}
        </FooterLink>
      </div>
    </footer>
  );
}
