# Requirements and acceptance register

Status: planned replacement-site acceptance. Existing source verification is recorded separately. Each requirement requires a build/content/environment identity, report links and reviewer before final acceptance.

| ID | Requirement | Required evidence | Gate / owning document | Current status |
| --- | --- | --- | --- | --- |
| REQ-01 | Recoverable, identified source | Original checksums, archive verification and successful isolated restore | G0 / [readiness](../01-evidence-and-readiness.md) | Source integrity verified; restore pending |
| REQ-02 | Every known URL has a deliberate disposition | Complete route/rule union, conflict report and additional discovery reconciliation | G1, G6 / [SEO](../06-seo-and-routing.md) | All retained identities and legacy dispositions implemented locally; final destination/platform review pending |
| REQ-03 | Existing public URL structure remains | Production-mode root/nested/Arabic/query/host/slash tests | G1, G6 / [routing ADR](../adr/0002-public-routing-and-locales.md) | All retained paths implemented locally; complete local coverage verified in Chunk 9; platform verification pending |
| REQ-04 | Exact HTTP behavior | GET/HEAD/chain tests for all rules plus real 404/410 under deployed cache/stream behavior | G1, G6, G8 | Old probes and local GET/HEAD proof tested; deployment/cache behavior pending |
| REQ-05 | Clean, maintainable architecture | Accepted vertical slice, dependency/module review, clean installation and CI | G2, G4 / [architecture](../03-application-architecture.md) | Local foundation implemented; visual slice, version control and CI pending |
| REQ-06 | Full content fidelity | Per-document text/structure/date/relationship reconciliation and per-page review | G3, G5, G6 / [content](../05-content-and-sanity.md) | Captured main content recovered for all retained routes; full fidelity, relationships and CMS acceptance pending |
| REQ-07 | Media and legacy asset availability | Public allowlist, checksums/maps, visual crop checks and old-URL response tests | G3, G6 / [media ADR](../adr/0003-media-compatibility.md) | Allowlisted local media and provenance implemented; crop/complete compatibility acceptance pending |
| REQ-08 | Every in-scope page matches the agreed design | Applicable baseline viewport/state comparisons for the 107 D-16 content pages, status-document checks, region diffs and human acceptance | G4, G6, G8 / [testing](../08-testing-and-acceptance.md) | All active layouts implemented; D-17 redesign uses separately approved targets, with unchanged-page contracts and historical findings retained; per-page/state acceptance open |
| REQ-09 | Responsive behavior fits correctly | Template/state/boundary tests, small/large widths, zoom and overflow checks | G4, G6, G8 / [design](../07-design-and-components.md) | Responsive baseline verified across archived widths and family representatives at 320px; source parity pending |
| REQ-10 | Interactions work and match | State inventory, navigation/search/FAQ/slider/form checks and browser evidence | G4, G7, G8 | Navigation/search/FAQ, source entrances, button smoothing and eleven service-tab widgets tested; complete source motion/states and integrations pending |
| REQ-11 | SEO identity/indexability preserved | Metadata/schema/robots/sitemap/internal-link report per route and approved deltas | G6, G8 / [SEO](../06-seo-and-routing.md) | All retained metadata mapped and raw HTTP contracts verified; sitemap and final SEO review pending |
| REQ-12 | Correct English/Arabic semantics | Correct server HTML attributes, genuine alternate relationships, RTL/layout/encoding tests | G1, G4, G6 | Arabic HTML semantics implemented locally; full RTL visual acceptance pending |
| REQ-13 | Safe, complete Sanity migration | Dry-run/import/reconciliation/idempotency/concurrency/recovery reports | G5 / [content](../05-content-and-sanity.md) | Not started |
| REQ-14 | Editors can publish and preview | Real workflow test, new root-path article, draft isolation, revalidation/failure evidence | G5, G7 | Not started |
| REQ-15 | Forms deliver correctly | Validation/abuse/failure tests, controlled transport and agreed-recipient delivery evidence | G7 / [integrations](../09-forms-and-integrations.md) | Configuration and delivery pending |
| REQ-16 | Tracking and ownership survive | Event/consent/verification map and staged/production smoke evidence | G7, G10 | Configuration recovery pending |
| REQ-17 | Accessibility and performance meet the contract | Automated/manual accessibility report; lab/bundle budgets; field monitoring plan | G4, G8, G11 / [testing](../08-testing-and-acceptance.md) | Not started |
| REQ-18 | Security and failure boundaries are sound | Secret/draft tests, validated boundaries, safe logs, dependency and outage review | G2, G5, G7, G8 | Local trust/failure/build-trace boundaries implemented; CMS/integration review pending |
| REQ-19 | Release and rollback are reproducible | Verified artifact/config/content, rehearsal, content delta, public smoke and rollback evidence | G9, G10 / [operations](../10-release-and-operations.md) | Not started |
| REQ-20 | Documentation matches the implementation | Passing docs checks, tested setup/runbooks/editor guide and handover review | Every gate, G11 / [maintenance](../11-documentation-maintenance.md) | Chunks 1-20 runbooks and D-17 next-phase plan documented; editor/operations handover pending |
| REQ-21 | Redesign follows the owner's direction and explicit design locks | Selected route/batch, owner direction, preservation checklist, reviewed implementation, viewport/state evidence and revision-bound owner lock | D-17 design stage; G4, G6, G8 / [next-phase plan](../12-redesign-and-arabic-delivery.md) | Sequence confirmed; no page selected or locked by this plan |
| REQ-22 | Arabic covers the same approved redesigned content accurately | Confirmed post-lock phase transition, verified page pairs, complete reviewed translations, localized UI/SEO, RTL/browser evidence and reliable draft/publication workflow | D-17 Arabic stage; G5-G8 / [next-phase plan](../12-redesign-and-arabic-delivery.md) | Planned after design lock and owner transition; technical/editorial decisions and implementation remain open |

## D-17 next-phase acceptance

The [redesign and Arabic delivery plan](../12-redesign-and-arabic-delivery.md) separates
owner design lock, the phase transition, Arabic editorial/visual review and final route/release
acceptance. Design is the first priority in the owner's selected order. Arabic implementation
and bulk translation do not begin by inference from an individual page approval. Arabic content
must match the approved redesigned source revision; it must not silently drop or shorten copy
to reproduce English geometry.

This is a planning update only. Historical engineering results remain tied to their recorded
builds; no application suite is claimed rerun and no route or legacy-rule acceptance field
is changed. An approved new visual target must be recorded separately from WordPress evidence;
planning a redesign does not retrospectively accept old comparison failures. Existing content,
SEO, real Sanity/integrations, production and release requirements remain open.

## Acceptance evidence format

[Chunk 12](../chunks/12-active-navigation-scope.md) reconciles the owner's active-navigation
scope: 107 content pages, including eight HTML-sitemap-only journeys, and eleven archive-only
project/demo pages. The [scope register](navigation-scope.md) selects further reconstruction;
earlier all-118 coverage claims are historical engineering evidence. All 149 captured routes
remain accounted for, compatibility remains unchanged and archive-only SEO dispositions remain
open. This scope audit accepts no route or requirement.

The [Chunk 9 coverage baseline](../chunks/09-complete-local-coverage.md) expands implementation to all 118 retained identities, with 116 recovered main documents alongside the existing home/API renderers. The unfiltered coverage command verifies local HTTP/content/SEO/media and browser behavior. It does not accept source-specific design, complete interactions, Sanity, integrations or deployment. Route and requirement acceptance remain open.

[Chunk 10](../chunks/10-article-family.md) extends shared article presentation across all 43 articles. Its body-text, presentation, locale, metadata and navigation checks supplement coverage evidence; exact visual acceptance, other family reconstruction, real CMS publishing and release gates remain open. No route acceptance field changes on the basis of this template rollout.

[Chunk 11](../chunks/11-service-family.md) extends layout reconstruction to 30 service/location pages. Source-derived roles preserve complete body text and actual column structure. Shared shell/Arabic font corrections supplement the article rollout; no service or article page is accepted without its remaining visual/state evidence. Corporate, archive and detail layouts remain open alongside CMS/integration/release requirements.

[Chunk 13](../chunks/13-company-pages.md) implements the five primary company layouts and
recovers seven reviewed backgrounds through the existing media allowlist. Complete source
text/headings remain mandatory. Its unfiltered production engineering gate passes 815 tests,
including all 30 company-browser cases; exact visual acceptance, form delivery and embedded-map
parity remain open. First-pass layouts now cover 79 of the 107 active pages, with 28 remaining.
No acceptance field changes from this rollout.

[Chunk 14](../chunks/14-listing-pages.md) implements the 20 ordinary Blog/category/author
layouts and the Blog's linked query-pagination views. Source-derived card order, complete text,
SEO identity and source absence/noindex behavior remain mandatory. Its unfiltered production
gate passes 907 tests, including 231 HTTP and 594 browser cases. Sixty source/current viewport
pairs remain diagnostic evidence, with visual differences explicitly open. First-pass layouts
cover 99 of the 107 active pages; eight secondary sitemap journeys remain. Real Sanity query
publishing, complete search/integrations and visual/release acceptance remain open. No route or
requirement acceptance field changes from this rollout.

[Chunk 15](../chunks/15-visual-motion-alignment.md) completes the first layout pass for all
107 active pages, including the eight secondary sitemap journeys. Its final unfiltered
engineering run passes 1,031 tests: 68 Python, 30 Vitest, 231 production HTTP and 702 browser
cases, with no skipped/flaky/unexpected HTTP or browser outcomes. All 321 final production
viewport comparisons are captured against build `NMgVqe3PsFY3ZUcwgqCh7`. The source and build
identities, strict comparison failures, native viewport evidence and remaining defects are
recorded in the runbook. Source motion, typography, controls and layout improvements do not
accept pages. All 149 route acceptance fields remain open, along with complete visual/state,
real Sanity, integrations, operational and release acceptance.

[Chunk 16](../chunks/16-homepage-load-alignment.md) corrects the homepage hydration flash,
wide-screen hero alignment, service action styling and ribbons. Its focused production gate
passes 333 tests (30 unit, 231 HTTP, 72 browser) on build `ZdplLJ1CO9ynqMNUSqs22`; it does
not replace the earlier complete engineering-suite record. Three new baseline-profile visual
comparisons remain different, with zero routes accepted. The runbook links cold-load frame
samples, large-screen measurements, screenshots and unresolved visual/state checks.

[Chunk 17](../chunks/17-services-interactions.md) shares the homepage button implementation
with the Services directory and corrects its hero, cards and CTA layout. Build
`hjQiV3Ij2z2iZm7dETVJ_` passes 363 focused tests (30 unit, 231 HTTP, 102 browser), including
source body-text checksums and real pointer/touch/keyboard navigation. Services heights match
in all three baseline profiles and nine native viewport frames match exact pixels. Six
whole-page comparisons remain different; no route acceptance field changes. This evidence
does not replace the earlier complete engineering gate or accept Sanity/integrations/release.

[Chunk 18](../chunks/18-about-alignment.md) continues source alignment on About and shares
homepage button behavior. Its visible Services CTA now navigates to the existing directory. Build
`X3OAx5wxugqbaxnU-xkRs` passes 378 focused tests (30 Vitest, 231 HTTP, 114 browser and
three Python company contracts); the unchanged browser rerun and initial Firefox cancellation
are both retained in its evidence.
Three strict whole-page comparisons remain different; matching responsive heights and
successful engineering checks do not accept the route. All acceptance fields remain open.

[Chunk 19](../chunks/19-remaining-pages-alignment.md) extends the shared action contract and
source alignment across the remaining active families. Its verification covers every active
route and preserves the separate exact visual/state gate. Header clearance, contact links
and homepage-style actions are intentional corrections; legacy dispositions remain unchanged.
Its final full engineering gate passes 1,110 tests on build `65AVM5xQe7v6yJrSqIyvw`, with
321 source/current capture pairs and zero current-page capture errors. Strict whole-page
and paint-integrity reports retain differences and exit 1; native frames supplement those
reports. These results do not accept any route. All 149 route acceptance records remain open.

[Chunk 20](../chunks/20-article-fidelity-follow-up.md) continues article source reconciliation
through finite typography/image roles, native prose-group spacing and shared category/action
presentation, featured-image sizing, table diagnostics and shared menu alignment. Its full
1,140-test gate passes on build `wzMC5ImvqewEhIO8vNEBD`; all 129 article capture pairs have matching
document heights and featured-image rectangles. Strict pixel/paint reports retain differences
and native frames supplement their review. This evidence is recorded separately from Chunk 19.
All 149 route acceptance fields remain open; integration and release requirements remain open.

Use a durable record containing requirement/route IDs, result, source baseline ID, build/commit, dataset/content version, browser/profile where relevant, timestamp, immutable report/trace/diff links, reviewer and decision/defect IDs. If an artifact expires, replace its durable reference before claiming acceptance remains supported.

Do not mark all routes accepted from a template-level test. For redirect/gone routes, acceptance is about the proper response and intended destination/body, not constructing new editorial pages.

## Release checklist

- [ ] All in-scope route acceptance fields are accepted with evidence/reviewer.
- [ ] Every legacy rule and additional historical URL is covered; no conflicts, loops or unintended destinations remain.
- [ ] All retained content/media are reconciled; drafts and private files are excluded from public delivery.
- [ ] Visual/content/SEO/state/browser checks pass; exceptions are narrow and accepted.
- [ ] Form delivery, search, editorial publishing and tracking/verification are demonstrated.
- [ ] Final source delta and frozen release candidate pass the mandatory suite.
- [ ] Operational access, indexing configuration, email/DNS preservation and rollback are rehearsed.
- [ ] The release package is reviewed and cutover authorized.
- [ ] Production smoke and stabilization ownership are ready.

Checkboxes remain unchecked until that evidence exists.

## Chunk 1 local evidence

[Foundation/routing proof](../chunks/01-foundation-routing.md) implements the local subset of
REQ-02/03/04/05/11/12/18/20. Its full-gate manifests record source/build identity and individual
check results. Per-page fields remain unaccepted because the seven fixtures contain excerpts
and proof styling. This does not close full content, visuals, Sanity, real-platform HTTP/cache,
CI/staging, recovery or release gates. The requirement table above remains the whole-site
acceptance contract, not a claim that this local subset is unimplemented.

## D-20: focused customer journeys, October 20, 2026

The [journey contract](../13-customer-journey.md) records a complete local engineering gate:
1,350 passing checks (75 tooling, 37 unit, 233 production HTTP and
1,005 browser cases). Four offers cover all 25 English service/location pages;
21 supporting pages and 35 English articles have explicit onward connections. The active
107-page graph remains reachable; all 118 retained page identities and 67 legacy rules keep
their protected HTTP/SEO behavior. Nine core English pages have a finite editorial ledger
and desktop/tablet/mobile/320px review evidence. All 1,165 protected source/asset records
checked against the phase baseline remain unchanged.

This adds local evidence for routing, maintainability, content/SEO, responsive behavior and
journey interactions. It does not accept whole-page design/content, complete accessibility or
performance audits, Arabic translation/alternate pairs, real CMS publishing, forms, analytics
or deployment. No replacement route is marked accepted; owner review and release gates remain open.

## October 20, 2026: unified header and mobile menu

D-21 is implemented and locally engineering verified across the shared header consumers. The [work record](../page-reviews/unified-header.md) identifies the passing complete gate, responsive/menu checks and production previews. Its 1,386 tests pass without failures, skipped cases or retries. Public routes, metadata, existing Arabic content and recovery evidence retain their protected contracts. This does not accept replacement routes, establish a whole-page design lock, or close Arabic translation, form delivery, Sanity or deployment gates. Owner visual review remains pending.
