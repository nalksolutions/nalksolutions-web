# Chunk 8 — Reference integrity and article detail corrections

Status: reference integrity and engineering verified; visual acceptance open. October 17, 2026 (Asia/Karachi).

## Contract

Repair the incomplete recovered article reference identified in [Chunk 7](07-article-visual-reconciliation.md).
Validate painted image pixels before allowing that reference into visual comparisons. Preserve
the historical archive, approved D-15 body links, public paths, content and SEO. Reconcile
source-supported remaining article details with a production build and the existing browser matrix.

The pre-implementation frozen-evidence check passed: 149 routes, 67 legacy rules, 29 documentation
files and zero accepted replacement routes. Existing Chunk 7 reference inputs remain frozen in
its run directory. New captures use separate owned output directories.

## Ordered work

1. Sweep ordinary viewports before full-page capture and measure whether all source diagrams paint.
2. Add explicit reference and runtime image-integrity validation, including a negative check against
   the known broken capture. Nonflat pixels establish painting, not image identity or visual parity.
3. Correct remaining measured styles without changing semantic language or approved link behavior.
4. Run the full production gate, capture validation and separate strict comparisons. Freeze the
   reference inputs, retain failures and document all residual differences.

Do not accept a page from geometry alone, replace historical baselines, or relax pixel comparisons.
Sanity, other templates, homepage acceptance and deployment remain separate gates.

## Implementation and source evidence

The recovered source now visits all ordinary viewports before its full-page screenshot.
The first controlled run paints every diagram at all three archived sizes without changing
page height. The old Chunk 7 snapshot remains unchanged and is explicitly rejected for
desktop diagrams 2 and 3. No screenshot pixels are edited, stitched, masked or rescaled.

`tooling/capture_integrity.py` owns the image-region checks shared by the reference and
runtime validators. It rejects clipped, empty, transparent or flat-color evidence. The
reference check additionally requires stable dimensions, the actual Consolas platform font,
and no failed content images. The archived `https://pixel.wp.com/g.gif` tracking image is
intentionally blocked offline and separately reported; other failed images still fail.
Eight contract tests cover these cases, including valid single-channel color variation.
Nonflat pixels do not prove image identity;
the existing media checksums, source conversion and content tests remain mandatory.

The production capture validator now checks all three body diagrams in each of six browser
profiles, in addition to featured images, stable geometry and complete footer bounds.
The comparison command refuses incomplete reference inputs before computing visual metrics.
The three archived Chromium runtime profiles use the same viewport-sweep-before-full-page
order as the reference. Their existing sequence artifacts move earlier; no extra browser
framework or screenshot transformation is introduced.

Article detail changes are scoped to measured source differences:

- Footer 117 text uses the source kit's `1.55em` units. Its two contact rows determine the
  desktop footer height; inherited unitless leading rounded each row differently by 1/64 px.
  Copyright text also uses the source units instead of the shared fixed 21.7 px value.
- Header 71's category chevron is recovered from its actual SVG path and viewBox; its 10 px
  height and 8.75 px width replace the differing icon-font glyph. Native disclosure and its
  accessible label remain in place.
- The desktop article language link retains `lang="ar"`, `hreflang` and full-document
  navigation, while naming its measured Times New Roman system fallback after Manrope.
  This preserves the observed Windows glyphs without redistributing a font. Other operating
  systems require new font calibration; full Arabic-page and menu typography remain open.

## Commands and verification

```powershell
npm.cmd run verify:article-reference
.venv/Scripts/python.exe tooling/compare-article.py tmp/chunk8/<successful-run> --calibrated-reference tmp/chunk8/<successful-run>/reference
```

The single gate validates frozen documentation/evidence, generated content/media/rules,
eight conversion tests and eight capture-integrity tests. It recovers the offline source,
captures a fresh reference into the owned run directory and validates its painted regions.
Formatting, lint, strict types, unit tests, production build/trace, HTTP/browser tests and
the strengthened six-profile capture check follow. The reference pipeline requires the
existing backup/archive; the application build itself does not read them at runtime.

The gate sets `REFERENCE_CODE_FONT=Consolas`, `CHROMIUM_TEXT_CALIBRATION=grayscale` and
`REFERENCE_OUTPUT_DIR=<run>/reference` for its child tools. Other scopes retain their
documented rendering policy. Strict historical and calibrated comparisons remain a separate
command with exact pixels and dimensions; engineering success cannot accept their failures.

An initial gate was stopped before its production build after the focused review exposed
the font-stack ordering mistake. Its partial manifest is retained as failed, not passing
evidence. The corrected focused desktop run confirms matching source/runtime platform fonts
and zero footer-box deltas before the final gate.

## Final verification and comparison

`tmp/chunk8/2026-10-17T13-03-48-293Z/manifest.json`, build `IDFOkU59wPqibE_mOGjjQ`, records
the passing complete gate: eight conversion tests, eight capture-integrity tests, 15 unit
tests, 114 HTTP tests and 48 browser tests, **193 total**. HTTP/browser results contain no
skips, flaky results or unexpected failures. Source validation passes all 12 image regions;
the six runtime capture checks pass, including all 18 body diagrams and complete footers.
The owned loopback server stopped after the run.

`reference-rejection.json` records that the comparison command rejects the known broken
Chunk 7 input before computing pixel metrics. `broken-reference-integrity.json` identifies
only its missing desktop diagrams 2 and 3; geometry and fonts are otherwise stable. The new
run's `reference-snapshot.json` hashes all 97 reference input files, which remain inside its
owned directory. Historical screenshots and previous run evidence remain unchanged.

The strict comparison in `visual-article/report.json` still exits 1:

| Profile | Archived/current size | Historical changed pixels | Calibrated full-page changed pixels | Ordinary-frame changed pixels | Exact ordinary frames |
| ------- | --------------------- | ------------------------: | ----------------------------------: | ----------------------------: | --------------------: |
| Desktop | 1440 × 23,541 px      |                 14.66087% |                            0.10565% |                      0.12214% |                 12/24 |
| Tablet  | 768 × 21,802 px       |                 24.90156% |                            0.32384% |                      0.33379% |                  8/22 |
| Mobile  | 390 × 24,945 px       |                 27.73556% |                            0.15387% |                      0.16873% |                 16/30 |

Every nonzero RGB difference is counted. Ordinary-frame percentages include overlapping
bottom rows and are not unique whole-page error percentages. Chunk 7's desktop calibrated
full-page number included blank reference diagrams, so its reduction must not be reported
as an equivalent application-design improvement.

All seven measured landmark boxes and all 278 body-element boxes now match exactly at all
three archived sizes. Heading, first-paragraph and language-link platform-font facts match
in all three profiles. Full-page heading crops match exactly everywhere; desktop featured
image and desktop/tablet footer crops also match exactly. Normal heading and first-paragraph
crops remain pixel-identical everywhere. This verifies the targeted font and footer fixes;
it does not accept all internal layout, interactions or pixels of the entire article.

Remaining differences include the approved D-15 links, header/search/icon details, adjacent
navigation and related cards. In particular, compare selected responsive image URLs and
internal text/icon bounds rather than relying on matching outer boxes. The article search
trigger still inherits the shared 22 px size while the recovered source measures 18 px;
this remains a concrete follow-up correction.

Normal footer crops retain 12 desktop, 768 tablet and 13 mobile differing pixels. The
desktop differences occupy its first enclosure row; the tablet differences occupy only its
last enclosure row, where source pixels are `#020202` and runtime pixels are `#f8fafc`.
That row extends beyond the recorded document height because fractional footer bounds are
enclosed in whole pixels. Investigate the marketing document background/overscroll treatment
alongside this crop boundary; do not conceal it with a mask or silently accept all residual
pixels as rasterization noise.

The chunk document and index were reconciled after the engineering run.
`documentation-review.json` verifies all other manifest-tracked sources, including application,
tests and tooling, remain unchanged and records fresh documentation checks. Report links are
in `tmp/chunk8/latest.json`. Preserve the whole ignored run directory and its reference inputs
separately for a durable handoff.

The reference-painting defect is resolved with repeatable checks. Complete the named remaining
article regions, then continue homepage and bilingual/service/listing reconstruction under
the existing vertical-slice gate. No replacement route is accepted: 0 of 149. Real Sanity,
integrations, staging, deployment and release acceptance remain open.
