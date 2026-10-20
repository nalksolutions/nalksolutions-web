# Services overview tidy-up

Verified: October 20, 2026. Status: implemented; owner review remains open.

Owner direction: continue the page-by-page refinements with `/our-services/`, after the
About Us tidy-up. Preserve content, destinations, SEO and the shared homepage buttons.
This is presentation work under D-17; owner design lock and new Arabic delivery remain open.

## Changes and boundaries

- Keep the hero artwork and reduce its excess lower spacing; constrain the lead to a
  readable measure and improve line spacing.
- Give the four main service cards a clear icon/copy composition, with stacked mobile
  layouts. The source AI card has no icon; a decorative CSS shape fills that empty region
  without adding text or modifying the captured content.
- Align specialist and location cards in three desktop columns, two tablet columns and
  one mobile column. An odd final tablet card spans its row. Remove redundant inner card
  padding, align text to the start and keep row actions aligned despite differing copy.
- Use restrained dark purple surfaces, bright readable copy and the existing cream icons.
  Whole-card links, keyboard focus and homepage button transitions remain unchanged.
- Balance closing-section spacing and image/copy widths, and bound the page's footer logo
  so it does not stretch across tablet screens.

Only `src/styles/company.css` changes application presentation. The four primary links and
21 specialist/location links retain their exact content and destinations. No captured
document, route, metadata, public asset or source evidence changes. Existing shared card-copy
markup is reused; no component library, client dependency or duplicate button system is added.

## Verification

The existing Services directory suite covers shared button appearance/hover/focus/reduced
motion, full-card targets without nested controls, all 25 destinations, pointer/keyboard
navigation and history, and operation without JavaScript. It now also checks card gutters,
row action alignment and bounded footer branding. Existing company-family checks retain
the source counts, responsive column counts, fonts, local assets and navigation behavior.

The initial visual review caught a tablet spanning selector that assumed direct card children;
the preserved source uses a `display: contents` wrapper. The selector now follows that
structure, and the browser test explicitly measures the final card against the full grid
width on odd tablet rows. The preliminary production run was intentionally stopped before
completion to make this correction; its interrupted results are not acceptance evidence.

Production verification includes formatting, lint, strict types, unit tests, build/bundle
guard, HTTP preservation checks and focused browser coverage of Services, all company pages,
About, shared navigation and hero motion. Before/after development captures live under
`tmp/services-overview`. Record final production results and review evidence after the run.
Engineering checks do not imply whole-site visual acceptance or an Arabic transition.

Reproducible commands (existing Node 24/npm environment):

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run verify:build
npm run test:integration
npm run test:e2e -- "--grep=about page|company structure|services directory|same-language routing|public response|hero entrance"
```

Final production build `4wuBUgUE7-421pRq7tOSK` passes all 13 recorded checks, including
30 unit tests, 232 production HTTP tests and 78 focused browser tests. There are no failed,
skipped or flaky browser cases. Browser coverage includes Chromium at 1440, 768, 390 and
320px, plus desktop Firefox and WebKit. All 25 directory destinations receive keyboard
navigation checks in Chromium desktop; other browser/viewport projects supplement this
with representative pointer/keyboard, history and no-JavaScript flows. The complete
historical site-wide browser suite was not rerun.

The source-frozen run is `tmp/services-overview/production-2026-10-19T19-35-43-603Z`.
Its `manifest.json` records commands, dependency versions, the source baseline and input
checksums; no inputs changed during the gate. `visual-review/manifest.json` records 36
production captures and checksums, with zero resource/console errors. The three full-page
desktop/tablet/mobile views and native main-card, grid and closing-section samples were
inspected. Owned verification/capture servers stop after use; the port 3000 preview remains.

Only this final record changes after verification; `handoff.json` reconciles its checksum,
checks the frozen source assets/documents and records the exact scoped application/test
changes. Content, URLs and SEO remain preserved. Owner design approval and the D-17 Arabic
transition remain separate from this completed implementation and engineering verification.
