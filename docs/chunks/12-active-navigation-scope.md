# Chunk 12 — Active navigation scope reconciliation

Status: live navigation audit complete; no runtime routes removed or accepted. Reconciled October 18, 2026 (Asia/Karachi), from requests taken just before midnight on October 17.

## Purpose and authority

The owner clarified that reconstruction covers the active, user-accessible site linked through
the main header/footer and its pages/subpages. Archive membership alone is insufficient.
[D-16](../registers/decisions.md) supersedes archive-wide reconstruction as the selection rule.
Chunks 9–11 remain accurate historical coverage reports; they do not define the release scope.

This chunk establishes the next implementation selection without deleting prior work, changing
the frozen archive, altering HTTP behavior, or authorizing deployment.

## Findings

| Classification                     | Content pages | Meaning                                                                                                                   |
| ---------------------------------- | ------------: | ------------------------------------------------------------------------------------------------------------------------- |
| Ordinary visitor journeys          |            99 | Reachable from home through header/footer, body links, listings, article relationships, categories, authors or pagination |
| HTML-sitemap-only visitor journeys |             8 | Reachable through the footer's visible HTML sitemap and its linked pages; kept explicit below                             |
| Total active reconstruction scope  |           107 | Live HTTP 200 pages with a link journey from those entry points                                                           |
| Archive-only content               |            11 | Nine project demos and two project-category pages form a disconnected component                                           |

The 31 archived redirect/gone rows remain separate compatibility records; all 67 configured
legacy rules also remain unchanged. These counts overlap and must not be added as unique URLs.
The audit captured 144 distinct paths: 118 HTTP 200, 13 HTTP 301 and 13 HTTP 410, with zero request
errors. Five other archived compatibility paths were not linked by this navigation graph and
were not re-probed here. No reachable path outside the existing archive was discovered.

All 43 articles and all 30 reconstructed service/location pages have active link journeys.
Noindex is not used to determine scope: an accessible noindex page may still be in scope.
The exact path classifications, link journeys, response statuses and source fingerprints are in
the [machine register](../registers/navigation-scope.json); the [generated page list](../registers/navigation-scope.md)
is the readable reconstruction inventory.

## Secondary journeys through the visible HTML sitemap

These eight HTTP 200 pages are included because the sitemap is an actual footer destination,
not because an XML sitemap or WordPress export lists them:

- `/image-credits/`
- `/our-team/`
- `/cmsms_profile/daniel-foster/`
- `/cmsms_profile/liam-carter/`
- `/cmsms_profile/maya-brooks/`
- `/cmsms_profile/ethan-white/`
- `/cmsms_profile_category/startup-growth-strategist/`
- `/cmsms_profile_category/lead-ux-ui-designer/`

The team page also links to six currently gone profile/taxonomy destinations. Those are source
broken journeys, not six additional pages to resurrect. Their exact paths and initial responses
remain in the capture and compatibility register. Preserve the current status contract until a
specific link/content correction is recorded. A later owner adjustment can exclude the eight
secondary pages, but the navigation evidence does not support silently calling them orphaned.

The nine project demos and two project taxonomies link among themselves but have no incoming
journey from the active site. Stop further visual reconstruction of those eleven. Their existing
local baseline content is retained until an SEO disposition is reviewed before release; this
audit does not select deletion, redirect targets or replacement statuses.

## Method and evidence

1. Inspect the live homepage, Services, Blog and visible HTML sitemap. Use the captured route
   register to identify existing pages to probe, not to seed inclusion.
2. Request the 118 archived HTTP 200 paths and follow newly discovered public-path references
   within a 250-path cap, with four request workers. Redirects are not followed automatically;
   each approved-origin hop is captured separately with its original Location.
3. Store each response and its SHA-256 under the ignored, dated evidence directory. Extract
   anchor links from header/footer and main/singular/archive content roots. Ignore fragments,
   mail/phone/external links, query URLs, assets and WordPress system paths for page discovery.
4. Exclude links explicitly hidden at all three Elementor breakpoints, hidden/template/noscript
   roots and inline `display:none`. Do not exclude ordinary responsive variants or collapsed
   menu classes. Header dropdown and mobile markup remain discovery evidence.
5. Traverse from home, following eligible links and explicit redirect hops. HTTP error documents
   cannot propagate reachability. Run the same traversal without HTML-sitemap body links to
   distinguish ordinary journeys from sitemap-only journeys.
6. Independently render home in Chromium at 1440×1000 and 390×844, open the mobile popup and
   compare the browser DOM header/footer targets with captured source extraction. Both views
   match the same 16 non-home internal entry targets; no missing or extra targets were found.
7. Verify every captured source hash and reproduce its extracted links before generating the
   scope register. Keep route IDs, paths, shortest journeys, incoming-link counts/examples and
   source hashes. All incoming links remain available in the capture.

Evidence lives under `tmp/navigation-scope/2026-10-17-live/`: `capture.json`, hashed response
HTML, `browser/navigation.json`, desktop/mobile screenshots and the opened-mobile-menu capture.
These are new read-only source observations, not replacements for the frozen October 15 archive.

The capture determines link reachability, not full visual/state correctness. It does not execute
every interaction on every page, prove all CSS visibility rules, search arbitrary query results,
or certify content freshness. Search/XML sitemap/database discovery alone does not expand this
scope. JavaScript-only destinations found during future page review must be reconciled explicitly.
The existing content/design baseline stays frozen until a separate source-delta review.

## Commands and checks

Use the existing Python environment and pinned Beautiful Soup dependency. No new package is needed.

```powershell
# New evidence only: choose a new, unused directory for a fresh live capture.
.\.venv\Scripts\python.exe tooling/audit-navigation-scope.py --capture --evidence tmp/navigation-scope/NEW-DATED-DIRECTORY

# Offline regeneration from the preserved scope capture.
.\.venv\Scripts\python.exe tooling/audit-navigation-scope.py --evidence tmp/navigation-scope/2026-10-17-live

# Offline source/hash/link and generated-register consistency check; writes nothing.
.\.venv\Scripts\python.exe tooling/audit-navigation-scope.py --check --evidence tmp/navigation-scope/2026-10-17-live

.\.venv\Scripts\python.exe -m unittest discover -s tooling/tests -v
.\.venv\Scripts\python.exe docs/tools/check_docs.py --with-evidence
npm.cmd run format:check
```

All 49 Python tests pass, including nine navigation-scope cases covering safe discovery limits,
single-decoded Arabic identity, dropdowns, hidden responsive content, deduplication, disconnected
pages, HTML-sitemap distinction, redirect cycles/external targets, and non-200/non-HTML documents.
No application source, dependencies, generated runtime manifests or acceptance fields change.
The previous 772-test application gate remains historical Chunk 11 evidence; it was not rerun or
extended into a claim of new visual acceptance by this audit.

## Next implementation batches

The active scope contains 74 pages with existing reconstructed first-pass layouts and 33 with
baseline layouts. Exact visual acceptance remains open across both groups.

1. Reconstruct five primary corporate/company destinations: `/about-us/`, `/our-services/`,
   `/contacts/`, `/شركة-تقنية/` and `/nalk-solutions-sitemap/`. Preserve source-specific differences
   rather than forcing them through the service hero template. About/Contacts currently have no
   source main h1; keep that source issue explicit. Recover required backgrounds from backup with
   provenance. Shared components cover real repeated sections only.
2. Reconstruct the 20 ordinary blog/archive destinations: Blog, 14 category/pagination pages and
   five author listings. Keep complete crawlable article cards, paths, metadata and pagination.
3. Reconstruct the eight secondary sitemap journeys: Image Credits, Our Team, four existing
   profile pages and two existing profile-taxonomy pages. Preserve noindex where recorded and
   separately record the six gone team destinations; do not create missing profiles.
4. Complete cross-site visual/interaction review, real Sanity workflow and integrations before
   release. Resolve the eleven archive-only URLs' SEO dispositions before altering release routes.

Each implementation batch requires source-derived content/SEO checks, production HTTP verification,
all archived viewport captures, relevant browser/keyboard flows, code review and documentation
reconciliation. Background/media recovery must remain offline and allowlisted. Native controls
must preserve accessible state behavior. Forms must not claim delivery while transport remains
unconfigured; embedded-map parity and form delivery remain explicit integration gates.

No route is accepted, removed or deployed by this scope reconciliation.
