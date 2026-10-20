import { expect, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { captureViewports } from '../../tooling/capture-viewports.mjs';

async function articleLayout(page: Page) {
  return page.evaluate(() => {
    const box = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
    };
    const selectors = [
      '.site-header',
      '.article-heading h1',
      '.article-featured img',
      '[data-article-body]',
      '.article-adjacent',
      '.article-related',
      '.article-related-track',
      '.site-footer',
    ];
    const landmarks = Object.fromEntries(
      selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing article landmark ${selector}`);
        return [selector, box(element)];
      }),
    );
    return {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      landmarks,
      body: [...document.querySelectorAll('[data-article-body] *:not(picture):not(source)')].map(
        (element) => {
          const style = getComputedStyle(element);
          return {
            tag: element.tagName,
            box: box(element),
            font: style.fontFamily,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
          };
        },
      ),
    };
  });
}

/** Screenshots must observe the page without changing the geometry being compared. */
export async function captureArticleEvidence(page: Page, info: TestInfo) {
  if (['chromium-desktop', 'chromium-tablet', 'chromium-mobile'].includes(info.project.name))
    await captureViewports(
      page,
      info.outputPath('article-viewports'),
      info.project.use.launchOptions?.args ?? [],
    );
  const before = await articleLayout(page);
  await page.screenshot({ path: info.outputPath('article-top.png') });
  await page.screenshot({ path: info.outputPath('article.png'), fullPage: true });
  const after = await articleLayout(page);
  const browser = {
    name: info.project.use.browserName,
    version: page.context().browser()?.version(),
    launchArgs: info.project.use.launchOptions?.args ?? [],
  };
  await writeFile(
    info.outputPath('article-geometry.json'),
    JSON.stringify(before.landmarks, null, 2) + '\n',
  );
  await writeFile(
    info.outputPath('article-layout.json'),
    JSON.stringify(
      { browser, before, after, stable: JSON.stringify(before) === JSON.stringify(after) },
      null,
      2,
    ) + '\n',
  );
  expect(
    after,
    'Full-page capture must not change document, landmark or body-element geometry',
  ).toEqual(before);
  await page.locator('.site-footer').screenshot({ path: info.outputPath('article-footer.png') });
  const rendering: Record<string, unknown> = {};
  for (const [region, selector] of Object.entries({
    heading: '.article-heading h1',
    paragraph: '[data-article-body] p',
    footer: '.site-footer',
  })) {
    const element = page.locator(selector).first();
    await element.screenshot({ path: info.outputPath(`article-${region}-viewport.png`) });
    rendering[region] = await element.evaluate((element) => {
      const styles = [];
      for (let current: Element | null = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        styles.push({
          tag: current.tagName,
          class: current.className,
          style: Object.fromEntries(
            [
              'background-color',
              'background-image',
              'transform',
              'filter',
              'opacity',
              'will-change',
              'isolation',
              'text-rendering',
              '-webkit-font-smoothing',
              'font-family',
              'font-size',
              'font-weight',
              'line-height',
            ].map((key) => [key, style.getPropertyValue(key)]),
          ),
        });
      }
      return styles;
    });
  }
  await writeFile(
    info.outputPath('article-rendering.json'),
    JSON.stringify(rendering, null, 2) + '\n',
  );
  if (info.project.name.startsWith('chromium-')) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const fonts: Record<string, unknown> = {};
    for (const [name, selector] of Object.entries({
      heading: '.article-heading h1',
      paragraph: '[data-article-body] p',
      language: '.desktop-nav [lang="ar"]',
    })) {
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
      fonts[name] = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    }
    await writeFile(
      info.outputPath('article-platform-fonts.json'),
      JSON.stringify(fonts, null, 2) + '\n',
    );
    await cdp.detach();
  }
}
