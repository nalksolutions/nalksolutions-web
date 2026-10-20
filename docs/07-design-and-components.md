# Design reconstruction and component plan

Status: reconstruction reference procedure plus D-17 owner-directed redesign. Template labels in the generated page matrix are provisional until visual inspection.

## Current design authority

The [redesign and Arabic delivery plan](12-redesign-and-arabic-delivery.md) governs the next
work under [D-17](registers/decisions.md). Redesign is the owner's first priority; page order
and design direction come from the owner. Preserve content/SEO, implement a concrete review,
resolve feedback and record explicit design lock before Arabic work on that scope. The
default Arabic phase begins after the owner confirms the design-phase transition, not merely
after an individual page passes tests.

For unchanged pages, the reconstruction procedure below remains the reference contract.
For an approved redesign, use separately recorded design references and state evidence;
do not overwrite WordPress evidence or treat all historical differences as accepted. Arabic
will adapt the same locked system for real translated text and RTL, with its own review;
identical English/Arabic line breaks or pixel heights are not an acceptance requirement.

## Design source and measurement

Use screenshots, DOM, extracted template data and CSS together. A screenshot establishes the visible result; CSS/DOM explains behavior and geometry. Inspect the live/restored site when video, hover, sticky transitions, lazy loading or responsive state cannot be inferred safely.

Do not trace only the homepage and apply it everywhere. English and Arabic pages, articles, services, archives and older live demo pages can have materially different shells and layouts.

For each template family record reference routes, shell variant, container widths, major landmarks, typography scale, vertical spacing, image behavior, breakpoints and special states. Put genuinely page-specific content/composition next to its route data.

## Initial extracted tokens

These values are verified starting points from Elementor; page-specific overrides still need inspection.

| Token | Value |
| --- | --- |
| Primary purple | `#6D2785` |
| Secondary | `#FFFFFF` |
| Body text | `#D2D2CF` |
| Accent | `#FFFBBD` |
| Alternate text/accent | `#B6B6B3` |
| Background | `#020202` |
| Alternate surface | `#272727` |
| Border | `#332C27` |
| Additional accents | `#008CFF`, `#DD8716`, `#FF4800`, `#AD2B68` |
| Main Latin heading family | Space Grotesk |
| Main Latin body family | Manrope |
| Existing mobile boundary | max-width `767px` |
| Existing tablet boundary | max-width `1180px` |
| Enabled widescreen boundary | `1601px`; inspect actual per-template behavior |

Map real token names into the chosen Tailwind version's supported theme mechanism. Do not use default framework breakpoints just because their names are familiar. See [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design).

Record actual font files/weights, line height, letter spacing, fallbacks and Arabic glyph coverage. Self-host approved fonts or use supported font tooling with the same visual metrics. Avoid synthetic weights, missing Arabic glyphs and fallback fonts that change line wraps. Treat any new Arabic font choice as a reviewed design change.

## Component inventory to validate

| Level | Candidate responsibilities | Verification |
| --- | --- | --- |
| Tokens/primitives | Container, section spacing, buttons/links, icon, field, label, focus treatment | Computed styles, variants and keyboard/focus behavior |
| Site shell | Header variants, desktop/nested nav, mobile/tablet popup, footer variants, language links, search popup | Every shell variant and state across original breakpoints |
| Repeated sections | Service cards, feature rows, stats, logo strip, testimonials, FAQs, CTA panels, location blocks | Shared geometry plus real content/asset variants |
| Blog | Article header/body, TOC, related posts, author/taxonomy links, cards and archive pagination | Every rich-content type and long/Arabic titles |
| Page templates | Home, corporate, service/location, Arabic marketing, article, archive, retained profile/project | Per-page comparison in addition to template checks |
| Error/status UI | 404, 410 and dependency failure | Correct status, actual intended shell and accessible navigation |

Build only components with a real current responsibility. Keep variants explicit and narrow. Complex homepage-only decoration can remain in that page's composition instead of becoming a misleading universal section.

## Per-page reconstruction procedure

1. Read its route record, source/rendered HTML, all three screenshots and applicable template JSON.
2. Verify page status and whether it should render, redirect or remain gone. Identify shell/template and page-specific sections.
3. Create a content/asset checklist in source order: text, headings, images, crops, cards, CTAs, FAQs, embeds, lists and links.
4. Measure container widths, header/hero height, text widths, line breaks, section gaps and footer start. Record deviations from shared tokens.
5. Implement complete content and semantic structure with real assets. Avoid placeholders, fabricated icons and shortened text used to make the layout fit.
6. Match desktop composition, then tablet/mobile transformations and intermediate widths. Preserve stacking order, hidden/shown elements, alignment and cropping.
7. Implement interaction states and keyboard behavior. Verify hover is not the sole way to reach essential content on touch devices.
8. Run full-page/region comparisons, content/SEO tests and manual review. Fix the shared component if a defect affects multiple routes.
9. Store evidence and mark each acceptance area separately. A template being accepted does not automatically accept all of its pages.

## Interaction coverage

Inventory and test all meaningful states, not merely those present in the seven initial state screenshots:

- Desktop navigation, nested Blog categories, hover/focus and active item states.
- Mobile/tablet open/close, scroll locking, escape key, focus containment and restoration.
- Search open/close, input, valid results, no results, invalid query and upstream failure.
- Language navigation to actual corresponding pages and its behavior when no translation exists.
- FAQ collapsed/expanded states, multiple-open policy, keyboard behavior and stable height.
- Slider/carousel initial, next/previous, pagination, automatic movement and reduced-motion state where present.
- Sticky header position, anchor scrolling, back/forward navigation and long-page behavior.
- Form empty/filled/invalid/submitting/success/error states and accessible feedback.
- Video/poster/blocked-media behavior and consent overlays where actually used.

Use narrow reference-state definitions with route, action, viewport, expected result and source screenshot/video/DOM evidence. Do not replace every slider with a static row without a recorded decision.

## Visual asset handling

Preserve original logo proportions, transparent edges, image crop/focal point and icon stroke/weight. Recover existing SVG/vector assets rather than generating approximate replacements. Optimize transport size without silently changing image content, aspect ratios or displayed sharpness.

Reserve image dimensions to avoid layout shifts. Match responsive `sizes`, source choices and loading priorities to actual display requirements. Prioritize the hero/LCP asset; avoid lazy-loading it. Defer noncritical media without creating missing sections in the settled screenshot.

The old blocked theme-demo video is a known source issue. Determine whether the accepted target uses recovered playback, the existing poster or another approved asset. Record the decision and the deterministic visual state used in tests.

## Responsive and accessibility contract

Test captured viewports of 1440×1000, 768×1024 and 390×844, plus 767/768, 1180/1181 and 1600/1601 widths, a small supported mobile width, a large desktop and 200% zoom. Check long unbroken strings, long titles, Arabic text, large tables/code and browser text enlargement.

Preserve design while using semantic HTML, visible focus, labels, keyboard operation and reduced-motion support. Use logical properties for RTL where that accurately represents the layout; inspect genuine intentional asymmetry rather than mechanically flipping everything.

No horizontal overflow outside intentionally scrollable content. No clipped text, overlapping controls, missing sections or obscured anchor targets. Accessibility corrections that affect visible design require a recorded comparison/decision rather than an unannounced redesign.

## Acceptance

G4 establishes the shared visual language and comparison environment. G6 requires all retained pages to pass their own [visual/content/behavior checks](08-testing-and-acceptance.md). Changes to tokens, shell components, fonts or article typography trigger all affected route comparisons, not only the page edited most recently.
