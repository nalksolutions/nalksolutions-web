import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { chromiumCaptureArgs } from './tooling/visual-environment.mjs';

const runDirectory = process.env.CHUNK_RUN_DIR;
if (!runDirectory) throw new Error('Use npm run test:integration or npm run test:e2e.');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  outputDir: path.join(runDirectory, 'test-results'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(runDirectory, 'results.json') }],
    ['html', { outputFolder: path.join(runDirectory, 'html'), open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${process.env.TEST_PORT ?? '3100'}`,
    locale: 'en-US',
    timezoneId: 'Asia/Riyadh',
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'http', testMatch: 'http/**/*.spec.ts' },
    ...[
      {
        name: 'chromium-desktop',
        browserName: 'chromium' as const,
        viewport: { width: 1440, height: 1000 },
      },
      {
        name: 'chromium-tablet',
        browserName: 'chromium' as const,
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'chromium-mobile',
        browserName: 'chromium' as const,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'chromium-narrow',
        browserName: 'chromium' as const,
        viewport: { width: 320, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      {
        name: 'firefox-desktop',
        browserName: 'firefox' as const,
        viewport: { width: 1440, height: 1000 },
      },
      {
        name: 'webkit-desktop',
        browserName: 'webkit' as const,
        viewport: { width: 1440, height: 1000 },
      },
    ].map(({ name, ...use }) => ({
      name,
      testMatch: 'browser/**/*.spec.ts',
      ...(!name.startsWith('chromium-') || name === 'chromium-narrow'
        ? { grepInvert: /@coverage/u }
        : {}),
      use: {
        ...use,
        ...(use.browserName === 'chromium'
          ? { launchOptions: { args: chromiumCaptureArgs() } }
          : {}),
      },
    })),
  ],
});
