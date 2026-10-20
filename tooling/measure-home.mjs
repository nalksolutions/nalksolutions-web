import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('tmp/chunk2-reference');
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const profiles = {
  desktop: { viewport: { width: 1440, height: 1000 } },
  tablet: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
const browser = await chromium.launch();
try {
  for (const [profile, options] of Object.entries(profiles).filter(
    ([name]) => !process.argv[2] || process.argv[2] === name,
  )) {
    const context = await browser.newContext({
      ...options,
      locale: 'en-US',
      timezoneId: 'Asia/Riyadh',
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
    });
    let html = await readFile(path.join(root, `${profile}.html`), 'utf8');
    if (process.env.REFERENCE_FONTS === 'local') {
      html = html.replace(
        '</head>',
        `<style>@font-face{font-family:Manrope;src:url(/fonts/manrope-latin.woff2);font-weight:200 800}@font-face{font-family:'Space Grotesk';src:url(/fonts/space-grotesk-latin.woff2);font-weight:300 700}</style></head>`,
      );
    }
    const denied = new Set();
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === 'https://nalksolutions.com' && url.pathname === '/') {
        return route.fulfill({ body: html, contentType: 'text/html; charset=utf-8' });
      }
      const key = url.origin + decodeURI(url.pathname);
      if (
        url.pathname === '/fonts/manrope-latin.woff2' ||
        url.pathname === '/fonts/space-grotesk-latin.woff2'
      ) {
        return route.fulfill({
          body: await readFile(path.join('public', url.pathname)),
          contentType: 'font/woff2',
        });
      }
      const asset = manifest.assets[key];
      if (asset)
        return route.fulfill({ body: await readFile(asset.file), contentType: asset.contentType });
      denied.add(route.request().url());
      return route.fulfill({ status: 404, body: '' });
    });
    const page = await context.newPage();
    await page.goto('https://nalksolutions.com/', { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('video').forEach((video) => {
        video.pause();
        video.preload = 'none';
      });
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      window.scrollTo(0, 0);
      await Promise.race([
        Promise.all(
          Array.from(document.images)
            .filter((image) => !image.complete)
            .map(
              (image) =>
                new Promise((resolve) => {
                  image.addEventListener('load', resolve, { once: true });
                  image.addEventListener('error', resolve, { once: true });
                }),
            ),
        ),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    });
    const measurements = await page.evaluate(() => {
      const measure = (element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          id: element.getAttribute('data-id'),
          type: element.getAttribute('data-widget_type'),
          tag: element.tagName,
          className: element.className,
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 300),
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
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
              'padding',
              'margin',
              'gap',
              'flex-direction',
              'align-items',
              'justify-content',
              'background-image',
              'background-color',
              'background-size',
              'background-position',
              'border-radius',
              'opacity',
              'visibility',
              'transform',
            ].map((name) => [name, style.getPropertyValue(name)]),
          ),
        };
      };
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.scrollHeight,
        heading: measure(document.querySelector('h1')),
        sections: [
          ...document.querySelectorAll('[data-elementor-id="55734"] > .elementor-element'),
        ].map(measure),
        elements: [
          ...document.querySelectorAll(
            '[data-elementor-id="55734"] .elementor-element, [data-elementor-id="77"] .elementor-element, [data-elementor-id="81"] .elementor-element',
          ),
        ].map(measure),
        texts: [...document.querySelectorAll('h1,h2,h3,p')].map(measure),
        cardDetail: [...document.querySelectorAll('[data-id="3a1cb45"] *')].map(measure),
        details: [
          ...document.querySelectorAll(
            '.elementor-widget-cmsmasters-featured-box__description, .elementor-widget-cmsmasters-featured-box__button, .elementor-widget-cmsmasters-toggles__title, [data-id="e900665"] span, .cmsmasters-testimonial__author-name',
          ),
        ]
          .filter((element) => element.getBoundingClientRect().height)
          .map(measure),
        controls: [...document.querySelectorAll('[data-elementor-id="55734"] a')]
          .slice(0, 30)
          .map(measure),
        heroLayers: [
          ...document.querySelectorAll(
            '[data-id="054c482"], [data-id="054c482"] .elementor-background-video-container',
          ),
        ].map((element) => ({
          ...measure(element),
          beforeProperties: Object.fromEntries(
            ['background-image', 'background-color', 'opacity', 'z-index'].map((name) => [
              name,
              getComputedStyle(element, '::before').getPropertyValue(name),
            ]),
          ),
        })),
        fontsLoaded: [...document.fonts].map((font) => ({
          family: font.family,
          status: font.status,
        })),
      };
    });
    const session = await context.newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root: document } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: document.nodeId,
      selector: 'h1',
    });
    measurements.headingPlatformFonts = await session.send('CSS.getPlatformFontsForNode', {
      nodeId,
    });
    measurements.deniedRequests = [...denied];
    measurements.browser = browser.version();
    await mkdir(path.join(root, 'measurements'), { recursive: true });
    await writeFile(
      path.join(root, 'measurements', `${profile}.json`),
      JSON.stringify(measurements, null, 2) + '\n',
    );
    await page.screenshot({
      path: path.join(root, `calibration-${profile}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    console.log(
      JSON.stringify({
        profile,
        height: measurements.height,
        heading: measurements.heading.box,
        platformFonts: measurements.headingPlatformFonts,
        denied: denied.size,
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
