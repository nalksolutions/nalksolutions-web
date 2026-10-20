import type { ArticleContent } from '../../content/articles/schema';
import { ArticleImage } from './article-image';
import { ArticleLink, articleLinkTitle, type ArticleNavigation } from './article-link';
import { ui } from '../../i18n/messages';
import { localizedHref } from '../../content/localization/identity';

export function ArticleAdjacent({
  links,
  navigation,
}: {
  links: ArticleContent['presentation']['adjacent'];
  navigation: ArticleNavigation;
}) {
  const available = links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => localizedHref(navigation.pages, link.href, navigation.locale));
  if (!available.length) return null;
  return (
    <nav className="article-adjacent" aria-label={ui(navigation.locale)('article.adjacent')}>
      {available.map(({ link: source, index }) => {
        const title = articleLinkTitle(navigation, source.href, source.title);
        const link = {
          ...source,
          title,
          image: navigation.locale === 'ar' ? { ...source.image, alt: title } : source.image,
        };
        return (
          <ArticleLink
            navigation={navigation}
            key={link.href}
            href={link.href}
            className={index === 1 ? 'article-next' : undefined}
          >
            <ArticleImage image={link.image} />
            <span>
              <span className="article-adjacent-label">
                {navigation.locale === 'ar'
                  ? ui('ar')(index === 0 ? 'article.previous' : 'article.next')
                  : link.label}
              </span>
              <span className="article-adjacent-title">
                <strong>{link.title}</strong>
              </span>
            </span>
          </ArticleLink>
        );
      })}
    </nav>
  );
}
