import type { ArticleContent } from '../../content/articles/schema';
import { Icon } from '../site/icon';
import { ArticleImage } from './article-image';
import { RelatedPostStrip } from './related-post-strip';
import { ArticleLink, articleLinkTitle, type ArticleNavigation } from './article-link';
import { ui } from '../../i18n/messages';
import { localizedHref } from '../../content/localization/identity';
import { arabicDateLabel } from '../../content/localization/format';

export function ArticleRelated({
  posts,
  navigation,
}: {
  posts: ArticleContent['presentation']['related'];
  navigation: ArticleNavigation;
}) {
  const available = posts.filter((post) =>
    localizedHref(navigation.pages, post.href, navigation.locale),
  );
  if (!available.length) return null;
  return (
    <section className="article-related" aria-labelledby="related-title">
      <h2 id="related-title">{ui(navigation.locale)('article.related')}</h2>
      <RelatedPostStrip>
        {available.map((source) => {
          const title = articleLinkTitle(navigation, source.href, source.title);
          const post = {
            ...source,
            title,
            image: navigation.locale === 'ar' ? { ...source.image, alt: title } : source.image,
          };
          return (
            <article className="article-card" key={post.href}>
              <ArticleLink
                navigation={navigation}
                href={post.href}
                aria-label={post.title}
                className="article-card-image"
              >
                <ArticleImage image={post.image} />
              </ArticleLink>
              <div className="article-card-content">
                <div className="article-card-meta">
                  <div className="article-card-category">
                    <ArticleLink
                      navigation={navigation}
                      className="article-category"
                      href={post.category.href}
                    >
                      {post.category.label}
                    </ArticleLink>
                  </div>
                  <span>
                    {navigation.locale === 'ar' ? arabicDateLabel(post.dateLabel) : post.dateLabel}
                  </span>
                </div>
                <h3>
                  <ArticleLink navigation={navigation} href={post.href}>
                    {post.title}
                  </ArticleLink>
                </h3>
                <ArticleLink
                  navigation={navigation}
                  href={post.href}
                  className="site-button site-button-outline"
                  tabIndex={0}
                >
                  <Icon name="arrow" />
                  {navigation.locale === 'ar' ? ui('ar')('article.read') : post.actionLabel}
                </ArticleLink>
              </div>
            </article>
          );
        })}
      </RelatedPostStrip>
    </section>
  );
}
