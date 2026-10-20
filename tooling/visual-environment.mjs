/** One explicit text-rendering policy shared by the source and production test browsers. */
export function chromiumCaptureArgs(mode = process.env.CHROMIUM_TEXT_CALIBRATION ?? 'default') {
  if (mode === 'default') return [];
  if (mode === 'grayscale') return ['--disable-lcd-text'];
  throw new Error('CHROMIUM_TEXT_CALIBRATION must be default or grayscale');
}
