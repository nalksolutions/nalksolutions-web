import { copyText } from '../../content/localization/copy';
import { ui } from '../../i18n/messages';
import type { ProofPage } from '../../content/schema';
import { enquiry } from '../../content/journey/offers';
import assets from '../../content/home/assets.generated.json';
import { ButtonLink } from '../site/button-link';
import { Icon } from '../site/icon';
import { homeEntrance } from '../site/source-entrance';
import { initialEntranceAttributes } from '../site/entrance';
import { HeroVideo } from './hero-video';

export function HomeHero({ page }: { page: ProofPage }) {
  const locale = page.locale;
  return (
    <section
      className="home-hero"
      aria-labelledby="home-heading"
      style={{ backgroundImage: `url("${assets.roles.heroFrame}")` }}
    >
      <div
        className="home-hero-interior"
        style={{ backgroundImage: `url("${assets.roles.hero}")` }}
      >
        <HeroVideo poster={assets.roles.hero} />
        <div className="home-hero-content">
          <div className="hero-badge" {...initialEntranceAttributes(homeEntrance('dd15aa4'))}>
            <span>
              <Icon name="stars" />
              {copyText(locale, 'nextGen', 'NEXT-GEN')}
            </span>
            <p>{copyText(locale, 'heroBadge', 'IT & Creative Solutions')}</p>
          </div>
          <h1
            id="home-heading"
            className="gradient-text"
            {...initialEntranceAttributes(homeEntrance('016a266'))}
          >
            {page.content.heading}
          </h1>
          <div className="home-hero-actions">
            <ButtonLink href="#services" entrance={homeEntrance('60dfcd6')} initialEntrance>
              {copyText(locale, 'explore', 'Explore Our Services')}
            </ButtonLink>
            <ButtonLink
              href={locale === 'ar' ? '/ar/contacts/' : enquiry.href}
              outline
              entrance={homeEntrance('e77ee67')}
              initialEntrance
            >
              {ui(locale)('nav.enquiry')}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
