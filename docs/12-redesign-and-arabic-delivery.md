# Redesign first, then Arabic content delivery

Owner transition, October 20, 2026: the current design is accepted as the working baseline for the Arabic phase. The approved [Arabic implementation contract](14-arabic-localization.md) supersedes the earlier deferral and URL proposals below. Subsequent owner direction assigns language acceptance internally: no reviewer nomination, visitor-facing review notice or disabled translation state. Historical redesign/review instructions below remain evidence, not a renewed nomination gate.

Updated: October 20, 2026. Decision: [D-17](registers/decisions.md). Status: owner-confirmed
delivery sequence; redesign and focused journeys are active under D-18/D-19/D-20 and expanded Arabic implementation has not started.

The current [focused customer journey contract](13-customer-journey.md) and [editorial record](page-reviews/customer-journey.md) authorize specific English copy/navigation changes while retaining routes, SEO and the visual system. This does not start Arabic work.

## Agreed priority and phase boundary

The owner directs the redesign, including page order, recommendations and the changes to make.
Preserve the content of each public page while improving its presentation. Lock the agreed
design before producing the Arabic version of that same redesigned page.

The default sequence is:

1. Redesign the owner-selected pages and shared components.
2. Resolve review feedback and record the owner's design lock for the agreed scope.
3. Begin Arabic implementation and translation against those locked designs and content revisions.
4. Review Arabic language, RTL presentation, behavior and SEO separately before publication.

Redesign remains the active priority across the site. Approval of one page does not silently
start Arabic work or declare the overall design phase complete. The owner confirms the scope
of the transition: the complete design phase, or an explicitly released locked page/batch.
Do not assume page-by-page translation will run alongside unfinished redesign work.

The earlier suggestions to start an Arabic pilot during redesign, install localization tooling
immediately or adopt new `/ar/` URLs are proposals, not approved implementation instructions.
Planning and RTL-friendly engineering are allowed during redesign; bulk translation, new
Arabic routes and the new localization/publishing system wait for the Arabic phase.

## Scope and starting evidence

The [D-16 navigation scope](registers/navigation-scope.md) selects 107 active content pages:
99 ordinary visitor journeys and eight reached through the visible HTML sitemap. The eleven
archive-only project/demo pages remain outside redesign scope. Their existing responses and
all 67 configured legacy rules remain protected until a separate SEO disposition is agreed.

The local content inventory contains 93 English and 14 Arabic pages within that active scope.
The fourteen Arabic pages are existing content, not fourteen verified English/Arabic pairs.
Do not infer equivalence from a matching service name, a slug or the current language button.
Listings and pagination will eventually be generated from localized content, so the number
of source routes is not a translation-document count or a promise of 214 final pages.

[Chunk 20](chunks/20-article-fidelity-follow-up.md) records historical application engineering
evidence: 1,140 passing tests and a local production build. Visual/state acceptance, real
Sanity, integrations and production/release checks remain open. This plan does not accept
those gates, rerun the application suite or authorize deployment.

The current [D-20 customer journey record](13-customer-journey.md) records 1,350 passing
engineering tests and nine-page previews. Owner content/design review remains open; this does
not lock the design or start Arabic implementation.

## What remains protected during redesign

| Area                   | Rule                                                                                                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content                | Preserve meaningful copy, headings, sections, facts, claims, statistics, dates, attribution, tables, code and downloads. Rewriting or removing content requires a specific owner direction.                                       |
| URLs and SEO           | Preserve existing paths, initial statuses, redirect destinations, canonicals including absent values, noindex behavior, structured-data facts and meaningful link/anchor destinations. Review any proposed SEO change separately. |
| Media                  | Preserve the intended image identity, branding and attribution. Record an owner-directed replacement or crop; keep original assets and provenance.                                                                                |
| Behavior               | Keep navigation, CTAs, search, tabs, FAQs, keyboard/focus, reduced motion and meaningful loading/error states usable. Redesign is not authority to drop functionality.                                                            |
| Current Arabic content | Keep its existing routes, content and language semantics working. Shared-component edits must not break these pages while expanded Arabic work is deferred.                                                                       |
| Evidence               | Retain the WordPress archive and historical engineering/visual reports unchanged. Store approved redesign references separately.                                                                                                  |

The existing approved contacts, current-article share targets and readable underlined body
links remain in force unless the owner changes them specifically. A design lock is not a
blanket approval to rewrite content, change indexing or remove a public page.

## Redesign procedure for each selected page

1. **Record the direction.** Identify the route, current language, relevant template and the
   owner's requested changes. Record affected shared components and pages. Do not invent a
   page queue or treat an illustrative recommendation as an approved design.
2. **Establish the preservation checklist.** Identify the current content revision, sections,
   assets, destinations, metadata and behaviors that must remain. Record any expressly
   requested content or SEO change separately from presentation work.
3. **Implement the redesign.** Keep content separate from composition; reuse approved tokens,
   buttons, cards, navigation and form controls. Introduce a component only for a real shared
   responsibility. Keep page-specific composition explicit and avoid a general page builder.
4. **Verify the affected scope.** Check responsive layouts, interactions, accessibility,
   loading stability, content, links and SEO. A shared edit needs regression coverage of its
   consumers, including existing Arabic pages, not just the selected page.
5. **Present a concrete review.** Supply a working preview, relevant screenshots/states,
   implemented changes and remaining issues. Resolve feedback before requesting design lock.
6. **Record the lock.** Capture the owner's explicit approval and its route/batch scope,
   content/design revision, build/source identity, dated visual evidence and known exceptions.
   Passing tests or silence do not constitute approval.
7. **Proceed as directed.** Continue the redesign queue. Start Arabic only after the owner
   confirms the transition described above; use the locked page as the translation source.

Do not start unrequested changes on other pages because a shared design recommendation was
discussed. Implementing a selected shared change includes its necessary regression fixes.

## Meaning of design lock

A locked page has an approved composition, typography, spacing, media treatment, component
variants, responsive rules, interactions and settled content revision. Review covers desktop,
tablet and mobile, plus applicable keyboard, focus, touch, loading and reduced-motion states.
There are no unresolved issues being presented as completed design work.

Locking a design fixes its intended system; it does not require Arabic text to have identical
line breaks, line lengths or element heights. Arabic typography, wrapping and RTL adaptation
must fit that system without clipping, omitted copy or shortened translations.

When a later English/source edit changes a locked page, record the new revision and its
impact. Reopen review for the affected design/content and mark dependent translations for
review. A changed shared component can affect several locks. Never overwrite approved
translations or silently carry an earlier approval onto changed material.

## Arabic phase: translate the approved redesigned pages

The Arabic source of truth is the locked redesign and its final content, not a fresh copy
of the old WordPress layout. Existing Arabic text may be reusable only after checking its
equivalence, accuracy and fit with the redesigned page's complete content.

| Content surface                 | Planned handling after the design transition                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared interface                | Typed messages for header/footer, menus, buttons, search, pagination, accessibility labels, dialogs, status documents and form notices.                                                    |
| Marketing/company/service pages | Structured Arabic content rendered by the same approved templates and components as its source page. No separate duplicated Arabic component tree.                                         |
| Articles                        | Complete translated body, excerpt, categories, captions and metadata, with independently reviewed/published language documents linked in Sanity.                                           |
| Categories and authors          | Stable shared entity identities with reviewed localized labels, descriptions and biographies where applicable; do not translate personal names as ordinary prose.                          |
| Listings and related content    | Generate the Arabic Blog, category/author views, pagination, related articles and HTML sitemap from actual published Arabic records. Do not translate frozen card snapshots independently. |
| Media and metadata              | Translate relevant alt text, captions, titles, descriptions and social copy. Identify text embedded in images; use approved localized artwork where necessary while retaining originals.   |
| Protected values                | Preserve factual numbers, code, URLs, phone/email destinations, field names, option values and identifiers. Localize display labels without changing their meaning or underlying values.   |

Translate meaningful paragraphs, headings and table cells with their context, preserving
inline formatting, links, anchors, lists and code. Do not translate isolated DOM text
fragments independently or replay raw WordPress HTML. Store translations with stable block
identities so edits/reordering do not attach old translations to the wrong passage.

The editorial workflow will be source selection, draft, automated checks, Arabic editorial
review, owner/editor approval of a specific revision, then publication. Source changes mark
the affected translation as needing review; retain the last approved version and resolve
the impact explicitly. Do not auto-publish AI output or translate on visitor requests.

Recommended language style is professional Modern Standard Arabic suitable for Saudi business
readers. Establish a glossary for brand/service names, technical terms, places, transliteration,
numerals and punctuation. AI can assist drafting and consistency checks; it cannot replace
a proficient Arabic reviewer for accuracy, natural phrasing and commercial/technical claims.
The reviewer and final editorial ownership must be identified before language acceptance.

## Planned technical approach, not implemented capabilities

Separate stable page identity, locale, public path, template and translation-group relationship
from optional legacy provenance. The present recovered-data validators bind some templates to
WordPress IDs/paths; preserve those recovery checks while allowing new localized documents
through a validated repository adapter. Do not fabricate source IDs for new translations or
manually modify generated recovery files to hold editorial content.

Use one locale-aware resolver for visible content, navigation, metadata and alternate-language
relationships. Keep Server Components as the default and pass only necessary messages/data to
interactive components. Preserve the current content-derived server `lang`/`dir` and full-document
language transitions until a separately tested architectural change is justified.

UI messages and formatting need typed coverage and Arabic plural rules; a library such as
`next-intl` is a candidate, not an installed dependency or a new routing decision. Keep page
content and Sanity models independent of the message library. Blog translation documents should
be linked and independently publishable; marketing content need not all move into Sanity.

Arabic rendering needs an approved licensed font, appropriate line height/letter spacing,
logical spacing/alignment, deliberate directional icons, and isolated LTR code/phone/email
content. Do not flip the whole page or every graphic. Set the calendar, timezone and numeral
format intentionally rather than changing source dates through a locale default. Arabic
search needs localized results/messages and reviewed matching normalization that does not
alter stored text. Translate form labels and feedback without implying that transport is configured.

Publishing/unpublishing must update the affected page, paired language links, listings,
related content, search and sitemap dependencies. Test draft isolation, partial publication,
source failures and stale-translation handling against the actual repository/Sanity workflow.
The current fixture proof is not evidence of real Sanity reliability or production freshness.

## URL and multilingual SEO decisions still open

- Preserve every existing English/Arabic path and all legacy dispositions. Adding `/ar/` for
  new missing Arabic counterparts is a proposal only; it requires a reviewed route map and
  architectural decision because `/ar` is currently reserved.
- Audit existing pairs before creating new pages. The present fixed Arabic language-button
  destination is not a translation map. Resolve the corresponding published version by identity;
  clearly handle an unavailable translation without pretending another page is equivalent.
- Never return untranslated English content as a published Arabic page, and do not change a
  known URL's language using cookies, browser detection or automatic language redirects.
- New indexable translations need intentional canonicals and reciprocal `hreflang` only for
  genuine published equivalents. Existing absent canonicals/noindex remain unless specifically
  reviewed. Decide language/region codes and any `x-default` behavior during the SEO design.
- Generate XML sitemaps from approved, published, indexable identities. Exclude drafts, missing
  translations, redirects and error/gone pages. Preserve legacy sitemap endpoint compatibility
  through a reviewed implementation; the visible HTML sitemap is a different page.

URL format, detailed page-pair coverage, Arabic font/style, glossary, calendar/numeral policy,
review ownership, message-library choice and Sanity configuration remain implementation-phase
decisions. This document approves none of them by inference. Translation of Arabic-only content
into new English counterparts also needs explicit coverage selection rather than a doubled
page-count assumption.

## Verification and acceptance boundaries

| Stage              | Required evidence                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Redesign           | Preserved content/media/SEO/links; working interactions; responsive and accessible layout; stable loading; owner-reviewed visual references for the selected scope.                              |
| Design lock        | Explicit owner approval tied to the route/batch, content/design revision, build and dated viewport/state evidence. A page lock is separate from the overall phase transition.                    |
| Arabic             | Complete reviewed content, localized interface/links/metadata, RTL and mixed-script rendering, correct language/formatting, no accidental English fallback, and usable navigation/search/forms.  |
| Arabic publication | Approved current revision, actual published page pairs, canonical/hreflang/sitemap checks, draft isolation, reliable publication/invalidation and language-navigation history tests.             |
| Release            | Existing content/SEO, real integrations, Sanity, security, performance, hosting, indexing, rollback and cutover gates from the migration plan. Design or language approval does not close these. |

Use 1440x1000, 768x1024 and 390x844 as the established profiles, plus 320px, applicable
breakpoint boundaries, zoom and Chromium/Firefox/WebKit checks. Use the existing engineering
suite and add meaningful locale/content/publication tests as implementation expands; do not
invent an already-passing Arabic suite. Automated checks detect omissions, structural damage,
changed facts and broken links; language quality also requires editorial review.

Approved redesign references live separately from frozen WordPress evidence. Each comparison
states its actual target and design revision. Do not erase old failures, relax thresholds,
mask content or declare all old differences accepted because a redesign is planned. Unchanged
pages remain under their existing contracts. Arabic gets its own approved visual evidence
against the locked design system, not a claim of identical English geometry.

## Page work record and source of truth

Create a real page review record when the owner selects a page; do not prepopulate 107 empty
records. Use the existing route IDs and link to the scope/route register. A record contains:

- Page URL/ID, language, template, selected scope and the owner's direction.
- Source content revision/checklist and separately approved content or SEO changes.
- Shared components and other affected routes.
- Implemented design changes, tests, preview/screenshots, open findings and review feedback.
- Owner design-lock evidence, revision and scope; any later reopening and affected pages.
- Phase-transition evidence before Arabic work starts for that scope.
- Verified Arabic counterpart/group, source and translation revisions, glossary/media notes.
- Arabic review/approval, RTL/SEO/publication evidence and unresolved dependencies.

The page record owns design-lock and translation-review detail. The existing
[route register](registers/routes.json) continues to own implementation/acceptance status and
references that evidence; do not maintain a conflicting acceptance database. The
[decision register](registers/decisions.md) owns changed product/SEO/architecture decisions.

## Immediate next action

Complete the owner-directed [light tidy pass across the remaining active pages](page-reviews/site-tidy.md)
before the deeper page-by-page design reviews. The active navigation scope and preservation
contracts remain unchanged; this cleanup does not lock designs or start new translations.

Continue the owner-directed [homepage refinements](page-reviews/homepage.md) under D-18 and
[service/location redesign](page-reviews/service-family.md) under D-19. Preserve their content
and SEO, verify concrete results and resolve owner feedback. Implementation does not imply
whole-page design lock or an Arabic transition.
Do not start the earlier proposed Arabic pilot, CMS setup, bulk translation or deployment on
the strength of this plan alone.

## Supporting references

These explain available mechanisms; they do not select a library, URL policy or provider:

- [next-intl request configuration and App Router setup](https://next-intl.dev/docs/getting-started/app-router).
- [Sanity document and field localization](https://www.sanity.io/docs/studio/localization).
- [Google localized-page relationships](https://developers.google.com/search/docs/specialty/international/localized-versions).
- [W3C direction and mixed-script markup](https://www.w3.org/International/questions/qa-html-dir).

