# Chunk 6 — Article fidelity and reproducible capture

Status: engineering verified; strict visual acceptance open. October 17, 2026 (Asia/Karachi).

## Outcome and scope

Continue the API article's remaining visual work from [Chunk 5](05-article-presentation.md).
Resolve capture-induced layout changes, reconcile adjacent/card typography and the article
footer's source text, and exercise the article header and horizontal card strip. Preserve
the full recovered body, SEO, public paths and approved contact/share corrections. Other
page families, real Sanity publishing and deployment remain separate gates.

## Evidence and decisions

The article source remains post 59034, route `R-fbbead80b209e23c`, templates 71/107/110/117.
The original HTML, screenshots, backup archives and frozen observations remain unchanged.

A controlled Chromium mobile diagnostic measured the same 24,978 px document before and
after keyboard focus, then 25,169 px after a full-page capture. Chrome's platform-font API
identified **Consolas before capture and Courier New afterward**, despite the unchanged
generic `monospace` CSS. An isolated explicit `Consolas, monospace` stack kept both the
platform font and height unchanged. This explains the observed code-line wrapping drift in
this environment; it does not prove every historical capture issue has the same cause.

The implementation names the measured existing font explicitly without bundling a
proprietary font. Environments without Consolas must record their actual fallback and repeat
reference calibration before visual acceptance. No cross-platform pixel equality is assumed.

Reference calibration may explicitly pin the same measured code font in a separate output
directory, with that adjustment, browser/font facts and before/after geometry recorded. This
removes a demonstrated capture side effect; it does not change source text or substitute a
new design. Historical screenshots and the unadjusted reference remain separately available.

## Implementation and verification steps

1. Record this contract and run the frozen-evidence checker.
2. Correct the code font stack and source-derived adjacent/card typography. Recover the
   footer 117 copyright strings rather than inheriting homepage footer 81's wording.
3. Capture article geometry before and after full-page screenshots. Fail on capture-induced
   document or landmark drift. Capture the complete footer separately at the normal viewport.
4. Record an explicitly calibrated source reference and compare body, navigation, cards,
   footer and pixels against the same production build. Keep the historical comparison strict.
5. Exercise menu/search focus and dismissal, blog-category access, related-card keyboard and
   pointer/touch scrolling, and responsive widths. Keep unsupported destination pages open.
6. Run the complete production engineering gate and reconcile the documentation and reports.

Source body text/code/headings continue to be compared in raw HTTP and six browser profiles.
Existing asset integrity, routing, locale, publication and non-indexing checks remain mandatory.
The new stability checks supplement those checks; passing capture stability is not visual
acceptance. Source-specific rounding tolerances must not hide layout or content changes.

## Commands and implementation

```powershell
.venv/Scripts/python.exe tooling/prepare-article.py --check
.venv/Scripts/python.exe tooling/recover-article-reference.py
node tooling/measure-article.mjs
$env:REFERENCE_CODE_FONT='Consolas'
node tooling/measure-article.mjs
Remove-Item Env:REFERENCE_CODE_FONT
npm.cmd run verify:article-fidelity
.venv/Scripts/python.exe tooling/compare-article.py tmp/chunk6/<successful-run> --calibrated-reference tmp/chunk5-reference/calibrated
```

The reference command writes uncalibrated output under `tmp/chunk5-reference/` and explicitly
calibrated output under its `calibrated/` directory. Both retain platform-font facts before
and after capture. Finite CSS animations/transitions finish before measurements; infinite
animations pause. This matches the archive's recorded static animation policy. Earlier
reference measurements included intermediate responsive font sizes and footer transforms;
those are measurement artifacts, not target styles. The metadata records this procedure.

Runtime changes remain focused on the existing article/shared boundaries:

- Article code uses the measured explicit font stack. Body/heading/category line-height units
  match source em units, avoiding accumulated desktop fractional rounding drift.
- Adjacent titles use source 17/16/15 px sizing and 1.65em line height; related metadata,
  badge padding, card spacing and footer links retain their source responsive values.
- The article header uses its measured source gradients, shadow, mobile logo offset and
  recovered menu SVG. The generated header input is checked against the frozen source.
- The article fixture includes source footer 117 owner/notice strings. The shared footer
  accepts that explicit content while preserving its existing homepage default.
- `tests/browser/article-evidence.ts` records document, landmark and all 278 body-element
  measurements before/after full-page capture and requires exact equality. It also captures
  the complete footer at normal viewport size.
- Capture validation requires full-page dimensions to match the stable document and include
  the footer. Region screenshot dimensions use exact floor/ceil pixel enclosure of fractional
  CSS bounds; no loose screenshot-size tolerance is introduced.
- Header tests exercise menu/search focus and Escape dismissal, keyboard category disclosure
  and published-identity search. Related cards retain keyboard focus access and use real
  Chromium touch gestures for scrolling in the archived touch profiles.
- Live resize checks cross 1180/1181, 1024/1025 and 767/768 px, plus 390 px and the desktop
  baseline. They verify navigation visibility, document overflow and visible-card height.
  This caught a real footer overflow at 1181 px; the article now uses the shared proportional
  footer columns, which retain the exact desktop baseline while fitting intermediate widths.
- `RelatedPostStrip` is the sole new client boundary: a ResizeObserver and native scroll
  events size the strip to the currently visible server-rendered cards, matching the source
  slider's auto-height behavior. It adds no carousel dependency or cloned content. With
  JavaScript disabled, the native strip retains its natural height and complete content.

Static captures precede the keyboard flow so the baseline does not include test-created focus
rings. Keyboard navigation/focus checks still run afterward. Capture stability covers the
document and every measured body/landmark box; it is not inferred from similar page heights.

The complete gate includes eight conversion tests, existing unit/routing/HTTP checks,
production build and all browser projects. Strict visual comparison remains a separate
failing command until actual differences are reconciled. Its calibrated report adds named
regions and geometry deltas without replacing historical results or relaxing pixel checks.

## Final verification and remaining differences

`tmp/chunk6/2026-10-17T11-38-41-457Z/manifest.json` records the passing production gate:
eight conversion tests, 15 unit tests, 114 HTTP tests and 48 browser tests, with no skipped,
flaky or unexpected HTTP/browser results. All six capture checks passed, including stable
before/after geometry, painted featured images and complete footer regions. Documentation,
frozen evidence, generated data, formatting, lint, strict types and build/trace checks passed.

The strict historical and calibrated comparisons both fail. The final report and individual
region crops/diffs are in that run's `visual-article/` directory. Historical screenshots are
unchanged; calibration is separately recorded and never replaces them.

| Profile | Archived/current size | Historical changed pixels | Calibrated changed pixels |
| ------- | --------------------- | ------------------------: | ------------------------: |
| Desktop | 1440 × 23,541 px      |                  13.8915% |                   0.1441% |
| Tablet  | 768 × 21,802 px       |                  24.9754% |                   9.2897% |
| Mobile  | 390 × 24,945 px       |                  27.7356% |                  10.6640% |

These percentages count any nonzero RGB difference; they are diagnostics, not acceptance
thresholds. All seven calibrated landmark boxes match exactly at tablet/mobile sizes. At
desktop size, six match exactly and the footer height differs by −0.03125 CSS px. Desktop
heading and featured-image regions are pixel-identical to the calibrated reference. Matching
dimensions and landmark boxes do not establish matching internal layout or pixels.

Regional review still finds text-edge differences, including colored fringes in the reference
mobile heading, and a visibly different tablet footer background texture. The desktop header,
body links, adjacent navigation, related cards and footer also retain nonzero differences.
Do not attribute all differences to font rasterization: compare computed styles, source asset
selection, background painting and normal-viewport regions before classifying each cause.
Keep the exact comparison failing until those differences are resolved or narrowly reviewed.

Earlier failed evidence is retained. Run `2026-10-17T11-26-56-309Z` ended with Windows native
exit 3221226505 when starting the test harness, before HTTP/browser tests ran. The next run
passed HTTP and 47 browser tests but caught footer overflow at 1181 px; this was fixed with
proportional columns and verified across all eight resize widths in the final passing run.
Neither failure was suppressed or counted as passing evidence.

This result note and the index were reconciled after the engineering run.
`documentation-review.json` records subsequent documentation checks and verifies all other
manifest-tracked sources, including application and tests, remain unchanged.
`tmp/chunk6/latest.json` links the engineering manifest, capture check, visual report and
documentation review. Reports remain local ignored artifacts and must be retained separately
if durable handoff storage is required.

## Completion and handoff

Hand off a verified build, deterministic source extraction, capture-stability evidence,
normal-viewport footer screenshots, interaction results and separate historical/calibrated
comparison reports. Record remaining differences explicitly. Do not accept this route,
the homepage, Sanity or release gates without the corresponding evidence and review.

The engineering/capture scope is complete. Continue with regional visual reconciliation,
starting with tablet footer asset/painting differences and tablet/mobile text rendering,
then header/card details and source interaction states. Preserve the passing capture checks
and approved contacts/share behavior. Whole-page acceptance remains open, with 0 of 149
replacement routes accepted; other page families, Arabic recovery, real Sanity publishing,
integration delivery and deployment remain unaccepted.
