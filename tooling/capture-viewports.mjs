import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Capture ordinary viewports without resizing, cropping, masking or stitching.
 * @param {import('@playwright/test').Page} page
 * @param {string} directory
 * @param {string[]} [launchArgs]
 */
export async function captureViewports(page, directory, launchArgs = []) {
  if (!path.resolve(directory).startsWith(path.resolve('tmp') + path.sep))
    throw new Error('Viewport evidence must stay inside the workspace tmp directory');
  await mkdir(directory, { recursive: true });
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('A fixed viewport is required');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const frames = [];
  for (let requested = 0; requested < height; requested += viewport.height) {
    const scrollY = Math.min(requested, Math.max(0, height - viewport.height));
    await page.evaluate(async (top) => {
      scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, scrollY);
    const measured = await page.evaluate(() => ({
      scrollY,
      height: document.documentElement.scrollHeight,
      width: innerWidth,
    }));
    if (
      measured.scrollY !== scrollY ||
      measured.height !== height ||
      measured.width !== viewport.width
    )
      throw new Error(
        'Viewport capture changed layout or failed to reach the recorded scroll position',
      );
    const file = `${String(frames.length).padStart(3, '0')}.png`;
    const bytes = await page.screenshot({
      path: path.join(directory, file),
      fullPage: false,
      animations: 'disabled',
    });
    const after = await page.evaluate(() => ({
      scrollY,
      height: document.documentElement.scrollHeight,
      width: innerWidth,
    }));
    if (JSON.stringify(after) !== JSON.stringify(measured))
      throw new Error('Ordinary screenshot changed viewport geometry');
    frames.push({ file, scrollY, sha256: createHash('sha256').update(bytes).digest('hex') });
    if (scrollY + viewport.height >= height) break;
  }
  const result = {
    browser: page.context().browser()?.version(),
    launchArgs,
    viewport,
    height,
    frames,
  };
  await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(result, null, 2) + '\n');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  return result;
}
