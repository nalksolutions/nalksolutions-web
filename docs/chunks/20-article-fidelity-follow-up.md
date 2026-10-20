# Chunk 20 — Article fidelity follow-up

Updated: October 19, 2026. Baseline: `nalk-wordpress-2026-10-15`. This follows the
[site-wide alignment pass](19-remaining-pages-alignment.md). All 107 active pages remain
in scope under D-16; this correction batch targets the shared article presentation, floating
menu alignment and remaining article differences identified by Chunk 19. No URL disposition changes.

## Findings and implementation

Chunk 19 leaves 13 article viewport cases with nonzero document-height deltas across eight
articles. The frozen source was loaded with its recovered local styles/assets and the same
fonts at 1440×1000, 768×1024 and 390×844. Body-child and header measurements locate the first
divergence; no page-height offsets, masks or image resizing are used to conceal differences.
Development diagnostics are under `tmp/chunk20`; final production evidence is recorded
separately because development measurements can span edits.

The source-confirmed corrections are:

- H1 body margins scale with the source body size. Fixed desktop margins previously left
  excess space in two Arabic articles at smaller breakpoints.
- Featured images use their intrinsic aspect ratio at the source's fixed responsive heights,
  capped by the available width. The old 3:2 container cropped square and wider images
  differently from the source. Twelve prototype cases across four aspect-ratio examples
  match the source image rectangles exactly before the application correction.
- The Email Marketing Goals opening span retains its exact source 16px regular text through
  a finite `compact-text` role. Arbitrary inline CSS is still stripped.
- The unaligned Search Ads image retains inline/baseline flow with zero margins through an
  `inline-image` role. Centered images keep their source body-relative spacing.
- A heading-led FAQ prose group remains a semantic group. Flattening it changed first-child
  margin collapse and introduced excess space before the Search Ads FAQ.
- The exact empty pasted response-control heading in Virtual Marketing is omitted. The
  converter preserves text-bearing headings, anchor identities and unreviewed attributes.
- ASCII formatting whitespace between table structure nodes moves into adjacent content
  cells in the same flattened text order. This avoids React's table-nesting diagnostics
  without dropping source characters, replaying raw HTML or suppressing console errors.
  Nested tables retain their outer-cell tail text; unsupported structural text fails conversion.
- Multiple header categories share one padded gradient pill, with individually crawlable
  links and the source wrapping/separator spacing. Previously each link had its own padding
  and background, adding an unnecessary mobile row.
- Related-post actions inherit homepage outline-button typography, crossfade, focus, shift
  and reduced-motion behavior. Duplicate article button CSS and the white-hover override
  are removed. Cream homepage feedback is intentional under the owner's consistency instruction.
- The existing related-post strip exposes its enhancement readiness. Capture waits for the
  visible-card height to settle after fonts/images load. A transient 15px tablet diagnostic
  difference came from measuring before that controller completed, not an article-body defect.
  Server/no-JavaScript content remains readable; this does not claim to eliminate all initial
  slider resizing or reproduce every source carousel state.
- The floating-shell menu trigger centers its source SVG explicitly in flex layout. Its
  inherited grid alignment did not center a flex child, leaving the glyph left of the source.
  This shared correction applies across floating-shell pages, not just articles.

The initial diagnostic targets are Arabic Web Development, Digital Channel Strategy, Email
Marketing Goals, How AI Helps Companies, Web Development and Digital Marketing, Search Ads
vs Display Ads, Virtual Marketing and Intelligent Workflow Automation. Shared regression
capture includes all 43 articles, not just those eight.

## Boundaries and preservation

`tooling/article_document_content.py` specializes the existing document converter only for
the 42 recovered article bodies. The independent API article converter in `article_content.py`
is unchanged. The original API converter and its eight tests were restored and checked against
the exact Chunk 19 file hashes after a filename collision during implementation; the new
module and six tests have separate names. No original test was removed or replaced.

The generated documents contain finite roles, never source utility classes or executable
WordPress/editor code. Recovery provenance records each article-body transformation. Body
text is reconciled exactly against archived HTML during generation. Published identities,
titles, descriptions, canonicals, robots, schema, public media bytes and legacy rules retain
their existing contracts. There are no added dependencies, Client Components or caches.

This chunk does not configure form transport, embedded maps, Sanity, hosting or deployment.
It does not accept a route merely because its height or a screenshot matches.

## Commands and verification

Use the existing Node 24/npm environment and installed Python requirements. Keep the frozen
backup/archive available for source validation. All servers bind to loopback; the production
test harness refuses occupied ports and stops only its owned process.

```powershell
.venv/Scripts/python.exe tooling/prepare-site.py
npm.cmd run verify:visual-engineering
```

The complete gate includes frozen evidence/documentation checks, generated-data consistency,
all Python/Vitest contracts, formatting, lint, strict types, the production build, bundle
boundaries and unfiltered production HTTP/browser suites. Inputs remain frozen during the
gate; final documentation changes are revalidated and recorded separately with hashes.

New browser contracts cover source H1 spacing, fixed text, inline image flow, FAQ grouping,
empty-heading cleanup, category row wrapping, featured-image aspect ratios, floating menu
centering and related-action feedback. They run in
Chromium desktop/tablet/mobile/320px, Firefox and WebKit. Existing tests continue to verify
all other families, routing, raw text/SEO, navigation, keyboard access and source failures.

Production visual capture covers every article at all three archived dimensions. Source
cache reuse requires matching baseline, browser, HTML and screenshot/frame checksums.
Retain full PNGs and ordinary viewport sequences; compare exact RGB without masks or
resizing. Paint discrepancies and strict visual differences must remain visible in reports.

The first run at `tmp/chunk15/2026-10-18T21-16-38-824Z/manifest.json` is intermediate:
its owned browser-test subtree was intentionally stopped after image-rectangle review
confirmed the featured-width and menu-alignment defects. The harness stopped its owned
production server; the preview was retained. Its 129 captures have matching heights but
are not final evidence for image widths. The interruption reason and prototype evidence
remain under `tmp/chunk20`. The full gate is rerun after these additional corrections.
The first development aspect-ratio probe also exposed structural table-whitespace warnings;
its failure traces are retained. The converter correction preserves the text reconciliation
contract and the console-error assertions remain strict.

## Completion record

The final [evidence manifest](../../tmp/chunk20/manifest.json) binds the complete gate,
source/dependency identity, fixture revision, production captures, reports and reconciled
final documentation. The [full engineering command](../../tmp/chunk15/2026-10-18T22-27-30-173Z/manifest.json) passes
all sixteen checks on build `wzMC5ImvqewEhIO8vNEBD`. Source identity is rechecked after the run.
All **1,140 tests pass**: 75 Python, 30 Vitest, 231 production HTTP and 804 browser cases.
HTTP/browser results contain zero failures, skips or flaky outcomes. Chromium runs at desktop,
tablet, mobile and 320px; Firefox and WebKit also pass. The gate records the exact Node,
Next.js, React and other dependency versions. Application, test, content and tooling inputs
remain unchanged after the gate; final documentation is validated and hashed separately.

The [fresh production capture](../../tmp/chunk20/articles-final-03/manifest.json) contains
129 source/current pairs for all 43 active articles at the three archived dimensions.
Every current response is 200, with zero capture errors, browser errors or failed images.
Its owned server uses the same build and stops after capture. The [per-route CSV](../../tmp/chunk20/route-visual-summary-final-03.csv)
and [JSON](../../tmp/chunk20/route-visual-summary-final-03.json) retain every measurement.
**129 of 129 document heights match exactly**, compared with 116 in Chunk 19.
The [image-geometry review](../../tmp/chunk20/image-geometry-final-03.json) matches all 129
featured-image rectangles exactly; the diagnostic one-pixel threshold is not needed for
those rectangles. It retains 135 other image occurrences outside one CSS pixel,
including direction-related differences and unresolved adjacent/related-content alignment.
No occurrence is unmatched. Height/rectangle equality does not accept a page or its pixels.

The [strict whole-page report](../../tmp/chunk20/visual-review-final-03/report.json) retains
129 different comparisons and exits 1: zero RGB tolerance, no masks, no assertion
resizing and zero routes accepted. The [paint-integrity report](../../tmp/chunk20/articles-final-03/paint-integrity.json)
also exits 1, retaining 400 differing image regions out of 3276 between full-page
and ordinary viewport captures. These remain evidence limitations and review findings;
full-page PNGs alone cannot accept affected regions.

The [native viewport comparison](../../tmp/chunk20/native-comparison-final-03.json) retains
1930 frame pairs, all at matching scroll positions; 734 match exactly in RGB.
It uses no masks or resizing and makes no route acceptance decision. The [native viewer](../../tmp/chunk20/native-gallery-final-03/index.html)
contains all 129 cases with hashed frames; selection, local decoding and route filtering
pass its [smoke check](../../tmp/chunk20/native-gallery-final-03/viewer-smoke.json).
Four [native spot inspections](../../tmp/chunk20/manual-review-final-03.json) cover category/menu
alignment, square and wide featured images, and inline image/heading flow. Those inspected
frame bytes are identical on this final build to the previously inspected capture. The
[320px production check](../../tmp/chunk20/narrow-category-final-03.json) confirms the long
category labels wrap inside the pill without horizontal overflow.

The [preservation audit](../../tmp/chunk20/change-audit-final-03.json) reconciles all 116
recovered body texts exactly. Seventeen article documents change finite roles/table
formatting; nonarticle documents, public media, published identities, SEO and the original
API converter/tests retain their prior bytes. Frozen backup/archive/register checks pass.
No historical source evidence is edited. Chunk 19 remains historical evidence for its own
build; it is not relabeled as evidence for these changes.

A second engineering attempt at `tmp/chunk15/2026-10-18T21-50-13-041Z/manifest.json`
passed all 804 browser cases, then failed writing the HTML report because the disk was full.
That command remains failed, with its JSON, traces, partial report and [incident record](../../tmp/chunk20/report-storage-incident.json)
retained. Automatic approval review rejected compiler-cache deletion, so the cache was left
unchanged. [Storage reconciliation](../../tmp/chunk20/storage-reconciliation.json) replaces
4,440 byte-identical generated report copies with NTFS hardlinks, preserving every path and
SHA-256 while reclaiming 12.45 GB. Incomplete nonidentical report files are left untouched.
The final full command above is a fresh unfiltered rerun with identical input checksums;
its build receives fresh captures rather than inheriting an earlier build's results.

All 149 route acceptance fields remain open, with zero routes accepted. Exact per-page
visual/state review, source carousel/counter sequencing, real enquiry delivery, embedded
maps, Sanity, staging and release gates remain separate. The preview stays local; no deployment
or legacy-disposition change is made by this chunk.
