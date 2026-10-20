# Chunk 15 — Site-wide visual and motion alignment

Status: site-wide alignment/motion implementation and engineering verification complete;
exact visual acceptance remains open. October 18, 2026 (Asia/Karachi).

## Contract

Align all 107 active content pages with the frozen WordPress design at desktop 1440×1000,
tablet 768×1024 and mobile 390×844. The eight secondary sitemap destinations remain part of
this scope. Do not interpret the earlier 99 reconstructed layouts as 99 accepted pages.
Keep all original evidence unchanged. Preserve the recorded contact, readable-link, sharing
and Arabic-semantics decisions. Do not deploy or change compatibility dispositions.

Use frozen HTML, rendered DOM, screenshots, backup CSS and media for content/design identity.
Observe the live website separately for motion and hover behavior; newer live content does not
silently replace the frozen migration content. Capture date, URL, viewport and observations.
New live observations live under `tmp/visual-alignment/`, outside application imports.

## Work sequence

1. Inventory source entrance settings and source animation definitions across the active scope.
   Record each effect, delay and responsive override. Verify live duration/easing and buttons.
2. Recover a script-free reference from the frozen rendered DOM and backup assets. Measure
   shared header/footer, typography, containers and content landmarks; retain original screenshots
   alongside the aligned reference. Never execute captured WordPress scripts in the application.
3. Implement one small motion enhancement, using source-selected elements only. Keep content
   server-rendered and visible without JavaScript. Respect reduced motion, keyboard focus,
   navigation/history and cleanup. Use opacity/transform without changing document layout.
4. Correct shared geometry and smooth button/hover states from source evidence. Correct family
   and page-specific differences through focused components and validated recovered roles.
5. Capture every active page in all three baseline viewports. Record content, required resources,
   overflow, image/font readiness, dimensions and regional differences. Review differences before
   assigning visual acceptance. Include the eight previously baseline secondary pages.
6. Run source/data contracts, format/lint/types, production build, HTTP and browser regressions.
   Test motion separately from settled static screenshots, including reduced motion and no JS.
7. Reconcile reports and documentation. Keep unresolved fidelity differences explicit; a broad
   engineering pass does not turn a failed visual comparison into acceptance.

## Initial source findings

The first survey found 1,232 animation-related settings; four were trigger/metadata settings.
The verified inventory contains 1,228 actual entrance elements, including repeated shared
header/footer instances. The finite entrance vocabulary is fade, fade-up, fade-left, fade-right
and pop. Recorded defaults are one second with `ease`; slide distance is 60px and pop starts
at scale 0.75. Delays and mobile overrides belong to individual source elements. Verify the
actual loaded stylesheet and live computed style when duplicate plugin CSS differs.

Do not add word splitting or animate every article paragraph: article body text generally has
no configured entrance. Preserve source behavior while rebuilding the configured smooth text,
image and control entrances. All enhancements must finish in the same static layout.

## Evidence and acceptance

Starting engineering baseline: Chunk 14, 907 tests, build `90Iq0ZSKoSCTN1h00-0cV`.
Source baseline: `nalk-wordpress-2026-10-15`. Live motion observations are supplemental.
The [verification contract](../08-testing-and-acceptance.md) governs strict geometry/pixel
review. No whole-section masks, resized screenshots or inflated thresholds may conceal drift.
Route acceptance fields remain open until their individual evidence supports acceptance.

## Implementation boundaries

`tooling/entrance_motion.py` extracts only five finite effects, integer delays, responsive
overrides and the source fast/slow durations (750/2000ms). `prepare-motion.py --check` verifies
all 107 original HTML checksums, both plugin CSS definitions and the shared footer presets.
`src/content/motion` owns the validated runtime vocabulary; `SiteMotion` mounts one observer
through a small client boundary. Source-selected elements use Web Animations with the recovered
keyframes. Completion, focus, reduced-motion changes and navigation cancel owned effects;
server content remains visible without JavaScript. No WordPress/GSAP runtime is imported.
Home composition explicitly maps visible source widgets. The eight image widgets in the hidden
legacy partner grid remain hidden; the visible twelve-logo carousel retains its group entrance.
The source plugin's `animated-separate` widgets use group entrances in this implementation;
individual internal fragment sequencing remains a motion-fidelity review item.

`interactions.css` owns shared 300ms color/gradient crossfades and source 400ms/5px button shifts.
Reduced motion removes shifts/transitions. Service FAQ icons have finite dimensions and
source open/closed visibility. Listing dividers, taxonomy wrapping, read-more icons, pagination
ownership and card borders retain their source roles. About typography, its missing message
divider and responsive offerings spacing are recovered from the frozen CSS.

Service copy uses the source paragraph spacing for both left and centered widgets. Containers
use the recovered 1280px width and one mobile column gutter. Statistics captions follow the
source 24/22/18px responsive heading sizes. Native FAQ documents recover the initial active
panel from the frozen rendered HTML (the pre-script HTTP markup is closed); matching IDs and
rendered checksums prevent substituting another page's state. Padding, line height, icon space,
body paragraphs and joined borders follow the archived accordion CSS. The Arabic digital
marketing representative matches source full-page height at all three baseline widths after
these corrections. This does not accept other service states or pages automatically.

The article audit additionally recovered theme table cells, header rows, quotation blocks,
body h1/h4/h5/h6 typography and exact inline regular weights. Thirty tables in the longest
comparison article exposed the former shared spacing defect. `article_body_evidence.py`
validates the frozen theme/kit definitions independently and records their hashes; no source
stylesheet enters the application. Browser tests exercise tables, quotations and the h5-heavy
hiring article across all six browser profiles. Readable underlined links remain the approved
correction. Table scrolling remains keyboard accessible.

`SecondaryConverter` and `SecondaryPage` cover four profiles, two profile taxonomies, Our Team
and Image Credits. They reuse the existing captured-page frame and article-card styles. Exact
text/headings and SEO remain source-derived. Portraits come from frozen rendered inline CSS,
with source/rendered/CSS checksums in the recovery report. The only newly published asset is
the reviewed profile background (22,558 bytes); there are now 961 allowlisted images, totaling
386,420,772 bytes. No dependencies changed. Profile article rows use native scroll snapping and
keyboard access, not the WordPress slider. Six legacy gone profiles remain gone.

First-pass layouts now cover all 107 active content pages. The 11 disconnected project/demo
pages retain historical local coverage and require the separate SEO disposition decision.
All 149 route acceptance fields remain open.

## Commands and evidence procedure

Use the existing Node 24.15.0/npm 10.8.2 and Python environment. Commands run at repository root:

```powershell
python tooling/prepare-motion.py --check
python tooling/prepare-site.py --check
npm.cmd run verify:visual-engineering
python tooling/recover-site-reference.py
node tooling/compare-site-visuals.mjs tmp/visual-alignment/new-run
python tooling/check_site_paint.py tmp/visual-alignment/new-run/manifest.json tmp/visual-alignment/new-run/paint-integrity.json
python tooling/review_site_visuals.py tmp/visual-alignment/new-run/manifest.json tmp/visual-alignment/new-review
```

The full engineering command runs 16 mandatory checks and all HTTP/browser regressions,
including the new motion and secondary-layout suites. It creates an ignored, timestamped Chunk
15 manifest with source/build/dependency identity and individual logs. Browser tests use an
owned production server on loopback port 3100 and terminate only that server. The development
preview on port 3000 remains available. The screenshot command defaults to that preview;
for production evidence set `VISUAL_BASE_URL` to an isolated loopback production server with a
temporary copy of both the index and documents. Keep the built application and fixture revision
fixed throughout each capture. `VISUAL_REFERENCE_MANIFEST` may reuse a prior reference capture;
the tool checks baseline/browser/source/viewport/image hashes and retains the original paths
and capture provenance. It never reuses prior application captures. Current reference cache
validation also requires the viewport-preparation version and successful resource readiness.
Browser/OS/font capture conditions must remain frozen when reusing this local evidence.

Version `ordinary-viewport-captures-v2` takes real screenshots at successive ordinary viewport
positions before taking the full-page PNG. It records every frame's scroll position and hash.
Decoding and scrolling alone did not reliably paint long-page images in Chromium. These native
frames remain available independently; no stitching, resizing or screenshot masking is used.
The paint checker compares image regions against the corresponding native frame at zero color
tolerance. A paint failure invalidates an assertion of exact full-page painting; it is not
automatically a website rendering defect or a source/application design difference.

The review command fails on strict differences. `--report-only` explicitly produces the same
failure measurements for triage without using them as a release gate. Its gallery thumbnails
are navigation aids only; assertions use unscaled originals with zero color tolerance and no
masks. Dimension differences are failures, never padded/resized matches. Its JSON also records
original historical screenshot hashes, calibration dimensions, footer geometry and overflow.
Every row starts unreviewed; neither a gallery nor a numerical match is human acceptance.

The complete before audit is `tmp/visual-alignment/all-pages-before/manifest.json`: 321 pairs,
all current responses 200, no current image failures or page errors. Its 295/321 historical
dimension matches included failed avatar loading in fifteen author comparisons. Recovering
the reviewed avatar locally resolves those reference-only differences. The fresh post-change
reference has 318/321 historical dimension matches: two contact views are 417px shorter after
iframe removal and one tablet article differs by 52px. Eight historical views also contain
horizontal overflow; their full-page images extend beyond the nominal viewport width. Preserve
those originals and record their dimensions rather than resizing them. The application retains
its no-unintended-overflow contract. Missing backup reference files are three WordPress core CSS
files, an unused logo and tracking pixel; their denied URLs remain recorded. The reference is
not an offline WordPress installation and does not prove embedded-map/video behavior.

Focused evidence: `tmp/chunk15-focused-04` passes all 72 motion/secondary browser cases across
six profiles. Earlier focused runs remain available, including a corrected test assumption
that the desktop profile carousel must overflow when both source cards fit. A temporary home
logo-annotation error produced three 500 captures in `home-after-01`; it was corrected by
retaining the actual visible carousel group. `home-after-02` supersedes those failed captures.
No source content, media bytes or acceptance fields were changed to conceal a failure.

`tmp/chunk15-focused-05` passes 30 additional article/motion cases. Two early complete-gate
attempts were intentionally interrupted to finish the broad article comparison corrections;
their manifests record the reason. A transient CSS syntax error was corrected before a successful
production build; the development compiler retained that error until its owned preview process
was restarted. Failed diagnostic runs remain recorded. Production evidence supersedes those
development diagnostics. The verifier now fingerprints the source again after its checks and
fails if an input changed or a file was added during verification.

The first uninterrupted complete run passed all 231 HTTP cases but exposed an old browser
expectation of a 5px hover shift under reduced motion. Reduced motion now deliberately has no
shift; the normal-motion suite verifies the 5px behavior separately. The regression retains its
color, keyboard and focus checks and now asserts the reduced-motion contract. Its failed trace
remains under `tmp/chunk15/2026-10-18T08-43-44-087Z`.

The initial post-change capture stopped at the first author page because the cached reference
had failed to load the external avatar. The reference now serves the previously reviewed,
checksum-verified avatar locally, with its retrieval provenance. Invalid cached image captures
are re-captured, never reused. The capture runner now marks exceptions and incomplete case
counts as failures; the earlier partial `all-pages-after-01` manifest's legacy `captureStatus`
is not valid completion evidence (its runtime manifest correctly records failure).

A further regression attempt was interrupted to finish the service paragraph, container and
initial accordion-state corrections found by those production comparisons. Interrupted and
failed manifests remain distinct from a completed passing gate.

## Production checkpoint and comparison results

The complete engineering checkpoint `tmp/chunk15/2026-10-18T09-03-24-507Z/manifest.json`
passes all sixteen commands and 1,010 tests/checks: 65 Python, 30 Vitest, 231 production HTTP
and 684 browser cases. Build: `Jw2_nB5-LxYGtTgQBkrLI`; source digest:
`21ca02f8b9f8d92a1f4a41d9d5b7389d99f1fa927ebdd57ab5eec5ded384de75`.
The end-of-run source fingerprint matches. Subsequent viewport-capture tooling and service-tab
corrections require a new full regression result; this checkpoint does not cover later edits.

`tmp/visual-alignment/all-pages-after-03/manifest.json` is the complete fresh production
capture for that checkpoint build, with copied fixtures and an owned server on port 3200.
Its runtime record confirms successful capture and shutdown. There are 321 cases across all
107 active pages, with zero current resource/console/capture/overflow failures. The strict
comparison at `tmp/visual-alignment/review-after-03/report.json` exits nonzero: all 321 pairs
have pixel or dimension differences, and zero pages are accepted. There are 167 exact full-page
height matches, 179 within one pixel, and 56 differences greater than 100px. Equal heights are
triage measurements, not design acceptance.

The full-page paint audit also fails: 412 of 6,071 image/viewport intersections differ from
their native frames across 642 source/current captures. Some are edge/subpixel differences;
the API reference includes substantial long-page image differences. Do not infer an exact
pixel match from these full-page PNGs. Review their hashed ordinary viewport frames directly.
The smaller Blog preparation proof (`tmp/visual-alignment/paint-proof-01`) passes all 84 image
regions, but does not clear the all-site paint failures. `all-pages-after-02` is earlier
geometry/resource evidence and is superseded for screenshot review; it exposed the original
lazy-painting issue. Failures remain retained and are not suppressed by changed thresholds.

The comparison identified eleven service process widgets showing every panel at once. Their
converter now validates source desktop/mobile title equality, IDs, panel order and the captured
first selection. `ContentTabs` enhances server-rendered slots into desktop tabs and mobile
disclosures. Arrow/Home/End keys, native activation, focus when crossing breakpoints, ARIA
relationships, refresh and no-JavaScript content are checked. `tmp/chunk15-focused-tabs-01`
passes all eighteen focused browser cases. Source icon/content grouping and h3/h4 typography
are also recovered. These changes replace the earlier thousand-pixel tab-layout differences;
all thirty service pages are included in the final production capture below.

Arabic company corrections recover its empty 20px section, 10/15px column gutters, finite
1.15rem source lead paragraph (mapped relative to the source body size), graphic alignment,
featured-box title/description gaps and native CTA dimensions. No arbitrary source styles enter
the renderer. Its follow-up comparison remains separate from the checkpoint capture above.

The second complete regression checkpoint passes 1,031 checks/tests (68 Python, 30 Vitest,
231 HTTP and 702 browser) with build `WkT8P70pG87UUQ38LYy4S` and unchanged end-of-run
source identity. Evidence: `tmp/chunk15/2026-10-18T10-23-06-980Z/manifest.json`; source digest:
`73b3759b048c38824b9b6c1c02420bfe912fb159458f289a2b26187d68f29f81`.
The parallel `all-pages-after-04` capture fails after 246 completed cases: its geometry guard
detects the first tab widget initializing after measurement begins. Its owned server stops
and its runtime manifest records failure. It is partial diagnostic evidence, not a completed
all-site comparison. The capture tool now explicitly waits for every service-tab enhancement
before measuring or scrolling, and records that readiness separately from viewport preparation.

Native-frame inspection also catches differences that equal heights did not reveal. Source
table headings inherit alignment, with no outer header-cell borders; the previous rebuild
centered them. The independent theme contract and browser checks now cover these details.
Source button arrows are 12px rather than the former 14px; the source 1.65em line height is
preserved. The measured Times New Roman fallback now applies to the homepage's Arabic menu
link as well as the floating header. These corrections are covered by the final regression
and complete capture below; earlier checkpoint reports do not cover them.

## Final engineering and visual evidence

The [final engineering manifest](../../tmp/chunk15/2026-10-18T10-54-01-006Z/manifest.json)
passes all sixteen mandatory commands and **1,031 tests**: 68 Python, 30 Vitest, 231 HTTP and
702 browser cases. HTTP/browser results contain zero skipped, unexpected or flaky outcomes.
The verifier rechecks the complete source identity at the end. Build:
`NMgVqe3PsFY3ZUcwgqCh7`; source digest:
`9ad86fbd58d761ae7ea7b31805b8a64c021ff386f274a0eaf29babcdbd105e4b`.
Verification finished at `2026-10-18T11:20:59.574Z`.
The final documentation reconciliation is retained beside that manifest as
`documentation-review.json`. It permits changes only to the root README, documentation index,
this runbook and acceptance narrative; application, assets, tests, tooling and frozen source
inputs must still match the verified hashes. Documentation/evidence checks run again afterward.

The [final capture manifest](../../tmp/visual-alignment/all-pages-after-05/manifest.json)
contains all **321 cases / 107 active pages**, using that same production build and a copied
fixture index/document set. All current responses are 200, required resources load, and no
console/capture/overflow failures are recorded. All 33 service-tab instances are ready before
geometry measurement. The [runtime record](../../tmp/visual-alignment/all-pages-after-05-runtime/runtime.json)
confirms successful completion and owned-server shutdown. Its adjacent `identity.json` records
the runtime input hashes, fixture revision, capture-tool hash and reference provenance.
The reference is reused from the checksum-verified `all-pages-after-03` capture, in the same
browser/OS/font environment. Every application view is freshly captured.

Final page-height measurements are 177 exact matches and 197 within one pixel. Cases with a
difference over 100px fall from 56 in the earlier post-change checkpoint to 25. These numbers
only prioritize review. They neither waive pixel differences nor accept a page. The source
calibration and full-page painting limitations above still apply.

Review artifacts:

- [Strict full-page comparison and historical calibration](../../tmp/visual-alignment/review-after-05/report.json), with its [full-page gallery](../../tmp/visual-alignment/review-after-05/index.html).
- [Image-region painting comparison](../../tmp/visual-alignment/all-pages-after-05/paint-integrity.json), separate from source/application design differences.
- [Ordinary viewport viewer](../../tmp/visual-alignment/native-review-after-05/index.html), with independent source/current frame selectors and actual scroll coordinates. Its [smoke check](../../tmp/visual-alignment/native-review-after-05/viewer-smoke.json) passes frame selection, local image decoding and route filtering for the 321-case gallery. Images are previews in the viewer; open originals for native dimensions.
- [Ranked per-page geometry backlog](../../tmp/visual-alignment/final-evidence/final-triage.json), retaining every route, family and viewport delta.
- [Selected native-frame inspection](../../tmp/visual-alignment/final-evidence/selected-native-comparisons-v2.json). The Ahrefs article's desktop frame `005.png` matches the entire 1440×1000 reference frame with zero changed RGB pixels, including the corrected table header, body cells and surrounding prose. Home, Arabic-company and mobile Blog samples still differ. A matching frame does not accept its whole page.

The strict comparison exits nonzero with **321 differing pairs and zero exact full-page
matches**. The painting check also exits nonzero: **412 of 6,073 image/viewport intersections**
differ across 642 source/current captures. These comprise 59 reference and 353 current regions;
39 reference regions differ by more than 10,000 pixels, while the largest current-region
difference is 3,511 pixels. These values describe painting disagreement, not permission to
ignore smaller differences. Historical reference dimensions still match 318/321 originals.

The full-page comparison and painting results remain separate failing acceptance evidence;
their statistics must not be replaced by the passing engineering total. The original
captures, interrupted attempts and earlier failed references remain preserved. No source
screenshots were resized, masked or replaced to obtain a passing comparison. All 149 route
acceptance fields remain open.

## Remaining visual work

The complete page/viewport register is in the linked reports. The following groups identify
the next corrections; smaller differences remain relevant even when below these triage values.

| Group                          | Observed remaining differences                                                                                                                                                                                                                       | Required follow-up                                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service city-column layouts    | Eight tablet views are about 198–215px shorter. The frozen API-integration view wraps the third city column onto a second row while the rebuild keeps three columns together.                                                                        | Recover the actual per-page responsive column widths/wrapping; do not treat uniform columns as an accepted source change.                                                                     |
| Service details                | Professional website mobile is 121px shorter; social-media marketing desktop is 113px shorter. Other service views retain smaller spacing differences.                                                                                               | Reconcile hero, feature, copy and control landmarks in native frames, including expanded states.                                                                                              |
| Three article variants         | `/12-types-of-digital-ads-that-drive-sales-2026/`, `/edm-marketing-for-saudi-businesses/` and `/how-web-development-and-digital-marketing/` retain differences up to 264px.                                                                          | Review source-specific rich-text formatting and section spacing while preserving the complete text and approved readable links.                                                               |
| Company pages                  | `/our-services/` is 268px shorter on tablet and 109px taller on mobile. Sitemap differences are 127/166/112px. Arabic company is now 6/6/11px taller; About is −3/0/−3px.                                                                            | Reconcile individual sections, list rhythm and local card/CTA spacing.                                                                                                                        |
| Contact integration and layout | Current deltas are 27/847/611px against the aligned reference. The reference itself is 417px shorter than the historical tablet/mobile captures after iframe removal; current historical-height differences are therefore 430/194px at those widths. | Separate map calibration from actual layout differences; complete the real map/form integration and accessible delivery states before acceptance.                                             |
| Listings and secondary pages   | Category `/category/custom-software-apps/` differs by 86px on desktop; author rows/pagination retain smaller differences. Profiles differ by roughly −59px desktop, +41px tablet and +24px mobile; Team is +30/+48/+66px.                            | Review card widths, copy positioning, carousel/education/form spacing and the visible email fallback. The two profile archives match all six page heights, but still need pixel/state review. |
| Shared details and motion      | Home navigation/badge rounding, footer pixels, source internal fragment sequencing, rolling counters, marquee/carousel behavior and complete hover/focus states are not accepted.                                                                    | Keep settled screenshots and motion/state evidence separate; retain reduced-motion, focus and no-JavaScript behavior.                                                                         |

## Open acceptance gates

The implementation and engineering pass do not close the visual gate. Source plugin fragment
sequencing, rolling counters, marquee/carousel motion, complete interaction-state fidelity,
map embedding and real form delivery remain separate checks. Disabled enquiry buttons retain
the explicit email alternative; this necessarily adds visible copy beyond the old form. Real
Sanity, CI/staging, operational acceptance and deployment remain open. Nothing here authorizes
or claims a production release.
