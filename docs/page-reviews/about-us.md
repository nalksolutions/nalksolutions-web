# About Us tidy-up

Verified: October 20, 2026. Status: implemented; owner review remains open.

Owner direction: retain the overall About Us design and tidy its presentation under the
D-17 redesign-first workflow. Scope is `/about-us/`; owner design lock and Arabic delivery
remain open.

## Changes

- Retain the source hero artwork, values image, CEO portrait/message, service imagery,
  section order, all three reviews and all source copy and destinations.
- Balance hero typography and spacing. Keep existing header styling and homepage button
  behavior rather than introducing new controls.
- Give Vision and Mission readable line spacing and restrained, paired dark surfaces.
- Contain and round the CEO portrait; use a stacked portrait/message on tablet and mobile
  instead of squeezing text into a narrow column.
- Align service images and copy within consistent page gutters, including mobile. Use a
  predictable image aspect ratio and reduce the excessive gap above the service cards.
- Contain review cards to the content width, improve quote contrast, align desktop
  attributions and remove the fixed 140px attribution gap. All three reviews remain visible
  on tablet instead of hiding the third. Smaller screens use a readable single column.
- Bound the About footer logo width so it does not expand across the tablet screen.

Only `src/styles/company.css` changes application presentation. No generated document,
metadata, public asset, route or source evidence is rewritten. About-specific refinements
are scoped to its layout or its unique section classes; the other company layouts retain
their contracts. No new component, client-side dependency or animation system is needed.

## Verification and review

The existing About browser test now checks image/card gutters, all three visible reviews,
readable statement typography, desktop attribution alignment and bounded footer branding,
in addition to shared button styles, hover/focus, navigation/history, refresh, no-JavaScript
operation and no horizontal overflow. Company-family expectations record the intentional
tablet visibility and statement typography improvements.

Run formatting, lint, strict types, unit tests and a production build/bundle guard, then
production HTTP tests and focused browser tests for About, all five company layouts,
services-directory actions and shared navigation/hero motion. Inspect desktop, tablet and
mobile screenshots. Record exact results and evidence after the final run; do not infer
whole-site visual approval or an Arabic transition from passing engineering checks.

Reproducible commands (Node 24, npm, existing local fixture environment):

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run verify:build
npm run test:integration
npm run test:e2e -- "--grep=about page|company structure|services directory shares|same-language routing|public response|hero entrance"
```

Production build `Q67p4qYCf3FfgvEowNm_7` passes all 13 recorded checks: documentation/source
evidence, generated content/assets/routing consistency, formatting, lint, strict types,
30 unit tests, production build/bundle guard, 232 HTTP tests and 66 focused browser tests.
There are no failed, skipped or flaky browser cases. Coverage includes Chromium at 1440,
768, 390 and 320px, plus desktop Firefox and WebKit. The complete historical site-wide
browser suite was not rerun for this scoped presentation change.

The source-frozen run is retained under
`tmp/about-tidy/production-2026-10-19T18-52-01-653Z`; its `manifest.json` records exact commands,
dependency versions, baseline and input checksums. `visual-review/manifest.json` records
30 production captures and their checksums, with zero resource/console errors. Full-page
desktop/tablet/mobile views and native section samples were inspected. The owned capture
and test servers stop after use; the existing development preview stays on port 3000.
Before/after development captures remain under `tmp/about-tidy`.

Only this final work record changes after the source-frozen gate; the handoff manifest
reconciles its final checksum and verifies that application/test inputs and preserved source
assets/documents remain unchanged. Content and metadata preservation are independently
covered by the production HTTP tests. Owner visual approval, new Arabic content, Sanity,
integrations and release acceptance remain open.
