import icons from '../../content/articles/share.generated.json';
import { articleShareUrls } from '../../lib/seo/article-sharing';
import { ui, type Locale } from '../../i18n/messages';

export function ArticleSharing({
  url,
  title,
  locale = 'en',
}: {
  url: string;
  title: string;
  locale?: Locale;
}) {
  const t = ui(locale);
  const urls = articleShareUrls(url, title);
  const names: Record<string, string> = {
    facebook: 'Facebook',
    x: 'X',
    linkedin: 'LinkedIn',
    email: locale === 'ar' ? t('form.email') : 'email',
  };
  return (
    <nav className="article-sharing" aria-label={t('article.share')}>
      {icons.map((icon) => (
        <a
          key={icon.network}
          href={urls[icon.network]}
          aria-label={t('article.shareVia', { network: names[icon.network]! })}
          target={icon.network === 'email' ? undefined : '_blank'}
          rel={icon.network === 'email' ? undefined : 'noopener noreferrer'}
        >
          <svg viewBox={icon.viewBox} width="18" height="18" fill="currentColor" aria-hidden="true">
            {icon.paths.map((path, index) => (
              <path key={index} d={path} />
            ))}
          </svg>
        </a>
      ))}
    </nav>
  );
}
