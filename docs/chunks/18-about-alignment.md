# Chunk 18 — About alignment and shared actions

Updated: October 18, 2026. Scope: `/about-us/` (`R-71192976f0e75fcc`), the shared
homepage button contract and company-page regression checks. Frozen baseline:
`nalk-wordpress-2026-10-15`. All route acceptance fields remain open.

## Findings and implementation

The [live About page](https://nalksolutions.com/about-us/) and preserved WordPress evidence
were compared at 1440, 768 and 390px. The existing text, images, SEO and hidden team section
remain source-derived. Live DOM measurements also confirm that the additional product CTA
and alternate mini-footer found by text extraction are hidden; they are not visible sections
to reconstruct.

About now opts into the existing `ButtonLink` and shared button classes used by Home and
Services. Its custom source SVG is retained through the shared icon slot, preserving body
text without adding a decorative glyph character. The separate About hover/pseudo-element
rules are removed; the shared styles own transitions, cream feedback, keyboard focus and
reduced-motion behavior. The homepage primary gradient/glow is intentional under the
owner's consistency instruction.

The visible “View All Services” source anchor has no href, previously recovered as `#`.
The reviewed converter now maps that exact About action to `/our-services/`, records the
correction in generated recovery provenance, and rejects an unexpected node shape. This is
an intentional functional correction. The hidden “Meet the Team” link is unchanged.

Source-confirmed presentation corrections:

- Showcase headings retain Manrope 24px, with the original 500 weight and normal tracking.
  Removing the inherited negative tracking restores tablet line wrapping.
- The offerings badge is centred on tablet as well as mobile. Its background spans the
  viewport, with a 1280px desktop content boundary and responsive source gutters.
- The CEO section uses the source background's natural size and default position, instead
  of stretching/cropping it. Its quote SVG uses the source baseline alignment, restoring
  the line box and vertical placement of the message/signatures.
- Heading line-height units follow the source. The reviews heading retains its 850px
  desktop width and full-width responsive container.
- Testimonial body, rating and author line boxes are separated, restoring source spacing
  without changing the quote or author text. Existing responsive visibility is retained.

Runtime continues to render validated semantic content and local assets. No WordPress
runtime, archive import, new client component or page-specific click handler is introduced.

## Verification and evidence

Supplemental observations and screenshots: `tmp/chunk18/before`, `tmp/chunk18/details.json`,
`tmp/chunk18/pseudo.json`, and development iterations `after-01` / `after-02`.
Production test results and capture identities are recorded in `tmp/chunk18/manifest.json`
when the focused gate finishes. Intermediate captures do not establish visual acceptance.

```powershell
.\.venv\Scripts\python.exe -m unittest tooling.tests.test_company_content
npm run build
$env:CHUNK_RUN_DIR='tmp/chunk18/browser-02'
$env:BROWSER_TEST_WORKERS='2'
node tooling/run-browser-tests.mjs browser '--grep=about page|services directory|company structure|homepage|hero entrance|buttons crossfade|reduced motion|server content remains|testimonial video|responsive header'
$env:CHUNK_RUN_DIR='tmp/chunk18/http-01'
$env:TEST_PORT='3110'
node tooling/run-browser-tests.mjs http
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
.\.venv\Scripts\python.exe docs/tools/check_docs.py --with-evidence
```

The browser suite checks actual computed Home/About button parity, hover and keyboard focus,
reduced motion, pointer/touch/keyboard Services navigation, history, refresh and no-JavaScript
navigation. Existing company, Home and Services checks cover shared-renderer regressions.
Profiles include Chromium desktop/tablet/mobile/320px, Firefox and WebKit. Production HTTP
checks preserve the existing raw body-text hashes and SEO expectations without relaxing them.

This is a focused engineering gate. Exact whole-page and complete animation/state acceptance,
other page reconciliation, real Sanity, integrations and deployment remain open.

Production capture `tmp/chunk18/capture-01/manifest.json` uses build
`X3OAx5wxugqbaxnU-xkRs`, a harness-owned loopback server and the three archived viewport
dimensions. Current/source heights are 4646/4647 desktop, 5402/5402 tablet and 7976/7976
mobile. Capture checks report no current console/resource/overflow errors. All 44 image-paint
regions agree between full-page and ordinary viewport captures. Strict whole-page comparison
still reports three differences and zero acceptances; one of 21 native viewport frames is
exact in RGB. These results are retained without masks, resizing or relaxed assertions.

The first browser run (`browser-01`) stopped at a Firefox favicon `NS_BINDING_ABORTED`
during the existing rapid history test. Trace network records show four surrounding successful
200 favicon responses and the cancelled 200 request. The unchanged suite is rerun in
`browser-02` after the HTTP/capture workloads finish. Neither resource diagnostics nor test
expectations are relaxed. The failed/interrupted run remains available for review.

Final result: **378 tests pass**: 30 Vitest, 231 production HTTP, 114 production browser and
three Python company/source contracts. Browser run `browser-02` reports zero unexpected,
skipped or flaky tests. Generated-content consistency, formatting, lint, strict types, frozen
evidence/documentation validation and build import boundaries pass. The manifest rechecks
the runtime source fingerprint and records final documentation hashes. The complete earlier
engineering suite is not claimed as rerun. Harness-owned test/capture servers are stopped;
the development preview remains available at `http://127.0.0.1:3000/about-us/`.
