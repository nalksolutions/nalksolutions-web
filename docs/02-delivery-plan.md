# Delivery plan

Status: active local layouts and reconstruction engineering verified through [Chunk 20](chunks/20-article-fidelity-follow-up.md). D-17 sets the current redesign-first sequence. Historical migration phases below retain their outstanding recovery, CMS, CI, integration, verification and release obligations.

## Current owner priority: redesign, lock, then Arabic

Follow the [redesign and Arabic delivery plan](12-redesign-and-arabic-delivery.md) under
[D-17](registers/decisions.md). The owner selects page order and redesign direction. Preserve
content/SEO, implement and test the selected scope, resolve feedback and record design lock.
Arabic versions use those locked redesigned pages as their source after the owner confirms
the phase transition. Do not begin the earlier proposed Arabic pilot, bulk translation or
localization setup during unfinished redesign by default. A page/batch can be released earlier
only through explicit owner direction for that locked scope.

This section governs the immediate queue. Historical coverage-first batches below are not new
instructions to reconstruct already implemented pages or to start Arabic/Sanity work ahead of
the current design priority. No next page or completion date is assigned by this plan.

## Sequencing and tracking

The owner changed delivery sequencing on October 17, 2026: prioritize complete local page coverage, then refine the complete site. Routing and repository contracts remain prerequisites; unresolved pixel differences in the existing vertical slice no longer block recovery and implementation of other page families. Source recovery, asset work and schema design can proceed independently where their prerequisites are available.

The historical local-content milestone is complete: 118 captured HTTP 200 pages render locally.
The owner's D-16 clarification and [Chunk 12 navigation audit](chunks/12-active-navigation-scope.md)
select 107 active pages for reconstruction, with eleven disconnected project/demo pages excluded
from further layout work. The five primary company, 20 ordinary listing and eight secondary
layout batches were subsequently implemented through Chunks 13-15. Track content coverage separately
from responsive design, interactions, real CMS publishing and final acceptance. Do not label a
route complete merely because it returns 200. No delivery date has been agreed; establish a
remaining-work estimate from template complexity and measured batch throughput.

Use task IDs below in commits/issues and evidence. Track per-page progress in [routes.json](registers/routes.json), business decisions in [decisions](registers/decisions.md), and requirement coverage in [acceptance](registers/acceptance.md). Status values are `not_started`, `in_progress`, `blocked`, `ready_for_review`, and `accepted`; a blocker includes its dependency and the work that can continue.

Owners below are roles: implementation lead, content/editorial reviewer, visual/QA reviewer, and project owner. Do not invent completion dates. Estimate implementation effort after Phase 1 and the vertical slice establish template complexity and review throughput.

## Phase 0 — Preserve evidence and establish recovery

Prerequisite: supplied backup and archive. Owner: implementation lead, with owner input for external accounts.

- **P0.1:** Verify the frozen input manifest, archive hashes and registers. Record the current baseline identifier; retain the original audit and screenshots.
- **P0.2:** Demonstrate isolated WordPress restoration and inspect template assignments, child-theme changes, custom code, forms and relevant plugin settings. Disable outbound effects in the restored copy.
- **P0.3:** Collect missing navigation, slider, focus, search, validation and language states. Document which require the live site versus the restored copy.
- **P0.4:** Reconcile Search Console, analytics, backlinks and server/CDN rules with the known URL union. Add newly established URLs to the route register with evidence.
- **P0.5:** Recover hosting, DNS/email, analytics, form and asset dependencies. Record account/secret references privately; populate decision owners and required-by gates.

Deliverables: restore record, evidence manifest, interaction inventory, public-asset candidate inventory, expanded route evidence and configuration checklist.

**Gate G0:** source/backup recovery is demonstrated or explicitly recorded as an unresolved recovery gate; all known evidence is accessible, hashes match, and each missing input has an owner. Existing capture verification is already established; it does not close P0.2–P0.5.

## Phase 1 — Resolve scope and prove difficult routing behavior

Prerequisite: G0 evidence and a candidate hosting runtime. Owner: implementation lead; project owner resolves disputed business behavior.

- **P1.1:** Review all 149 route dispositions and 67 legacy rules. Keep 200/noindex pages by default; reconcile redirects whose targets are retired or unrelated.
- **P1.2:** Assign and inspect actual template families. The register's inferred family labels are discovery aids, not approved component boundaries.
- **P1.3:** Build a minimal production-mode routing prototype covering `/`, an English root article, an Arabic slug, a nested category, pagination, a newly added article, unknown paths, a literal-asterisk rule, 301 and 410. Use a controlled public-content adapter/fixtures if a development Sanity dataset is not yet available.
- **P1.4:** Validate server-emitted `lang`/`dir`, exact statuses under GET/HEAD, canonical/public paths, locale inference, internal-route protection, cache isolation and article publication without a manual deploy.
- **P1.5:** Select the real 410 delivery mechanism and metadata/404 behavior on the deployment target. Verify behavior before and after a cold request, cache hit and client navigation. Do not rely on a development-server result.
- **P1.6:** Close or schedule decisions that affect shell variants, content ownership, asset delivery and form providers. Record the architectural choice in ADR-0002.

Deliverables: routing contract tests, runtime evidence, approved route policy, template inventory, updated ADR and prioritized implementation backlog.

**Gate G1:** all prototype cases pass, route and language behavior is explicit, and unresolved product decisions have preservation defaults. Fixture-backed new-route tests prove the routing contract here; real Sanity publication/revalidation must additionally pass G5. A failed locale/status prototype blocks architecture expansion, not independent content/asset inspection.

## Phase 2 — Establish the application foundation

Prerequisite: G1. Owner: implementation lead.

- **P2.1:** Initialize version control and a single application package. Protect private backups and bulky evidence; commit the plan, lockfile and small test manifests. Configure the selected supported Node/package versions and clean-install instructions.
- **P2.2:** Scaffold Next.js App Router, TypeScript strict mode and Tailwind using the verified architecture. Pin compatible dependencies; add environment validation and a secret-free example configuration.
- **P2.3:** Establish routing/content/SEO boundaries, structured diagnostics, typed shared contracts and the public error shell. Introduce only folders that have implemented responsibilities.
- **P2.4:** Add format, lint, typecheck, unit/component tests, production build and documentation checks in CI. Add narrow import-boundary checks and fail on unexpected application warnings.
- **P2.5:** Establish protected staging, deployment artifact identity and the fixed visual test runner. Match browser, fonts, timezone, locale and viewports; measure reference repeatability.

Deliverables: reproducible clean checkout/build, minimal deployed vertical route, CI checks, environment matrix and baseline comparison harness.

**Gate G2:** a clean installation builds and deploys; checks run in CI; no secrets/private archives ship; unknown/retired routes emit tested statuses; no broad client-only shell has been introduced.

## Phase 3 — Recover content, media and design data

Prerequisite: source evidence; integrate with G2 contracts. Owners: implementation lead and content reviewer.

- **P3.1:** Extract immutable WordPress IDs, bodies, dates, authors, taxonomies, alt text, captions, SEO and original paths into a normalized intermediate model.
- **P3.2:** Build a public asset allowlist from content/template/CSS references and observed requests. Recover originals and required variants; exclude PHP, logs, caches, private uploads and credentials.
- **P3.3:** Produce a media map containing original URL/path, archive member, checksum, dimensions, destination and reference counts. Resolve external media and fonts; record replacements separately.
- **P3.4:** Extract actual typography, layout widths, breakpoints, section spacing and style variants. Produce a template/component map with reference routes and measured exceptions.
- **P3.5:** Inventory unsupported rich-content structures and create representative fixtures, including long code blocks, tables, Arabic content, links, embeds and captions.

Deliverables: intermediate content export, asset map, font inventory, design-token specification and conversion-loss report.

**Gate G3:** every required reference resolves to recovered media or a tracked decision; no content block is silently dropped; public asset publication is allowlisted; templates are measured rather than guessed.

## Phase 4 — Build and accept the vertical slice

Prerequisites: G2, G3 and relevant business decisions. Owners: implementation lead and visual/QA reviewer.

- **P4.1:** Implement shared header/footer/navigation variants, tokens, containers, buttons, typography and responsive behavior.
- **P4.2:** Rebuild the English homepage and one complex service/location page with real assets and complete content.
- **P4.3:** Implement an English article, the API article with code/tables where applicable, and an Arabic article/page using the actual content model. Include listing/category behavior.
- **P4.4:** Add navigation/search/FAQ and relevant slider states with keyboard/focus behavior. Exercise mobile/tablet variants and missing-media fallbacks.
- **P4.5:** Run visual, content, SEO, route, accessibility and initial performance checks. Correct shared defects before copying patterns into more pages.
- **P4.6:** Review module boundaries, component APIs, dependency footprint and documentation against [engineering standards](04-engineering-standards.md).

Deliverables: accepted representative templates and shared shell; fixed-environment comparison reports; proven import/rendering contracts; initial calibrated performance budgets.

**Gate G4:** no unexplained design/content differences in the vertical slice; behavior works; semantic corrections are recorded; layout abstraction supports real variants without a giant conditional component. Reference acceptance remains required for visual/release acceptance. Under the October 17 coverage-first instruction, it does not block local content rollout.

## Phase 5 — Implement and verify the Sanity workflow

Prerequisites: G2, G3 and a representative accepted article renderer. Owners: implementation lead and content/editorial reviewer.

- **P5.1:** Define schemas, validation, reserved-path checks and generated types. Separate immutable legacy identity from editorial fields.
- **P5.2:** Implement idempotent media/content imports with dry run, explicit dataset selection, checkpoints and an allowlist of fields the import owns.
- **P5.3:** Import a representative development-dataset batch and reconcile every rich-content structure. Re-run it to prove no duplicate documents/assets.
- **P5.4:** Import retained articles/taxonomies/authors; reconcile active articles versus redirecting/retired WordPress records. Preserve drafts privately where required without publishing them.
- **P5.5:** Implement authenticated preview, safe preview exit, signed webhook handling and targeted cache invalidation. Demonstrate publication, update, unpublish and new-path visibility.
- **P5.6:** Exercise the editor workflow with actual users/roles. Write supported-format, publishing and recovery instructions using screenshots only where they help.

Deliverables: schema definitions/types, import scripts/logs, reconciliation report, editorial guide, preview/revalidation tests and dataset backup/recovery procedure.

**Gate G5:** retained content matches source; repeated imports are safe; new articles work at root paths; drafts and secrets stay private; editor operations and failure recovery are demonstrated.

## Phase 6 — Complete every retained page and route

Prerequisite for local coverage: the verified local routing/content foundation and recovered source content. G4 and G5 remain prerequisites for final visual acceptance and real CMS workflow acceptance respectively. Owners: implementation lead, content reviewer and visual/QA reviewer.

Owner clarification D-16 supersedes archive-wide reconstruction as the selection rule. Before
the next family rollout, map active desktop/mobile header, dropdown and footer links and their
visitor-facing linked pages/subpages. Reconcile that navigation scope against the captured
inventory, recording incoming-link evidence and in-scope/archive-only/review dispositions.
Only confirmed in-scope pages proceed to further reconstruction. Existing coverage counts do
not establish the release page count; excluded public URLs require reviewed SEO handling
before any runtime removal or response change. Keep all baseline rows as historical evidence.

- **P6.1:** Roll out confirmed in-scope pages in coherent families: corporate pages, service/location pages, Arabic variants, articles and their visitor-facing listings/subpages. Reconstruct profile/project/demo pages only if the navigation scope review establishes that they belong to the active site.
- **P6.2:** For each route, implement its complete content and unique interactions, connect correct media, and verify canonical/indexability/language/status behavior.
- **P6.3:** Run all three captured viewport comparisons for every route. Record acceptance evidence and exceptions in the route register; inspect the full page, not only the first viewport.
- **P6.4:** Verify every legacy rule and required media compatibility URL independently of page screenshots.
- **P6.5:** Perform cross-page consistency checks: shared sections, typography, CTA destinations, current navigation/active states, locale links, related content and footer differences.

Deliverables: complete route implementation, per-page reports, legacy/media route coverage, updated registers and resolved defects.

**Gate G6:** every in-scope route has a deliberate implemented disposition and required acceptance evidence. No retained page is omitted because it resembles a template; noindex is preserved where applicable. All 149 baseline rows and the legacy-rule union are accounted for through explicit scope/SEO dispositions, not an obligation to reconstruct every archived page.

## Phase 7 — Complete functional integrations

Prerequisites: G2 and accepted relevant UI. Owner: implementation lead; owner confirms destinations/accounts.

- **P7.1:** Reproduce live form fields and validation; implement server validation, abuse controls, accessible feedback and explicit delivery failures.
- **P7.2:** Verify a controlled message through the selected real transport to an agreed test recipient, including errors/timeouts/duplicates; document production recipients by secret reference.
- **P7.3:** Verify search coverage, empty/error states, pagination and safe query handling across supported languages/content types.
- **P7.4:** Configure analytics, consent behavior, conversions and Search Console verification; exclude preview/test traffic as supported and verify event deduplication.
- **P7.5:** Exercise Sanity/hosting/provider outage behavior and monitoring without exposing private data in logs.

Deliverables: integration evidence, event/consent map, transport runbook and failure alerts.

**Gate G7:** UI success corresponds to actual accepted delivery/persistence; critical integrations work and their failures are visible; no test submits to unconfirmed real recipients.

## Phase 8 — Full release-candidate verification

Prerequisites: G5–G7. Owners: implementation lead and independent QA/visual review role.

- **P8.1:** Run the production-mode full route/content/SEO/visual suite. Check the public URL union and invalid-path probes under GET/HEAD.
- **P8.2:** Run browser/real-device, keyboard, screen-reader, zoom, reduced-motion, RTL and breakpoint-boundary reviews.
- **P8.3:** Check representative and worst-case performance, bundle/media budgets, security boundaries, preview cache isolation and dependency findings.
- **P8.4:** Reconcile every exception, unresolved defect and requirement. Check docs against the actual commands/files/configuration.
- **P8.5:** Package a release candidate with commit/artifact IDs, dataset snapshot, route map, test environment, reports and rollback references.

**Gate G8:** zero unresolved release-blocking defects; every required test is passing or has an explicit justified exception; every route is accepted; no unsupported claim of pixel or SEO parity remains.

## Phase 9 — Rehearse and refresh the final migration

Prerequisite: G8 and verified operational access. Owners: implementation lead and project owner.

- **P9.1:** Rehearse deployment, configuration, import/revalidation and rollback on the target platform. Time recovery and retain evidence.
- **P9.2:** Schedule an agreed content freeze or reconcile all edits through a defined cutoff. Take a fresh database/uploads export and new dated public capture.
- **P9.3:** Apply the idempotent delta import and code/data changes. Compare source changes separately from implementation differences.
- **P9.4:** Re-run affected tests and the complete mandatory release suite against the frozen release candidate. Review DNS/email/TLS/verification records and remove staging-only indexing controls from production configuration.

**Gate G9:** content cutoff, final reports, operational configuration and rollback are verified. Present the concrete release package for cutover authorization; do not ask the owner to approve an unbuilt or untested proposal.

## Phase 10 — Cut over and verify production

Prerequisite: G9 and authorized cutover. Owner: implementation lead.

Follow the exact [cutover runbook](10-release-and-operations.md): deploy the verified artifact/configuration, change only intended DNS/routing records, test production URL/status/metadata/asset behavior, verify controlled integrations, confirm indexing controls and begin monitoring. Preserve the old environment and backups.

**Gate G10:** production smoke checks pass from the public hostname; real traffic/crawlers are served successfully; mail routing remains correct; any rollback trigger has an owner actively watching it.

## Phase 11 — Stabilize and hand over

Prerequisite: G10. Owners: implementation lead, QA reviewer and project owner/editor.

- Review early production errors, delivery failures, unusual 404/410/redirect behavior and performance continuously during the launch window.
- Check the site on days 1, 3, 7, 14 and 28 after launch. Compare traffic/indexing with seasonality and source changes; investigate rather than promise fixed ranking outcomes.
- Correct defects through the same tests and change controls. Keep redirects and old-media compatibility maintained.
- Complete editor/developer/operations guides, restore exercise and ownership handover. Retire old hosting only after traffic/DNS and rollback requirements permit it.

**Gate G11:** stable production evidence, accepted handover and a recorded ongoing owner for content, dependencies, monitoring and recovery. Remaining nonblocking work is explicit, not hidden under a claim that everything is done.
