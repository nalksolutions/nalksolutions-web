# Chunk 14 — Blog, category and author listings

Status: engineering verified. October 18, 2026 (Asia/Karachi). No visual or release acceptance.

## Scope and source contract

Reconstruct the 20 ordinary listing destinations in [Chunk 12](12-active-navigation-scope.md):
Blog, 14 category/pagination paths and five author pagination paths. These are already served
with complete captured content; this chunk replaces baseline presentation with reviewed layouts.
Keep paths, metadata, complete card text, relationships, pagination, source heading levels and
existing noindex directives. Do not change route acceptance fields or reconstruct disconnected demos.

| Public path                                                                  | Source route ID      |
| ---------------------------------------------------------------------------- | -------------------- |
| `/author/uhj1984yahoo-com/`                                                  | `R-4d78069f8d8b6ecf` |
| `/author/uhj1984yahoo-com/page/2/`                                           | `R-3b2c13b643010af3` |
| `/author/uhj1984yahoo-com/page/3/`                                           | `R-26f86701b69092b6` |
| `/author/uhj1984yahoo-com/page/4/`                                           | `R-e694596eeb7dbf6a` |
| `/author/uhj1984yahoo-com/page/5/`                                           | `R-a1c9afeaf46c1fa5` |
| `/blog/`                                                                     | `R-8523d897404fbce9` |
| `/category/ai-automation/`                                                   | `R-84be103eebe17b09` |
| `/category/custom-software-apps/`                                            | `R-d2577f7bd6af225b` |
| `/category/digital-marketing-strategy/`                                      | `R-4cd90575d3ca57e7` |
| `/category/digital-marketing-strategy/content-marketing/`                    | `R-20fc6ab9d04e9a67` |
| `/category/digital-marketing-strategy/email-marketing-marketing-automation/` | `R-8cd22e986d3713b9` |
| `/category/digital-marketing-strategy/google-ads-paid-advertising/`          | `R-731e42a2ed09ea10` |
| `/category/digital-marketing-strategy/page/2/`                               | `R-5d7c48759714228a` |
| `/category/digital-marketing-strategy/page/3/`                               | `R-d3d46126ceae4812` |
| `/category/digital-marketing-strategy/seo/`                                  | `R-c8936b0a4081d196` |
| `/category/digital-marketing-strategy/video-marketing/`                      | `R-11bda722f67cf07c` |
| `/category/marketing-automation/`                                            | `R-b16ef47077981333` |
| `/category/uncategorized/`                                                   | `R-6bd0be0ae2b84166` |
| `/category/uncategorized/page/2/`                                            | `R-ccff881f6fef50e4` |
| `/category/website-development/`                                             | `R-1f0c28d75ae49e1f` |

The [route register](../registers/routes.json) resolves these IDs to frozen HTML and screenshots.
`tooling/sources/site-recovery.generated.json` records their recovered headings, text hashes,
stylesheet provenance and ordered card targets. The public query views below share the Blog ID.

Blog uses entry template 110 and a three-column desktop grid, stacked at 1180px and below.
Category template 133 and author template 136 share entry template 152, a desktop sidebar,
stacked sidebar below 1180px and stacked image/copy cards below 768px. Featured sidebar cards
use template 149. The author panel retains its recovered avatar and source name. The source
uses two different `71-background-2.webp` upload paths for Blog and archives; recover each from
the backup with provenance. Runtime code receives semantic roles and allowlisted assets only.

The frozen archive has only the initial Blog view. Its visible pagination uses
`?cmsmasters-page-c1619d2=2` through `=5`, while category/author pages use nested paths.
Supplementary read-only captures on October 18 establish the four linked Blog query views,
with the same Blog title and root canonical. Their 34 cards plus the initial nine cover the
43 already-captured articles. Preserve and hash this additional evidence separately; never
replace the October 15 archive. An out-of-range page-6 observation is an empty HTTP-200 Blog
view. Malformed/plugin-specific query variants are outside exact preservation acceptance.

## Implementation boundaries

- `tooling/listing_content.py`: reviewed template/section/card roles, source validation and
  text/heading/link reconciliation. Unknown templates, widgets and backgrounds fail recovery.
- `tooling/prepare-site.py`: offline content/media generation and supplemental query-view checks.
- `src/content/site/schema.ts`: listing-family/layout and finite Blog view validation.
- `src/content/site/listing-view.ts`: pure, bounded query-view selection. The page reads Next's
  asynchronous `searchParams`; the selected nodes retain the same resolved published/SEO identity.
- `ListingPage`: server-rendered composition through the existing `CapturedPageFrame`.
- `src/styles/listings.css`: scoped typography, grid/rows, crops, badges, sidebar and pagination.
- Query selection: server rendering of supported Blog views, preserving the root SEO identity;
  no client-only pagination, arbitrary content-file selection or WordPress runtime dependency.
- Existing local search remains a small Client Component. The listing context selects its source
  field/button treatment; hydration readiness and associated accessible labels are retained.

Supplemental HTML lives in `migration-review/blog-query-pages/`; the exact URLs, timestamps and
hashes are pinned by `tooling/sources/blog-query-evidence.json`. Recovery verifies all query-view
SEO fields and JSON-LD against the frozen Blog identity, validates each card against the archived
author journeys, and hashes complete converted text. These inputs are fingerprinted in the final
gate manifest and excluded from application imports and build traces. Media now totals 960
images/variants, 386,398,214 bytes: nine additional backup assets, 5,693,378 bytes.

`tooling/theme_evidence.py` supplies shared source-derived heading sizes to the existing company
and new listing expectations. `tooling/listing_evidence.py` independently recovers reviewed grid,
hero-padding and photo-height expectations. Blog keeps its source `h4` tags while applying the
source entry template's smaller h5 typography; headings are not rewritten for styling.

Browser diagnostics are shared with the company-page suite. Only same-origin `fetch` requests
with `_rsc`, explicitly allowed journey paths and the three observed cancellation codes may be
recorded as expected navigation cancellations. Every cancellation is attached to the test report.
Images, fonts, stylesheets, scripts, failed HTTP responses, console errors and other request
failures remain failures. Two unit cases verify this boundary, including required-resource probes.

## Ordered delivery and verification

1. Preserve the passing Chunk 13 baseline and documentation/evidence result: 149 routes,
   67 legacy rules, zero accepted replacement routes. Inspect all three archived viewport designs.
2. Recover and validate listing structures, source styles and supplemental query views; compare
   complete text/headings/links with the baseline converter and known article identities.
3. Implement the server layout and responsive styles without changing other page families.
4. Verify all 20 paths and linked pagination views through production HTTP. Test direct entry,
   refresh, canonical/noindex metadata, card order and exact content. Exercise keyboard/search,
   pagination and cross-language article navigation in Chromium, Firefox and WebKit, plus
   Chromium desktop/tablet/mobile/320px. Capture all 60 archived-view diagnostic screenshots.
5. Review source/current pairs before freezing the full gate; fix material layout problems.
6. Run `npm.cmd run verify:listing-pages`, inspect the complete production reports and update
   this document, the index and acceptance register with the actual evidence. The command must
   include all existing source/quality/unit/HTTP/browser checks and exit nonzero on any failure.

Use Node 24.15.0, npm 10.8.2 and the pinned existing Python environment. No dependency change
is planned. Production tests use the harness-owned loopback port 3100; leave preview port 3000
running. Freeze implementation/test/tooling inputs during the final gate and audit final docs edits.

## Completion evidence

The complete unfiltered `npm.cmd run verify:listing-pages` gate passes all 15 mandatory checks
and **907 tests**: 56 Python contracts, 26 Vitest cases, 231 production HTTP cases and 594 browser
cases. HTTP/browser reports have zero unexpected, skipped or flaky cases. The final run started
at 06:24:15 UTC and finished at 06:46:31 UTC on October 18 (11:24–11:46 in Asia/Karachi).

- Evidence: `tmp/chunk14/2026-10-18T06-24-15-315Z/manifest.json`.
- Build: `90Iq0ZSKoSCTN1h00-0cV`.
- Source digest: `7f9fc6b5d4d5940433341de1552289e039556dd91a7ef0a39284e353c7d91743`.
- The manifest fingerprints 1,348 inputs, including the five separately captured Blog query
  responses. All 15 command logs have recorded checksums. `http/results.json`,
  `browser/results.json`, HTML reports, screenshots and traces retain production evidence;
  `runtime.json` records an unfiltered selection and the owned server's shutdown.
- `visual-review.json` records all 60 historical/current full-page pairs. All 60 final screenshots
  are byte-identical to the focused-run captures reviewed below. Remaining differences stay open.
- `documentation-review.json` audits the input inventory, log integrity and build identity;
  only this runbook, the two indexes and the acceptance note change after the gate.
  `post-gate-quality.json` records final documentation/evidence and formatting checks.
  `post-gate-checks.json` records all 20 preview paths, five query views and port-3100 cleanup.

The existing port-3000 preview remains running. Dependencies and lockfile are unchanged.
All 149 route acceptance fields remain unaccepted.

### Focused and failed-run history

The source and focused development checks currently pass 56 Python tests and 26 Vitest cases.
The five production query-view HTTP cases pass. The first focused browser run at
`tmp/chunk14-focused` passed all 40 desktop/tablet layout cases but failed its error monitor on
intentional router refresh cancellations during query/history navigation. It remains failed
evidence. No application behavior, retries or timeout thresholds changed; the narrow shared
diagnostic classifier above records the cancellations. `tmp/chunk14-focused-02` passed those
flows but exposed a test assumption that author pagination should have a canonical. The source
has none; the test now explicitly preserves the destination identity's canonical absence and
noindex directive. Both failed runs remain preserved. The complete passing gate above supersedes
these failed runs without discarding their evidence.

`tmp/chunk14-focused-03` passed 64 cases before Firefox reported an image decode error while
the test reloaded page 2 during an active PNG transfer. The 570,299-byte PNG matches backup
hash `55fde1fcb0c509516d6a807d23172e7c4b54ea16cda7c51b15a1da25546c5e5b` and fully decodes.
The trace places reload inside that response's transfer interval. Listing journeys now explicitly
decode all main-region images in each visited view before leaving/reloading it, verifying the
resource rather than allowing the test to interrupt its decode. No asset bytes changed and no
image/console failure is ignored. The failed trace remains preserved.

`tmp/chunk14-focused-04` passes all 78 browser cases with zero skipped, unexpected or flaky
results. This includes all 60 layout captures and the three navigation journeys in each of six
browser profiles. Its `visual-review.json` records source/current hashes and dimensions for
60 full-page pairs. All 12 contact sheets were reviewed across desktop, tablet and mobile.
Card order and the three layout families align with the source; small crop, text-wrap,
pagination-spacing and shared-footer geometry differences remain open. This is a diagnostic
review, not pixel acceptance. Implementation, test and tooling inputs stayed frozen throughout
the full gate.

## Open fidelity and integration gates

Source/current comparisons cover the three layout families at all archived widths.
Final source/current captures remain diagnostic, with spacing, wrapping, hover and exact geometry
acceptance open. The shared tablet header's missing Get Started button remains an existing visual
item. Blog's source purple pagination contrast is preserved and remains an accessibility-review
item; no contrast exception is accepted. Local search retains deliberate local index semantics,
not WordPress query-result pages or real Sanity search. No whole-page acceptance follows from a
passing layout or source-content test.

Supplementary Blog query HTML was captured on October 18, while the original page/screenshots
remain the October 15 baseline. Query-view card/SEO reconciliation passes against those archived
articles, but no historical query-view screenshots existed in the original archive. Their exact
visual acceptance remains open alongside the initial Blog view's remaining differences.

The complete unfiltered engineering gate, supplemental-source checks and reviewed diagnostic
captures pass. First-pass layouts cover 99/107 active content pages, leaving the eight secondary
sitemap journeys. These counts are not visual acceptance.
Exact per-page fidelity, source query edge cases, real Sanity indexing/publishing, forms/maps,
complete integration/state review, CI/staging and deployment remain separate gates. Captured
listing cards do not yet become a live Sanity query when a fixture article is published.
