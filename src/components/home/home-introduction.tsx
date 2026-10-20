import { copyText, homeCopy } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';
import assets from '../../content/home/assets.generated.json';
import { ArchiveImage } from '../site/archive-image';
import { ResolvedButtonLink } from '../site/resolved-button-link';
import { homeEntrance, homeEntranceAttributes } from '../site/source-entrance';
import { BrandSlider } from './brand-slider';

const logoNames = [
  'Golden Trust',
  'Iftikhar',
  'Alghad',
  'HH',
  'Akyme',
  'Afnan',
  'KS',
  'Anas Abdullah',
  'Momaiza',
  'Expo',
  'Arena Shield',
  'Peak View',
];

export function HomeBrands({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section
      className="home-introduction journey-brands"
      aria-label={copyText(locale, 'brandLabel', 'Businesses we work with')}
      style={{ backgroundImage: `url("${assets.roles.intro}")` }}
    >
      <div className="home-intro-overview">
        <div className="home-logo-strip" {...homeEntranceAttributes('6da7140')}>
          <BrandSlider>
            {assets.logos.map((src, index) => (
              <ArchiveImage key={src} src={src} alt={logoNames[index] ?? ''} />
            ))}
          </BrandSlider>
        </div>
        <div className="home-locations">
          <h2 {...homeEntranceAttributes('3b5eccd')}>
            {copyText(locale, 'locations', 'Locations')}
          </h2>
          <p {...homeEntranceAttributes('60141e1')}>
            {copyText(
              locale,
              'areas',
              'Serving Businesses Across Saudi Arabia | Riyadh | Jeddah | Dammam & Eastern Province',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeIntroduction({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section
      className="home-introduction journey-introduction"
      aria-label={copyText(locale, 'about', 'About Nalk Solutions')}
      style={{ backgroundImage: `url("${assets.roles.intro}")` }}
    >
      <div className="home-about">
        <ArchiveImage src={assets.roles.ring} alt="" className="home-ring" />
        <div className="home-about-copy">
          <p className="section-label" {...homeEntranceAttributes('cd8075f')}>
            {copyText(locale, 'partner', 'Your technology partner')}
          </p>
          <h2 className="gradient-text">
            {copyText(locale, 'built', 'Built around your business.')}
          </h2>
          <div>
            {homeCopy(locale).intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ResolvedButtonLink
            href={locale === 'ar' ? null : '/about-us/'}
            appearance="coral"
            entrance={homeEntrance('2f14a6f')}
          >
            {copyText(locale, 'about', 'About Nalk Solutions')}
          </ResolvedButtonLink>
        </div>
      </div>
    </section>
  );
}
