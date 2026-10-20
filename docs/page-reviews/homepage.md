# Homepage redesign: services, brands, features and testimonials

Updated: October 19, 2026. Route: `/`, `R-91d9b62648d713d4`. Language: English.
Decision: [D-18](../registers/decisions.md), within the [D-17 workflow](../12-redesign-and-arabic-delivery.md).
Status: implemented and verified for owner review. Design lock: not granted.
Arabic phase: not started or authorized by this page change.

## Owner direction and scope

1. Align the What We Do items and make them fully responsive.
2. Make the Brands strip slide continuously.
3. Improve the edge-to-edge horizontal Work That Speaks sections.
4. Retain one main testimonial and three supporting testimonials; remove the other three and select the strongest existing entries.

The owner supplied current-page screenshots for services, brands and featured work. Only
these sections and their necessary tests are changed. Hero, general navigation, FAQ, benefits,
stats, footer, routing, metadata and other page families retain their existing contracts.
Shared homepage button behavior is reused; no new general button style is introduced.

## Implementation

- Service cards use a four-column/two-column/one-column grid with shared content rows so
  icons, headings, descriptions and actions line up within each row. Four columns apply above
  1180px, two from 640px through 1180px, and one below 640px. Content is neither clamped nor
  shortened. Original titles, descriptions, destination URLs and blue gradient actions remain.
- Featured work uses contained cards up to 1280px wide, page gutters, padding, rounded corners,
  consistent spacing and readable text widths. Cards stack at 1024px and below. All three
  original images now remain visible on mobile instead of being hidden.
- All twelve original brand assets remain. A small client enhancement runs a seamless logo
  loop only when visible and motion is permitted. Pause/resume, hover/focus pause, a complete
  static grid for reduced motion and a keyboard-scrollable no-JavaScript list are provided.
  The duplicate visual group is hidden from assistive technology. Control space is reserved
  before enhancement to avoid a hydration layout jump. Image labels use the existing brand
  asset names without inventing expanded company identities.
- Testimonials keep the existing featured quote/video and three specific supporting accounts.
  Supporting figures use flexible content and natural author spacing instead of the old 140px
  caption gap. Three columns apply above 1024px; smaller screens show a single readable column.

## Authorized testimonial curation

| Treatment            | Source ID | Existing author/account                               | Reason                                                           |
| -------------------- | --------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Featured retained    | `e925188` | Amen Hossam, Brands Influencer                        | Preserve the existing main quote and associated video treatment. |
| Supporting retained  | `187bcc8` | Engr. Syed Ahmed Farooq Shah, Alpha Engineering Works | Specific website optimization and marketing account.             |
| Supporting retained  | `089b3bd` | Dr. Samina Khalid, BioMed Solutions                   | Specific website development and marketing account.              |
| Supporting retained  | `1c6e845` | Mr. Muhammad Zubair Qureshi                           | Specific custom ERP delivery account.                            |
| Removed from display | `68e13b4` | Skaik Mohammed                                        | More generic traffic/conversion statement.                       |
| Removed from display | `9f47491` | Abdullah Mabrouk, DesignX                             | Repeats generic traffic/conversion feedback.                     |
| Removed from display | `f0cf1c6` | Layla Nour, Stellar Enterprises                       | General impact statement with less service detail.               |

Selection is an editorial judgment under the owner's instruction, not independent verification
of these claims or endorsements. Retained quotes/authors are unchanged. All seven original
records remain in `home.generated.json` and the frozen archive; `src/content/home/testimonials.ts`
owns the explicit display selection. Do not edit recovered source files to make the UI test pass.
The removed entries are absent from rendered testimonial markup, rather than merely hidden.

## Preservation and implementation boundaries

Keep service/feature/CTA destinations, source media bytes, all other homepage copy, canonical,
title/description, robots, social metadata, JSON-LD and existing 301/410/404 behavior unchanged.
The source JSON-LD has no selected testimonial list to synchronize. Existing structured-data
quality issues are not silently edited as part of this layout task. No testimonial text is rewritten.

CSS changes are scoped to homepage classes. Obsolete card/media breakpoint rules are removed
rather than layered under contradictory overrides. Brand motion uses CSS plus an existing-style
IntersectionObserver enhancement and one pause state; no animation library is added. Server
rendering retains content, image dimensions and navigation. No Arabic routes/content, Sanity,
form delivery, deployment or whole-page design approval is introduced.

## Verification procedure

Use Node 24/npm and the repository Python environment. Validate documentation/frozen evidence,
source-generated content/assets/motion, formatting, lint, strict types, unit tests, the production
build and import boundaries. Run all production HTTP checks plus focused homepage, motion and
navigation browser checks across Chromium desktop/tablet/mobile/320px, Firefox and WebKit.
Use existing package scripts; focused browser selection must be disclosed rather than called
the complete site-wide engineering gate.

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
npm.cmd run verify:build
npm.cmd run test:integration
npm.cmd run test:e2e -- '--grep=homepage|testimonial video|hero entrance|buttons crossfade|reduced motion keeps|server content remains|responsive header controls|original representative routes|same-language routing|public response'
```

New browser coverage checks row alignment at responsive boundaries, contained card/image
geometry, source text and link preservation, actual feature navigation, the exact four quotes,
real logo movement and pause/resume, offscreen pause, live reduced-motion changes, no duplicate
accessible logo group, no-JavaScript keyboard scrolling and console/resource failures. Retain
diagnostic screenshots and traces. Production screenshots and runtime/build identity supersede
development captures as final implementation evidence.

Early development probes are retained under `tmp/home-redesign`: the first test import needed
an explicit Node JSON import attribute; feature-navigation probes use the existing narrow,
recorded same-origin RSC cancellation classification; a reduced-motion probe found and corrected
an animation-selector precedence defect. The no-JavaScript probe records the browser's intentional
script CSP execution block separately; failed CSS, fonts, images and unexpected errors remain strict.
Development screenshots can include the framework's diagnostic badge and are not production evidence.

## Results and review

Production verification passed on October 19, 2026 with build `dotjR9QZgg6Sw6dW-e9a5`.
Evidence: `tmp/home-redesign/production-2026-10-19T14-11-41-723Z/manifest.json`.
The manifest records exact commands, log checksums, dependency versions, 1,388 input-file
checksums and unchanged inputs throughout the run.

| Check                                                  | Result                                                |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Documentation and frozen evidence                      | Passed: 149 routes, 67 legacy rules, no errors        |
| Source-generated motion, reference, content and assets | All consistency checks passed                         |
| Formatting, lint, strict TypeScript                    | Passed                                                |
| Python contracts                                       | 75 passed                                             |
| Unit tests                                             | 30 passed                                             |
| Production build and bundle boundaries                 | Passed; private backup/reference files excluded       |
| Complete production HTTP suite                         | 231 passed, including all 67 legacy initial responses |
| Focused production browser suite                       | 120 passed, zero skipped, flaky or unexpected results |

The browser selection covers the new homepage suite, existing homepage content, hero loading,
motion, buttons, dialogs, language/navigation and related shared-button checks. Projects are
Chromium at 1440, 768, 390 and 320px, Firefox and WebKit; the alignment tests additionally sweep
the documented breakpoint boundaries. This is focused regression coverage, not a complete
site-wide browser rerun. The 30 new checks are five homepage cases across six projects.

Reports, traces and screenshots are in `http-run/http` and `browser-run/browser` beneath the
run directory. Both harness-owned production servers stopped after their runs. The existing
preview on port 3000 was retained.

The `visual-review/manifest.json` records fifteen production section captures, image checksums,
the same build identity and clean browser diagnostics. All were inspected at native dimensions:
1440×1000, 768×1024 and 390×844, including the normal-motion brand strip paused using its real
control and the complete reduced-motion logo grid. The separate capture server on loopback
port 3200 was stopped. These captures document the requested redesign; they do not claim
pixel parity with the superseded WordPress layouts or owner approval.

Before/working captures and failed development probes remain under `tmp/home-redesign`.
Recovered content, original media and frozen WordPress references remain unchanged; only the
explicit testimonial display selection removes content. Canonicals, metadata and response
contracts passed the HTTP regression suite.

Next: owner review and any further homepage adjustments, followed by an explicit design lock.
Other page redesigns continue in the owner's chosen order. Arabic translation and localization
remain deferred until the agreed design phase is locked and the owner directs that transition.
No whole-page acceptance, Arabic acceptance or release acceptance is recorded by this change.

## Featured testimonial glass trial — October 19, 2026

Owner direction: try an Apple Liquid Glass inspired finish with only a slight tint and preserve
content visibility. This follow-up changes only the featured testimonial surface and attribution
color in `marketing.css`; supporting testimonials, copy, photograph and interaction are unchanged.

The quote panel uses a dark translucent backing, 24px backdrop blur, restrained saturation,
faint violet/warm tint, inset highlights and a fine glass edge. The photo remains unfiltered.
An opaque fallback supports browsers without backdrop filtering; reduced-transparency preference
also restores the opaque surface and disables blur. No added motion, library or client logic.

White quote text and the brighter attribution have conservative calculated contrast ratios of
9.74:1 and 6.49:1 respectively, assuming a fully white backdrop and the maximum white surface
highlight. This calculation bounds the interior surface; it is not a claim of a complete
accessibility audit. Calculation evidence is `tmp/home-glass/contrast.json`.

Production build `ETh0yqpBOyf8VYe0I5cwF` and CSS formatting checks pass. Twelve focused production
browser checks pass across all six projects for testimonial composition, video opening/closing
and focus restoration. Results: `tmp/home-glass/browser-verification/browser/results.json`.
Three production captures at desktop/tablet/mobile sizes were inspected; capture/runtime evidence
is `tmp/home-glass/production-review/manifest.json`. The wider earlier HTTP/browser gate above
predates this CSS-only trial and was not rerun in full. Owner approval remains open.

### Stronger glass refinement

The owner found the first trial too subtle. The current surface replaces that trial with more
translucency, a diagonal reflection, a brighter masked perimeter highlight, stronger inset edges
and 32px blur at 135% saturation. The tint remains slight. The decorative perimeter does not
intercept pointer input; the photograph remains unfiltered. Opaque and reduced-transparency
fallbacks remain available. No content, sizing, responsive structure or video behavior changes.

Current production build: `AXJ5K7H-KlS6Ef2oeMaj7`. Build, formatting and twelve focused production
browser checks pass. Desktop/tablet/mobile production captures were inspected. Evidence is under
`tmp/home-glass-v2`: `production-review/manifest.json`, `browser-verification/browser/results.json`,
`contrast.json` and `reduced-transparency.json`. The conservative interior contrast calculation
now assumes both reflection gradients reach their brightest white simultaneously over a white
backdrop: 5.47:1 for the quote and 4.62:1 for the attribution. This supersedes the earlier trial's
contrast figures. The reduced-transparency check confirms an opaque background and no blur.
Owner design approval remains open.

### Borderless glass across homepage cards

Owner direction: retain the stronger glass effect, remove its visible border, and apply the same
effect to every homepage card. The previous reflective rim, inset edge lines and card borders
are removed. One shared `home-glass-card` surface now owns the subtle tint, diagonal reflection,
32px backdrop blur, restrained shadow and opaque/reduced-transparency fallbacks.

The 21 surfaces are four service cards, three featured-work cards, four benefit cards, the main
testimonial quote panel and three supporting testimonials, five FAQ disclosures and the closing
call-to-action. The closing artwork stays beneath the translucent backing through a local CSS
custom property. Photos are unfiltered; navigation, buttons, icon circles, section labels and
keyboard focus indicators keep their existing treatments. The unboxed statistics band remains
a band. No source copy, destination, metadata or source asset bytes change.

Body copy and attributions on these surfaces use the same bright neutral text color to preserve
contrast against translucency. The previous conservative glass-interior calculation still applies:
5.47:1 for white text and 4.62:1 for the neutral body/attribution color. No borders or bright inset
edge shadows remain on card surfaces. Removed per-card surface backgrounds are replaced by the
shared rule rather than overridden by another page-specific patch.

Evidence is under `tmp/home-glass-all`. Eighteen production section captures cover all six card
sections at desktop, tablet and mobile sizes; all were visually inspected. Computed-style captures
check all 21 surfaces at each size for zero borders and the shared backdrop effect. The separate
reduced-transparency probe confirms opaque backgrounds, disabled blur and zero borders on all
21 cards. Its first sample occurred during the existing link color/background transition; the
final probe uses reduced motion to inspect the settled accessibility state.

Production build `eay5fM8Ucz0K6tK1tNGeo`, lint, formatting and documentation/evidence checks pass.
All 120 focused production browser checks pass across the six configured projects, with zero
skips, flaky tests or unexpected results. This includes responsive alignment, source content,
FAQ controls, video dialogs, focus, motion, navigation and the shared-button regressions.
Results: `tmp/home-glass-all/browser-verification/browser/results.json`; capture evidence:
`tmp/home-glass-all/production-review/manifest.json`. The wider historical HTTP suite was not
rerun for this surface-only change. Whole-page design lock and Arabic delivery remain open.

### Stats, introduction, FAQ motion and original hero video

Owner direction: center and improve the stats, change satisfaction to 100%, animate FAQ opening
and closing, remove the duplicated introductory paragraph/tagline under the hero, remove the
brand slider's pause button, and use the original homepage hero video.

- Stats use a centered 1280px grid, symmetric padding and centered labels, four desktop columns
  and two smaller-screen columns. A dark overlay over the original background improves contrast;
  figures are pale yellow and labels white. `100% Client Satisfaction` is owner-directed marketing
  copy replacing the archived `97% Clients Satisfaction`, not a newly measured or audited metric.
- Only the duplicated `content.intro` and `content.tagline` are removed from display. The About
  content, its links, brands and location copy remain. Old intro/tagline styles and excess spacing
  are retired. Source JSON and frozen evidence retain the original text. HTTP expectations record
  the two exact display removals instead of mutating the source fixture.
- The brand slider has no play/pause button or reserved button space. Hover/keyboard focus pause,
  offscreen pause, reduced-motion static logos and the native scrollable no-JavaScript list remain.
- FAQ uses a small client enhancement around native `details`/`summary`: 320ms interruptible height
  transitions in both directions, immediate reduced-motion states and native behavior without
  JavaScript. Enter/Space retain normal summary activation. No animation library is introduced.
- The live and archived hero settings reference `71-home-2-video.mp4` at the theme host. Direct
  requests returned 403 and the live-browser probe reported a media error. The same named video
  was recovered from the WordPress uploads backup, not substituted with stock footage. Its 733,105
  bytes are served at `/media/home-hero.mp4`; SHA-256, archive member, source URL and recovery notes
  live in `tooling/sources/home-hero-video.json`. Runtime code imports only the public path constant.
  The exact asset joins the proxy allowlist after legacy matching; `/media` is reserved against
  published-page collisions. Other media paths do not become public pages.
- The decorative video is muted, looping and inline. Motion preferences and offscreen/document
  visibility pause playback. Reduced motion and no JavaScript retain the existing image; browser
  autoplay denial leaves the poster usable. Overlays remain above the video and below hero text.
  No incoming host, language, canonical or structured-data behavior changes.

Verification adds production byte/checksum, GET/HEAD/range playback checks and browser coverage
for source playback, offscreen/reduced-motion behavior, centered stats, intentional copy removals,
FAQ animation/interruption/keyboard behavior and native no-JavaScript disclosures.
Browsers can cancel successful media byte-range probes while locating MP4 metadata: diagnostics
record only exact same-origin hero-media cancellations after a successful 206 with a Range request.
HTTP errors, other paths, decoding errors and failed playback remain failures. Early probes caught
the initial missing asset allowlist entry; the final route test covers it explicitly.

Evidence for this follow-up is under `tmp/home-refinements`; production results are recorded after
the focused gate. This direction does not lock the whole homepage or start Arabic localization.

### D-19 follow-up: featured-work composition and disclosure interaction

The owner requested a more considered featured-work design alongside the service-family
redesign. The three uniform wide feature rows are replaced by a wide lead feature plus two
image-led supporting cards, with a left-aligned section heading. Source copy, images and
three CTA destinations remain. The [service-family record](service-family.md) owns this joint
verification scope.

The prior production FAQ probe exposed a real click problem beyond hydration readiness:
focus cancelled the old FAQ-group entrance, moving the summary during pointer activation.
That group entrance is removed. Heading entrances remain, and the shared `AnimatedDisclosure`
now owns the opening/closing animation for homepage and service FAQs. Subsequent development
checks confirm pointer and keyboard behavior. Final production results supersede the earlier
failed probe runs; no acceptance is inferred from them.

The combined final production gate passes with build `eJRjD1ZkXgslSBCUtOEsy`: 30 unit tests,
232 HTTP tests and 285 focused browser tests across the six configured browser/viewport
projects, with no skipped or flaky browser results. Documentation/evidence checks, generated
data checks, formatting, lint, strict types, build and bundle guard also pass. This confirms
the original local video's exact bytes and range responses, actual browser playback,
offscreen/reduced-motion behavior, centered stats, intended copy removals, the button-free
brand strip, and FAQ opening/closing, interruption, keyboard and no-JavaScript behavior.

Final evidence is under `tmp/service-redesign/production-2026-10-19T17-59-27-533Z`; its manifest
records the source-frozen verification. The settled visual review includes 18 homepage
section/video captures at desktop, tablet and mobile sizes alongside service-family captures.
The conservative stats calculation in `tmp/home-refinements/stats-contrast.json` reports
15.30:1 white-label and 14.42:1 pale-yellow-figure contrast against the worst-case background
under the dark overlay. This is a local contrast calculation, not whole-page accessibility
certification. Owner design approval, whole-site visual acceptance and Arabic delivery remain open.
