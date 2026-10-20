import { ui } from '../../i18n/messages';
import { copyText, contactArabic } from '../../content/localization/copy';
import type { DocumentNode, PageDocument } from '../../content/site/schema';
import { contacts } from '../../content/home/site';
import { contactOffices, ksaPhone, projectBrief } from '../../content/journey/contact';
import { contactIntro, enquiryNotice } from '../../content/journey/company-content';
import { DocumentBody, type ContentContext } from '../content/document-body';
import { ButtonLink } from '../site/button-link';

function descendants(nodes: readonly DocumentNode[]): DocumentNode[] {
  return nodes.flatMap((node) => [node, ...('children' in node ? descendants(node.children) : [])]);
}

/** Authored contact composition; recovered contact facts, media and controls stay intact. */
export function ContactJourney({
  document,
  context,
}: {
  document: PageDocument;
  context: ContentContext;
}) {
  const locale = context.locale;
  const t = ui(locale);
  const nodes = descendants(document.nodes);
  const hero = document.nodes.find(
    (node) => node.type === 'element' && node.variant === 'company-contacts-hero',
  );
  const locations = document.nodes.find(
    (node) => node.type === 'element' && node.variant === 'company-locations',
  );
  const image =
    hero && 'children' in hero
      ? descendants(hero.children).find((node) => node.type === 'element' && node.tag === 'img')
      : undefined;
  const officeImages =
    locations && 'children' in locations
      ? descendants(locations.children).filter(
          (node) => node.type === 'element' && node.tag === 'img',
        )
      : [];
  const map = nodes.find((node) => node.type === 'map');
  const enquiry = nodes.find((node) => node.type === 'enquiry');
  if (!image || !enquiry || !map || officeImages.length !== 2)
    throw new Error('Contact source is incomplete');
  const render = (items: readonly DocumentNode[], prefix: string) => (
    <DocumentBody
      nodes={items}
      prefix={prefix}
      context={{ ...context, sharedButtons: true, enquiryPlaceholders: true }}
    />
  );
  return (
    <div data-journey-page="contacts" className="contact-journey">
      <section className="journey-section contact-hero" aria-labelledby="contact-heading">
        <div className="contact-hero-copy">
          <p className="section-label">
            {copyText(locale, 'contactBadge', "Let's talk about your business")}
          </p>
          <h1 id="contact-heading" className="gradient-text">
            {copyText(locale, 'contactHeading', 'Contact Us Online')}
          </h1>
          <p className="contact-lead">{locale === 'ar' ? contactArabic.intro : contactIntro}</p>
          <div className="journey-actions">
            <ButtonLink href={contacts.email.href}>
              {copyText(locale, 'emailBrief', 'Email Your Project Brief')}
            </ButtonLink>
            <ButtonLink href={ksaPhone.href} outline>
              {copyText(locale, 'callSaudi', 'Call Our Saudi Team')}
            </ButtonLink>
          </div>
          <p className="contact-reassurance">
            {copyText(
              locale,
              'reassurance',
              'You do not need a finished specification to start a conversation.',
            )}
          </p>
        </div>
        <aside className="contact-brief home-glass-card" aria-labelledby="brief-heading">
          <div className="contact-hero-media">{render([image], 'contact-hero')}</div>
          <div className="contact-brief-copy">
            <h2 id="brief-heading">
              {copyText(locale, 'briefHeading', 'A useful starting point')}
            </h2>
            <ol>
              {(locale === 'ar' ? contactArabic.brief : projectBrief).map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
      <section className="journey-section" aria-labelledby="contact-methods-heading">
        <div className="contact-section-heading">
          <p className="section-label">{copyText(locale, 'choose', 'Choose what works for you')}</p>
          <h2 id="contact-methods-heading">
            {copyText(locale, 'direct', 'Talk to the team directly.')}
          </h2>
        </div>
        <address className="contact-methods journey-contact-links">
          <a className="contact-method home-glass-card" href={contacts.email.href}>
            <span>{copyText(locale, 'emailProject', 'Email your project')}</span>
            <strong>{contacts.email.label}</strong>
            <span>
              {copyText(locale, 'emailHelp', 'Share your goals, questions or a short brief.')}
            </span>
          </a>
          <a className="contact-method home-glass-card" href={ksaPhone.href}>
            <span>{t('footer.ksa')}</span>
            <strong dir="ltr">{ksaPhone.label}</strong>
            <span>{copyText(locale, 'callSaudiHelp', 'Call our Saudi team.')}</span>
          </a>
          <a className="contact-method home-glass-card" href={contacts.phone.href}>
            <span>{t('footer.pakistan')}</span>
            <strong dir="ltr">{contacts.phone.label}</strong>
            <span>{copyText(locale, 'callPakistanHelp', 'Call our Pakistan team.')}</span>
          </a>
        </address>
      </section>
      <section className="journey-section contact-locations" aria-labelledby="locations-heading">
        <div className="contact-section-heading">
          <p className="section-label">{copyText(locale, 'ourLocations', 'Our locations')}</p>
          <h2 id="locations-heading">
            {copyText(locale, 'connected', 'Connected across Saudi Arabia and Pakistan.')}
          </h2>
        </div>
        <div className="contact-office-grid">
          {contactOffices.map((office) => (
            <article className="contact-office home-glass-card" key={office.city}>
              <div className="contact-office-media">
                {render([officeImages[office.imageIndex]!], `office-${office.city}`)}
              </div>
              <div className="contact-office-copy">
                <p className="section-label">
                  {t(office.country === 'Saudi Arabia' ? 'footer.ksa' : 'footer.pakistan')}
                </p>
                <h3>{t(office.city === 'Jeddah' ? 'footer.jeddah' : 'footer.rawalpindi')}</h3>
                <address>
                  {t(office.city === 'Jeddah' ? 'footer.ksaAddress' : 'footer.pakistanAddress')}
                </address>
                <p>
                  <strong>{copyText(locale, 'opening', 'Opening hours')}</strong>
                  <br />
                  {t(office.city === 'Jeddah' ? 'footer.ksaHours' : 'footer.pakistanHours')}
                </p>
                {office.city === 'Rawalpindi' && (
                  <a
                    className="contact-map-link"
                    href={map.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copyText(locale, 'map', 'View Rawalpindi on Google Maps')}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
        className="journey-section contact-form-note"
        aria-labelledby="online-enquiry-heading"
      >
        <h2 id="online-enquiry-heading">{copyText(locale, 'sendEnquiry', 'Send an enquiry')}</h2>
        <p>{locale === 'ar' ? contactArabic.notice : enquiryNotice}</p>
        <div className="contact-form-panel home-glass-card">
          {render([enquiry], 'contact-enquiry')}
        </div>
      </section>
    </div>
  );
}
