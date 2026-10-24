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
    // Proxy's build entry is named "proxy", without a leading slash. "/*"
    // covers page routes but misses that separately packaged function.
    '*': [
      './src/content/site/**/*.json',
      './src/content/articles/api.generated.json',
      './src/content/localization/**/*.json',
      // Arabic revision checks hash the authored English input bytes at runtime.
      './src/content/journey/pages.ts',
      './src/i18n/messages/*.json',
    ],
  },
  outputFileTracingExcludes: {
    '*': [
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
