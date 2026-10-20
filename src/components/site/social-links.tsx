import icons from '../../content/home/social.generated.json';

export function SocialLinks() {
  return (
    <div className="social-links">
      {icons.map((icon) => (
        <a key={icon.label} href={icon.href} aria-label={icon.label} tabIndex={0}>
          <svg viewBox={icon.viewBox} width="20" height="20" fill="currentColor" aria-hidden="true">
            {icon.paths.map((path, index) => (
              <path key={index} d={path} />
            ))}
          </svg>
        </a>
      ))}
    </div>
  );
}
