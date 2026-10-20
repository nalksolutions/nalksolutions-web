# Focused customer journeys

Owner-approved implementation contract, October 20, 2026. Decision D-20.

## Outcome

Help Saudi business visitors understand the offer, choose a service, build confidence and
contact Nalk. Keep the five main navigation destinations and all retained public routes.
Four offers organize the experience: Websites & E-commerce, Custom Software & Apps,
AI & Automation, and Digital Marketing. The existing Contact page is the enquiry destination.

This phase covers English main-page composition, focused editorial changes, shared
navigation/search and connections to retained supporting pages. Existing colors, fonts,
glass cards, imagery, buttons and motion remain. Arabic expansion, form delivery, Sanity,
analytics and deployment are excluded. Existing Arabic content remains protected.

## Structure and content contract

Nine core English pages use existing identities: Home, About, Services, Blog, Contact,
and the four existing main service pages. All 25 English service/location pages belong
to exactly one offer: four primary pages and 21 supporting pages. Marketing automation
belongs to Digital Marketing; business-process automation belongs to AI & Automation.

Home presents the video hero, brands, four offers, short company introduction, three
capability examples, benefits, testimonials/statistics, FAQs and final enquiry. Services
presents four choices, a contact invitation and four optional native specialist groups.
Offer pages retain their H1 and substantive source sections while presenting concise
introductions, problems, deliverables, evidence/process, specialist links, FAQs and contact.
About keeps founder, values and testimonial substance with less repeated service promotion.
Blog keeps its sequence/pagination and gains four topic links plus an optional full topic list.
Contact leads with working contact links, preserves locations/hours and keeps the unavailable
form honest. No response-time or delivery promises are introduced.

Specialist bodies remain intact with separate parent/contact navigation. The 35 English
articles retain their bodies and gain one explicitly assigned offer link after the body.
Eight Arabic articles receive no new editorial section. Team, profiles, credits and HTML
sitemap retain their content and access without new prominence in the buying journey.

## Preservation and architecture

Author the journey map and copy separately from immutable WordPress recovery documents.
Validate published identities, locale, unique membership, destinations and explicit article
assignments. Server Components remain the default. Reuse the established visual components;
do not introduce a page builder, new dependencies or a duplicate site implementation.

Public paths, statuses, legacy matching, metadata, canonicals including absence, indexability,
structured-data facts, article attribution/media and archive membership remain unchanged.
About/Contact visible titles may become H1s as explicit semantic corrections. New links use
direct retained destinations. Specialist directory links must exist in server HTML even when
their native disclosures are closed. Historical navigation/evidence registers stay frozen.

Search retains title matching and noindex exclusion, adds offer aliases, prioritizes matching
offers and reveals six results at a time. All matches remain available. No new search route
or external search service is introduced.

| Responsibility | Implementation |
| --- | --- |
| Core identities/navigation | `src/content/journey/pages.ts` |
| Offer membership, summaries, actions and topics | `src/content/journey/offers.ts` |
| Explicit article recommendations | `src/content/journey/articles.ts` |
| Published-target validation and active-section identity | `src/content/journey/resolve.ts` |
| Source-preserving editorial transforms/context | `company-content.ts`, `service-content.ts` in the same module |
| Shared search matching/priority | `src/content/journey/search.ts` |
| Server page compositions and contextual navigation | `src/components/journey/` |
| Editorial exceptions and required source/authored fragments | [Editorial ledger](page-reviews/customer-journey-editorial.json) |

The request still passes through the existing Proxy, repository and request-scoped server
resolver. That resolved page owns both metadata and visible content. The journey layer
selects a composition by authored identity and resolves offer/specialist destinations from
the current published identity list; it does not own routing, repository caching or SEO.
The existing captured renderers still own specialist, article, archive and Arabic content.

The [editorial review](page-reviews/customer-journey.md) lists all nine review destinations,
every main-page change and all 35 explicit article recommendations. Whole-body hashes stay
in force outside the seven revised recovered main documents. Those seven use a finite
source-fragment exception ledger plus checks for all remaining source paragraphs, lists and
headings and required authored copy. Blog topic/search additions are tested independently
from the preserved archive body; no archive source checksum is rewritten.

## Commands and environment

```powershell
npm ci
npm run dev
npm run build
npm start
npm run verify:visual-engineering
```

Node 24, npm and the existing lockfile/dependencies remain unchanged. Development and local
production servers bind to loopback. `APP_ENV=local` is the optional local setting; fixture
mode still refuses `APP_ENV=production`. The verification harness sets `APP_ENV=test`, creates
isolated `FIXTURE_CONTENT_PATH`/`FIXTURE_DOCUMENTS_PATH` copies, reserves its own port and
stops only its own server. It does not reuse the developer server on port 3000.

Focused browser checks can use the existing harness with a separate directory and port:

```powershell
$env:CHUNK_RUN_DIR='tmp/customer-journey/focused-'+(Get-Date -Format 'yyyyMMdd-HHmmss')
$env:TEST_PORT='3200'
node tooling/run-browser-tests.mjs browser '--grep=customer journey'
```

Do not reuse an existing run directory or run two harnesses on the same port. Clear these
temporary environment overrides before the complete engineering command. No future-suite
placeholders or new verification dependencies were introduced.

`BROWSER_TEST_WORKERS` accepts `1`, `2` or `4`. The complete visual gate defaults to two;
the reconciled run uses four independent browser workers on the available 16-thread host.
HTTP tests still use one worker, and publication/fixture mutations finish before browser
checks begin. Every browser case remains selected; no assertions or retries are changed.

```powershell
$env:BROWSER_TEST_WORKERS='4'
npm run verify:visual-engineering
```

## Delivery and evidence

Baseline: `tmp/customer-journey/baseline.json` records source/public/test/document hashes,
published SEO identities and the pre-change production build. `baseline-docs.json` records
49 valid documents, 149 frozen routes, 67 legacy rules and zero accepted replacement routes.
Earlier screenshots and WordPress evidence remain unchanged.

Implementation order: authored map/copy and editorial ledger; navigation/Services;
Home/offers; About/Blog/Contact; supporting links/search; targeted browser/HTTP checks;
final `npm.cmd run verify:visual-engineering`; visual and documentation reconciliation.

Verify raw HTML and source preservation, all published identities and legacy behavior,
specialist reachability, six-result search, pointer/keyboard journeys, native no-JavaScript
directories, Arabic regressions, focus/reduced motion, hydration/resource errors, 200% zoom
and overflow at 1440x1000, 768x1024, 390x844 and 320px across the established browsers.

Completion requires implemented journeys, a passing final engineering gate and concrete
main-page previews with an editorial record. It does not establish improved real-world
conversion, owner visual acceptance, Arabic readiness or release acceptance.

## Implementation and review evidence

All nine core compositions, the four-offer map, 21 specialist connections, 35 English
article recommendations, simplified shared navigation and six-result search are implemented.
The [editorial review](page-reviews/customer-journey.md) remains a copy/design draft for owner review.

Before/after review gallery: `tmp/customer-journey/review/index.html`. The final-build
desktop/tablet/mobile capture is `tmp/customer-journey/final-1792482367037/manifest.json`:
27 views, 54 screenshots, no errors or horizontal overflow. The additional 320px audit is
`tmp/customer-journey/narrow-1792482608071/manifest.json`: nine views, 18 screenshots,
no errors or overflow. Enlarged-text/720-CSS-pixel reflow is tested as the 200% zoom
equivalent; this is not a claim of native browser-toolbar zoom or a complete WCAG audit.

`tmp/customer-journey/protected-content.json` verifies 1,165 original public assets,
generated documents, source registers and routing records unchanged. The original backup
and capture evidence also pass the existing frozen-evidence checker. No dependency versions
or lockfile entries changed.

The focused cross-browser run passed 132 checks, and the final application build passed all
42 dedicated journey checks across Chromium, Firefox and WebKit. The complete gate first
passed all 75 tooling, 37 unit and 233 HTTP checks, then stopped at a legacy browser test
that expected Contact's deliberately removed About promotion. That report remains at
`tmp/chunk15/2026-10-20T07-43-14-611Z/manifest.json`; it is not a full passing gate. The
test now checks the intended email/phone action and unavailable form. An earlier gate was
intentionally interrupted for spacing/rounded-card corrections; its process record remains
under `tmp/customer-journey/interrupted-gate-processes.json`.

The reconciled Contact/remaining-page checks pass all 18 cases across the six browser/viewport
projects: `tmp/customer-journey/contact-regression-3/browser/results.json`. They verify the
new contact-link location without restoring the removed promotion or dropping phone/email,
unavailable-form, navigation, language, button-state or no-JavaScript assertions.

A subsequent complete run passed 233 HTTP and 925 browser cases before a WebKit test
focused the menu while its hydration-ready state was still disabled. Its failed report is
`tmp/chunk15/2026-10-20T08-18-23-638Z/manifest.json`. The test now waits for the menu to be
enabled, asserts actual focus and retains the visible-outline assertion. All 93 WebKit cases
then pass in `tmp/customer-journey/webkit-readiness/browser/results.json`. This is a test
readiness reconciliation; the application source and preview identity remain unchanged.

Final complete engineering result: **passed**. `npm run verify:visual-engineering` completed
with 1,350 passing tests: 75 tooling, 37 unit, 233 production HTTP and
1,005 browser cases, with zero failures, skips or retries. Manifest: `tmp/chunk15/2026-10-20T09-01-39-071Z/manifest.json`.
The gate rechecked its source identity after completion. Final build: `aogLQGhqN0Gsv21UUH_1g`.
The preview build `aSssbn6uUmSKavR_3GrwU` has the same verified application/public/dependency
identity; later changes reconciled tests, verification concurrency and documentation only. `tmp/customer-journey/handoff.json`
records both build identities, the application digest, fixture revision, dependency versions and reports.

Documentation was finalized after the gate to record its result; application/test sources remain
unchanged after verification. Documentation/evidence and formatting checks are rerun for that
results-only update. No visual/content acceptance,
replacement-route acceptance, Arabic transition, integration or deployment gate is granted here.
