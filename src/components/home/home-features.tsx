import { homeCopy, copyText, offerCopy } from '../../content/localization/copy';
import { localizedTarget } from '../../content/localization/identity';
import type { Locale } from '../../i18n/messages';
import { ArchiveImage } from '../site/archive-image';
import { ResolvedButtonLink } from '../site/resolved-button-link';
import { SectionHeading } from './section-heading';
import { homeEntrance, homeEntranceAttributes } from '../site/source-entrance';
import type { ProofPage } from '../../content/schema';
import { offers } from '../../content/journey/offers';

const sources = [
  ['9a70885', '4a6c2b1', '29cc8b3', '774cf6d'],
  ['ec1ff6b', 'a33cceb', 'a40251d', '9bffff3'],
  ['e13c424', '0c04181', 'c224fe5', 'ebbefc4'],
] as const;

export function HomeFeatures({
  pages,
  locale = 'en',
}: {
  pages: readonly ProofPage[];
  locale?: Locale;
}) {
  return (
    <section
      className="home-features"
      aria-label={copyText(locale, 'solutions', 'Solutions We Build')}
    >
      <SectionHeading
        label={copyText(locale, 'capabilities', 'Capabilities in practice')}
        title={copyText(locale, 'solutions', 'Solutions We Build')}
        large
        source={['d30a197', '3f0df25']}
      />
      <div className="home-feature-grid">
        {homeCopy(locale).features.map((feature, index) => (
          <article
            className={`home-feature home-glass-card home-feature-${index + 1}`}
            key={feature.title}
          >
            <div className="home-feature-copy">
              <p className="section-label" {...homeEntranceAttributes(sources[index]![0])}>
                {feature.label}
              </p>
              <h3 className="gradient-text" {...homeEntranceAttributes(sources[index]![1])}>
                {feature.title}
              </h3>
              <p {...homeEntranceAttributes(sources[index]![2])}>{feature.description}</p>
              <ResolvedButtonLink
                href={
                  localizedTarget(pages, offers[index === 0 ? 2 : 1]!.pageId, locale)?.path ?? null
                }
                outline
                entrance={homeEntrance(sources[index]![3])}
              >
                {offerCopy(offers[index === 0 ? 2 : 1]!, locale).action}
              </ResolvedButtonLink>
            </div>
            <ArchiveImage src={feature.image} alt="" className="home-feature-image" />
          </article>
        ))}
      </div>
    </section>
  );
}
