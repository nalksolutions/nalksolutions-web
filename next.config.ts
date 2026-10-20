import type { NextConfig } from 'next';
import { assertFixtureEnvironment } from './src/lib/env/config';
import createNextIntlPlugin from 'next-intl/plugin';

assertFixtureEnvironment();

const config: NextConfig = {
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
  skipProxyUrlNormalize: true,
  htmlLimitedBots: /.*/,
  outputFileTracingIncludes: {
    '/*': [
      './src/content/site/**/*.json',
      './src/content/localization/**/*.json',
      './src/i18n/messages/*.json',
    ],
  },
  outputFileTracingExcludes: {
    '/*': [
      './nalksolutions.com_wordpress_backup/**',
      './nalk-public-archive/**',
      './migration-review/**',
      './tmp/**',
      './.venv/**',
      './docs/**',
      './tests/**',
      './tooling/**',
    ],
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(config);
