# Chunk 7 — Article regional visual reconciliation

Status: engineering verified; regional visual acceptance open. October 17, 2026 (Asia/Karachi).

## Outcome and boundaries

Continue the verified API article from [Chunk 6](06-article-fidelity.md). Resolve measured
regional differences, starting with footer background selection and text rendering. Keep
source content, SEO, public paths, approved contacts/share behavior and capture stability.
Do not expand page families or introduce Sanity/deployment scaffolding during this review.

The frozen-evidence checker passed before implementation: 149 routes, 67 configured rules,
28 documentation files and zero accepted replacement routes. Historical screenshots and
backup files remain immutable. Engineering success does not imply visual acceptance.

## Steps and acceptance

1. Inspect the recovered footer 117 stylesheet, actual selected assets and computed styles.
   Prove the source breakpoint and fix selection rather than approximating a background.
2. Capture repeatable source/runtime regional evidence with browser/font/computed-style
   facts. Separate exact geometry, asset differences and text rasterization findings.
3. Correct source-supported header, body-link and card differences. Retain accessible
   focus behavior and document any intentional departures from the source.
4. Extend meaningful regression checks for the demonstrated defects, including live resize
   across the mobile/tablet background boundary. Keep all existing content/SEO checks.
5. Run the production engineering gate, six-profile capture validation and separate strict
   historical/calibrated comparisons. Preserve failures and report unresolved differences.

Only accept the article after every remaining difference is resolved or narrowly reviewed
with evidence. Do not change baselines, mask regions or silently relax comparison thresholds.

## Source findings and implementation

Footer 117's `uploads/elementor/css/post-117.css` selects the desktop background through
768 px, switching only in `@media(max-width:767px)`. The rebuild incorrectly selected the
mobile background through 1024 px. The corrected article override follows 767 px. The
preparation script recovers this breakpoint into the checked asset manifest; browser checks
verify actual selected background URLs, including live resize across 767/768 px. The two
original assets remain checksum-verified, with no image editing or approximation.

Header 71 widget `7315e73b` specifies a 12 px CTA icon. The article override now matches it
without changing the homepage button. Related template 110 widget `811e573` specifies a
surface-colored button, white hover/focus background, dark text and a 5 px horizontal hover
translation. Those states replace the unrelated shared gradient hover. Keyboard focus has
the same visible treatment and an outline; reduced-motion mode disables the transition.
The document-navigation branch of `ButtonLink` also retains the source's explicit
`tabIndex="0"`, matching its Next.js Link branch. A real Tab-flow check caught its omission
in WebKit; programmatically focusing the action alone had not exercised that behavior.

The four article body links retain their readable light underlined treatment under the
owner-approved [D-15](../registers/decisions.md). This deliberate departure from the purple
unadorned source links remains visible in strict comparisons; it is never masked.

Regional diagnostic screenshots, ancestor computed styles and Chromium platform-font facts
are captured alongside the existing stable full-page evidence. Source and rebuilt headings
and the first paragraph match exactly in normal viewport crops at all three archived sizes.
All 278 body-element boxes also match exactly in the focused review. This does not establish
whole-body pixel equality: other regions still differ, including text-edge painting.

The source desktop Arabic language link uses Times New Roman on this runner; the explicit
`lang="ar"` link in the rebuild uses Segoe UI. Both actual platform fonts are recorded, not
inferred from the CSS family names. Preserve the semantic language attribute; Arabic font
selection and the complete Arabic page remain under D-06/D-09 review.

## Commands and evidence

```powershell
.venv/Scripts/python.exe docs/tools/check_docs.py --with-evidence
.venv/Scripts/python.exe tooling/prepare-article.py --check
$env:REFERENCE_CODE_FONT='Consolas'
$env:CHROMIUM_TEXT_CALIBRATION='grayscale'
$env:REFERENCE_OUTPUT_DIR='tmp/chunk7-reference/grayscale'
node tooling/measure-article.mjs
Remove-Item Env:REFERENCE_CODE_FONT
Remove-Item Env:CHROMIUM_TEXT_CALIBRATION
Remove-Item Env:REFERENCE_OUTPUT_DIR
npm.cmd run verify:article-regions
.venv/Scripts/python.exe tooling/compare-article.py tmp/chunk7/<successful-run> --calibrated-reference tmp/chunk7-reference/grayscale
```

The source recovery command from Chunk 6 is a prerequisite when `tmp/chunk5-reference/`
is absent. The new output override keeps Chunk 6 calibration files separate. All network
references are intercepted to recovered local files; the reference does not contact the
live site. Source HTML and image hashes, browser version and explicit font calibration
remain recorded. The engineering command runs the full existing production gate.

The article-regions gate selects `CHROMIUM_TEXT_CALIBRATION=grayscale`; other engineering
scopes retain `default`. Shared `tooling/visual-environment.mjs` maps this explicit test-only
policy to Chromium's `--disable-lcd-text` switch. Both reference measurement and production
browser tests use it, and record launch arguments. Comparisons reject different policies.
Firefox/WebKit and application CSS are unaffected. Historical and default-rendering evidence
remain separate, with unchanged exact-pixel comparisons and no accepted renderer tolerance.

Controlled same-frame probes reduced changed pixels from 95,193 to 19 at tablet scroll
16,384 and from 43,653 to 26 at mobile scroll 21,100 when both sides disabled LCD text.
Changing only the application's body background did not reduce those differences. This
supports a renderer explanation for the bulk of those two frames, not every remaining pixel.
Chromium's [switch definition](https://chromium.googlesource.com/chromium/src/+/master/content/public/common/content_switches.cc)
identifies the flag; measured local results establish its effect on this runner. Production
visitors retain their own browser's normal rendering. This test environment change does not
alter assets, content, styles, geometry or historical images.

`tooling/capture-viewports.mjs` captures complete ordinary viewport sequences at all three
archived Chromium dimensions, shared by source measurement and production browser tests.
It records every scroll position, viewport/document size and image checksum. Geometry must
remain unchanged during each capture. The last frame overlaps earlier rows where necessary
to cover the entire document. There is no stitching, resizing, cropping, masking or discarded
region. The comparison requires matching coverage, browser/version, dimensions, positions
and integrity before checking exact pixels for every frame.

These sequences supplement full-page historical/calibrated comparisons; their differences
are not suppressed. Ordinary heading/paragraph/footer comparisons and all body-element
geometry deltas appear in the same strict report. Capture and engineering success do not
change that report's nonzero exit status while differences remain.

## Verification and handoff

The passing production gate is `tmp/chunk7/2026-10-17T12-35-10-735Z/manifest.json`, build
`Pyo8Q41uCaNBGxwe0tJcv`: eight conversion, 15 unit, 114 HTTP and 48 browser tests, plus
six stable full-page/featured-image/footer checks. No HTTP/browser tests were skipped,
flaky or unexpected. All documentation, frozen evidence, generation, format, lint, strict
types and build/private-reference checks passed. The owned loopback server stopped afterward.

The strict comparison in `visual-article/report.json` exits 1. All three archived dimensions
match exactly, and all 278 body-element boxes match in each profile. Seven landmark boxes
match at tablet/mobile; desktop footer height differs by −0.03125 CSS px. Normal heading
and first-paragraph crops match exactly in all three profiles. The calibrated tablet footer
full-page region also matches exactly; its earlier wrong-background defect is resolved.

| Profile | Archived/current size | Historical changed pixels | Calibrated full-page changed pixels | Ordinary-frame changed pixels | Exact ordinary frames |
| ------- | --------------------- | ------------------------: | ----------------------------------: | ----------------------------: | --------------------: |
| Desktop | 1440 × 23,541 px      |                 14.66195% |                            3.90515% |                      0.14528% |                 12/24 |
| Tablet  | 768 × 21,802 px       |                 24.90156% |                            0.32384% |                      0.33518% |                  8/22 |
| Mobile  | 390 × 24,945 px       |                 27.73556% |                            0.15387% |                      0.17856% |                 16/30 |

These count every nonzero RGB difference with no tolerance. Ordinary-frame percentages
weight all captured frame pixels, including overlapping bottom rows; they are not unique
whole-page error percentages. Calibration now fixes LCD rendering on both sides, so these
columns must not be treated as directly comparable application improvements over Chunk 6.

**The desktop calibrated full-page reference has a painting defect.** Body diagrams 2 and 3
are uniform `#020202` in that source PNG despite successful decoding and unchanged geometry.
All nine diagram regions in the rebuilt Chromium desktop/tablet/mobile full-page captures
are nonflat. Source and rebuilt ordinary desktop frames at scroll 5000, 6000, 7000 and 8000
match exactly, including the two diagrams. `reference-image-review.json` records the crop
bounds and channel extrema. The large desktop full-page percentage therefore includes an
invalid reference capture; do not remove working runtime diagrams to match it. Retain the
failed comparison and repair/validate reference painting before using that metric for design
acceptance. Stable geometry and decoded images alone do not establish complete raster output.

Remaining differences include the approved D-15 body links, the measured Arabic language-link
fallback, header/icon details, adjacent/card regions and desktop footer rounding/painting.
Normal footer crops differ by 7651 desktop pixels, 768 tablet pixels and 13 mobile pixels;
do not attribute every remaining difference to rasterization without regional evidence.

The run's `reference/` directory freezes all 97 calibrated input files; `reference-snapshot.json`
lists their hashes. Use that snapshot as `--calibrated-reference` when reproducing this exact
report. Original historical screenshots remain separate and unchanged. Three negative policy
checks in the run's `renderer-policy-negative-check.json` confirm mismatched browser arguments
are rejected before pixel comparison. These are supplemental diagnostics, not additional
passing page acceptance tests.

The focused review retained a Firefox test failure caused by using
programmatic focus after mouse input as a substitute for keyboard navigation. The test now
uses Tab from the preceding link, exercising the actual keyboard focus-visible behavior.
The subsequent full run `2026-10-17T12-25-06-333Z` passed 114 HTTP and 47 browser tests,
but failed that Tab-flow check in WebKit. The missing explicit action tabindex was corrected
in the shared document-navigation branch; this failed run remains retained for review.

Result documentation and the index were reconciled after the passing run. The run's
`documentation-review.json` records repeated documentation checks and verifies all other
manifest-tracked sources, including application/tests/tooling, remain unchanged.
`tmp/chunk7/latest.json` links the reports. These are ignored local artifacts; retain the
entire run and its reference snapshot separately for a durable handoff.

Next, validate complete source-reference painting, reconcile the remaining named regions
and review Arabic font selection before accepting the article. Preserve the passing keyboard,
background-selection and capture checks. No replacement route is accepted: 0 of 149.
Homepage fidelity, Arabic/service/listing templates, real Sanity, integrations, staging and
release remain separate gates.
