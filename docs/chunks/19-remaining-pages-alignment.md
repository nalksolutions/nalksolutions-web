# Chunk 19 — Remaining active pages and shared actions

Updated: October 18, 2026. Scope: all 107 active visitor-facing content routes under D-16,
including the eight HTML-sitemap journeys. The eleven disconnected project/demo pages remain
outside reconstruction. This continues the Home, Services and About reviews across the rest
of the active site. Frozen baseline: `nalk-wordpress-2026-10-15`.

## Implementation and source observations

All remaining standalone company/service actions, Arabic service-card actions, listing
“Read More” actions and enquiry buttons use the existing homepage button classes and
interaction rules. Primary, blue card and outline appearances are the existing homepage
variants. Page-specific duplicate button definitions and listing wrapper translations are
removed. A listing action now moves once, rather than accumulating wrapper and button shifts.
Pagination, search icons, disclosure and tab controls keep their appropriate semantic roles.

The document renderer preserves each action's source children, label and destination, with
locale-aware navigation. Company `ButtonLink` actions now also perform full document
navigation across languages. Its optional icon accepts explicit `null`, preventing a blank
icon slot or invented decorative character on source text-only actions. Services-only copy
grouping is an explicit context option; Arabic cards retain their distinct source layout.
Their existing outer padding is moved into the single anchor, making the whole card usable.

Disabled enquiry controls share the same base typography, geometry and palette but do not
animate or imply successful delivery. The email alternative remains visible. The shared CSS
reset no longer overrides button typography through a more specific `font: inherit` rule.
Real form delivery is still an integration gate.

Contacts source evidence (`post-38573.css`) confirms the 579/540px hero columns, 30px copy
gaps, source contact typography, zero-gap information/enquiry columns, 41%/58% information
widths and 48%/52% enquiry widths. These replace the previous generic grids. Responsive
gutters, section gaps, source input/textarea sizing and image/location spacing are corrected.
The map remains an explicit external link in a 417px reserved region matching the source
iframe height; it is not an embedded/live-map implementation.

The source Contact hero wrapped both phone numbers and email in one malformed telephone
link. The converter now creates separate `tel:+966506000843`, `tel:+923055518777` and
`mailto:info@nalksolutions.com` links, preserving exact visible text and recording the
correction in recovery provenance. This introduces no message delivery or new contact data.

Additional source-confirmed corrections include the full available category-title width
(the 1280px cap incorrectly wrapped Custom Software & Apps on desktop), sitemap list
indent/margins and 6px item spacing, profile education-label typography, heading line-height
units and the working-shifts trailing space at each breakpoint.

The remaining three article exceptions are also corrected. Image margins use three times
the article body size, matching the theme's root-relative spacing, rather than inheriting a
heading's font size. This removes excess space around images nested in headings. The single
paragraph inside the Digital Ads table retains its source top/bottom spacing. The theme's
`blockquote:not([class])` selector is verified from the backup: classed source quotations are
mapped to a finite `plain-quote` role, preserving the plain quotation without replaying source
utility classes. Other quotations keep the decorative treatment. These changes preserve all
body text and are covered by source conversion and browser contracts.

Contact location copy now retains the source's extra widget spacing. On mobile, ordinary
flow gaps reproduce the source's visible address/opening-hours positions without copying its
negative margins. The two card endings retain their individually measured source spacing.
Phone/email links and form-delivery limitations remain independent of those geometry fixes.

Live observations also show the Arabic company title behind the desktop navigation and
Contact title behind tablet navigation. The rebuild intentionally reserves header clearance.
Sitemap title clearance is increased for the same reason. These are usability corrections,
not source pixel matches. No source text, image, metadata or URL identity is replaced.

Observations and iterative diagnostic captures are under `tmp/chunk19`: `before`,
`profile-listing-details`, `contact-detail.json`, `contact-source.css`, `profile-shifts.json`,
`service-tabs-audit.json` and `sitemap-audit.json`. The initial working audit spans development
edits; use final production captures for the final application identity. Live evidence is
supplemental and does not replace the frozen migration content.

## Verification contract

```powershell
npm run verify:visual-engineering
```

The complete engineering gate runs documentation/frozen evidence, generated source and
motion contracts, Python tests, formatting, lint, strict types, Vitest, the production build,
bundle/import checks, production HTTP and the unfiltered browser suite. It owns its loopback
server, refuses occupied ports and stops only its own process. Runtime and source identities
are frozen during the gate. Final result documentation is reconciled separately with hashes.

Coverage tests assert the shared action contract on every recovered page, supplementing
raw body-text and SEO preservation checks. New journeys exercise English and Arabic service
CTAs, location pages, Contacts, Arabic company cards, Blog and profile article actions.
They check hover, focus, reduced motion, keyboard/pointer/touch navigation, history,
cross-language document replacement and no-JavaScript operation. Company checks verify
heading/header clearance, deliberate disabled states and individual phone/email destinations.
Existing tests continue to cover all page families, tabs, disclosures, search, pagination,
articles/sharing, Home and the shared shell.

Final production visual capture covers every active route at 1440×1000, 768×1024 and 390×844:
321 source/current pairs. Native ordinary viewport frames are retained in addition to full
PNGs. Source cache reuse requires matching baseline, browser, source HTML, screenshot and
viewport-sequence checksums. Strict review uses no masks or image resizing and must retain
differences as differences. Pixel comparison results are independent of engineering success.

## Completion record and limits

The final [evidence manifest](../../tmp/chunk19/manifest.json) records build/source identity,
dependency versions, command outcomes, test reports, per-route captures, errors and visual
differences. No route is marked accepted merely because it renders, a family test passes or
a screenshot exists.

The final [complete engineering gate](../../tmp/chunk15/2026-10-18T14-27-50-029Z/manifest.json)
passes all sixteen commands on build `65AVM5xQe7v6yJrSqIyvw`. Source identity was rechecked
after the run. All 1,110 tests pass: 69 Python, 30 Vitest, 231 production HTTP and 780 browser.
The HTTP/browser reports have zero failures, skips or flaky results. Browser coverage includes
Chromium desktop/tablet/mobile/320px, Firefox and WebKit. Generated-data, motion, formatting,
lint, strict typing, build and import/bundle boundaries also pass. The recorded environment is
Node 24.15.0, npm 10.8.2, Next.js 16.4.1 and React 19.3.1; the gate manifest records every exact
dependency version. Final documentation changes are validated separately and hashed in the
evidence manifest; application, content, test and tooling inputs remain those of the passing gate.

The final [production capture](../../tmp/chunk19/all-pages-final-02/manifest.json) contains
321 source/current pairs covering all 107 active routes. All current responses are 200, with
zero capture failures, browser errors or failed images. The owned capture server used the same
build as the gate and was stopped afterwards. The [per-route CSV](../../tmp/chunk19/route-visual-summary.csv)
and [JSON](../../tmp/chunk19/route-visual-summary.json) retain every height delta and screenshot
reference. 147 document heights match exactly, including 116 of the 129 article cases; height
equality is diagnostic, not acceptance. Digital Ads and EDM Marketing now match source heights
at all three widths. Web Development and Digital Marketing matches on desktop/tablet and
retains a 6px mobile difference. All remaining deltas are recorded, not automatically excused.

The [strict visual report](../../tmp/chunk19/visual-review-final-02/report.json) retains
321 differing whole-page comparisons and exits 1. It uses zero RGB tolerance, no masks and
no resizing for assertions. The [paint-integrity report](../../tmp/chunk19/all-pages-final-02/paint-integrity.json)
also exits 1: 409 of 6,082 image regions differ between full-page and ordinary viewport captures
(59 reference, 350 current). These are evidence limitations and unresolved differences, not
passing visual checks. Do not use a full-page PNG alone to accept affected image regions.

The [native comparison](../../tmp/chunk19/native-comparison-final-02.json) checks 3,062 frame
positions without masks/resizing. 2,877 have matching scroll positions; 692 match exactly in
RGB. Unpaired/different-scroll frames remain explicit. The [native viewer](../../tmp/chunk19/native-gallery-final-02/index.html)
retains all 321 cases, with hashed source/current frames. Its frame selection, local image
decoding and route filter pass the [viewer smoke check](../../tmp/chunk19/native-gallery-final-02/viewer-smoke.json).
Native spot inspection includes Contact mobile, the Arabic company heading/cards, category
heading width, a tablet profile, the plain article quotation and a flagged image region.
This inspection does not accept those routes or replace their remaining state review.

Contact's responsive aligned reference omits the source iframe, whereas the rebuild preserves
its 417px reserved map-link region. That deliberate difference and the visible enquiry email
alternative explain substantial responsive height differences, but neither proves map/form
integration. Header clearance and homepage action geometry are also deliberate corrections.
Other differences remain open in the reports. All 149 route acceptance records remain open;
zero routes are accepted. No source backup, archived HTML/screenshot or frozen register changed.

The initial complete gate at `tmp/chunk15/2026-10-18T14-02-14-526Z/manifest.json` passes
all sixteen commands and 1,091 tests (68 Python, 30 Vitest, 231 HTTP and 762 browser) on
`x5U_49K7JlEiNgKbsuskC`. Its 321 captures are retained in `all-pages-final-01`. The article
exceptions and final Contact spacing were found during that review; this is an intermediate
identity, not the final corrected build. The final full gate above was rerun after those corrections.
Early action-probe failures and traces remain under `actions-probe-*`; assertions were not
relaxed to hide the reduced-motion defect. The header-clearance test measures visible
controls, excluding transparent container padding.

Exact per-page visual/state acceptance remains separate. Source fragment/carousel/counter
sequencing, embedded maps, real enquiry delivery, Sanity, staging and deployment remain open.
This task does not authorize deployment or change legacy routing dispositions.
