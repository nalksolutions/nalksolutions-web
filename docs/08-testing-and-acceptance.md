# Testing and acceptance

Status: full migration verification contract. Local content/HTTP/browser engineering is verified through [Chunk 20](chunks/20-article-fidelity-follow-up.md); design/language acceptance, real CMS, integrations and deployment evidence remain open. Python archive checks alone are not application acceptance tests.

## D-17 redesign and Arabic targets

Follow the [next-phase acceptance boundaries](12-redesign-and-arabic-delivery.md): redesign
review and owner design lock precede Arabic work on the released scope. A locked redesign
becomes a versioned visual target, stored separately from WordPress evidence. Compare unchanged
pages to their existing contract and redesigned pages to their approved target. Preserve
content/SEO/behavior checks in both cases. Do not mask old failures or relabel them as accepted
merely because a redesign is planned.

Arabic requires complete-content and editorial review, genuine page-pair navigation,
localized UI/metadata, RTL/mixed-script/formatting tests and real publication/draft-isolation
evidence. It adapts the locked design rather than reproducing English text geometry. Design
lock, Arabic review, engineering success and overall route/release acceptance are separate.
This documentation update adds no passing application test or accepted route.

[Chunk 9](chunks/09-complete-local-coverage.md) adds complete retained-route HTTP content/SEO checks, all allowlisted media byte checks and browsing of every recovered document at three archived dimensions. Family/language representatives also run in Firefox/WebKit and at 320px. Its screenshots are top-viewport diagnostics. Full-page visual comparisons, complete interaction parity, real CMS/integration tests and deployment acceptance remain open; do not equate this coverage gate with release acceptance.

## Release principle

Every in-scope route, retained document, legacy rule and critical integration needs evidence. A passing representative page, aggregate coverage score, screenshot count or Lighthouse score cannot accept a different failing page.

The target is zero unexplained or unapproved differences in design, content and behavior. Use controlled comparisons, semantic assertions and human review together. Do not promise literal pixel equality across different renderers, operating systems or font installations.

## Layers and responsibilities

| Layer | Required checks | Typical tool/implementation |
| --- | --- | --- |
| Static quality | Formatting, lint, strict types, import boundaries, unused exports/dependencies, secret checks | Pinned project tooling in CI |
| Unit | Route identity/precedence, redirects, locale, SEO mapping, conversion, field validation | Vitest or the selected focused equivalent |
| Component | Interactive state, keyboard/focus, errors, rich-content rendering | Testing Library with semantic queries |
| Integration | Production HTTP, CMS queries/preview/cache, importer, transport and webhook contracts | Real production build plus controlled dependencies |
| Content | Text/structure/media/links/dates/author/taxonomy reconciliation | Source-to-target comparison reports |
| Visual | Full-page and focused-region comparisons at fixed viewports/states | Pinned Playwright and reviewed reference images |
| End to end | Navigation, search, language, pagination, forms and editor publishing | Playwright plus controlled test accounts/transport |
| Accessibility | Automated rules and keyboard/screen-reader/zoom/manual assessment | axe integration plus manual review |
| Performance | Representative and worst-case pages, media/bundle budgets and field monitoring | Lab measurements, bundle reports and RUM where configured |
| Operational | Configuration, indexing, cutover, rollback and recovery | Staging rehearsal and production smoke runbook |

Select exact dependencies/versions in Phase 2. Do not install an overlapping testing stack for each feature.

## Per-route acceptance record

The [route register](registers/routes.json) starts with 149 rows and independent status fields for implementation, visual, content, SEO, behavior and final review. All start `not_started`. Each accepted field links to immutable evidence identifying commit/build, route, source baseline, test environment, dataset/content version, timestamp and reviewer.

For a retained 200 route, required evidence includes:

- Correct initial/final HTTP behavior and direct-request/client-navigation checks.
- Complete visible text, heading order, rich structures, links, media/crops, dates and relevant relationships.
- Metadata, canonical/indexability/language/schema/sitemap assertions.
- Desktop, tablet and mobile full-page comparisons; unique state comparisons and applicable breakpoint cases.
- Functional and accessibility checks appropriate to that page/template.
- Manual inspection of the entire page and resolution of all differences.

For a redirect route, assert the initial status/Location and chain first. Its archived screenshot shows the destination; compare the final approved destination rather than treating the redirect source as a new standalone page.

For a 410 route, assert a true gone response and intended body, plus sitemap exclusion. Preserve/approve its visible error-page appearance rather than quietly returning a styled 200.

Additional historical routes receive the same applicable checks once verified. The 67 legacy rules have separate identity and test coverage even when their source is already in the route register.

## Fixed visual environment

The old archive uses Chromium 156.0.8078.4, scale 1, locale `en-US`, timezone `Asia/Riyadh` and these profiles:

| Profile | CSS viewport | Input mode |
| --- | --- | --- |
| Desktop | 1440×1000 | Desktop pointer |
| Tablet | 768×1024 | Mobile emulation and touch |
| Mobile | 390×844 | Mobile emulation and touch |

Pin the Playwright/browser version, operating-system image, font files, locale, timezone, device scale, color/motion preference and screenshot settings in the comparison manifest. Some original OS/font/GPU details were not captured; establish reproducibility before setting strict thresholds.

If the selected CI environment differs, capture both the preserved WordPress reference and the replacement in that same environment, verify the reference still represents the frozen design/content, and retain the original 447 screenshots as historical evidence. Do not overwrite them with a newer live design. The calibration report explains any renderer-only differences.

Playwright documents environmental variation and reviewed screenshot workflows in [visual comparisons](https://playwright.dev/docs/test-snapshots).

## Deterministic capture procedure

1. Start the production build against a fixed dataset/content snapshot. Use isolated browser contexts with explicit settings and no authenticated public-session contamination.
2. Navigate by the public URL. Record redirects, response status, console errors and failed required resources.
3. Trigger required deferred scripts with real input where needed. Scroll instantly through the whole page, allowing lazy content/counters to settle, and return to the agreed position.
4. Wait for the required fonts, images, application readiness and final counter/static states with bounded waits. A timeout is an investigated result, not an automatic success.
5. Freeze animations for static comparison. Use an agreed poster/frame for moving media; exercise motion separately. Apply the recorded Elementor entrance-visibility adjustment only to the old reference where required, not as arbitrary CSS hiding of differences.
6. Save full-page screenshots and diagnostic evidence. For long pages additionally capture/compare named regions to expose local drift hidden by a whole-page aggregate.
7. Compare dimensions, content landmarks, styles and pixels. Review the overlay/difference image and actual side-by-side pages.

The existing archive does not contain a complete landmark geometry map. Collect those measurements from an aligned reference in Phase 0/4 before claiming coordinate assertions are established.

## Visual acceptance thresholds

These are proposed initial gates, calibrated in Phase 2/4 and recorded before broad rollout:

- Zero missing/extra sections, changed text, wrong assets, wrong crop, clipped controls or unexpected horizontal overflow.
- Matching page image width and full-page height unless a specific documented correction explains the difference. Do not resize/pad one screenshot to conceal layout drift.
- Critical landmarks—header/hero bounds, content/container edges, section starts and footer start—match within 1 CSS pixel where measured rounding is the only cause. Larger or accumulated drift fails.
- Critical typography matches font family/file, weight, size, line height, spacing and line wraps. A font fallback is a defect, not acceptable antialiasing noise.
- Start with strict pixel comparison. A total mismatch ratio up to 0.1% is only a review ceiling for demonstrated low-level rasterization noise after geometry/content pass; it is not automatic permission to change 0.1% of the design. Critical regions can require zero mismatch.
- Any tolerance/mask is narrow, justified, versioned and reviewed. No whole-section/headline/hero masks, blanket color tolerance or globally inflated threshold to clear failures.

Even a numerical pass requires manual acceptance for layout/content fidelity. Any obvious visual defect fails regardless of aggregate ratio. A justified correction to an old defect uses a decision-specific expectation, with original reference and approved new expectation retained.

## State and responsive matrix

The original inventory contains 447 screenshots for 149 captured routes. Under D-16, run the
three baseline profiles for all 107 active content pages (321 content-page comparisons), plus
applicable response-document/state checks for compatibility routes. Eleven archive-only
project/demo pages require reviewed SEO dispositions rather than further layout reconstruction;
their source evidence remains preserved. Existing broad engineering regression suites continue
to cover the current local runtime until those dispositions are implemented. Shared component
changes trigger every affected in-scope route, not only a sample. See the
[scope reconciliation](chunks/12-active-navigation-scope.md).

Additionally test each template/shell variant and affected unique page at 767/768, 1180/1181 and 1600/1601 CSS widths, a small supported mobile width (initial proposal 320px), a large desktop, and 200% zoom. Confirm the final supported-browser/device matrix in Phase 2; initial coverage includes Chromium, Firefox and WebKit desktop/mobile emulation plus real iOS Safari and Android Chrome checks for critical flows.

Cover navigation/nested dropdowns, mobile popup, search, language transitions, FAQs, sliders, anchors/sticky behavior and every form state. Use separate action/state IDs and evidence; the seven archived states are the initial reference set, not the complete required matrix.

For the request-derived root-locale architecture, explicitly verify that a language change performs document navigation and updates server HTML attributes/shell, including back/forward history. Same-language client navigation must not reuse a different page's canonical, content or metadata.

## Content fidelity tests

Use normalized DOM/structured content comparison that ignores presentation wrappers and irrelevant whitespace while preserving meaningful punctuation, lists, table cells, code whitespace, anchors and order. Retain a readable diff.

Compare article title/body/excerpt, visible dates/time formatting, author identity, category/tag ancestry, featured/inline images, alt/captions, link destinations/fragments, TOC, related-content rules and supported schema. Check English and Arabic text for encoding corruption and unintended Unicode normalization. Ensure SSR content matches hydrated content.

Every unsupported block, unresolved asset or unexplained content hash change blocks import acceptance. Expected corrections belong to the change register, not a generic ignored-difference list.

## HTTP and SEO tests

Test raw production-mode GET/HEAD responses without browser redirect auto-follow, then follow and inspect the full chain. Assert exact statuses, Location, content type, cache/indexing headers, canonicals, robots, locale attributes and meaningful body content. Test query/host/slash variants, malformed encoding, unknown paths and reserved-route collisions.

Parse JSON-LD and XML sitemaps; validate relationship/URL facts as well as syntax. Verify drafts/preview/Studio/internal paths cannot become indexable. Test canonical/path policy across cache hits and publication/unpublication. See the detailed [SEO contract](06-seo-and-routing.md).

## Accessibility and performance

Target WCAG 2.2 AA behavior, using the [W3C quick reference](https://www.w3.org/WAI/WCAG22/quickref/). Require no unresolved critical/serious automated findings, then manually review keyboard/focus, dialogs, announcements, headings/landmarks, labels/errors, contrast, touch targets, zoom, motion and RTL. Automation alone does not establish conformance.

Use LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile as field goals for supported mobile/desktop usage, following [Web Vitals](https://web.dev/articles/vitals). A lab score or Total Blocking Time is not a substitute for field INP. Before enough production field data exists, run repeatable cold/warm mobile lab profiles and trace the causes of regressions.

Calibrate route/template asset and JavaScript budgets after the vertical slice, then ratchet them rather than inventing a universal byte limit before measuring the actual design. Record hero/media, font and client-JavaScript budgets. A visually identical page with avoidable blocking JavaScript or severe shifts is not complete.

## CI and test execution

Phase 2 should establish these command contracts; exact names must match the eventual package scripts:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run build
npm run test:e2e
npm run test:visual
npm run verify:content
npm run verify:seo
npm run verify:release
```

On Windows use `npm.cmd` where execution policy prevents `npm.ps1`. The final release command runs the production candidate with an explicit environment, base URL and content/baseline identity. It must not silently submit forms to production recipients or modify a production dataset.

Every change runs relevant fast checks and a production build. Affected-page selection can shorten feedback, but shared-shell/token/typography/routing changes require their full impact set. Before G8/G9, run the entire mandatory route/legacy/content/visual/functional suite, not only the changed subset.

## Failure handling and evidence

Classify failures as implementation defect, baseline drift, renderer nondeterminism, source defect, dependency/configuration failure or approved intentional change. Preserve actual/expected/diff images and traces before investigating. A retry can identify flakiness; it does not erase the failed attempt or permit persistent nondeterminism.

Release blockers include missing content/routes, wrong canonical/indexability/status/locale, broken critical controls/delivery, draft/secret exposure, substantial layout mismatch, inaccessible critical flows, unrecoverable deployment and unverified content delta. Lower-priority cosmetic differences still need an explicit owner decision if they remain at launch; the default is to fix them.

Evidence should include test/report IDs, checksums or immutable artifact links, source baseline ID, build/commit, dataset version, profile/browser, timestamp, result, defect/exception references and reviewer. Store large reports externally/ignored locally with a durable manifest; do not clutter production folders with them.

## Final acceptance

G8/G9 require every route's applicable fields accepted, all legacy rules accounted for, complete content/media reconciliation, passing critical integration/recovery checks, resolved release blockers and documentation matching the final implementation. The owner receives a concrete report and reviewable staging site before cutover authorization.
