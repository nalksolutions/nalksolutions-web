# Service-area cards and shared disclosure motion

October 20, 2026. D-24 responds to the owner's regional-section and accordion feedback.

## Presentation changes

Linked service-area groups with a heading, copy and action in each column now use the existing
Home glass surface. Shared grid rows align headings, body copy and full-width action heights;
mobile cards stack with intrinsic sizing. Heading size, spacing and button wrapping are bounded
so the preserved descriptions and descriptive links remain readable.

`presentServiceNodes` adds presentation attributes to matching recovered groups without mutating
source documents. Classification uses existing node roles, independently of route or city names.
Frozen text, ordering, destinations, metadata and structured data remain unchanged. Other service
layouts retain their existing composition.

## Disclosure behavior

All recovered disclosures and authored specialist groups now use `AnimatedDisclosure`, matching
the Home FAQ mechanism. Server-rendered native details/summary and ordinary links remain usable
without JavaScript. The client enhancement animates measured height for 320ms and body opacity
for 200ms; native content semantics remain intact.

The shared implementation now includes outer padding/borders in its end measurements, cancels
both animations during reversal/unmount, prevents focus entering a closing body, and restores
natural sizing after completion. Reduced motion settles immediately. Specialist plus indicators
rotate during opening and closing. No new animation dependency or page builder was added.

## Focused verification

Passed: targeted ESLint/formatting, strict TypeScript, nine unit tests (including non-mutation,
text/link preservation and four offer destinations), and four short Chromium cases on desktop
1440x1000 and mobile 390x844. Browser checks cover shared action geometry, animation in both
directions, rapid reversal, keyboard activation, reduced motion, no-JavaScript links, overflow,
and console/resource diagnostics. Desktop/mobile card previews were visually inspected.

Final development-server report/previews: `tmp/service-polish/smoke-final/` (four cases, 32.2s).
The earlier two-case run is retained in `tmp/service-polish/smoke/`. No full engineering,
production-build or broad cross-browser gate was run, respecting the owner's focused-test request.
Owner visual approval remains open.
