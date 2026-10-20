import Link from 'next/link';
import { topics, otherTopics } from '../../content/journey/offers';
import { ContentSearch, type SearchPage } from '../content/content-search';
import { blogIntroduction } from '../../content/journey/pages';
import { TopicPicker } from './topic-picker';
import { ui } from '../../i18n/messages';
import { localizedHref } from '../../content/localization/identity';
import { journeyArabic as ar } from '../../content/localization/copy';

export function BlogTopics({
  pages,
  locale,
}: {
  pages: readonly SearchPage[];
  locale: 'en' | 'ar';
}) {
  const t = ui(locale);
  const keys = ['websites', 'software', 'automation', 'marketing'] as const;
  const all = [
    ...topics.map((topic, index) => ({ ...topic, label: t(`topics.${keys[index]!}`) })),
    ...otherTopics.map((topic, index) => ({
      ...topic,
      label: locale === 'ar' ? ar.otherTopics[index]! : topic.label,
    })),
  ].flatMap((topic) => {
    const href = localizedHref(pages, topic.href, locale);
    return href ? [{ ...topic, href }] : [];
  });
  return (
    <section className="journey-topics" aria-label={t('topics.region')}>
      <p>{locale === 'ar' ? ar.blogIntroduction : blogIntroduction}</p>
      <ContentSearch pages={pages} locale={locale} appearance="listing" />
      <nav aria-label={t('topics.featured')}>
        {all.slice(0, 4).map((topic) => (
          <Link key={topic.href} href={topic.href} prefetch={false}>
            {topic.label}
          </Link>
        ))}
      </nav>
      <TopicPicker items={all} locale={locale} />
    </section>
  );
}
