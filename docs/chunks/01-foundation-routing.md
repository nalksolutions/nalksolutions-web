# Chunk 1: Application foundation and routing proof

Status: local foundation/routing implementation. Updated October 17, 2026.
Each full-gate manifest identifies the exact tested source/build. This is not release acceptance.

## Purpose and limits

Establish the permanent Next.js foundation and prove routing, HTTP, locale and SEO before visual
reconstruction. Baseline: `nalk-wordpress-2026-10-15`, containing 149 archived routes, 67 configured
legacy rules and 447 historical screenshots. Original evidence remains unchanged.

Seven source-derived excerpt pages exercise the contracts. Full content, typography, branding,
status-page design, Sanity, forms, search, hosting, WordPress recovery and cutover remain open.
Proof styling and the proof favicon are not approved final design assets.

## Installation and commands

Use Node 24.15.0 and npm 10.8.2. Full verification also requires Python 3 and the preserved evidence.
Python checks use the standard library and existing SQL reader. The runner selects the Windows
`.venv` automatically; `PYTHON` can specify another interpreter.

```powershell
npm.cmd ci
node node_modules/@playwright/test/cli.js install chromium firefox webkit
npm.cmd run verify:chunk1

# Development: http://127.0.0.1:3000
npm.cmd run dev

# Local optimized runtime, also bound to loopback
npm.cmd run build
npm.cmd start
```

| Command                   | Implemented responsibility                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `format:check` / `format` | Check / format new app, tests, tooling and chunk docs; exclude evidence and unrelated docs                |
| `lint`                    | Next/TypeScript ESLint with zero warnings                                                                 |
| `typecheck`               | Next route types followed by strict TypeScript                                                            |
| `test:unit`               | Routing, collision, environment and SEO contracts                                                         |
| `build`                   | Optimized production build                                                                                |
| `verify:build`            | Reject prohibited traced files; require the default fixture                                               |
| `test:integration`        | Own a production server and run HTTP/publication/environment tests                                        |
| `test:e2e`                | Own a production server and run the browser matrix                                                        |
| `generate:routing`        | Generate runtime status data from documented inputs                                                       |
| `verify:routing-data`     | Fail on stale generated status data                                                                       |
| `verify:chunk1`           | Evidence, derivation, generated data, formatting, lint, types, unit, build, traces, HTTP and browser gate |

Standalone integration/browser commands require a successful build. The harness copies fixtures
into its ignored run directory, fails if its port is occupied, and terminates only its own server.
It never changes a CMS or follows a legacy redirect onto the live site.

Regenerate reference excerpts/settings deliberately with `python tooling/extract-reference.py`.
Its `--check` mode verifies committed inputs without writing.

## Versions and configuration

Runtime: Next.js 16.4.1, React/React DOM 19.3.1, Zod 4.6.7, server-only 0.0.1.
Tailwind and its PostCSS integration: 4.3.3. Tools: TypeScript 5.9.3, ESLint 9.39.5 with Next config
16.4.1, Prettier 3.9.10, Vitest 5.0.5, Playwright 1.64.1 and parse5 8.0.1.
Direct versions are exact; the npm lockfile defines the complete graph.

ESLint 9 is a compatibility pin: Next's bundled import/React/accessibility plugins do not declare
ESLint 10 support. npm reports the upstream ESLint 9 deprecation. Upgrade the compatible lint
stack together; do not force incompatible peers. This dependency is development tooling.

| Variable               | Contract                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `APP_ENV`              | Defaults to `local`; `test` supported; other values, including `production`, refuse startup |
| `FIXTURE_CONTENT_PATH` | Trusted server-only override; harness supplies its temporary JSON file                      |
| `TEST_PORT`            | Default 3100; occupied ports fail rather than reusing another server                        |
| `CHUNK_RUN_DIR`        | Run directory, normally under ignored `tmp/chunk1/`                                         |
| `PYTHON`               | Optional interpreter for the full evidence gate                                             |

Next's optimized `NODE_ENV=production` is independent of the disabled `APP_ENV=production`.
There is no fixture-mutation HTTP endpoint. Never derive the override from a request or point
publication tests at the committed file.

The canonical origin is the server constant `https://nalksolutions.com`. Host and forwarded
headers cannot select a different canonical origin. Local responses carry
`X-Robots-Tag: noindex, nofollow`; robots disallows `/`. Source meta-robots is checked independently.
No partial production sitemap is published.

## Request flow and ownership

1. Proxy validates encoding and checks configured/captured status rules before exclusions.
2. Only framework resources, robots and the proof favicon bypass page resolution. No blanket
   extension or WordPress-directory bypass swallows the literal asterisk rule.
3. A fresh validated fixture read establishes published identities. Proxy returns 301, 404, 410
   or 503 before streaming, or overwrites the trusted pathname header for a valid page.
4. Rendering reads one request-local snapshot shared by layout, metadata, page and navigation.
   Proxy and rendering share no mutable process state.
5. Content identity determines language: `en-US/ltr` or `ar/rtl`. Cross-language links use document
   navigation; same-language links use Next Link. History is tested.

This is request-rendered SSR, not whole-page SSG/ISR. Fixtures have no cross-request cache.
The future Sanity adapter must establish real publication, path identity, revalidation,
preview and outage contracts before production is enabled.

Routing owns path/status policy; content owns validated fixtures; the server resolver owns
request consistency; SEO owns metadata/serialization; presentation owns the proof UI; tooling
owns generation and verification. Server Components are the default. There are no empty future
feature folders, global client stores or general page-builder abstractions.

## Data, HTTP and SEO contracts

Route outcomes are `page | redirect | gone | notFound`; repository failures remain distinct errors.
Pages contain stable/source IDs, public path, kind, locale, explicit optional SEO, typed excerpts
and provenance. Boundary validation rejects duplicate identities, reserved/legacy collisions and
foreign/mismatched canonicals, including draft collisions. Drafts never resolve publicly.

The manifest contains 67 configured rules plus five captured responses outside those plugins:
`/arabic/`, three nested Arabic redirects and
`/mastering-social-media-management-for-local-audiences/`. Additional responses match their
observed exact paths without invented plugin flags. Tests cover all 31 captured non-200 routes.

Rank Math exact rules are case-sensitive and trim surrounding slashes. Redirection uses its
saved case-insensitive and trailing-slash-ignore flags. These sources require exact query
matching. Literal asterisks, ellipses, spaces and formatting characters remain literal.
Recovered settings contain selected flags and SQL/export/plugin hashes, not database contents.

Known missing-slash variants receive one explicit 301; unknown paths remain 404. Proxy requires
absolute Location URLs, so canonical-path redirects use the approved public origin. Local tests
assert the original Location and follow only its path against loopback. The known
`/arbic/ → /arabic/ → 410` chain remains preserved under D-08; business resolution is pending.

GET/HEAD share statuses and relevant headers; HEAD has no body. Invalid encoding returns 400;
encoded separators return 404. Gone paths return 410. Invalid/unavailable content returns a
generic no-store 503 with Retry-After, without draft data or validation details. Legacy responses
continue working during content failure.

Metadata is blocking and comes from the page snapshot. Root slash, pagination self-canonical,
absent profile canonical and source noindex are preserved. Core Open Graph/Twitter fields use
Next metadata; supplemental fields use `other`. Full social/schema semantic reconciliation is
a later gate. Only the source Article/BlogPosting node is emitted; the unreviewed Organization
graph is not promoted as corrected schema. JSON-LD escapes HTML delimiters.

## Representative fixtures

| Route                                                     | Source ID          | Contract                                             |
| --------------------------------------------------------- | ------------------ | ---------------------------------------------------- |
| `/`                                                       | R-91d9b62648d713d4 | English root and canonical slash                     |
| `/شركة-تقنية/`                                            | R-56afdad51c5c96c4 | Arabic path and D-06 semantics                       |
| `/how-to-build-an-api-from-scratch-a-step-by-step-guide/` | R-fbbead80b209e23c | Root article and JSON-LD                             |
| `/category/digital-marketing-strategy/`                   | R-4cd90575d3ca57e7 | Nested taxonomy                                      |
| `/category/digital-marketing-strategy/page/2/`            | R-5d7c48759714228a | Pagination identity                                  |
| `/cmsms_profile/daniel-foster/`                           | R-d5fcda349535d138 | Noindex and absent canonical                         |
| `/contacts/`                                              | R-a0ac0f2631af30d8 | Legacy target; source lacks H1, proof uses its title |

The generator records raw HTML/page-record hashes, excerpt identity and heading fallbacks.
It selects up to three substantial source paragraphs. These are not complete migrated pages
and must not be imported as finished marketing content.

## Verification and remaining gates

The suite contains 11 unit tests, 112 production HTTP tests and 18 browser tests. Publication
tests add English and Latin-slug Arabic articles, edit content/metadata, unpublish, remove,
exclude drafts, reject collisions and recover after malformed JSON on the same built server.

Browser profiles: Chromium 1440×1000, touch 768×1024, touch 390×844 and touch 320×844; Firefox and
WebKit 1440×1000. Checks cover direct entry, client/document navigation, history, refresh,
keyboard skip link, overflow, console/resource errors and JavaScript-disabled content.
Each profile saves seven diagnostic PNGs: 42 total, not historical visual comparisons.
WebKit on this Windows runner skips implicit anchor tab stops; a controlled native-versus-explicit
link diagnostic confirmed the difference. Interactive proof anchors explicitly use tabindex=0
without changing DOM order; the skip target uses tabindex=-1. The suite asserts real Tab focus,
Enter activation, main-target focus and onward navigation in every engine. This does not rely
on programmatically focusing the link to bypass the keyboard check. See the
[upstream keyboard discussion](https://github.com/microsoft/playwright/issues/5609) for browser
preference context; the local diagnostic, not that historical issue, establishes this runner's behavior.

`tmp/chunk1/latest.json` identifies the latest full gate and status. Separate run directories
contain source fingerprints, dependency versions, build ID, logs, temporary fixture, server log,
HTTP/browser JSON/HTML reports, traces and screenshots. Failed runs remain available. Copy
accepted evidence to durable storage before long-term release use.

Build verification rejects traced backups, archives, review data, temporary files, Python
environments, docs, tests and tooling. A narrow supported Turbopack annotation excludes the
trusted test override from tracing; the default seven-page fixture is explicitly included.

This locally advances REQ-02/03/04/05/11/12/18/20. Per-page acceptance remains unaccepted because
the fixtures are not reconstructed pages. G0 restore, deployment-platform G1, CI/staging G2,
content/media, visual slice, Sanity, remaining routes, integrations and release remain open.
No remote repository, commit or deployment is created in this chunk.

Next: recover reference-runtime/design assets, implement the faithful shared-shell vertical
slice, calibrate the visual runner and compare reconstructed pages before expanding families.

## Local milestone record: October 17, 2026

The [first complete gate](../../tmp/chunk1/2026-10-16T20-39-03-837Z/manifest.json) passed 11 unit, 112 HTTP and 18 browser tests after a clean npm lockfile install. The production-only npm audit reported zero known vulnerabilities. The final gate pointer remains `tmp/chunk1/latest.json`; use its source/build identity when reviewing the latest state.

The working registers record 38 captured routes (seven fixtures plus 31 non-200 dispositions) and all 67 configured rules as `in_progress`, with the local proof linked. No route, visual field or full migration requirement is accepted. Paragraphs and navigation links use automatic text direction so an English source excerpt embedded in an Arabic proof is readable without altering its text.
