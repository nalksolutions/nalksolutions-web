# Section consistency, Contact and topic selection

Decision D-22, owner-directed October 20, 2026. Implementation for review; focused verification only.

## Changes

- Navigation now reads Home, Services, About Us, Blog, Contact Us in desktop and mobile menus.
  Destinations, language handling, active sections and the enquiry action are unchanged.
- Visible section content shares a 1360px maximum width and responsive page gutters. Plain
  section shells include the gutters; glass enquiry/summary panels align their outside edges
  to the content grid. Full-bleed backgrounds and narrower article prose remain intentional.
  Service, company, listing, secondary and homepage containers consume the shared sizing tokens.
- Homepage feature cards and service columns use stretching and flexible remaining space to
  align actions at the bottom. Existing offer cards retain their bottom-pinned actions.
- Related posts now use an intrinsic equal-height grid row, uniform 3:2 image windows and
  bottom-aligned actions. Native horizontal scrolling remains. The obsolete visible-card
  height observer/state is removed, so card height no longer changes after hydration/scrolling.
- Blog's All Topics disclosure is replaced by a native modal containing all eleven existing
  topic links. It does not expand the article layout. It has a visible close control, scrollable
  content, Escape dismissal, keyboard focus wrapping/restoration and ordinary category links.
  Without JavaScript, a noscript topic directory preserves access. No categories or routes change.

## Contact composition and preservation

Contact uses an explicit server composition rather than the inherited company-contact layout.
Email Your Project Brief is the primary hero action; a Saudi phone action is secondary.
The existing hero image accompanies a short briefing guide. Three contact cards make email,
Saudi phone and Pakistan phone directly accessible. Saudi and Pakistan offices follow with
all retained addresses, hours and source office images; the existing Rawalpindi map link remains.
The form and its four fields are visible by default in a glass panel. The owner explicitly
requested removing the collapsed presentation after reviewing D-22. Submission remains
unconfigured and clearly disclosed; no submission transport or response-time claim is added.

Retained facts: info@nalksolutions.com; +966 50 6000 843; +92 305 551 8777;
Jeddah, Saudi Arabia (Monday-Sunday, 9am-6pm); Bahria Town, Rawalpindi Pakistan
(Monday-Sunday, 11am-8pm). Source punctuation is normalized without changing hours.
The source is `R-a0ac0f2631af30d8`; its three images, map and enquiry controls remain.
The finite [editorial ledger](customer-journey-editorial.json) records rewritten headings,
labels and spacing; required assertions preserve the actual contact facts. No frozen recovery
JSON, URL, metadata, canonical, robots directive, schema fact or article body is edited.

## Architecture

`src/styles/layout.css` owns shared section/surface alignment and cross-family card behavior.
Existing family styles consume the same content-width tokens instead of unrelated maxima.
Contact copy/facts live in the authored journey layer; ContactJourney validates that required
recovered media/map/enquiry controls exist before rendering. TopicPicker is the only new client
island. RelatedPostStrip becomes a server component; no new dependencies are introduced.

## Verification policy

The owner explicitly requested basic checks without another long full-site run. Added regression
cases cover section edges, equal related cards, topic keyboard/no-JavaScript behavior and the
short contact/topic/layout smoke. Existing tests are updated for the visible
form, topic fallback and removal of the old height-enhancement marker. The broader cases are
added but not executed in this pass. The previous D-21 full engineering result is historical;
it must not be represented as a full-suite result for these new changes.

Focused checks: lint, strict production-build type checking, unit tests and the short smoke in
Chromium desktop/mobile. Reports are under `tmp/ui-consistency/`; the browser command is:

```powershell
$env:CHUNK_RUN_DIR='tmp/ui-consistency/smoke-final'
$env:BROWSER_TEST_WORKERS='2'
node tooling/run-browser-tests.mjs browser '--grep=UI polish: quick smoke' '--project=chromium-desktop' '--project=chromium-mobile'
```

Visual review caught an inherited company image rule allowing the contact photo to overflow its
new media window. The final styles scope media sizing and clip the window; the smoke explicitly
checks that the briefing title sits below the image and that the image fits its frame.
Owner visual approval and the deferred Arabic, form delivery, Sanity and deployment work remain open.

## Focused result

The production build (including strict TypeScript checking), lint, formatting, 37 unit tests,
documentation/frozen-evidence checks and two short Chromium desktop/mobile smoke cases pass.
The final browser run takes 9.2 seconds and reports no failed/skipped/flaky cases.
Reports: `tmp/ui-consistency/smoke-final/`; handoff: `tmp/ui-consistency/handoff.json`;
review previews: `tmp/ui-consistency/review/index.html`.

A separate development visual inspection confirms that Services offer/directory/CTA edges
align at x=40 and x=1400 in a 1440px viewport; About's padded section content matches its glass
panel edges. The three regional website CTAs share the same bottom position, and all related
cards share the same height/action baseline. This is a bounded inspection, not site-wide acceptance.
No full HTTP/browser engineering gate or broad cross-browser run is claimed for D-22.

Owner follow-up: the Contact form is now permanently visible, with editable fields and the
existing disabled submission button/email fallback. Its former disclosure is removed. This
visibility correction does not establish working form delivery.
