# Service-family redesign and homepage feature composition

Updated: October 19, 2026. Decision: D-19 under the D-17 redesign-first workflow.
Status: implemented and production-verified; owner visual approval and Arabic phase remain open.

Header implementation notes below describe the historical D-19 stage. D-21 supersedes its
variant selection with the [unified header](unified-header.md) on every page family.

## Owner direction and scope

Redesign the four main service journeys and related specialist/location pages. Preserve their
content and SEO while replacing the unfinished WordPress presentation with clean, varied
layouts in the homepage palette and shared button system. The owner also rejected the repetitive
homepage featured-work stack. This work does not authorize publishing, new translations or a
whole-site design lock.

The shared service layout has 30 active consumers: 25 English service/location pages and five
existing Arabic service pages. The English categories include custom software/apps, AI/API and
automation, portals/B2B, website development and maintenance, marketing specialties and the six
existing city landing pages. Existing Arabic consumers receive the shared presentation and RTL
regression coverage, not rewritten translations or newly paired routes.

## Design and implementation

- Contained hero compositions replace oversized centered headings and full-width paragraphs.
  Headings and lead copy sit beside distinct native SVG artwork for software, automation,
  platforms, marketing and web services. Artwork is decorative, locally rendered, hidden from
  assistive technology and contains no new claims or copy. The same homepage header and CTA
  styles replace the detached pill navigation on these pages.
- Capability sections use an editorial heading/copy split. Source blank columns are suppressed;
  meaningful content, controls and media are never treated as blank. Feature groups become
  readable grids. Statistics have high-contrast family accents, tabs have clear selected states,
  and closing CTAs form a contained focal section. Existing paragraphs, tables and links remain.
- Five restrained accent/artwork families provide variation while preserving the black, cream,
  purple and warm accent palette. Layout differences follow real document structure rather
  than duplicating every page into an identical stack of cards.
- `src/content/services/presentation.ts` produces presentation annotations from validated,
  immutable source nodes. It never rewrites text, reorders source children or changes links.
  Source registers and generated documents remain frozen. `service-page.tsx` composes the
  resulting document with `service-artwork.tsx`; `services.css` replaces obsolete source-layout
  rules rather than layering a second conflicting stylesheet.
- `CapturedPageFrame` has an explicit header variant, defaulting to its original floating header.
  Only service pages select the homepage variant; article/company/listing frames retain theirs.
- `AnimatedDisclosure` is shared by homepage and service FAQs. It retains source initial state,
  native no-JavaScript behavior, keyboard activation and reduced motion, with interruptible
  320ms opening/closing enhancement. The old homepage FAQ-group entrance was removed because
  its focus-triggered cancellation moved the group during a pointer click.
- Homepage featured work becomes an asymmetric composition: one wide lead feature and two
  image-led supporting cards. It keeps the three source images, titles, descriptions and links,
  borderless glass treatment and mobile readability. This replaces the three identical wide rows.

The earlier requested homepage stats/contrast, 100% satisfaction copy, duplicate intro removal,
button-free brand strip and recovered original hero video remain part of this delivery. Their
source exceptions and video provenance are documented in [the homepage record](homepage.md).
The service pages' own source statistics remain unchanged.

## Preservation and verification

The development text-reconciliation probe already verifies all 30 rendered service bodies
against independent frozen `renderTextSha256` values. Final proof uses a production build and
all 232 HTTP tests, including source-body hashes, metadata, status/redirect contracts and exact
recovered video bytes/range requests. A new browser suite visits every service page at desktop,
tablet and mobile sizes, additionally probes 320px, and exercises FAQs and shared actions.
Five representative themes/locales also run in Firefox, WebKit and narrow Chromium. Existing
service counters, tabs, language/history and homepage/motion/navigation suites remain included.

Responsive checks cover headline/header separation, contained artwork, source text/links,
readable controls, no document overflow and disclosure state. Production screenshots provide
review evidence, not automatic owner approval. No generated source or historical screenshot
is edited to obtain a passing test.

The representative desktop checks also cover 1601, 1920 and 2048px hero/header alignment.
Viewport gutters are not applied twice inside a capped container. Tablet service statistics
keep the three counters together and place the location statement beneath them. Diagram
rotation is contained by insetting the SVG, without hiding document overflow or clipping copy.
These checks caught and corrected an initial tablet counter layout and artwork-edge overflow.

Expected commands use the existing npm scripts: formatting, lint, strict types, unit tests,
production build, bundle guard, `test:integration`, then focused browser selection covering
homepage, service redesign, service layout and tabs, and shared navigation/motion. Complete
site-wide browser coverage remains separate; record exact final suite counts and filters.

## Route inventory

| Public path                                                  | Source route ID      | Visual family |
| ------------------------------------------------------------ | -------------------- | ------------- |
| `/b2b-portal-website-development-saudi-arabia/`              | `R-1987ffb9e2fcb882` | platform      |
| `/locations-digital-marketing-dammam-eastern-province/`      | `R-77d930cacfbddce2` | marketing     |
| `/locations-digital-marketing-jeddah/`                       | `R-05879588546b2d6e` | marketing     |
| `/locations-digital-marketing-riyadh/`                       | `R-bf89166f744b9fc3` | marketing     |
| `/locations-website-development-dammam-eastern-province/`    | `R-ae4b8f2c4557d17c` | web           |
| `/locations-website-development-jeddah/`                     | `R-008fb5215e727c01` | web           |
| `/locations-website-development-riyadh/`                     | `R-8341c7f01f86e270` | web           |
| `/professional-website-development-company-in-saudi-arabia/` | `R-d37935eb53a2a5dd` | web           |
| `/services-ai-automation-saudi-arabia/`                      | `R-2ea04bcf8b41b11f` | automation    |
| `/services-api-integration-saudi-arabia/`                    | `R-3c0c402f82a25de6` | automation    |
| `/services-cloud-portal-development-saudi-arabia/`           | `R-6e7e1d49e2793d9b` | platform      |
| `/services-custom-software-app-development-saudi-arabia/`    | `R-54ef9c93732551a9` | software      |
| `/services-custom-website-development-saudi-arabia/`         | `R-37f67fcbe0f89e8e` | web           |
| `/services-digital-marketing/`                               | `R-661faf9de8b4a219` | marketing     |
| `/services-ecommerce-development-saudi-arabia/`              | `R-074b5e2a410a5e14` | web           |
| `/services-email-marketing-saudi-arabia/`                    | `R-a009409174c4c09c` | marketing     |
| `/services-google-ads-saudi-arabia-2026/`                    | `R-a11a158e4617d012` | marketing     |
| `/services-marketing-automation-saudi-arabia/`               | `R-97b60a187fbcf1c5` | automation    |
| `/services-pwa-development-in-saudi-arabia/`                 | `R-df847250b2307366` | web           |
| `/services-seo-saudi-arabia/`                                | `R-5246187dfd3b778b` | marketing     |
| `/services-ui-ux-design-saudi-arabia/`                       | `R-badd60679617635f` | web           |
| `/services-video-marketing-saudi-arabia/`                    | `R-2d3c16544074ee82` | marketing     |
| `/services-website-maintenance-saudi-arabia/`                | `R-a40cf1b87a23cd67` | web           |
| `/services-wordpress-development-saudi-arabia/`              | `R-1939954a2017db77` | web           |
| `/social-media-marketing-services-in-saudi-arabia/`          | `R-4173d39911060952` | marketing     |
| `/تسويق-رقمي/`                                               | `R-6bb40d0b6be521cf` | marketing     |
| `/تصميم-وتطوير-المواقع/`                                     | `R-38a23850594a47d4` | web           |
| `/تطوير-تطبيقات-الجوال/`                                     | `R-dbe0adc51c0b8222` | software      |
| `/حلول-الذكاء-الاصطناعي/`                                    | `R-c8d9e9811ccf1b44` | automation    |
| `/خدمات-سيو/`                                                | `R-6192607faaa0163f` | marketing     |

## Review and handoff

Production build `eJRjD1ZkXgslSBCUtOEsy` passes all 13 recorded checks: documentation/source
evidence and generated-data consistency, formatting, lint, generated Next types, strict
TypeScript, 30 unit tests, production build, bundle guard, 232 production HTTP tests and
285 focused production browser tests. The browser run has no failed, skipped or flaky cases.
It covers six projects: Chromium at 1440, 768, 390 and 320px, plus desktop Firefox and WebKit.
The exact browser filter and command arguments are retained in the run manifest; this is
focused redesign coverage, not a rerun of the entire historical site-wide browser suite.

The source-frozen run is `tmp/service-redesign/production-2026-10-19T17-59-27-533Z/manifest.json`.
Its source baseline is `nalk-wordpress-2026-10-15`; dependencies and source checksums are recorded
there. No application, asset, test or documentation inputs changed during the verification run.
Final record updates are reconciled separately after verification.

The production visual review records 159 captures at 1440×1000, 768×1024 and 390×844:
90 service hero views, 51 representative service section views and 18 homepage section/video
views. `visual-review-settled/manifest.json` records checksums, playback observations, zero
unexpected resource/console errors and termination of its owned server. Captures wait for
image decoding and a subsequent paint before review; the initial capture set is retained
separately. Hero galleries cover all 30 routes; native section samples cover typography,
capabilities, grids, statistics, disclosures and closing actions.

Owner review remains open for all redesigned pages. Existing routes, content ownership and
release gates remain protected. Sanity, integrations, hosting/deployment and expanded Arabic
delivery remain separate. The next step is owner feedback on the local designs, followed by
agreed refinements and an explicit design lock before any new Arabic content work.
