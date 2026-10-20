import { homeEntranceAttributes } from '../site/source-entrance';
type SourceId = Parameters<typeof homeEntranceAttributes>[0];

export function SectionHeading({
  label,
  title,
  large = false,
  source,
}: {
  label: string;
  title: string;
  large?: boolean;
  source?: readonly [SourceId, SourceId];
}) {
  return (
    <div className={`home-section-heading${large ? ' home-section-heading-large' : ''}`}>
      <p className="section-label" {...(source ? homeEntranceAttributes(source[0]) : {})}>
        {label}
      </p>
      <h2 className="gradient-text" {...(source ? homeEntranceAttributes(source[1]) : {})}>
        {title}
      </h2>
    </div>
  );
}
