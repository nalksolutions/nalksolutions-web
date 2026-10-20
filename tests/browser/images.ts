import type { Page } from '@playwright/test';

/** Load rendered lazy images through scrolling without changing React-owned attributes. */
export async function decodePageImages(page: Page, selector: string) {
  await page.evaluate(async (selector) => {
    await document.fonts.ready;
    const position = { x: scrollX, y: scrollY };
    const containers = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => /auto|scroll/u.test(getComputedStyle(element).overflowX))
      .map((element) => ({ element, left: element.scrollLeft, top: element.scrollTop }));
    try {
      for (const image of document.querySelectorAll<HTMLImageElement>(selector)) {
        if (!image.getClientRects().length) continue;
        // Firefox can reject decode() before scrolling has started a lazy request.
        // Wait for an actual load; broken or stalled assets must still fail the check.
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => {
            clearTimeout(timeout);
            image.removeEventListener('load', loaded);
            image.removeEventListener('error', failed);
          };
          const loaded = () => {
            cleanup();
            resolve();
          };
          const failed = () => {
            cleanup();
            reject(new Error(`Image did not load: ${image.currentSrc || image.src}`));
          };
          const timeout = setTimeout(failed, 15_000);
          image.addEventListener('load', loaded);
          image.addEventListener('error', failed);
          image.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
          if (image.complete && image.naturalWidth > 0) loaded();
        });
        await image.decode();
      }
    } finally {
      for (const { element, left, top } of containers)
        element.scrollTo({ left, top, behavior: 'instant' });
      scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    }
  }, selector);
}
