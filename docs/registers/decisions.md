# Decision register

Status: decision backlog and dated owner resolutions. Defaults preserve the requested site and allow independent work to continue. D-17 governs the next redesign/Arabic delivery sequence. A required-by gate is a dependency, not a claim that all development must stop now.

| ID | Decision / evidence | Default or proposed resolution | Owner / required by | Status |
| --- | --- | --- | --- | --- |
| D-01 | Hosting/CDN must support chosen Next.js rendering, true 301/410, headers, image delivery and revalidation | Owner selected Vercel; validate the full release behavior on its preview deployment before launch | Owner + lead / G1 | Vercel selected October 21, 2026; deployment and platform acceptance remain open |
| D-02 | Sanity project/datasets/roles and recovery ownership | Separate development and production datasets; least-privilege server access and named editorial ownership | Owner + lead / G5 | Pending configuration |
| D-03 | Correct server locale with existing flat public paths and new articles | Start with server public-path resolution; prove caching/status/locale; select one tested approach in ADR-0002 | Lead / G1 | Request-derived SSR selected for local Chunk 1; platform proof pending |
| D-04 | Actual phone/email destinations and form transport/recipients | Use confirmed footer contacts; D-27 selects direct Resend delivery to the configured inbox, defaulting to info@nalksolutions.com | Owner / G7; visual states earlier | Contacts confirmed October 17, 2026; form adapter implemented October 21; real delivery acceptance pending configuration |
| D-05 | 27 public noindex pages include old/demo content | Retain current public behavior and noindex under the 1:1 scope; removal requires a specific proposed disposition | Owner if scope changes / G1, G6 | Preservation default established |
| D-06 | Arabic pages have English HTML language; retired `/arabic/` differs from live Arabic slugs | Use real Arabic content/path identity; correct HTML semantics without unintended visual flipping; map only real translations | Lead + content reviewer / G1, G4 | Planned correction; page/state evidence required |
| D-07 | Blocked external theme-demo video | Recover intended permitted asset or preserve approved current static/poster behavior; document visible/motion change | Lead + owner if asset/design changes / G3, G4 | Original MP4 recovered from WordPress uploads backup October 19, 2026; playback verification tracked in homepage record |
| D-08 | Questionable Google Ads destination, literal asterisk and malformed legacy patterns | Preserve observed exact behavior until a concrete corrected map is reviewed; never reinterpret an exact rule as a glob | Lead + owner for business destination / G1, G6 | Review required |
| D-09 | Original fonts/Arabic fallbacks and external asset provenance | Recover exact available font files/weights; validate glyph metrics and usage rights; review any replacement | Lead + visual reviewer / G3, G4 | Inventory required |
| D-10 | Analytics, consent, event meaning and verification ownership | Recover actual configuration; remove duplicate tags; verify agreed events without personal form data | Owner + lead / G7 | Configuration recovery required |
| D-11 | Old capture OS/font details are incomplete | Fixed comparison runner, aligned legacy reference, measured repeatability and narrow documented tolerances | Lead + visual reviewer / G2, G4 | Calibration required |
| D-12 | Browser/device support and operational freshness/recovery targets | Initial matrix in testing; calibrate measured budgets and publishing/rollback objectives before release | Lead + owner / G2, G5, G9 | Proposed defaults; implementation evidence required |
| D-13 | Source changes and concurrent WordPress/Sanity edits during development | Freeze/cutoff plus idempotent delta with explicit conflict reconciliation | Owner + editor + lead / G9 | Procedure defined; cutoff not scheduled |
| D-14 | API article share buttons reference a different article | Share the current canonical article with its own title | Owner / G4 | Approved October 17, 2026; implemented in Chunk 4 |
| D-15 | Four API article body links are low-contrast purple without underlines in the source | Retain the rebuild's readable light underlined links | Owner / G4 | Approved October 17, 2026; verified in Chunk 7 |
| D-16 | Archive coverage was treated as the complete reconstruction scope | Rebuild the active visitor-facing site reached through header/footer navigation and its linked pages/subpages; reconcile archive-only routes separately | Owner / G6 | Clarified October 17; audited October 18, 2026: 107 active content pages, 11 archive-only |
| D-17 | Next priority is owner-directed redesign, then Arabic content for those same redesigned pages | Preserve content/SEO; redesign in the owner's selected order; record design lock; begin Arabic only after the confirmed transition for the locked scope | Owner + lead; Arabic editor for language review / next-phase design and Arabic gates, then existing release gates | Sequence confirmed October 19, 2026; no page design, translation, URL policy or deployment accepted by this resolution |
| D-18 | First selected redesign scope is homepage services alignment, sliding brands, contained featured-work cards and four testimonials | Implement the four directed changes; retain the featured quote plus three specific existing website/marketing/ERP accounts; preserve other copy, media, SEO and destinations | Owner + lead / homepage review before design lock | Direction confirmed October 19, 2026; implementation for review, no design lock or Arabic transition |
| D-19 | Redesign the primary service journeys and related specialist/location pages; improve the repetitive homepage featured-work composition | Preserve source content, links and SEO; use varied service artwork/editorial layouts with homepage palette and buttons; cover existing Arabic consumers without new translations | Owner + lead / service-family visual review before design lock | Direction confirmed October 19, 2026; implementation for review, no Arabic or release acceptance |
| D-20 | Simplify the customer journey while retaining SEO pages | Four consistent offers for Saudi businesses; five familiar navigation links; Contact as the main action; optional specialist groups; focused English editorial changes with unchanged public routes/SEO | Owner + lead / journey review and engineering verification | Approved October 20, 2026; implemented and engineering verified; owner content/design review pending; Arabic, form delivery, Sanity and deployment excluded |
| D-21 | Header geometry, responsive controls and mobile-menu behavior differ across page families | Use one enclosed dark glass bar on every page; shared 1180px breakpoint; independently scrolling native mobile dialog with subtle 200ms open/close animation, reduced-motion support and reliable focus | Owner + lead / shared-header visual review and engineering verification | Approved October 20, 2026; implemented and complete engineering gate passed; owner visual review pending; see [header work record](../page-reviews/unified-header.md) |
| D-22 | Section widths and card actions are inconsistent; Contact obscures the enquiry path; Blog topics expand the listing | Use shared section edges, bottom-aligned actions and uniform related-card media; reorganize preserved Contact information around email/phone; put all Blog topics in a native modal; order navigation Home, Services, About, Blog, Contact | Owner + lead / focused UI review | Requested October 20, 2026; implemented for review; build/lint/format, 37 unit tests and two short browser smoke cases pass; broader suites not run at owner direction; see [work record](../page-reviews/ui-consistency-contact.md) |
| D-23 | Placeholder tab icon, cropped Contact hero photo and incomplete footer | Reuse original Nalk icon variants; preserve the full photo aspect ratio; one responsive shared footer with retained direct destinations and reused business facts | Owner + lead / focused visual review | Implemented October 20, 2026; focused lint/type/unit and three Chromium viewport checks pass; see [work record](../page-reviews/brand-contact-footer.md) |
| D-24 | Regional service columns look unbalanced and specialist accordions lack motion | Use existing glass cards and shared grid rows for matching linked content groups; reuse one interruptible animated native disclosure across recovered and authored content | Owner + lead / focused visual review | Implemented October 20, 2026; targeted lint/type/format, nine unit and four Chromium cases pass; see [work record](../page-reviews/service-cards-disclosures.md) |
| D-25 | Service pages retain empty spacer columns, detached CTAs and distracting layouts | Normalize source columns, group concise capabilities in responsive glass panels, retain quiet supporting links and use restrained shared motion | Owner + lead / service-family visual review | Requested and implemented October 20, 2026; focused checks and all-service source preservation pass; see [work record](../page-reviews/service-layout-redesign.md) |
| D-26 | Begin complete Saudi Arabic experience after design baseline acceptance | Shared designs, authored localization and /ar/ canonical paths; ready-target compatibility redirects; next-intl and local font; owner manages language acceptance internally without a nomination or visitor review/disabled states | Owner / internal language acceptance | Owner-approved October 20, 2026; subsequent owner clarification separates publication readiness from internal review; no fabricated native approval or complete-site claim; see [contract](../14-arabic-localization.md) |
| D-27 | Make Contact operational on Vercel, using simple email delivery without a database | One bilingual handler, server validation, honeypot, bounded local attempt controls and direct Resend delivery; Turnstile disabled by subsequent owner direction and available only through explicit opt-in | Owner / real delivery acceptance | Requested and revised October 21, 2026; implementation and setup recorded in [Contact email](../15-contact-email.md); account/DNS connection and real inbox test remain open |

## October 19, 2026: service-family redesign

D-19 applies to the 30 existing shared service-layout consumers, including 25 English and five
existing Arabic pages. The owner selected the service detail and related specialist pages;
existing Arabic pages are shared-component regression scope. The [service-family work record](../page-reviews/service-family.md)
records the exact route inventory, preservation and verification. Homepage revisions continue
under [D-18](../page-reviews/homepage.md). No whole-page design lock or translation phase is inferred.

## October 19, 2026: homepage selected for redesign

D-18 records the owner's four homepage requests and the bounded implementation in the
[homepage work record](../page-reviews/homepage.md). The testimonial reduction is an explicit
content exception to D-17 preservation: four existing quotes remain displayed and three
generic entries are removed from the UI, with all originals retained in recovered evidence.
The work record identifies the selected source IDs and rationale. No claims are rewritten
or newly verified. Responsive layout and brand motion change intentionally; other page
content/SEO, legacy rules and prior shared-button decisions remain protected. Owner direction
authorizes this implementation, not a completed design lock, Arabic phase or deployment.

## October 19, 2026: redesign first, then Arabic delivery

D-17: the owner directs that redesign is the first priority for each selected page, on the
owner's direction, and Arabicization follows after the design is locked. The
[next-phase plan](../12-redesign-and-arabic-delivery.md) records the concrete workflow,
preservation rules, design-lock evidence, Arabic content/review approach and separate gates.

Redesign remains the active queue. The owner selects page order and approves the actual
design, then confirms the scope of the transition to Arabic. Do not infer that a single
page approval automatically starts translation alongside unfinished redesign. An earlier
page/batch transition needs explicit direction for that locked scope. Arabic uses the final
approved redesigned page/content revision, not an independently translated WordPress layout.

This supersedes strict source appearance for specifically approved redesign scopes and the
earlier suggestions to start an Arabic pilot before design lock. It authorizes neither
unrequested content removal/rewriting nor bulk URL/indexing changes. Existing routes, all
67 legacy rules, source evidence, contacts and prior approved interaction/readability
corrections remain protected. No application or route-acceptance field changes in this
documentation task. The eleven archive-only pages remain excluded under D-16.

The complete Arabic pair map, new URL format (including the proposed `/ar/` namespace),
font, glossary, numeral/calendar policy, review ownership, localization library and Sanity
configuration remain future technical/editorial decisions. No package, provider, route or
translation is approved merely because it appeared in the preceding analysis. New English
counterparts of Arabic-only pages need a specific coverage decision. Real integrations,
production SEO, CMS, hosting, rollback and release requirements remain open.

## Resolving a decision

Append a dated resolution containing the chosen behavior, affected route/rule/requirement IDs, evidence, reviewer, implementation task, test expectations and any baseline exception. Keep the original observation. Architectural decisions also update the relevant ADR and architecture document.

Do not request a business decision with only an abstract problem. Prepare the exact options/affected pages and a recommendation. Routine engineering choices within the contract can be resolved by the implementation lead and recorded normally.

## October 17, 2026: active navigation scope

D-16: the owner clarified that the target is "all Active and user accessible Menu Linked Pages etc"
on nalksolutions.com. The previous statement that every archived HTTP 200 page must be rebuilt
overstated the scope. The 149-route inventory and 118 locally rendered content pages describe
captured evidence and work already performed, not the approved release page count.

Before reconstructing further families, inventory the active desktop/mobile header, dropdowns
and footer, then trace the visitor-facing pages/subpages linked from those entry points.
Record each candidate's incoming navigation/link evidence and classify it as in scope,
archive-only/out of scope, or requiring review. Blog listing/article/pagination links belong
in this review; their final count is not inferred from the archive. Do not automatically include
or exclude profile, project, author, taxonomy or noindex pages based on their content type.

The scope review precedes new family rollout. Do not delete existing local pages, change their
HTTP status, or remove legacy rules merely to match a smaller count. Any excluded public URL
needs a deliberate SEO disposition and affected tests before a runtime change. Historical
chunk reports and frozen evidence remain unchanged. No new launch or removal is authorized.

The [Chunk 12 audit](../chunks/12-active-navigation-scope.md), completed October 18, finds 107
active HTTP 200 pages: 99 ordinary journeys plus eight reached through the visible footer-linked
HTML sitemap. The [scope register](navigation-scope.md) records the exact paths and incoming-link
evidence. Eleven disconnected project/demo pages are excluded from further reconstruction;
their release SEO dispositions remain open. All 43 articles and 30 service/location pages remain
in scope. The next batch is the five primary corporate/company destinations, followed by ordinary
blog/archive pages and the eight secondary sitemap journeys. No runtime statuses or acceptance
fields changed as a result of this audit.

## October 17, 2026: Chunk 1 engineering resolutions

D-03 selects request-derived SSR with a trusted overwritten pathname header and one rendering
snapshot per request. Cross-language navigation reloads the document. See
[ADR-0002](../adr/0002-public-routing-and-locales.md) and the
[chunk runbook](../chunks/01-foundation-routing.md) for implementation and evidence commands.
D-06 corrects HTML language/direction only in the representative Arabic proof; visual RTL
acceptance remains open. D-08 preserves observed exact rules and the arbic-to-gone chain;
five additional captured status responses are included without inventing matching flags.
No business redirect destination, production hosting, content removal or launch is approved
by these engineering resolutions. Final requirement/page acceptance remains open.

## October 17, 2026: homepage contacts and font recovery

D-04: the owner selected the existing footer contacts for consistent menu/footer use:
`+92 305 551 8777`, `info@nalksolutions.com`. Correct the corresponding `tel:`/`mailto:`
destinations as well as visible theme placeholders. This does not select form recipients or
authorize sending messages. The exact before/after map is recorded in
[Chunk 2](../chunks/02-homepage-visual-slice.md).

D-09/D-11: local Latin Space Grotesk and Manrope files restore all three preserved homepage
reference heights after the old external font request began returning 404. Font licenses,
hashes and original-media provenance are recorded; Arabic fonts and replacement-page visual
acceptance remain open. Reference calibration differences are reported, not adopted as tolerances.


## October 17, 2026: article share destinations

D-14: the owner selected ?Share the current article? for route `R-fbbead80b209e23c`.
Archived widget `7c209573` pointed to `/nalk-solution-offers-smart-business-portals-in-islamabad/`
with that other article's title/body. Facebook, X, LinkedIn and email now use the API article's
canonical and title; source icons are preserved. This changes share targets only, not public
routing or canonical metadata. See [Chunk 4](../chunks/04-article-rendering.md) for tests and
implementation boundaries. No test sends email or publishes to a social account.

## October 17, 2026: article body-link readability

D-15: the owner selected “Keep readable, underlined links” for the four body links on
route `R-fbbead80b209e23c`. Source computed styles are purple `#6d2785` without underlines
against `#020202`; the rebuild retains `#fffbbd` and underlines, plus visible keyboard focus.
Text, destinations and surrounding content are unchanged. This narrowly approved difference
does not accept the whole page or authorize masking links in strict screenshot comparisons.
[Chunk 7](../chunks/07-article-visual-reconciliation.md) records rendering evidence and tests.

## October 17, 2026: deterministic article text comparison

D-11: controlled tablet/mobile frame probes identified large LCD text-edge differences
despite matching content, fonts and all 278 body-element boxes. The article-regions gate
now uses the same explicit grayscale Chromium text policy for source and runtime capture;
other engineering scopes retain default rendering. Browser arguments are recorded and must
match before comparison. Default-rendering evidence and historical screenshots are retained.
This is a fixed test environment, not a production style change, baseline replacement or
pixel tolerance. Exact comparison still fails on remaining differences, including D-15's
approved link treatment. See [Chunk 7](../chunks/07-article-visual-reconciliation.md) for
controlled measurements, the shared configuration and remaining acceptance limits.

## October 17, 2026: article language-link font preservation

D-09: Chunk 7 measured Times New Roman for the original English article header's Arabic
language link and Segoe UI for the rebuilt semantic `lang="ar"` link on Windows. Chunk 8
names the measured system fallback after Manrope for that article desktop link only,
retaining `lang`/`hreflang` and full-document navigation. No proprietary font is redistributed.
Other operating systems must repeat font calibration; this does not select or accept the
typography of the complete Arabic page or mobile menu. See [Chunk 8](../chunks/08-reference-integrity.md).

## October 17, 2026: consistent article-family interactions

The owner's D-14 selection to share the current article and D-15 selection to keep readable,
underlined body links extend across the shared article template in [Chunk 10](../chunks/10-article-family.md).
All 43 article identities use their own public URL/title for sharing, using the published path
when canonical metadata is absent. Those six noindex articles retain absent canonicals. Captured metadata and
link destinations remain unchanged; tests never publish shares or send messages. These
interface corrections do not establish whole-page visual acceptance.

## October 17, 2026: Arabic documents and English shared shells

Chunk 11 reconciles D-06's correct server Arabic language/direction with the captured English
header/footer: English shell copy has `lang="en" dir="ltr"`, while the document/body identity
remains Arabic/RTL and cross-language links still replace the document. Arabic text uses the
measured archived Times New Roman system fallback after the local Latin fonts, rather than
letting the corrected document language silently switch the fallback. No proprietary font is
redistributed. Font metrics and full visual acceptance remain subject to the recorded checks
and operating-system calibration; see [Chunk 11](../chunks/11-service-family.md).
