export type ButtonAppearance = 'coral' | 'orange' | 'reverse' | 'blue';

/** Shared by standalone links and non-interactive action labels inside linked cards. */
export function buttonClassName({
  outline = false,
  appearance,
  className,
}: {
  outline?: boolean;
  appearance?: ButtonAppearance | undefined;
  className?: string | undefined;
} = {}) {
  return [
    'site-button',
    outline && 'site-button-outline',
    appearance && `site-button-${appearance}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
