import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { captureViewports } from './capture-viewports.mjs';

const output = process.argv[2];
if (!output || !path.resolve(output).startsWith(path.resolve('tmp') + path.sep))
  throw new Error('Provide a fresh output directory inside tmp');
await mkdir(output, { recursive: false });
const reference = JSON.parse(
  await readFile('tmp/visual-alignment/reference/manifest.json', 'utf8'),
);
const selected = process.argv[3]?.split(',');
const pages = reference.pages.filter((page) => !selected || selected.includes(page.id));
if (selected && pages.length !== selected.length) throw new Error('Unknown visual page selection');
const baseURL = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:3000';
if (!/^http:\/\/127\.0\.0\.1:\d+$/u.test(baseURL)) throw new Error('Local visual target required');
const browser = await chromium.launch();
const report = {
  baselineId: reference.baselineId,
  startedAt: new Date().toISOString(),
  baseURL,
  browser: browser.version(),
  capturePreparation: 'ordinary-viewport-captures-v2',
  currentEnhancementReadiness: 'service-tabs-related-strip-v2',
  environment: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezone: 'Asia/Riyadh',
    reducedMotion: 'reduce',
    colorScheme: 'light',
    fonts: Object.fromEntries(
      await Promise.all(
        ['manrope-latin.woff2', 'space-grotesk-latin.woff2'].map(async (name) => [
          name,
          createHash('sha256')
            .update(await readFile(`public/fonts/${name}`))
            .digest('hex'),
        ]),
      ),
    ),
  },
  selected: pages.map((page) => page.id),
  cases: [],
  captureFailures: [],
};
const hash = (data) => createHash('sha256').update(data).digest('hex');
const cachedManifest = process.env.VISUAL_REFERENCE_MANIFEST;
let cachedReference;
if (cachedManifest) {
  if (!path.resolve(cachedManifest).startsWith(path.resolve('tmp') + path.sep))
    throw new Error('Reference capture must be inside tmp');
  const bytes = await readFile(cachedManifest);
  cachedReference = JSON.parse(bytes);
  if (
    cachedReference.baselineId !== reference.baselineId ||
    cachedReference.browser !== report.browser
  )
    throw new Error('Reference capture environment differs');
  report.referenceCapture = {
    manifest: cachedManifest,
    sha256: hash(bytes),
    capturedAt: cachedReference.startedAt,
  };
}
try {
  for (const source of pages) {
    for (const [profile, viewport] of Object.entries({
      desktop: { width: 1440, height: 1000 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 390, height: 844 },
    })) {
      const item = {
        id: source.id,
        path: source.path,
        family: source.family,
        profile,
        historicalScreenshot: source.profiles[profile].historicalScreenshot,
        sourceHtmlSha256: source.profiles[profile].sourceSha256,
      };
      for (const kind of ['reference', 'current']) {
        if (kind === 'reference' && cachedReference) {
          const cached = cachedReference.cases.find(
            (row) => row.id === source.id && row.profile === profile,
          );
          if (
            !cached ||
            cached.sourceHtmlSha256 !== item.sourceHtmlSha256 ||
            cached.reference.metrics.viewport !== viewport.width ||
            hash(await readFile(cached.reference.screenshot)) !== cached.reference.sha256
          )
            throw new Error(`Invalid frozen reference capture: ${source.id} ${profile}`);
          if (
            cached.reference.status === 200 &&
            !cached.reference.errors.length &&
            !cached.reference.failedImages.length &&
            cachedReference.capturePreparation === report.capturePreparation
          ) {
            item.reference = cached.reference;
            continue;
          }
          report.recapturedReferences ??= [];
          report.recapturedReferences.push({
            id: source.id,
            profile,
            reason:
              'Cached reference failed resource checks or used a different paint preparation; capture again from recovered assets',
          });
        }
        const context = await browser.newContext({
          viewport,
          deviceScaleFactor: 1,
          isMobile: profile !== 'desktop',
          hasTouch: profile !== 'desktop',
          locale: 'en-US',
          timezoneId: 'Asia/Riyadh',
          reducedMotion: 'reduce',
          colorScheme: 'light',
          serviceWorkers: 'block',
        });
        const denied = new Set();
        if (kind === 'reference')
          await context.route('**/*', async (route) => {
            const url = new URL(route.request().url());
            if (
              url.origin === 'https://nalksolutions.com' &&
              decodeURI(url.pathname) === decodeURI(source.path)
            ) {
              const html = await readFile(source.profiles[profile].html, 'utf8');
              return route.fulfill({
                body: html.replace(
                  '</head>',
                  '<style>@font-face{font-family:Manrope;src:url(/fonts/manrope-latin.woff2);font-weight:200 800}@font-face{font-family:"Space Grotesk";src:url(/fonts/space-grotesk-latin.woff2);font-weight:300 700}</style></head>',
                ),
                contentType: 'text/html',
              });
            }
            if (
              ['/fonts/manrope-latin.woff2', '/fonts/space-grotesk-latin.woff2'].includes(
                url.pathname,
              )
            )
              return route.fulfill({
                body: await readFile('public' + url.pathname),
                contentType: 'font/woff2',
              });
            const asset =
              reference.assets[url.origin + decodeURI(url.pathname)] ??
              reference.assets[url.origin + url.pathname];
            if (asset)
              return route.fulfill({
                body: await readFile(asset.file),
                contentType: asset.contentType,
              });
            denied.add(url.href);
            return route.fulfill({ status: 404, body: '' });
          });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        if (kind === 'current') {
          page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
          });
          page.on('requestfailed', (request) =>
            errors.push(`${request.url()}: ${request.failure()?.errorText}`),
          );
          page.on('response', (response) => {
            if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
          });
        }
        const response = await page.goto(
          `${kind === 'reference' ? 'https://nalksolutions.com' : baseURL}${encodeURI(decodeURI(source.path))}`,
          { waitUntil: 'load' },
        );
        if (kind === 'current')
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll('.content-service-tabs')].every(
                (element) => element.getAttribute('data-enhanced') === 'true',
              ),
            undefined,
            { timeout: 15000 },
          );
        const failures = await page.evaluate(async () => {
          await document.fonts.ready;
          const failures = [];
          for (const image of document.images) {
            if (getComputedStyle(image).display === 'none' || !image.getClientRects().length)
              continue;
            image.loading = 'eager';
            try {
              await image.decode();
            } catch {
              failures.push(image.currentSrc || image.src);
            }
          }
          return failures;
        });
        if (kind === 'current')
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll('.article-related-track')].every((element) => {
                if (element.getAttribute('data-enhanced') !== 'true') return false;
                const bounds = element.getBoundingClientRect();
                const visible = [...element.children].filter((child) => {
                  const box = child.getBoundingClientRect();
                  return box.right > bounds.left + 1 && box.left < bounds.right - 1;
                });
                return (
                  visible.length > 0 &&
                  Math.abs(
                    bounds.height - Math.max(...visible.map((child) => child.offsetHeight)),
                  ) <= 1
                );
              }),
            undefined,
            { timeout: 15000 },
          );
        // Actual viewport screenshots force image rasterization; scrolling/decoding alone did not.
        const viewportDirectory = `${output}/viewports/${source.id}/${profile}/${kind}`;
        const viewportSequence = await captureViewports(page, viewportDirectory);
        await page.screenshot({
          path: `${output}/${source.id}-${profile}-${kind}-top.png`,
          animations: 'disabled',
        });
        const metrics = await page.evaluate((kind) => {
          const measure = (element) => {
            if (!element) return null;
            const box = element.getBoundingClientRect(),
              style = getComputedStyle(element);
            return {
              text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
              box: { x: box.x, y: box.y, width: box.width, height: box.height },
              style: Object.fromEntries(
                [
                  'fontFamily',
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'letterSpacing',
                  'padding',
                  'margin',
                  'gap',
                  'display',
                  'gridTemplateColumns',
                ].map((key) => [key, style[key]]),
              ),
            };
          };
          const visible = (element) => element.getBoundingClientRect().height > 0;
          const header =
            kind === 'current'
              ? document.querySelector('.site-header')
              : document.querySelector(
                  '[data-elementor-type="header"],[data-elementor-type="cmsmasters_header"]',
                );
          const footer =
            kind === 'current'
              ? document.querySelector('.site-footer')
              : document.querySelector(
                  '[data-elementor-type="footer"],[data-elementor-type="cmsmasters_footer"]',
                );
          return {
            height: document.documentElement.scrollHeight,
            width: document.documentElement.scrollWidth,
            viewport: innerWidth,
            header: measure(header),
            footer: measure(footer),
            footerChildren: [...(footer?.children ?? [])].map(measure),
            elements: [
              ...document.querySelectorAll(
                kind === 'reference'
                  ? '[data-id], main p'
                  : 'main [class^="content-"], .site-header a, .site-header button, .site-footer a',
              ),
            ]
              .filter(visible)
              .map((element) => ({
                id: element.getAttribute('data-id'),
                className: element.className,
                ...measure(element),
              })),
            headings: [
              ...document.querySelectorAll(
                'main h1,main h2,main h3,main h4,main h5,main h6,[data-elementor-type="cmsmasters_singular"] h1,[data-elementor-type="cmsmasters_archive"] h1',
              ),
            ]
              .filter(visible)
              .map(measure),
            images: [...document.images]
              .filter(visible)
              .map((image) => ({ src: image.currentSrc, box: measure(image)?.box })),
          };
        }, kind);
        const screenshot = `${output}/${source.id}-${profile}-${kind}.png`;
        await page.screenshot({
          path: screenshot,
          fullPage: true,
          animations: 'disabled',
          timeout: 60000,
        });
        item[kind] = {
          status: response.status(),
          screenshot,
          sha256: hash(await readFile(screenshot)),
          metrics,
          viewportSequence: { directory: viewportDirectory, ...viewportSequence },
          failedImages: failures,
          denied: [...denied],
          errors,
        };
        if (kind === 'current')
          item[kind].enhancements = {
            serviceTabs: await page.locator('.content-service-tabs').count(),
            ready: true,
          };
        await context.close();
      }
      report.cases.push(item);
      for (const kind of ['reference', 'current']) {
        const result = item[kind];
        if (
          result.status !== 200 ||
          result.failedImages.length ||
          result.errors.length ||
          result.metrics.width > result.metrics.viewport
        )
          report.captureFailures.push({
            id: item.id,
            profile,
            kind,
            status: result.status,
            failedImages: result.failedImages,
            errors: result.errors,
            overflow: result.metrics.width - result.metrics.viewport,
          });
      }
      await writeFile(`${output}/manifest.json`, JSON.stringify(report, null, 2) + '\n');
      console.log(
        `${source.id} ${profile}: source ${item.reference.metrics.height}, current ${item.current.metrics.height}, delta ${item.current.metrics.height - item.reference.metrics.height}`,
      );
    }
  }
} catch (error) {
  report.failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.captureStatus =
    report.failure || report.captureFailures.length || report.cases.length !== pages.length * 3
      ? 'failed'
      : 'passed';
  if (report.captureFailures.length) process.exitCode = 1;
  await writeFile(`${output}/manifest.json`, JSON.stringify(report, null, 2) + '\n');
}
