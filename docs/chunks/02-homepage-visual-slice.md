# Chunk 2 — Homepage and shared design slice

Status: implementation and fidelity review in progress. October 17, 2026 (Asia/Karachi).

## Outcome and scope

Replace the English root proof document with the preserved homepage, recover its actual media
and typography, and establish the first reusable English shell. Keep the other six Chunk 1
routes as explicitly labelled proof documents until their own reconstruction work. Do not
extend homepage styling to Arabic pages, articles or taxonomies without examining their sources.

This chunk does not accept the whole site, real Sanity publishing, forms, hosting or deployment.
The application still refuses `APP_ENV=production`. Canonicals remain bound to the approved public
origin; local crawling remains disabled. Source links to pages outside the seven published
identities retain their recorded destinations and can still return 404/410 locally.

## Ordered work and checkpoints

1. Recover referenced images and source styles from the preserved ZIP archives. Publish only
   the images actually needed for this composition, original icon glyphs and licensed fonts.
   Preserve original media paths and bytes. Record archive/member, SHA-256, dimensions and roles.
2. Render an isolated reference from archived HTML and recovered styles with all script execution
   removed and network intercepted. Measure all three archived viewports before choosing fonts.
   Keep original screenshots immutable. Recover the intended fonts if an expired external request
   would otherwise change the preserved appearance.
3. Extract semantic text, rich links, cards, testimonials, FAQ answers and structured data into a
   source-derived content file. Keep raw Elementor markup, CSS and plugin code out of runtime.
4. Build focused Server Components for the homepage sections, image/button/icon primitives and
   the English shell. Keep Client Components limited to dialogs that need browser interaction.
5. Implement and exercise native keyboard-operable menu/search dialogs, category navigation,
   same-language client links, cross-language document navigation and native FAQ disclosures.
   The local search searches the currently published, indexable identities only; full-site search
   coverage and matching WordPress search behavior remain a later integration gate.
6. Run the existing HTTP/routing/publication proof against the replacement homepage and verify
   every published media file through GET/HEAD with byte checksums. Preserve all legacy-rule
   precedence, including the literal theme asterisk.
7. Capture source-sized and additional breakpoint screenshots, compare geometry and pixels,
   review every section and interactive state, then resolve discrepancies. No screenshot masks,
   resized comparisons or permissive aggregate thresholds can accept layout changes.
8. Reconcile documentation and the route register with actual evidence. Only reviewers may accept
   the applicable complete page gates. An engineering test pass is not visual acceptance.

## Sources and content ownership

Route `R-91d9b62648d713d4`, `/`, WordPress page 55734; shell templates 77 (header), 81 (footer),
95 (mobile popup). The source is
`nalk-public-archive/html/rendered/home-91d9b62648d713d4--desktop.html` and its tablet/mobile peers.
The immutable page record contains the exact screenshot and rendered-document paths.

`src/content/home/home.generated.json` contains source text, paragraph/link tokens, card identities,
FAQs, testimonials and the homepage's complete JSON-LD. The seven routing fixtures still own
page identity, locale and metadata. The homepage heading comes from that same resolved page.
The generated file is static migrated content, not an implemented Sanity integration.

The source's Insights/Blog section `9e48ffa` is hidden at all three captured breakpoints. Its
disposition is recorded in the generated data; it is not presented as visible homepage content.
The decorative ticker retains source service labels. Content/behavior differences in animated
entrances, ticker/carousel timing and video lightbox behavior require review before G4 acceptance.

`assets.generated.json` records 28 original images, two Latin variable fonts, their two OFL
license files and the recovered icon font. Runtime imports that compact allowlist; it never reads
the backup ZIPs, documentation or archived HTML. `ArchiveImage` supplies verified dimensions and
original bytes through `next/image` with optimization disabled for initial fidelity measurement.
Responsive derivatives and performance budgets require a later measured image-delivery decision.

## Font and reference calibration

The source requests Space Grotesk for headings and Manrope for body text. Its old Google Fonts
CSS URL now returns HTTP 404. Arial fallback produced a mobile heading one line too short and
a reference height of 14,901 px, versus the preserved 15,233 px. Self-hosted Latin variable font
files from Google Fonts restore the archived line wrapping and reference dimensions:

| Profile | Viewport          | Original and aligned reference height |
| ------- | ----------------- | ------------------------------------- |
| Desktop | 1440 × 1000       | 12,679 px                             |
| Tablet  | 768 × 1024, touch | 13,339 px                             |
| Mobile  | 390 × 844, touch  | 15,233 px                             |

These are reference calibration results, not replacement-page results. Initial reference versus
historical screenshot differences (pixels with any channel difference above 20, diagnostic only)
were 7.12% desktop, 6.65% tablet and 0.151% mobile. Source animation states and renderer differences
must be investigated; these values do not authorize any migration tolerance. The actual pixel
acceptance contract remains [the testing document](../08-testing-and-acceptance.md).

Font URLs, file sizes and hashes are pinned in `tooling/sources/home-fonts.json`, with the original
OFL text included in `public/fonts`. No Google Fonts or WordPress resource is fetched by the
running homepage. Arabic font selection remains independent and unaccepted.

## Approved contact correction: D-04

The owner confirmed using the existing footer contacts consistently on October 17, 2026:
`+92 305 551 8777` and `info@nalksolutions.com`.

The source mobile popup displayed `+123 456 7890` and `softy-solutions@example.com`; its mail link
also contained an extra `.com`. The source footer displayed the correct business contacts but
linked to a different phone number and the theme email. The replacement menu and footer use
`tel:+923055518777` and `mailto:info@nalksolutions.com`. This confirms contacts, not form recipients
or transport configuration. Social links use the source footer's real Nalk profiles.

## Module boundaries

| Location                            | Responsibility                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `src/content/home`                  | Source-derived homepage data, asset provenance and explicit shared links              |
| `src/components/home`               | Homepage composition and focused sections                                             |
| `src/components/site`               | Current English header/footer, images, icons, button links and dialogs                |
| `src/styles/marketing.css`          | Scoped English design tokens, measured layouts and original breakpoints               |
| `src/proxy.ts`                      | Existing routing contracts plus exact published-media allowlist after legacy matching |
| `tooling/extract-home.py`           | Deterministic content extraction/check against frozen source                          |
| `tooling/recover-home-reference.py` | Isolated reference recovery; no executable WordPress publication                      |
| `tooling/prepare-home-assets.py`    | Selective image/font publication, dimensions and provenance checks                    |
| `tooling/measure-home.mjs`          | Offline Playwright reference rendering, measurements and diagnostic screenshots       |
| `tests/browser/home.spec.ts`        | Content, resource, typography, dialogs and responsive flows                           |
| `tests/http/assets.spec.ts`         | Exact GET/HEAD media integrity and unknown-media rejection                            |

The `marketing-site` ancestor scopes the design. Proof pages retain their neutral styles, and
the existing Arabic server `lang`/`dir` contract remains independent of this shell.

## Commands and environment

Use Node 24 and the existing exact lockfile; no new npm package is needed. In PowerShell use
`npm.cmd` if policy blocks `npm.ps1`. Python tooling uses the existing `.venv` with BeautifulSoup
and Pillow, pinned in `tooling/requirements.txt`. Keep reference generation and application runtime separate.

```powershell
npm.cmd ci
.venv/Scripts/python.exe -m pip install -r tooling/requirements.txt
.venv/Scripts/python.exe tooling/recover-home-reference.py
.venv/Scripts/python.exe tooling/extract-home.py
.venv/Scripts/python.exe tooling/prepare-home-assets.py
$env:REFERENCE_FONTS='local'
node tooling/measure-home.mjs
.venv/Scripts/python.exe tooling/extract-home.py --check
.venv/Scripts/python.exe tooling/prepare-home-assets.py --check
npm.cmd run verify:home-engineering
```

`verify:home-engineering` runs the frozen-evidence, source-content, asset-provenance, generated
routing, formatting, lint, type, unit, production-build, build-trace, HTTP and browser checks in
order, with an immutable timestamped source/build/result manifest under `tmp/chunk2`.
It is explicitly an engineering gate; run the separate strict visual comparison afterwards:

```powershell
.venv/Scripts/python.exe tooling/compare-home.py tmp/chunk2/<run-id>
```

The visual comparison writes full-page dimensions, exact pixel results, original/actual hashes,
reference calibration and landmark deltas, plus diagnostic difference images. It exits nonzero
on any unresolved difference. It never replaces a baseline or silently changes tolerances.
Individual engineering commands remain available for development:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
npm.cmd run verify:build
npm.cmd run test:integration
npm.cmd run test:e2e
```

Reference recovery uses `tmp/chunk2-reference` only for the preserved HTML/CSS and measurements.
Application reports stay under ignored timestamped run directories. Tests start and stop their
own production server on loopback, refuse an occupied port and modify only an isolated fixture
copy. No test client may follow an absolute public redirect to the live website.

## Completion and open gates

Engineering completion requires all source/asset checks, formatting, lint, strict types, unit,
production HTTP and browser suites to pass with an identified build and source fingerprint.
Visual completion additionally requires full-page and region comparisons, state comparisons,
font/crop/geometry reconciliation and manual review. Real-device, screen-reader, 200% zoom,
performance and shared-shell rollout remain explicit checks before release.

Do not mark the root route accepted while any visible-content, link, motion, layout, lightbox,
carousel, header/footer or responsive discrepancy remains unresolved. English article and Arabic
page reconstruction follow the verified marketing slice; Sanity and deployment remain separate.

## First comparison evidence and remaining work

The first production comparison is
`tmp/chunk2/2026-10-17-home-review-01/visual-home/report.json`. It correctly fails the strict
visual gate: initial replacement heights were 12,628 / 13,027 / 15,333 px, versus
12,679 / 13,339 / 15,233 px. The report includes per-section geometry; these differences are
implementation work, not accepted tolerances. The mobile hero, statistics, FAQ and final CTA
already have matching section heights, but that does not accept their pixels or other sections.

Next fidelity work must reconcile intro/logo sizing, tablet feature geometry, testimonial
typography/spacing, benefit-card wrappers, header/footer details, source carousel/ticker states
and testimonial lightbox visual review. The original blocked background video created two gradient
overlay layers; both are reproduced over the local poster without fetching the blocked video.
Source metadata is preserved, and the homepage's full source JSON-LD is now restored in addition
to the earlier proof metadata. Six other routes remain explicit excerpts.

The latest engineering run is indexed by `tmp/chunk2/latest.json`; its manifest records the
actual pass/fail status, source fingerprints, dependency versions, build ID and individual logs.
Run the strict visual command on that exact run after engineering checks pass. No route-level
or release acceptance is implied by an engineering pass.

## Responsive fidelity corrections — 17 October 2026

The next pass restores the source tablet feature columns and images (46.22% / 53.78%),
60 px feature headings and 600 px image height. The stacked feature layout is restricted to
the source mobile breakpoint of 767 px. The tablet featured testimonial retains its side-by-side
37.8% / 62.2% composition, while the smaller review cards retain two columns with 20 px gaps.
Statistics now use the source two-column tablet arrangement and its 80 px inner padding.

Testimonial captions use the recovered Space Grotesk metadata typography: 15 / 14 / 13 px
for desktop / tablet / mobile, with the original muted color. Inline author spans preserve the
surrounding body line boxes. Rating size, rating spacing, author gaps and featured-quote tracking
follow the archived CSS rather than compensating with section heights. Tablet FAQ titles use
22 px; mobile service cards regain their source separators. These changes use the existing
reference measurements and recovered `post-55734.css` and global typography rules.

Narrow feature headings wrap long words within their own column, as the archived theme does.
Browser coverage checks heading scroll widths as well as document overflow: a clipped gradient
heading can otherwise pass the page-level overflow check. This regression was found during
manual inspection of the first tablet capture in this pass.

The image-readiness check now runs after the streamed homepage content and expected feature
images exist, before geometry and screenshot capture. It forces lazy images to load, awaits
decoding and asserts complete images with nonzero intrinsic widths and resolved sources.
An earlier capture could enumerate images before the streamed content arrived; that image
check was insufficient, even though the other engineering assertions passed. Captures from
`2026-10-17T07-44-21-090Z` are diagnostic only and must not be used for visual acceptance.

This is a fidelity correction pass, not visual acceptance. Its engineering and strict comparison
results belong to the timestamped run described above; unresolved differences and interaction
work remain open. The original screenshot baselines and acceptance thresholds are unchanged.

## Source typography and testimonial dialog follow-up

Detailed archived measurements confirm that rating rows retain the body-font line box around
smaller star glyphs. The implementation now preserves that inline layout. Benefit icons use the
original 68 × 66 px frame, with centered mobile placement and 40 × 30 px mobile card padding.
The imported tagline retains its original 11 pt Arial text, with the surrounding responsive
body spacing; location headings retain the source tracking and tablet size.
About-section paragraphs preserve their trailing `1.5em` margins and the button's separate
20 px top margin. The ring scales to 70% at tablet/mobile widths. Tablet logo height and spacing,
outlined feature links, featured-review padding and 32 px FAQ controls are source-derived too.
FAQ arrows use the recovered icon font rather than a text-character substitute.

The archive's `4713dd1` link encodes its lightbox settings in a URL-escaped Base64 payload.
`extract-home.py` now decodes and validates that payload, retaining the source widget ID,
exact YouTube embed URL and corresponding watch link in generated content. The previous
hand-entered `aEhPaFgP1ok` video ID was incorrect; the source ID is `aDhPaFgP1ok`.
The empty linked poster in the archive has no visible play badge, so the added triangle and
circle have been removed. Its accessible link name remains available to assistive technology.

`testimonial-video.tsx` is a focused Client Component owning the native dialog and iframe
lifetime. The iframe mounts only after activation and is removed when the dialog closes,
ending playback. Escape and the close button restore focus to the poster link. Without
JavaScript, and for modified link clicks, the source-derived YouTube watch link remains usable.
The rest of the testimonial composition remains server rendered.

The browser suite tests deferred loading, the exact recovered URL, keyboard activation,
Escape, explicit close, reopening, iframe removal and focus restoration across all six
projects. YouTube requests are fulfilled by a clearly identified local test response; no live
provider request is needed. Dialog screenshots therefore show a provider fixture. These tests
prove application behavior, not the external video's availability or visual parity with the
WordPress lightbox. Provider playback and lightbox visual review remain open acceptance checks.

## Tablet footer and call-to-action follow-up

The recovered page CSS for `08924fa` specifies a 1 px border at every viewport and
80 px vertical tablet padding. These replace the missing desktop/tablet border and
100 px tablet padding. Mobile retains its existing 60 px padding.

The footer CSS and archived tablet measurements (`499b9627`, `3b409c19`,
`638481a4`, `457a4f92`) establish a full-width logo, a negative 50 px logo offset,
50 px vertical padding, 40 px row gaps and 60 px column gaps. The implementation
now places the two navigation groups and contacts in three columns, followed by
a full-width horizontal copyright row with its separate 10 px top margin.
The first two columns retain the source 21% widths; the contact column takes the
remaining available space. Mobile retains its centered stacked composition.
This layout correction does not constitute visual acceptance; strict screenshot
comparison and the remaining card, header and interaction differences remain open.

The footer's archived `638481a4` image is `23-e1760999812942.png` (1563 × 878),
not the header logo. Its exact backup bytes are now published under a separate
`footerLogo` asset role with provenance and checksums. The mobile logo uses the
source 50% of its full-width container (175 px at a 390 px viewport), rather than
a fixed 200 px width. Asset HTTP/hash checks include the recovered file.

## Responsive cards and footer typography follow-up

Archived tablet card containers (`62d3a11`, `c587433`, `f17c59c`, `b79d0c9`)
use 40 px vertical padding, contiguous rows and a 1 px divider below the first
row. The reconstruction now uses those values instead of compensating row gaps.
Card actions use the source 15 px tablet font. The four tablet benefit cards
(`03265fb`, `7d9c842`, `adcbc57`, `28d1c70`) share equal-height rows; mobile
retains independent row sizing and its original service-card spacing.

The featured-services title (`3f0df25`) is 48 px on tablet and 36 px on mobile;
its previous inherited large-heading sizes caused extra wrapping and vertical
drift. Desktop retains the source 82 px size. Footer navigation (`337763aa`)
uses bold white 16 px text with a 1.65 line height, 10 px link spacing and the
source accent on hover/focus. Footer contact text is white, and the approved
contact destinations remain unchanged. These corrections are source-based;
full-page screenshot differences still require review before visual acceptance.
