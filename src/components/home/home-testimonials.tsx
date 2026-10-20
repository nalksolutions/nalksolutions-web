import { copyText, homeCopy } from '../../content/localization/copy';
import type { Locale } from '../../i18n/messages';
import content from '../../content/home/home.generated.json';
import assets from '../../content/home/assets.generated.json';
import { SectionHeading } from './section-heading';
import { Icon } from '../site/icon';
import { TestimonialVideo } from './testimonial-video';
import { homeEntranceAttributes } from '../site/source-entrance';

export function HomeTestimonials({ locale = 'en' }: { locale?: Locale }) {
  const [featured, ...reviews] = homeCopy(locale).reviews;
  if (!featured) throw new Error('Missing source testimonial');
  return (
    <section
      className="home-testimonials home-section home-inner-section"
      style={{ backgroundImage: `url("${assets.roles.testimonials}")` }}
    >
      <SectionHeading
        label={copyText(locale, 'testimonials', 'Testimonials')}
        title={copyText(locale, 'trusted', 'Trusted by Brands Worldwide')}
        source={['a94b869', 'ddd6a5d']}
      />
      <div className="home-featured-review" {...homeEntranceAttributes('f4cf0dd')}>
        <TestimonialVideo
          locale={locale}
          poster={assets.roles.videoPoster}
          embedUrl={content.testimonialVideo.embedUrl}
          watchUrl={content.testimonialVideo.watchUrl}
        />
        <figure className="home-glass-card" {...homeEntranceAttributes('e925188')}>
          <blockquote>
            <p>{featured.quote}</p>
          </blockquote>
          <figcaption>
            <span>{featured.author}</span>
          </figcaption>
        </figure>
      </div>
      <div className="home-review-grid">
        {reviews.map((review, index) => (
          <div
            className="home-review-card"
            key={review.sourceId}
            {...homeEntranceAttributes((['732b350', 'bb8093f', '75bb01d'] as const)[index]!)}
          >
            <figure
              className="home-glass-card"
              {...homeEntranceAttributes((['187bcc8', '089b3bd', '1c6e845'] as const)[index]!)}
            >
              <div
                className="home-review-stars"
                aria-label={locale === 'ar' ? '\u0035 \u0645\u0646 \u0035' : '5 out of 5'}
              >
                {[0, 1, 2, 3, 4].map((star) => (
                  <Icon key={star} name="star" />
                ))}
              </div>
              <blockquote>
                <p>{review.quote}</p>
              </blockquote>
              <figcaption>
                <span>{review.author}</span>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </section>
  );
}
