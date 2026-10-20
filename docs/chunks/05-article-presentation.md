# Chunk 5 — Article presentation and navigation

Status: presentation implemented; engineering verification passed; visual acceptance remains open.
October 17, 2026 (Asia/Karachi).

## Scope

Continue the API article vertical slice from [Chunk 4](04-article-rendering.md). Reconstruct
the source title/body typography, featured-image crops, article header variant, adjacent-post
navigation and related-post cards. Keep all recovered body text, public paths, source metadata
and approved D-14 share targets. Sanity, other article bodies, full-site rollout and deployment
remain separate gates. Whole-page visual acceptance requires the original screenshot comparison.

## Source and measurement

The source remains route `R-fbbead80b209e23c`, WordPress post 59034. Its original HTML and
three rendered documents/screenshots are immutable. Source templates are header 71, singular
107, related entry 110 and footer 117.

[Reference recovery](../../tooling/recover-article-reference.py) strips scripts, frames and
event attributes, recovers allowlisted CSS/images/fonts from the ZIP backups and writes only
under ignored `tmp/chunk5-reference/`. It publishes no WordPress code or application assets.
The helper reuses the existing archive-path and CSS-URL interpretation from Chunk 2.
[Measurement](../../tooling/measure-article.mjs) intercepts every browser request: only the
recovered reference and two pinned local fonts are fulfilled. Other requests return 404 and
are recorded, along with failed images and browser version. No request reaches the live site.

With the recovered Manrope/Space Grotesk fonts, the reference matches all three archived
document heights: desktop 23,541 px, tablet 21,802 px and mobile 24,945 px. Matching height
calibrates this measurement input; it does not establish pixel equality. Missing reference
assets include three WordPress media/admin styles, a tracking pixel and the hidden theme logo;
their requests remain explicit in the reference manifest.

Measured typography includes 82/60/42 px title sizes, weight 400 and 1.05 line height;
62/48/36 px second-level headings; 48/36/28 px third-level headings; and 18/17/16 px body
text. Source paragraph/list/image/code spacing is expressed relative to body size. The
featured image retains its source 379/450/350 px crop heights. Code retains exact source
whitespace and scrolls inside its own focusable region.

## Implementation boundaries

- The header has an explicit `article` variant. Shared links, dialogs, approved contacts and
  icons remain shared; article navigation uses its source pill layout and unboxed logo.
  The homepage variant retains its existing composition. The article does not mark Home current.
- [ArticleAdjacent](../../src/components/article/article-adjacent.tsx) renders the two recovered
  destinations, source labels/titles and thumbnails in their original order.
- [ArticleRelated](../../src/components/article/article-related.tsx) renders three recovered
  cards with source image, category link, date, title and action label. A native scroll-snap
  strip shows three/two/one cards across desktop/tablet/mobile. It supports touch scrolling
  and keyboard access to every link without a client carousel or cloned hidden cards.
- Related/adjacent destinations use full document links, including Latin-slug Arabic articles.
  Their complete page bodies are outside this chunk; retaining a link does not accept its target.
- [ArticleImage](../../src/components/article/article-image.tsx) preserves source responsive
  sizes for featured images, thumbnails and cards. Only validated local media is rendered.
  Its picture source owns variant selection; the featured image uses eager loading/high fetch
  priority without a conflicting preload of the fallback image. Synchronous decoding is explicit.
- [prepare-article.py](../../tooling/prepare-article.py) now recovers presentation media as
  well as body media: 53 unique original/variant files with ZIP/member/hash provenance,
  including the desktop and mobile footer backgrounds recovered from stylesheet 117.
  The production asset allowlist and GET/HEAD checks use the same inventory.

Generated files remain reproducible; the application imports no raw archived HTML, source CSS,
SQL or ZIP files. Components render typed semantic content. No empty future integrations are added.

## Commands and evidence

```powershell
.venv/Scripts/python.exe tooling/recover-article-reference.py
node tooling/measure-article.mjs
.venv/Scripts/python.exe tooling/prepare-article.py --check
npm.cmd run verify:article-presentation
.venv/Scripts/python.exe tooling/compare-article.py tmp/chunk5/<successful-run-directory>
```

The single engineering command runs the existing frozen-evidence/doc checks, generated-data
checks, eight conversion tests, formatting, linting, types, unit tests, production build/trace
checks and production HTTP/browser tests. Its owned loopback server and isolated fixture copy
retain Chunk 1's lifecycle and mutation safeguards. Reports live under ignored `tmp/chunk5/`.

Browser evidence must cover complete source body/code equality, all local images decoding,
correct share targets, source navigation/card identities, keyboard scrolling/focus, responsive
geometry, no page overflow and no required-resource/hydration errors. Capture both the viewport
and full page. Investigate Chunk 4's mobile full-page image omission; an image decoding check
alone does not establish that its pixels appear in a screenshot.

[Capture validation](../../tooling/check-article-captures.py) runs after the browser suite and
rejects blank featured-image interiors in any of the six full-page captures. It records the
capture hash, measured crop and channel extrema. This checks that image pixels were painted;
it does not establish the correct image, crop or visual equality. Those require the source
asset checks and strict historical comparison.

Strict comparison preserves original dimensions and pixels, with no masks, rescaling or
baseline replacement. A failing comparison remains an open visual gate even if engineering
tests pass. Record final results and remaining visible differences here before handoff.

## Review findings

The focused six-project article checks passed after the navigation/card changes. They verify
all source body text, code and heading order, every adjacent/card destination and label,
image decoding, approved sharing URLs and keyboard access to the last off-screen related
card. The newly added capture check passed for all six projects in the refined review.

Comparison of all 278 source/current mobile body elements found matching tag order and
geometry, with subpixel third-level heading line-height rounding accumulating to about half
a pixel; the renderer now uses the source's em line-height. No text or code was changed to
achieve that alignment. The earlier missing featured image is present in the refined captures;
the capture gate protects that specific regression. This does not prove a single browser cause.

Long-page Chromium captures still warrant regional review: a full-page image can omit the
bottom of the footer even though the page contains the email, social links and copyright.
The archived mobile screenshot also ends during the contact block. Preserve those historical
pixels; do not clip the implementation to reproduce a capture artifact. The initial full-page
height differences remain in strict comparison reports. Card spacing/typography, source
template interactions and reliable complete-footer evidence require review before accepting
the page.

## Final verification

`tmp/chunk5/2026-10-17T10-25-32-649Z/manifest.json` records the passing production gate:
eight conversion tests, 15 unit tests, 114 HTTP tests, 42 browser tests and six nonblank
featured-image capture checks. The strict comparison in `visual-article/report.json` fails:

| Profile | Archived height | Current full-page capture | Difference |
| ------- | --------------: | ------------------------: | ---------: |
| Desktop |       23,541 px |                 23,535 px |      −6 px |
| Tablet  |       21,802 px |                 21,833 px |     +31 px |
| Mobile  |       24,945 px |                 24,978 px |     +33 px |

These dimensions do not establish pixel equality. `geometry-review.json` retains the measured
landmarks, including layout changes observed after Chromium's full-page capture.

A separate mobile viewport review captured 30 ordinary 390 × 844 frames while keeping the
document height stable at 24,978 px. Its `mobile-viewport-review/tiles.json` records scroll
positions. The exact-scale `article-viewport-mosaic.png` joins only uncovered rows from those
frames, with no rescaling, masks, content replacement or missing vertical ranges. The
`complete-footer.png` crop visibly includes the approved phone/email, social links and
copyright. This provides complete-footer evidence independently of the problematic full-page
capture; it does not replace the historical screenshot or pass the visual gate.

This result note was added after the engineering run. `documentation-review.json` records
subsequent documentation validation and verifies application/test source hashes are unchanged.
The final engineering manifest and diagnostic reports are linked from `tmp/chunk5/latest.json`.

## Completion and remaining gates

The presentation implementation is reviewable when source extraction is deterministic,
engineering checks pass, all recovered cards/thumbnails work locally and the measured visual
differences are recorded. Accept the page only after the complete archived design, relevant
interactions and screenshot capture are reconciled. Homepage fidelity, Arabic article recovery,
taxonomy templates, real Sanity publishing, deployment and launch authorization remain open.
