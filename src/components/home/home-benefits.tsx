import { copyText, homeCopy } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';
import assets from '../../content/home/assets.generated.json';
import { Icon } from '../site/icon';
import { SectionHeading } from './section-heading';
import { homeEntranceAttributes } from '../site/source-entrance';

const icons = ['solution1', 'solution2', 'solution3', 'solution4'] as const;

export function HomeBenefits({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section className="home-benefits home-section home-inner-section">
      <SectionHeading
        label={copyText(locale, 'why', 'Why Choose Us')}
        title={copyText(locale, 'whyTitle', 'Why Saudi Businesses Choose Nalk Solutions')}
        source={['160a5ce', '170162d']}
      />
      <div className="home-benefit-layout">
        <div
          className="home-benefit-photo"
          role="img"
          aria-label={copyText(locale, 'creative', 'Creative work at Nalk Solutions')}
          style={{ backgroundImage: `url("${assets.roles.benefits}")` }}
          {...homeEntranceAttributes('4b58cc0')}
        />
        <div className="home-benefit-grid">
          {homeCopy(locale).benefits.map((benefit, index) => (
            <article
              key={benefit.sourceId}
              className="home-benefit-card home-glass-card"
              {...homeEntranceAttributes(
                (['98137d3', '6e275fe', '68dd82f', '07768d8'] as const)[index]!,
              )}
            >
              <div
                className="home-benefit-content"
                {...homeEntranceAttributes(
                  (['03265fb', '7d9c842', 'adcbc57', '28d1c70'] as const)[index]!,
                )}
              >
                <Icon name={icons[index] ?? 'shape1'} />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
