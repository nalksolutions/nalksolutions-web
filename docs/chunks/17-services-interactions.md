# Chunk 17 — Services interactions and shared buttons

Updated: October 18, 2026. Scope: `/our-services/`, its 25 linked service/location cards,
the closing CTA, and shared homepage button regression checks. The request explicitly requires
the homepage button system, rather than a separate Services design.

## Findings and correction

Source identity is `R-e83c0ad06ef3deb6`, baseline `nalk-wordpress-2026-10-15`. The frozen
WordPress HTML/assets and [live Services page](https://nalksolutions.com/our-services/) were
compared on October 18 at 1440, 768 and 390px, with additional 1707/2048px geometry checks.

The card destinations were already valid, but their standalone company-button styling had
no equivalent of the homepage's cream hover/focus feedback. Outer card padding also sat
outside the link. The closing CTA had the same separate styling problem. There is no need
for a JavaScript click handler: these actions are ordinary crawlable navigation links.

`button-styles.ts` now supplies the shared class contract for `ButtonLink`, homepage card
actions and Services card actions. The existing homepage blue/cream treatment is a shared
`blue` appearance, not a new Services-specific design. `interactions.css` owns its transitions,
hover/focus state and reduced-motion behavior alongside the existing standalone buttons.
Duplicate homepage card-action CSS is removed. The standalone Services CTA uses `ButtonLink`,
including the same 12px arrow sizing, typography, gradient, glow and 5px hover/focus shift as the
homepage primary CTA. Using that homepage treatment instead of its old blue CTA is intentional
under the owner's consistency instruction.

The validated document renderer enables shared buttons only for the Services company layout.
Each card keeps one anchor and one non-interactive action label; there are no nested buttons
or links. Its padding is moved inside that anchor so the entire visible card is clickable,
including on touch devices. Keyboard focus outlines the whole card and activates the same
action feedback as pointer hover. The other company layouts retain their existing treatment.

Source-confirmed layout corrections include:

- Hero subtitle at 20px/30px, 30px heading gap and source 50%/80%/100% content widths.
  Tablet hero padding is 180px/120px; mobile is 120px/80px.
- Source 1280px desktop content, tablet 30px gutters and mobile 18px card-section gutters.
  The first group retains the source's additional 28px space left by its embedded style
  widget, represented as padding rather than an empty runtime element.
- Major-card icons at 60px; subservice icons at 34px; correct 24px/18px graphic spacing.
  Decorative glyphs and the hidden duplicate source headings remain preserved.
- The original 20px inner copy padding, 500-weight subservice headings at 1.35em line height,
  correct major heading line height, description spacing and body color.
- The source 28px gaps between group children, 24px grid gaps, responsive card padding and
  section padding. Text wrapping now matches the source tablet columns.
- Closing CTA column gaps of 30px and responsive image/text gaps of 100px/60px/50px.
  The unintended 60px mobile margin below the CTA is removed.

No route, editorial text, metadata, image, fixture identity or frozen source file is changed.
The body grouping exists only to reproduce the original graphic/copy layout; application
runtime never executes WordPress scripts or imports the archive.

The renderer preserves the source nodes' exact order, including whitespace, when grouping
card copy. The shared button's icon slot retains the source SVG arrow for this CTA, avoiding
a decorative text character in the recovered document. The original raw body-text checksum
and metadata assertions pass without changing their expectations. An earlier HTTP run caught
this distinction and is retained in `tmp/chunk17/http-01`; its correction is independently
probed in `tmp/chunk17/http-content-probe-01` before the complete HTTP rerun.

## Evidence and verification

Supplemental source observations and before screenshots: `tmp/chunk17/before`,
`tmp/chunk17/live-states.json`, `tmp/chunk17/live-geometry.json` and
`tmp/chunk17/live-wide-geometry.json`. Development comparison iteration 03 records matching
whole-page heights of 6695px desktop, 9770px tablet and 11978px mobile. All 25 card widths,
heights and x positions match; their y differences are below 0.1px. These numerical results
do not establish exact pixel or full interaction acceptance.

```powershell
npm run build
$env:CHUNK_RUN_DIR='tmp/chunk17/focused-production-04'
$env:BROWSER_TEST_WORKERS='2'
node tooling/run-browser-tests.mjs browser '--grep=services directory|company structure|homepage|hero entrance|buttons crossfade|reduced motion|server content remains|testimonial video|responsive header'
$env:CHUNK_RUN_DIR='tmp/chunk17/http-02'
$env:TEST_PORT='3110'
node tooling/run-browser-tests.mjs http
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
python docs/tools/check_docs.py --with-evidence
```

The focused browser suite runs in Chromium desktop/tablet/mobile/320px, Firefox and WebKit.
It compares actual Services button styles with the corresponding homepage controls, checks
hover and true keyboard focus, reduced motion, full-card hit areas and no nested controls.
It clicks/taps card padding and action labels, follows all 25 destinations with keyboard/history
on Chromium desktop, and samples the main/subservice/location journeys in the other profiles.
The final CTA and native navigation without JavaScript are tested too. Existing homepage,
motion and all five company-layout tests guard the shared implementation.

The first focused run exposed a test-input mistake: programmatic focus after pointer use does
not imply keyboard `:focus-visible`. The corrected test independently checks actual mouse
hover and switches to keyboard input before checking focus. Run 02 reached every service
destination successfully, but classified Next router `_rsc` refresh cancellations as resource
failures during back navigation. The final test uses the existing strict cancellation classifier
for only the exact journey paths, same-origin fetches and recognized abort codes. Cancellation
attachments remain visible; JavaScript errors, failed required resources and HTTP errors fail.
Both earlier failed runs remain in `tmp/chunk17/focused-production-01` and `02`.
Run 03 passes all 102 browser cases before the raw-text rendering correction. It is retained
as intermediate evidence; the final run repeats them against the corrected build.

## Final verification record

Build `hjQiV3Ij2z2iZm7dETVJ_` passes **363 tests**: 30 Vitest, 231 production HTTP and
102 browser cases. Browser/HTTP results have zero skipped, unexpected or flaky outcomes.
Formatting, ESLint, strict TypeScript, build-import checks and frozen-evidence/documentation
validation pass. This is a focused regression gate; the complete unfiltered site-wide suite
was not rerun for this correction.

- Browser: `tmp/chunk17/focused-production-04/browser/results.json`, including traces,
  shared-style attachments and narrowly classified navigation-cancellation records.
- HTTP: `tmp/chunk17/http-02/http/results.json`; recovered body-text hashes, metadata,
  assets, published identities, legacy responses and failure contracts pass unchanged.
- Quality/source identity: `tmp/chunk17/quality-results.json` and its per-check logs.
- Fresh production capture: `tmp/chunk17/capture-02/manifest.json`, six source/current
  profile pairs covering Services and the homepage. All capture checks pass with no current
  required-resource, console or overflow errors. Services source/current heights match in
  all three profiles; homepage height deltas remain +9/0/−3px.
- Exact native-frame diagnostics: `tmp/chunk17/native-services-comparison-final.json`.
  Nine of 32 Services viewport frames match all RGB pixels: one desktop, three tablet and
  five mobile frames. No resizing, masking or screenshot-baseline replacement is involved.
- Strict whole-page review: `tmp/chunk17/visual-review-02/report.json`, six different,
  zero accepted; exit 1 retained. Paint diagnostics: `tmp/chunk17/capture-02/paint-integrity.json`,
  five of 100 image regions differ between full-page and native captures; exit 1 retained.
  Native viewport images remain the reliable references for those regions.
- Consolidated versions, source/build identities and report hashes: `tmp/chunk17/manifest.json`.

The owned-server harness refuses occupied ports and stops only its own servers. Keep the
local preview at port 3000 available. Do not rebuild while a production capture uses `.next`.

## Acceptance limits

This is a focused Services correction, not a new whole-site acceptance pass. Retain strict
visual difference reports and native viewport frames; equal heights do not prove pixel equality.
Other pages' remaining source-state/layout differences, sticky-header behavior, full accessibility
and release acceptance remain open. Sanity, forms, integrations and deployment are unchanged.
