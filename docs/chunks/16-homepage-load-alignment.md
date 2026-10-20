# Chunk 16 — Homepage first paint and visual corrections

Updated: October 18, 2026. Scope: the reported homepage hero flash/alignment, service cards,
and additional source-confirmed homepage details. This follows the broad engineering pass in
[Chunk 15](15-visual-motion-alignment.md); it does not accept the homepage or other routes.

## Evidence and diagnosis

Compare the frozen `nalk-wordpress-2026-10-15` homepage, route `R-91d9b62648d713d4`, with
[the live homepage](https://nalksolutions.com/) and the local production build. Supplemental
live observations are from October 18, 2026; they do not replace frozen evidence.

- At 2048×1000, the original navbar and hero content both start at x=244px. The previous
  reconstruction left hero content at x=40px while centering the navbar. The hero's inner
  frame and inherited percentage gutter also have different containing blocks: a naive
  subtraction leaves a further 10px error near 1707px. The corrected padding accounts for
  the 10px frame at each side. Tablet/mobile retain their original centered layout.
- Server text was visible before `SiteMotion` hydrated. Its effect then created a backwards
  filled, paused animation with opacity zero. That hid already-painted text and replayed it.
  Static settled screenshots and the former animation-call assertion missed this defect.
- The four service actions had text/padding but omitted their source gradient and radius.
  Source normal gradient is 70deg, `#008cff` at 0% to `#6d2785` at 70%; hover changes to
  white/cream with dark text over 300ms ease-in-out. The link remains one accessible card,
  with equivalent keyboard focus feedback and no nested interactive element.
- Above 1600px, the source About section uses a 140px column gap; the reconstruction used
  80px, making its ring image 30px taller and pushing the service section down by 30px.
- Crossed ribbons used 52px type, wrong icons/angles and incomplete text groups. Source
  widgets `8d87445` and `0ce1db3` use 32/28/24px Space Grotesk 500, 50px item gaps,
  20px `star-2` glyph `U+E915`, rotations +4°/−3°, and opposite horizontal directions.
  Live translation advanced about 61px in one second; the replacement uses 60px/s.
- The service contact sentence lacked source −1px letter spacing. Featured-service labels
  lacked their source `#272727` fill. Both are corrected without changing content.

Supplemental measurements/screenshots are in `tmp/home-audit-before`, `tmp/home-detail.json`,
`tmp/home-button.json`, `tmp/home-marquee-source.json` and `tmp/home-extra-source.json`.
These are diagnostic artifacts, not new baselines. Script-free references can omit source
entrance fragments; use live observations before treating a blank heading as intended design.

## Implementation boundaries

`initialEntranceAttributes` emits source timing as CSS custom properties on the hero badge,
heading and buttons. `entrances.css` starts their finite opacity/transform animation with the
first styled paint. Backwards fill reserves their final layout during the delay and releases
the animation's transform after completion, allowing normal button hover behavior. Hydration
does not own/recreate these animations. No JavaScript is required for them to finish; reduced
motion disables them, and focus immediately exposes a focused control.

`motion-controller.ts` continues to own below-viewport entrances. It skips CSS-owned initial
entrances and anything already in the viewport when enhancement mounts. A late script, history
restore or client navigation must not hide text the visitor can already see. This deliberately
prioritizes stable visible content over replaying a delayed entrance on an already-painted item.

`SiteFonts` uses ReactDOM font preloads, emitted during server rendering, for the two existing
local variable fonts. Font files, families and source typography stay unchanged. There is no
external font dependency, pre-hydration script, body-hiding class or hydration suppression.

`HomeMarquee` owns only the decorative ribbons. Server-rendered repeated groups remain usable
as a static design without JavaScript. A scoped ResizeObserver measures the untransformed group
width to set the CSS loop duration, and IntersectionObserver pauses offscreen motion. Cleanup
disconnects both observers. Reduced motion disables the loops. The source text, icon, type,
angles and gradient are preserved; no captured WordPress scripts execute in the application.

Routing, content, SEO metadata and public evidence are unchanged. The local preview remains
loopback-only. Sanity, deployment and integrations remain outside this correction.

## Verification

Use the existing production test harness; it refuses occupied ports, copies the content data,
starts its own production server and terminates only that server. Do not rebuild while another
production capture is using `.next`.

```powershell
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
python docs/tools/check_docs.py --with-evidence
npm run build
$env:CHUNK_RUN_DIR='tmp/chunk16/focused-production-03'
$env:BROWSER_TEST_WORKERS='2'
node tooling/run-browser-tests.mjs browser '--grep=homepage|hero entrance|buttons crossfade|reduced motion|server content remains|testimonial video|responsive header|same-language routing|original representative|public response is useful'
$env:CHUNK_RUN_DIR='tmp/chunk16/http-01'
$env:TEST_PORT='3110'
node tooling/run-browser-tests.mjs http
```

The strengthened cold-load regression delays application JavaScript by 1800ms and fonts by
350ms, samples actual computed heading opacity and layout every frame, and requires a single
monotonic entrance through hydration. It attaches frame samples and checks initial CLS below
0.01 where the browser supports layout-shift observations. Chromium, Firefox and WebKit run
the flow. An empty shift list in a browser without that API is not a measured CLS result.

Homepage tests include service button states, ribbon typography/directions/reduced motion,
dialogs/video/focus, no-JavaScript content, asset/font readiness and overflow. The desktop
geometry sweep covers 320, 390, 767, 768, 1180, 1181, 1600, 1601, 1707, 1920 and 2048px;
above 1180px it requires hero/navbar left edges to agree within 0.1px. Navigation regressions
include same-language transitions, language document navigation, history and direct entry.

## Results and remaining acceptance

Final build: `ZdplLJ1CO9ynqMNUSqs22`. Focused verification passes **333 tests**: 30 Vitest,
231 production HTTP and 72 browser cases. Browser/HTTP reports contain zero skipped,
unexpected or flaky cases. Formatting, ESLint, strict TypeScript, production build and frozen
evidence/documentation validation also pass. This is a focused correction gate; the unfiltered
Chunk 15 suite was not rerun for this change.

- Browser report: `tmp/chunk16/focused-production-03/browser/results.json`, with traces,
  screenshots and six cold-load frame attachments (91–282 samples each). The four Chromium
  profiles record no initial layout-shift entries under the artificial JS/font delays.
- HTTP report: `tmp/chunk16/http-01/http/results.json`. Tests include all configured legacy
  initial responses, retained content/SEO, publication and controlled failures.
- Source/current production screenshots: `tmp/chunk16/home-capture-02/manifest.json`;
  three baseline profiles pass capture checks with no current resource/console/overflow errors.
  Page-height deltas are +9px desktop, 0px tablet and −3px mobile. These are diagnostics, not
  proof of identical pages. Ordinary viewport PNGs remain available alongside full-page PNGs.
- Extra 1707×1000 and 2048×1000 comparisons: `tmp/chunk16/home-wide-01/manifest.json`.
  Source and current hero x/y/width/height match exactly; the current navbar shares the hero
  left edge. All four service heading x coordinates/widths match, with y deltas of −0.0625px.
- Strict review: `tmp/chunk16/home-review-02/report.json`, **three different / zero accepted**,
  exit 1 retained. Paint diagnostics: `tmp/chunk16/home-capture-02/paint-integrity.json`,
  **5/72 regions differ**, exit 1 retained. Use native viewport frames for those regions.
- Consolidated build/dependency/source/report identities: `tmp/chunk16/manifest.json`.

The first focused run correctly failed on the 10px percentage-padding error; its artifacts
remain in `tmp/chunk16/focused-production-01`. Run 02 passed 48 cases before the ribbon
corrections and stronger font/CLS regression; it is not evidence for those later changes.

Whole-page exact-pixel comparisons remain a separate failing gate. Keep reports, including
failures, and do not update historical screenshots or mark routes accepted from these focused
tests. Remaining homepage review includes logo-carousel behavior, source inner-fragment
sequencing, counters, sticky/back-to-top behavior and complete state/pixel reconciliation.
The broader Chunk 15 backlog, real integrations, Sanity and release gates remain open.
