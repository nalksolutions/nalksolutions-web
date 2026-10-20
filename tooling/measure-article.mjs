import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { captureViewports } from './capture-viewports.mjs';
import { chromiumCaptureArgs } from './visual-environment.mjs';
const root = 'tmp/chunk5-reference';
const codeFont = process.env.REFERENCE_CODE_FONT;
if (codeFont !== undefined && codeFont !== 'Consolas')
  throw new Error('Supported calibration font: Consolas');
const output = process.env.REFERENCE_OUTPUT_DIR ?? (codeFont ? `${root}/calibrated` : root);
if (!path.resolve(output).startsWith(path.resolve('tmp') + path.sep))
  throw new Error('Reference output must be inside the workspace tmp directory');
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile(root + '/manifest.json', 'utf8'));
const launchArgs = chromiumCaptureArgs();
if (launchArgs.length && !process.env.REFERENCE_OUTPUT_DIR)
  throw new Error('Calibrated text rendering requires a separate REFERENCE_OUTPUT_DIR');
const browser = await chromium.launch({ args: launchArgs });
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 },
  }).filter(([name]) => !process.argv[2] || process.argv[2] === name)) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      isMobile: name !== 'desktop',
      hasTouch: name !== 'desktop',
      locale: 'en-US',
      timezoneId: 'Asia/Riyadh',
      colorScheme: 'light',
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    const denied = new Set();
    await context.route('**/*', async (route) => {
      const u = new URL(route.request().url());
      if (u.pathname === '/how-to-build-an-api-from-scratch-a-step-by-step-guide/')
        return route.fulfill({
          body: (await readFile(root + '/' + name + '.html', 'utf8')).replace(
            '</head>',
            `<style>@font-face{font-family:Manrope;src:url(/fonts/manrope-latin.woff2);font-weight:200 800}@font-face{font-family:'Space Grotesk';src:url(/fonts/space-grotesk-latin.woff2);font-weight:300 700}${codeFont ? '[data-id="1b907200"] pre,[data-id="1b907200"] code{font-family:Consolas,monospace}' : ''}</style></head>`,
          ),
          contentType: 'text/html',
        });
      if (['/fonts/manrope-latin.woff2', '/fonts/space-grotesk-latin.woff2'].includes(u.pathname))
        return route.fulfill({
          body: await readFile('public' + u.pathname),
          contentType: 'font/woff2',
        });
      const asset = manifest.assets[u.origin + decodeURI(u.pathname)];
      if (asset)
        return route.fulfill({ body: await readFile(asset.file), contentType: asset.contentType });
      denied.add(u.href);
      return route.fulfill({ status: 404, body: '' });
    });
    const page = await context.newPage();
    await page.goto(
      'https://nalksolutions.com/how-to-build-an-api-from-scratch-a-step-by-step-guide/',
    );
    const failedImages = await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
      const failed = [];
      await Promise.all(
        [...document.images].map(async (image) => {
          try {
            await image.decode();
          } catch {
            failed.push(image.currentSrc || image.src);
          }
        }),
      );
      return failed;
    });
    const animationCount = await page.evaluate(async () => {
      const animations = document.getAnimations();
      for (const animation of animations) {
        const end = animation.effect?.getComputedTiming().endTime;
        if (typeof end === 'number' && Number.isFinite(end)) animation.finish();
        else animation.pause();
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return animations.length;
    });
    const data = await page.evaluate(() => {
      const measure = (e) => {
        const b = e.getBoundingClientRect(),
          s = getComputedStyle(e);
        return {
          id: e.getAttribute('data-id'),
          tag: e.tagName,
          cls: e.className,
          text: e.textContent?.trim().replace(/\s+/g, ' ').slice(0, 140),
          box: { x: b.x, y: b.y, w: b.width, h: b.height },
          style: Object.fromEntries(
            [
              'display',
              'position',
              'font-family',
              'font-size',
              'font-weight',
              'line-height',
              'letter-spacing',
              'color',
              'background-color',
              'background-image',
              'background-position',
              'background-size',
              'box-shadow',
              'text-decoration-line',
              'text-rendering',
              '-webkit-font-smoothing',
              'font-feature-settings',
              'font-kerning',
              'font-variation-settings',
              'filter',
              'opacity',
              'will-change',
              'isolation',
              'padding',
              'margin',
              'gap',
              'width',
              'height',
              'border-radius',
              'border',
              'object-fit',
              'flex-direction',
              'align-items',
              'justify-content',
              'overflow',
              'transform',
              'white-space',
              'overflow-wrap',
              'vertical-align',
            ].map((k) => [k, s.getPropertyValue(k)]),
          ),
        };
      };
      return {
        height: document.documentElement.scrollHeight,
        elements: [
          ...document.querySelectorAll(
            '[data-elementor-id="71"] .elementor-element,[data-elementor-id="107"] .elementor-element,[data-elementor-id="117"] .elementor-element',
          ),
        ].map(measure),
        details: [
          ...document.querySelectorAll(
            'h1,[data-id="4bdeabfb"] p,[data-id="46571a65"] a,[data-id="46571a65"] span,[data-id="5733abb0"] span,[data-id="66af6fea"] a,[data-id="66af6fea"] img,[data-id="1fcd562b"] h4,[data-id="1fcd562b"] img,[data-elementor-id="117"] img',
          ),
        ].map(measure),
        body: [...document.querySelectorAll('[data-id="1b907200"] .entry-content *')].map(measure),
        header: [...document.querySelectorAll('[data-elementor-id="71"] a')].map(measure),
        footer: [...document.querySelectorAll('[data-elementor-id="117"] a')].map(measure),
        fonts: [...document.fonts].map((f) => ({ family: f.family, status: f.status })),
      };
    });
    data.denied = [...denied];
    data.failedImages = failedImages;
    data.browser = browser.version();
    data.browserLaunchArgs = launchArgs;
    data.codeFontCalibration = codeFont ?? null;
    data.animationCapturePolicy = {
      finite: 'finish before measurement',
      infinite: 'pause',
      count: animationCount,
    };
    data.sourceHtmlSha256 = createHash('sha256')
      .update(await readFile(`${root}/${name}.html`))
      .digest('hex');
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const platformFonts = async () => {
      const { root: document } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: document.nodeId,
        selector: '[data-id="1b907200"] pre code',
      });
      return cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    };
    data.codePlatformFontsBefore = await platformFonts();
    data.textPlatformFonts = {};
    for (const [name, selector] of Object.entries({
      heading: '[data-id="6991331c"] h1',
      paragraph: '[data-id="1b907200"] .entry-content p',
      language:
        '[data-id="728f6108"] .elementor-widget-cmsmasters-nav-menu__main a[href*="%d8%b4%d8%b1" i] .elementor-widget-cmsmasters-nav-menu__item-text',
    })) {
      const { root: document } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: document.nodeId, selector });
      if (nodeId)
        data.textPlatformFonts[name] = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    }
    // Decode alone did not paint two offscreen diagrams in the Chunk 7 desktop reference.
    // Visit every ordinary viewport before asking the browser for a full-page surface.
    data.viewportSequence = await captureViewports(page, `${output}/${name}-viewports`, launchArgs);
    data.fullPageCapturePreparation = 'ordinary viewport sweep before full-page capture';
    await page.screenshot({ path: output + '/' + name + '-top.png', animations: 'disabled' });
    await page.screenshot({
      path: output + '/' + name + '.png',
      fullPage: true,
      animations: 'disabled',
    });
    data.codePlatformFontsAfter = await platformFonts();
    data.heightAfterCapture = await page.evaluate(() => document.documentElement.scrollHeight);
    data.viewportRegions = {};
    for (const [region, selector] of Object.entries({
      heading: '[data-id="6991331c"]',
      paragraph: '[data-id="1b907200"] .entry-content p',
      footer: '[data-id="b5558fb"]',
    })) {
      const element = page.locator(selector).first();
      await element.screenshot({
        path: `${output}/${name}-${region}-viewport.png`,
        animations: 'disabled',
      });
      data.viewportRegions[region] = await element.evaluate((element) => {
        const styles = [];
        for (let current = element; current; current = current.parentElement) {
          const s = getComputedStyle(current);
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
              ].map((key) => [key, s.getPropertyValue(key)]),
            ),
          });
        }
        return styles;
      });
    }
    await writeFile(output + '/' + name + '.json', JSON.stringify(data, null, 2));
    if (
      codeFont &&
      (data.height !== data.heightAfterCapture ||
        JSON.stringify(data.codePlatformFontsBefore) !==
          JSON.stringify(data.codePlatformFontsAfter))
    )
      throw new Error(`Unstable ${name} reference capture`);
    console.log(name, data.height, denied.size);
    await context.close();
  }
} finally {
  await browser.close();
}
