import type { ComponentProps } from 'react';
import { ButtonLink } from './button-link';

/** Omit unavailable destinations rather than presenting disabled translation controls. */
export function ResolvedButtonLink({
  href,
  children,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, 'href'> & { href: string | null }) {
  return href ? (
    <ButtonLink href={href} {...props}>
      {children}
    </ButtonLink>
  ) : null;
}
