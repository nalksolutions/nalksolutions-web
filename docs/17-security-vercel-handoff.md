# Security baseline and Vercel repository handoff

Checked October 24, 2026. This is a source handoff, not deployment or public-launch acceptance.

## Security baseline

- Active local Node: 24.22.1. This is the October 21 security release covering the
  Brotli, TLS, DNS, HTTP, crypto and permission fixes listed in the
  [official release](https://nodejs.org/en/blog/release/v24.22.1).
- `.node-version` pins 24.22.1; package engines require `>=24.22.1 <25`.
  `npm run build` refuses an older runtime before compilation.
- Next.js and eslint-config-next updated together from 16.4.1 to 16.4.3, with exact
  versions and an npm lockfile. The prior 16.4.1 already included the
  [October 14 fixes](https://nextjs.org/blog/nextjs-security-update-october-14-2026).
- npm audit reports zero known vulnerabilities in the resolved dependency tree.
- The lockfile had zero malicious-version matches against the 446-package
  [Wiz incident list](https://github.com/wiz-sec-public/wiz-research-iocs/blob/main/reports/keyv-packages.csv).
  This is a bounded advisory check, not a workstation forensic investigation or a guarantee
  that no undisclosed vulnerability exists. Installation used `--ignore-scripts`.

## Repository and Vercel inputs

Remote: `https://github.com/nalksolutions/nalksolutions-web.git`; branch: `main`.
Import the repository with the project root as the root directory and Next.js as the framework.
Use `npm ci` to install and `npm run build` to build; leave the output-directory setting at
the framework default. Choose Node 24.x in Vercel. Vercel manages the patch version.
Both npm 10 and npm 11 are supported. The local package-manager baseline remains 10.8.2;
Vercel's npm 11.19.1 is allowed by the engines range with strict engine checks retained.
The prebuild check requires at least 24.22.1 in the actual build environment.
See [Vercel runtime selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Application source, localized content, public assets, dependency lockfile, tooling, tests
and documentation belong in Git. Backups, captures, temporary files, local environments,
installed dependencies and generated build/test output remain ignored. `.vercelignore`
also excludes local evidence and secrets from CLI uploads. Runtime tracing already excludes
evidence, docs and tests while including the content repositories required by server rendering.

Configure contact credentials only through Vercel environment variables, following
[the contact guide](15-contact-email.md). Never commit `.env.local` or a Resend key.
Turnstile remains disabled by default as requested. No email credentials or delivery backend
are provisioned by pushing this repository.

## Release boundaries retained

Validation on Node 24.22.1: 95 unit tests passed; ESLint, production Webpack build and
TypeScript compilation passed; build tracing verified all 116 recovered documents with no
private/reference files included; documentation/frozen-evidence validation passed (149 routes,
67 original legacy rules). No tracked local environment files or private-key/token pattern
matches were found in the bounded source scan. Browser suites were not rerun for this patch.

The current content repository still refuses `APP_ENV=production`. For a protected preview,
the existing `APP_ENV=local` mode builds the site with its deliberate non-indexing controls.
Do not treat that preview as an accepted public launch or bypass those controls by changing
the environment value. Public release needs the separately agreed content/release-mode and
indexing decision. Remaining Arabic coverage is recorded in the existing localization docs.

Pushing source does not establish Vercel runtime patching, domain configuration, email delivery
or deployment acceptance. Verify the runtime version in Vercel build logs and any existing
deployment's runtime separately; old running Node processes do not update automatically.
