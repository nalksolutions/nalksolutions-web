# Project contract

Status: implementation requirements. Owner: project owner and implementation lead. Last reviewed: October 19, 2026.

## Outcome

Deliver Nalk Solutions on a maintainable Next.js application, using TypeScript and Tailwind, with Sanity providing an effective blog editing workflow. Preserve existing public content, URL identity, SEO and meaningful behavior while applying owner-approved design changes. The initial WordPress reconstruction remains the preservation baseline; D-17 now prioritizes owner-directed redesign, then Arabic versions of those locked redesigned pages. Editors must be able to publish supported articles without developer changes.

The [redesign and Arabic delivery plan](12-redesign-and-arabic-delivery.md) defines page selection,
design locks, the transition to Arabic, translation review and separate acceptance. This
supersedes exact WordPress appearance as the target only for an explicitly approved redesign
scope; it does not approve copy removal, URL changes, new indexing policy or deployment.

The migration is complete when the release criteria in [verification](08-testing-and-acceptance.md) and [operations](10-release-and-operations.md) are satisfied, documented and accepted. Completing implementation tasks alone is insufficient.

## In scope

- The active, visitor-facing Nalk Solutions website: pages linked from the main header (including dropdowns and mobile navigation), footer, and the pages/subpages reached through those entry points. This is the owner's scope clarification recorded as D-16.
- Existing marketing, location/service, English/Arabic and blog content where it belongs to those active visitor journeys. A page is not automatically in scope because it was archived, returned HTTP 200 or appears in a sitemap or WordPress export.
- A navigation-derived scope register, reconciled against all 149 captured routes. Archive-only, orphaned and theme/demo pages require an explicit disposition before further reconstruction; their presence in the local baseline does not approve them for release.
- Existing redirect/gone behavior and all 67 configured legacy rules remain a separate SEO compatibility concern. A rule or an archived URL does not by itself require rebuilding a destination page.
- Shared header/footer variants, navigation, nested menus, mobile/tablet popup, search, accordions, sliders, sticky behavior and relevant hover/focus states.
- Text, headings, inline formatting, images, captions, links, article anchors, tables, code, embeds, download references and attribution.
- Original URL identity, redirect/gone behavior, metadata, indexability, canonical relationships, intended structured data and crawlable internal links.
- Blog content modeling, import, editing, preview, publishing and controlled revalidation in Sanity.
- Contact delivery, spam controls, verified tracking, environment configuration, deployment, rollback and handover.
- Automated and manual verification, documented exceptions and maintainable developer/editor instructions.
- Owner-directed redesign of the active pages, followed by reviewed Arabic content and RTL adaptation of those same locked designs under D-17. This is a staged scope extension, not authorization to start bulk translation during redesign.

The [active navigation register](registers/navigation-scope.md) currently identifies 107 content
pages: 99 ordinary journeys and eight HTML-sitemap-only journeys. Eleven disconnected project/demo
pages are outside further reconstruction; their SEO dispositions remain open before release changes.
See [Chunk 12](chunks/12-active-navigation-scope.md) for evidence and implementation batches.

Default handling of existing responses, subject to the navigation scope review. Existing local responses remain unchanged until exclusions have reviewed SEO dispositions:

| Observed behavior | Default replacement behavior |
| --- | --- |
| 200, indexable candidate | Rebuild at the same URL when in the active navigation scope; otherwise review its disposition and SEO impact |
| 200 with noindex | Apply the same navigation scope review; preserve noindex on retained pages |
| 301 | Preserve the configured/observed rule and exact status; review chains and unrelated destinations |
| 410 | Keep a genuine 410 response; do not resurrect its content or return a soft 200 |
| Unknown historical URL | Reconcile additional evidence; unmapped nonexistent URLs return a real 404 |

## Preservation rules

### URLs and SEO

Blog articles currently use root paths. `/blog/` is a listing; it is not a new compulsory prefix for article URLs. Arabic slugs stay at their current paths. Internal locale organization must not expose a replacement `/en/` or `/ar/` URL structure. Preserve useful existing media paths and public query behaviors identified during discovery.

Use actual HTTP-source metadata as the baseline, reconciled with WordPress settings and content records. A missing explicit Rank Math value can inherit a valid generated value. Do not replace all titles/descriptions with new templates without comparison.

### Content

No silent truncation, omitted sections, shortened articles, invented copy, altered dates, swapped images, normalized author names or fabricated translations. Identify stale/demo content explicitly instead of assuming it can be deleted. Article body parity is a separate gate from a successful import count.

### Design

For unchanged pages, retain the existing reference contract. For an owner-selected redesign,
implement the directed composition and reviewed typography, spacing, imagery, responsive rules
and interactions. Record explicit design lock and separate approved references. Shared
components must preserve content and the agreed behavior of their affected consumers.

The measurable visual contract is in [testing](08-testing-and-acceptance.md). Pixel equality across different OS/font/browser renderers is not a credible universal guarantee. Acceptance instead uses fixed reference environments, strict geometry/content checks, per-page comparison and explicit exceptions. The target remains zero unexplained or unapproved design differences.

### Behavior

Preserve the visible result and meaningful interaction, including keyboard operation. Retain real loading/error/empty states. A decorative placeholder cannot substitute for working search, form submission, language navigation or a CTA destination.

## Intentional corrections

The audit identified defects that should not become accidental new requirements: incorrect `tel:`/`mailto:` destinations, Arabic pages marked `lang=en-US`, malformed robots directives, a blocked external theme video, questionable redirects and retired paths.

Each correction needs a decision ID with:

1. The observed behavior and evidence.
2. The intended behavior and affected URLs.
3. Its effect on visuals, content, semantics, status and indexing.
4. Regression tests and any SEO/visual baseline exception.
5. The responsible reviewer and final resolution.

Routine implementation choices and refactoring within the agreed contract proceed normally. Owner decisions are required when business intent, content removal, visual changes, real recipients or production cutover cannot be established from evidence. Prepare a concrete recommendation before requesting such a decision.

## Exclusions unless separately agreed

- Undirected redesign, rewritten marketing copy, new services or wholesale URL restructuring. D-17 authorizes the staged redesign/Arabic delivery approach; individual design directions, content changes, Arabic phase release and URL decisions still follow its recorded workflow.
- Reimplementing WordPress administration, plugin settings screens, commerce checkout or products already retired with 410 responses.
- A general visual page builder, application microservices, a custom CMS framework or a monorepo without demonstrated need.
- Publishing private database records, users, logs, credentials, drafts or every file under `uploads/`.
- Promising unchanged search rankings. The work preserves and verifies technical/content signals and monitors results; ranking outcomes remain external.

## Acceptance and responsibility

The implementation lead owns architecture, code, import reconciliation and technical evidence. The visual/QA reviewer owns independent comparison and defect classification. The project owner confirms business destinations, disputed scope and the reviewed release. These are roles; one person may hold multiple roles, with the review distinction recorded.

No tracked requirement or page becomes `accepted` without its required evidence and reviewer. Retained routes, legacy rules, integrations and operations each need acceptance; a high overall test percentage cannot conceal a failed page.

## Change control

Update the relevant register, tests and documentation together when scope changes. Do not edit raw capture files. New captures use a new dated directory. Approved deviations belong to the working plan and comparison reports, with the original baseline still available.

See [acceptance requirements](registers/acceptance.md), [decisions](registers/decisions.md) and [architecture decisions](adr/README.md).
