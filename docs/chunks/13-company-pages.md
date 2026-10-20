# Chunk 13 — Primary company pages

Status: engineering gate passed. October 18, 2026 (Asia/Karachi). Visual acceptance and integrations remain open; no page accepted or deployed.

## Scope

Reconstruct the five primary corporate/company destinations selected by
[D-16 and Chunk 12](12-active-navigation-scope.md). Preserve frozen source content, SEO,
paths and page-specific structure. The active scope remains 107 content pages. The eleven
disconnected project/demo pages receive no further reconstruction in this chunk.

| Public path                | Source route       | Source WordPress page | Layout            |
| -------------------------- | ------------------ | --------------------- | ----------------- |
| `/about-us/`               | R-71192976f0e75fcc | 38769                 | About             |
| `/our-services/`           | R-e83c0ad06ef3deb6 | 55355                 | Service directory |
| `/contacts/`               | R-a0ac0f2631af30d8 | 38573                 | Contacts          |
| `/شركة-تقنية/`             | R-56afdad51c5c96c4 | 59048                 | Arabic company    |
| `/nalk-solutions-sitemap/` | R-393cf74e2e96e1c4 | 58947                 | HTML sitemap      |

Complete content was already recovered in Chunk 9. This chunk changes presentation without
rewriting copy or metadata, adding a company-page builder, connecting Sanity, selecting form
transport or authorizing release. About and Contacts retain their recorded absence of a main h1.

## Implementation boundaries

- `tooling/company_content.py` maps reviewed source sections/widgets to finite semantic roles.
  Unknown sections, background URLs, testimonial ratings and icon mappings fail validation.
  No arbitrary source CSS, source classes, inline styles or executable HTML enter the runtime.
- `tooling/prepare-site.py` uses this converter only for the five stable route identities.
  It compares complete converted text against the prior converter and retains all source headings.
  Four compiled page stylesheets supply background provenance; the sitemap has no Elementor layout.
- `tooling/company_evidence.py` independently extracts the reviewed theme heading sizes,
  service-card widths, accent and used icon glyphs from backup stylesheets. Generated browser
  expectations live in `tooling/sources/company-presentation.generated.json`, outside application
  imports. Missing or changed source declarations fail recovery instead of assuming a layout.
- Seven reviewed background images are published through the existing backup media allowlist.
  The shared inventory now contains 951 images/variants, 380,704,836 bytes. The seven additional
  images account for 1,216,101 bytes. Asset byte/hash/dimension checks remain mandatory.
- `src/content/company/assets.generated.json` supplies approved background roles.
  The document schema requires the matching `companyLayout` for exactly these five identities;
  it rejects missing, unrelated or simultaneous article/service layouts.
- `CompanyPage` and `ServicePage` share `CapturedPageFrame` for the existing floating header,
  complete-main region, source footer, locale-aware navigation and safe structured data.
  Page-specific presentation stays in `src/styles/company.css`. The small shared `SkipLink`
  is the only new Client Component, handling browser history and keyboard focus.
- `DocumentBody` continues rendering validated semantic nodes. Reviewed decorative glyphs use
  the already-recovered local icon font through CSS pseudo-elements, adding no content text.

The About source's hidden team section remains in the DOM and hidden at every breakpoint.
Its third testimonial remains in the DOM, hidden on tablet and visible again on mobile.
Source duplicate titles in service-card graphic regions also remain in the DOM with the theme's
hidden visual treatment. The cards are ordinary links, not invented flip interactions. All four
major service cards and 21 nested cards are retained. Arabic Company has six distinct service cards.

The backup icon stylesheet, `uploads/elementor/cmsmasters-local-icons/cmsmasters-demo-icons/style.css`,
provides the five used shape glyphs and four used service glyphs. Shapes 6/7 are not defined.
Those missing glyphs remain absent, as in the archived screenshots; no replacement symbol is invented.
About's gradient highlights, quote SVG and five-star ratings are mapped explicitly.
Contacts retains source location-card order/reversal and its two countries' contact information.
Company heading levels use the archived global kit's Space Grotesk family; body-copy and badge
roles retain Manrope, with the established system fallback for Arabic glyphs.

## Responsive source contract

The archived page styles and global kit establish these behaviors:

| Area                                   | Above 1180px                       | 768–1180px                          | Up to 767px                       |
| -------------------------------------- | ---------------------------------- | ----------------------------------- | --------------------------------- |
| Services subservice/location cards     | Three columns                      | Two columns, odd last card centered | One column                        |
| Services final image/text section      | Row                                | Stacked                             | Stacked                           |
| About values text/image                | Row                                | Stacked                             | Stacked                           |
| About testimonial cards                | Three visible                      | Two visible                         | Three stacked                     |
| Contacts hero, information and enquiry | Rows                               | Stacked                             | Stacked                           |
| Contacts location cards                | Reversed row                       | Reversed row                        | Reversed column, metadata stacked |
| Contacts form fields                   | Name/email row, then phone/message | One column                          | One column                        |

The six heading levels use source-derived breakpoint sizes. Source crops retain a 600px CEO
photo, 350px About service photos and contact hero/location photos, and a 700/600/400px enquiry
photo across the three size ranges. Contacts uses original field labels as placeholders while
retaining associated screen-reader labels. The disabled delivery state and email alternative remain.

The production browser checks exposed a pre-existing shared skip-link history defect: a native
hash activation created a history entry with no router state, so returning from Blog could show
the company URL with Blog content. The shared `SkipLink` now uses Next's documented native
History API integration and explicitly focuses/scrolls the main region. Its ordinary anchor
href still works without JavaScript. Home, articles, baseline/proof pages and captured frames
use this same component. Tests preserve the fragment/focus contract and cover Back/Forward,
rather than removing the failing journey. Failed focused traces remain under
`tmp/chunk13-focused*` (history/focus, CSS and request-classification failures); none of the failed
runs is passing evidence. The current corrected focused run is `tmp/chunk13-focused-09`.

## Verification commands

Use Node 24.15.0, npm 10.8.2 and the existing Python environment with pinned dependencies.
The preserved archive and backup ZIPs are required; source recovery is offline.

```powershell
.\.venv\Scripts\python.exe tooling/prepare-site.py --check
.\.venv\Scripts\python.exe -m unittest discover -s tooling/tests -v
npm.cmd run verify:company-pages
```

The full command checks documentation/frozen evidence, source generation, Python contracts,
routing data, formatting, linting, strict types, Vitest, production build/build-trace boundaries,
production HTTP and the complete browser suite. It uses an owned loopback server on port 3100,
refuses an occupied port, and stops only its own server. The existing development preview stays
on port 3000. Dependencies and the npm lockfile are unchanged.

Company browser tests cover all five pages in Chromium desktop/tablet/mobile/320px, Firefox
and WebKit. They check full-page diagnostic captures, decoded local images, structure/card counts,
hidden source states, source physical ordering, locale/navigation/history/refresh, keyboard focus,
overflow and console/resource errors. Existing HTTP tests compare complete source text hashes,
headings and source SEO for all currently served pages; existing legacy/publication tests stay mandatory.

Back/Forward may cancel an RSC refresh after cached page content has committed. Only same-origin
`_rsc` requests for the current company page or Blog with explicit browser cancellation codes
are recorded as expected in each test's `navigation-cancellations.json` attachment. Images/fonts,
HTTP error responses, console errors and every other failed request remain failures. This keeps
deliberate navigation cancellation separate from missing required resources.

## Completion evidence

The complete unfiltered `npm.cmd run verify:company-pages` gate passes all 15 mandatory checks
and **815 tests**: 52 Python contracts, 21 Vitest cases, 226 production HTTP cases and 516 browser
cases. HTTP/browser reports have zero unexpected, skipped or flaky cases. The final run started
at 21:03:07 UTC and finished at 21:29:57 UTC on October 17 (October 18 in Asia/Karachi).

- Evidence: `tmp/chunk13/2026-10-17T21-03-07-892Z/manifest.json`.
- Build: `UiGoaxqzZMzIfuTqn2p6J`.
- Source digest: `e3df24c287aaea1053e58d3e5fdef52cb227cdf3b78e821be2ada67dd45ea3ba`.
- `http/results.json`, `browser/results.json`, browser HTML reports, screenshots and traces
  retain the complete production evidence; `runtime.json` records the unfiltered selection.
- `visual-review.json` records all 15 source/current comparisons and hashes. All 15 final
  screenshots are byte-identical to the focused-run screenshots inspected below. They remain
  diagnostic evidence, with the fidelity issues below explicitly open.
- `documentation-review.json` checks that final handoff edits affect only the four named
  documentation files, preserving every tested application, asset, test and tooling input.
  `post-gate-quality.json` records the final documentation/evidence and formatting checks;
  `post-gate-checks.json` records preview responses and owned-server cleanup.

The owned port-3100 server exited after the gate. The existing port-3000 preview remains running.
Dependencies and lockfile are unchanged. All 149 route acceptance fields remain unaccepted.

### Focused and failed-run history

The production build and the current 30-case company browser run pass in all six profiles,
including Chromium at 320px, Firefox and WebKit. This run includes the recovered service glyphs,
source-derived responsive and heading expectations, Arabic CTA centering and skip-link history.
Source contracts pass 52 Python tests, including three company-conversion tests.
Fifteen archived/current full-page pairs are recorded in
`tmp/chunk13-focused-09/visual-review.json`, with screenshot hashes and dimensions. They have
been inspected across desktop, tablet and mobile; remaining differences are listed below.
These are diagnostic reviews, not pixel or route acceptance.

The initial complete run at
`tmp/chunk13/2026-10-17T19-53-30-943Z` was intentionally stopped during its owned build for the
Arabic CTA alignment correction. `review-stop.json` records ownership checks and the failed
run; the preview was not stopped. The final gate includes the added centering, source glyph,
responsive and heading-family checks. Do not treat these checks as visual acceptance.

The subsequent complete run at `tmp/chunk13/2026-10-17T19-58-18-735Z` passed 226 HTTP cases
but was intentionally stopped for the responsive source reconciliation above. Its owned Playwright
subtree was stopped and the harness cleaned up its own server before code changes. That failed
manifest and `review-stop.json` remain intact; neither partial run is a completed gate.

The complete run at `tmp/chunk13/2026-10-17T20-35-43-348Z` passed all 226 HTTP cases and
507 browser cases, including all 30 company cases, but failed a WebKit pagination assertion.
Its trace records a successful page-2 RSC response and the page-2 URL in the final assertion
snapshot, just after the generic five-second assertion deadline. The listing test now waits
explicitly for the link navigation within the existing test deadline before asserting its URL,
stable content identity and canonical. No application code, retry count or visual threshold
changes for this failure. Its six-profile focused regression passes in `tmp/chunk13-pagination`.
The new complete passing gate above supersedes the failed run; the failed manifest and trace
remain evidence.

## Open fidelity and integration gates

Full-page screenshots in this chunk are diagnostic; exact historical pixel/geometry acceptance
remains open. Source backgrounds and layout recovery do not themselves accept a page.
Final typography, spacing, color/hover states and breakpoint details require reviewed comparisons.
Source/current review still shows shared-shell differences, including the missing tablet Get Started
button, plus remaining text wrapping and region geometry. Contacts keeps clearance below the header
instead of reproducing the archived tablet heading overlap. These remain explicit visual-review items.
The HTML sitemap retains readable underlined links; its source low-contrast purple appearance
remains a recorded, unaccepted visual difference rather than a silently approved exception.

Contacts retains validated source form fields and an explicit disabled submission state with
the real email alternative. It does not claim delivery. Google Maps remains a source-derived
link until the embedded-map integration is implemented and verified. These differences remain
open. Source copy, including the contact paragraph's unrelated wellness language, is preserved
pending an editorial decision; no replacement copy is invented.

After this batch, 79 of the 107 active content pages have reconstructed first-pass layouts;
28 remain: 20 ordinary blog/archive pages and eight secondary HTML-sitemap journeys.
This is rollout progress, not 79 accepted pages. Real Sanity, complete interactions, visual
acceptance, CI/staging and deployment remain separate delivery gates.
