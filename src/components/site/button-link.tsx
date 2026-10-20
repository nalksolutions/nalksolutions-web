import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icon';
import type { Entrance } from '../../content/motion/schema';
import { entranceAttributes, initialEntranceAttributes } from './entrance';
import { buttonClassName, type ButtonAppearance } from './button-styles';

export function ButtonLink({
  href,
  children,
  outline = false,
  documentNavigation = false,
  entrance,
  initialEntrance = false,
  appearance,
  className,
  icon,
}: {
  href: string;
  children: ReactNode;
  outline?: boolean;
  documentNavigation?: boolean;
  entrance?: Entrance;
  initialEntrance?: boolean;
  appearance?: ButtonAppearance;
  className?: string;
  icon?: ReactNode;
}) {
  const classes = buttonClassName({ outline, appearance, className });
  const motion =
    entrance && initialEntrance
      ? initialEntranceAttributes(entrance)
      : entranceAttributes(entrance);
  const content = (
    <>
      {icon === undefined ? (
        <Icon name="arrow" />
      ) : icon ? (
        <span className="site-button-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </>
  );
  if (documentNavigation)
    return (
      <a href={href} className={classes} tabIndex={0} {...motion}>
        {content}
      </a>
    );
  return (
    <Link href={href} prefetch={false} tabIndex={0} className={classes} {...motion}>
      {content}
    </Link>
  );
}
