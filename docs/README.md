# Nalk Solutions migration documentation

Status: the current design is the accepted working baseline for Arabic delivery under D-26. Forty Arabic views are available locally, including all nine core pages; full Arabic content coverage and the final bilingual gate remain open. Linguistic acceptance is handled internally by the owner, without reviewer nomination or visitor-facing review states. Updated: October 20, 2026 (Asia/Karachi).

The objective is to replace WordPress with Next.js, TypeScript and Tailwind, with Sanity managing blog content, while preserving public content and SEO. The local foundation, English content coverage and active-page layouts are implemented. The owner accepted the current design as the working baseline and moved delivery to the [Arabic implementation contract](14-arabic-localization.md). The [redesign and Arabic delivery plan](12-redesign-and-arabic-delivery.md) retains the historical sequence; Sanity, integrations and release acceptance remain pending.

The owner's latest scope clarification is the active visitor-facing site reached through the header/footer and their linked pages/subpages, not every archived URL. The [navigation reconciliation](chunks/12-active-navigation-scope.md) identifies 107 active content pages: 99 ordinary journeys and eight reached only through the visible HTML sitemap. Eleven disconnected project/demo pages are outside further reconstruction. The 118 locally rendered pages remain a historical coverage inventory. The fourteen documented Arabic compatibility redirects now move their ready replacements into `/ar/`; English responses and the original legacy rules retain their protected behavior.

Current work: [Arabic foundations and first content batches](page-reviews/arabic-foundation.md). The [service layout revision](page-reviews/service-layout-redesign.md), [service-area cards and accordion motion](page-reviews/service-cards-disclosures.md), [brand icon, Contact image and footer](page-reviews/brand-contact-footer.md), [section consistency, Contact and topic selection](page-reviews/ui-consistency-contact.md) and [unified-header engineering result](page-reviews/unified-header.md) remain historical design evidence. Arabic delivery uses focused checks before the final bilingual gate.

Arabic phase: [implementation contract](14-arabic-localization.md), [ADR-0005](adr/0005-arabic-localization.md) and [current editorial/delivery record](page-reviews/arabic-foundation.md). Sanity, real form delivery and deployment remain separate; no native approval or whole-phase completion is claimed.

## Read in this order

| Document | Purpose |
| --- | --- |
| [Project contract](00-project-contract.md) | Scope, preservation requirements, acceptance and change control |
| [Evidence and readiness](01-evidence-and-readiness.md) | Verified sources, limitations, missing inputs and recovery work |
| [Delivery plan](02-delivery-plan.md) | Ordered work packages, dependencies, deliverables and exit gates |
| [Application architecture](03-application-architecture.md) | Module boundaries, routing, rendering, data flow and proposed files |
| [Engineering standards](04-engineering-standards.md) | Component design, coding rules, repository hygiene and review |
| [Content and Sanity migration](05-content-and-sanity.md) | Schemas, conversion, media mapping, imports and reconciliation |
| [SEO and URL preservation](06-seo-and-routing.md) | HTTP behavior, canonicals, schema, indexability and URL tests |
| [Design reconstruction](07-design-and-components.md) | Tokens, layouts, assets, responsive behavior and component inventory |
| [Verification strategy](08-testing-and-acceptance.md) | Per-page visual/content/SEO testing, thresholds and evidence |
| [Forms and integrations](09-forms-and-integrations.md) | Delivery, search, analytics, previews, secrets and environments |
| [Release and operations](10-release-and-operations.md) | CI, cutover, rollback, monitoring and operational handover |
| [Documentation maintenance](11-documentation-maintenance.md) | Source-of-truth rules, commands and change discipline |
| [Redesign first, then Arabic delivery](12-redesign-and-arabic-delivery.md) | Owner-directed page workflow, design locks, content preservation and deferred Arabic translation/RTL/SEO approach |

## Implemented chunks

- [Chunk 1: foundation and routing proof](chunks/01-foundation-routing.md): setup, architecture, fixture identities, commands and evidence limits.
- [Chunk 2: homepage and shared design slice](chunks/02-homepage-visual-slice.md): source recovery, fonts, confirmed contacts, implementation boundaries and open fidelity checks.

- [Chunk 3: article content recovery](chunks/03-article-content-recovery.md): complete API article body, conversion tests and media provenance; offline recovery provenance and conversion checks.

- [Chunk 4: full API article rendering](chunks/04-article-rendering.md): validated full-body rendering and local media; template fidelity remains open.

- [Chunk 5: article presentation and navigation](chunks/05-article-presentation.md): source measurements, article header, adjacent thumbnails and related-post cards; engineering verified, visual acceptance open.

- [Chunk 6: article fidelity and reproducible capture](chunks/06-article-fidelity.md): stable full-page capture, source typography/footer reconciliation and 185 passing tests; strict visual acceptance remains open.

- [Chunk 7: article regional visual reconciliation](chunks/07-article-visual-reconciliation.md): corrected background/button/keyboard behavior, 185 passing tests and calibrated regional evidence; visual acceptance remains open, including a documented source-capture painting defect.

- [Chunk 8: reference integrity and article detail corrections](chunks/08-reference-integrity.md): complete source painting, font/footer corrections and 193 passing tests; remaining regional pixel differences stay open.

- [Chunk 9: complete local content coverage](chunks/09-complete-local-coverage.md): coverage-first rollout of the remaining 116 captured documents through reusable semantic templates; family visual reconstruction and integrations remain open.

- [Chunk 10: shared article reconstruction](chunks/10-article-family.md): all 43 articles use the shared layout, with complete body/metadata preservation, locale-aware navigation and 748 passing tests; exact visual acceptance remains open.

- [Chunk 11: service and location layouts](chunks/11-service-family.md): source-derived shared presentation for 30 English/Arabic service pages, shared shell/locale corrections and 772 passing tests; exact visual acceptance remains open.

- [Chunk 12: active navigation scope](chunks/12-active-navigation-scope.md): live desktop/mobile navigation and link-journey reconciliation; 107 active content pages, 11 archive-only pages, compatibility preserved and revised implementation batches.

- [Chunk 13: primary company pages](chunks/13-company-pages.md): About Us, Services, Contacts, Arabic Company and HTML Sitemap presentation, backup backgrounds, shared frame and skip-link history correction; 815 tests pass, exact visual acceptance remains open.

- [Chunk 14: listing pages](chunks/14-listing-pages.md): 20 Blog/category/author layouts, source card/pagination preservation and server-rendered Blog query views; 907 tests pass, exact visual acceptance remains open.

- [Chunk 15: visual and motion alignment](chunks/15-visual-motion-alignment.md): all 107 active layouts, source motion, hover smoothing, 1,031 passing engineering tests and 321 production comparisons; exact visual acceptance remains open.

- [Chunk 16: homepage first paint and alignment](chunks/16-homepage-load-alignment.md): hero hydration-flash correction, wide-screen alignment, service buttons and source ribbon details; 333 focused production/unit tests pass, exact visual acceptance open.

- [Chunk 17: Services interactions and shared buttons](chunks/17-services-interactions.md): homepage button reuse, full-card navigation feedback and source card/hero/CTA alignment; 363 focused tests pass, exact visual acceptance open.
- [Chunk 18: About alignment and shared actions](chunks/18-about-alignment.md): homepage button reuse, working Services CTA and source typography, background and responsive alignment; 378 focused tests pass, exact visual acceptance open.
- [Chunk 19: remaining active pages and shared actions](chunks/19-remaining-pages-alignment.md): consistent actions, Contact usability and source layout/article corrections across all 107 active routes; 1,110 engineering tests pass, 321 production capture pairs retained, exact visual acceptance open.
- [Chunk 20: article fidelity follow-up](chunks/20-article-fidelity-follow-up.md): featured-image sizing, source typography/image flow, grouped categories, shared actions and menu centering; 1,140 engineering tests pass, with 129 fresh article capture pairs and exact visual acceptance open.

## Working registers

- [Page matrix](registers/page-matrix.md): all 149 captured routes, with baseline screenshots and planned handling.
- [Active navigation scope](registers/navigation-scope.md): reconstruction selection under D-16, with a [machine-readable register](registers/navigation-scope.json) of paths, journeys and source hashes.
- [Route register](registers/routes.json): machine-readable observed behavior and per-route implementation/acceptance status.
- [Legacy rule register](registers/legacy-rules.json): all 67 configured rules and their public verification results.
- [Requirements and acceptance](registers/acceptance.md): requirements mapped to delivery gates and evidence.
- [Decisions](registers/decisions.md): unresolved product/configuration choices and defaults.
- [Risks](registers/risks.md): concrete risks, detection and responses.
- [Architecture decisions](adr/README.md): decisions and the routing prototype that must validate them.

`routes.json` is the working route acceptance register. The page matrix is generated from it. Raw audit/capture files remain historical evidence; do not edit them to make a migration test pass.

## Starting position

The verified archive contains 149 discovered URLs: 118 initial HTTP 200 responses, 18 initial 301 responses and 13 initial 410 responses. It includes 149 original HTML files, 447 rendered HTML files, 447 full-page screenshots and seven supplementary interaction screenshots. Its 76 sitemap entries and 107 WordPress public-content seeds are covered. See the [archive verification](../nalk-public-archive/archive_verification.json).

The initial 200 responses comprise 91 routes without an explicit `noindex` directive and 27 with `noindex`. These are observations, not evidence that Google has indexed a given page. The 67 configured legacy rules contain 32 redirects and 35 gone responses. These sources overlap the captured routes; do not add their counts as if all were unique URLs.

All nine supplied ZIP archives passed CRC checks, and all 424 attachment originals referenced in the WordPress export are present. See the [backup audit](../migration-review/backup_audit.json) and [human-readable review](../migration-review/review.html).

These checks establish source availability and archive integrity. They do not establish a successful WordPress restore, complete discovery of every historical URL, visual equality of a new application, form delivery, or SEO ranking preservation.

## Governing rules

1. Preserve public paths, content and intended behavior; change visual targets only through the owner-directed redesign and lock process under D-17.
2. Reproduce shared patterns with focused components; retain real page-specific differences.
3. Keep WordPress/plugin internals out of the replacement runtime.
4. Use the same route/content models for page rendering, metadata, sitemap generation and test expectations.
5. Test every retained page. Representative template testing supplements that coverage.
6. Require evidence for completion. A screenshot file existing does not mean the new page matches it.
7. Record intentional corrections to existing defects. Never hide them in baseline updates or relaxed thresholds.
8. Keep work in small, reviewable changes; update affected documentation in the same change.

## Immediate next work

The implemented [D-20 focused customer journeys](13-customer-journey.md) are ready for owner content/design review, with an [editorial review record](page-reviews/customer-journey.md). They organize the existing pages into four offers while preserving SEO and the established design system. The completed [light tidy pass](page-reviews/site-tidy.md) remains historical evidence. Arabic expansion and form delivery remain deferred.

Follow the [D-17 plan](12-redesign-and-arabic-delivery.md): the owner directs each selected page's redesign. Preserve its content/SEO except specific directed changes, implement and verify the concrete work, resolve feedback and record explicit design lock. Continue redesign as directed. Arabic implementation and bulk translation wait for the owner's confirmed transition for the locked scope; a single page approval does not automatically start that phase. URL/library/font proposals remain open.

All 107 active layouts have their first reconstruction pass, including the eight secondary HTML-sitemap journeys. The [homepage](chunks/16-homepage-load-alignment.md), [Services](chunks/17-services-interactions.md), [About](chunks/18-about-alignment.md) and [remaining-page](chunks/19-remaining-pages-alignment.md) alignment passes are historical evidence. [Chunk 20](chunks/20-article-fidelity-follow-up.md) records a historical full engineering gate: 1,140 passing tests and 129 fresh article capture pairs. Existing visual findings remain recorded; approved redesign targets are stored separately rather than rewriting WordPress evidence. Preserve the six gone team destinations and the [Chunk 12 scope](chunks/12-active-navigation-scope.md); do not redesign the eleven disconnected project/demo routes.

All 118 previously retained pages have local content; reconstructed layouts cover the homepage, 43 articles, 30 service/location pages, five company pages, 20 listings and eight secondary pages. Chunks 9–20 distinguish this engineering progress from exact visual acceptance, Sanity, integrations and deployment. Existing archive-only routes remain unchanged pending reviewed SEO dispositions.

Use shared templates and validated content documents, not 149 unrelated page components. Resolve or specifically reconcile findings against the approved target before acceptance; planning a redesign does not accept old differences or waive preservation/release checks.

The current D-20 engineering gate passes 1,350 tests (75 tooling, 37 unit,
233 HTTP and 1,005 browser cases). Its [editorial record](page-reviews/customer-journey.md)
and before/after previews cover all nine core pages. This verifies local contracts, not owner
design acceptance, real Sanity publishing, form delivery, Arabic expansion or deployment.

## Current status

| Area | Status |
| --- | --- |
| Original backup integrity and attachment reconciliation | Verified |
| Discovered public URL archive | Verified for captured discovery sources |
| Legacy exact-rule status probes | Verified against configured statuses; destination quality still requires review |
| Implementation planning documentation | Defined here |
| Isolated restore and configuration recovery | Pending |
| Next.js foundation and local routing proof | Implemented; see Chunk 1 verification manifests |
| Homepage and English shared-shell reconstruction | Implemented first pass; fidelity review in progress |
| Shared article family | Chunk 10 verified; 43 articles, exact visual acceptance open |
| Shared service/location family | Chunk 11 verified; 30 English/Arabic pages, exact visual acceptance open |
| Primary company pages | Chunk 13 engineering verified; five layouts, exact visual acceptance open |
| Blog/category/author listings | Chunk 14 engineering verified; 20 layouts and Blog query views, exact visual acceptance open |
| Remaining page content | 118 captured pages local; all 107 active layouts covered; Chunk 20 full gate passes 1,140 tests, visual/state acceptance remains open |
| Owner-directed redesign | Next priority under D-17; page order/direction and design locks belong to the owner |
| Expanded Arabic coverage | Planned after design lock and confirmed phase transition; current 14 Arabic pages are not a verified complete translation map |
| Sanity and staging | Not started |
| Replacement-site visual, functional and SEO acceptance | Open; no route accepted |
| Launch authorization and cutover | Pending release evidence |

## Documentation tools

From the workspace root:

```powershell
.\.venv\Scripts\python.exe docs/tools/check_docs.py
.\.venv\Scripts\python.exe docs/tools/check_docs.py --with-evidence
.\.venv\Scripts\python.exe docs/tools/render_page_matrix.py
```

The checker validates internal documentation links, register coverage and status consistency. `--with-evidence` additionally requires the original external evidence files and verifies frozen fingerprints; use it in this workspace or after CI retrieves the evidence. Without that flag, unavailable external evidence links are reported as deferred. The renderer refreshes the page matrix after deliberate route-register edits. Existing archive commands are documented in [scripts/README.txt](../scripts/README.txt). Application commands are documented in Chunk 1 and later chunk runbooks. The current complete gate is npm run verify:visual-engineering; real CMS, integration and deployment checks remain open.


