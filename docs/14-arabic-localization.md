# Arabic localization delivery

Decision D-26, October 20, 2026. The owner accepts the current design as the working baseline
and authorizes the complete Arabic plan. This supersedes the earlier Arabic deferral, not
the separate CMS, form-delivery or deployment phases. The owner subsequently directs that
language acceptance is handled internally without a nominated reviewer, visitor-facing review
notices or disabled translation controls. That explicit direction supersedes the nomination
and pre-bulk approval gate in the original plan.

## Contract

The active inventory contains 107 source routes, 93 English and 14 Arabic. The authored
register records all 107 with 102 logical entities: the existing Arabic landing and four
Arabic services correspond to English identities; nine Arabic-only entities stay distinct.
The design/source baseline is fingerprinted in the register directory. Frozen recovery
documents are never edited to hold translations.

English paths and SEO remain unchanged. New Arabic counterparts use `/ar/` plus the source
path, except the mapped Websites, Marketing, AI and SEO services retain their Arabic slug
after `/ar/`. The Arabic home is `/ar/`. Existing Arabic-only content gains the prefix.
The 14 authored compatibility rules activate only for publishable, available replacements;
the original 67 rules remain independent and retain precedence and matching settings.
Compatibility redirects are explicit 301, preserve query strings, and target canonical
paths directly from both slash variants. Draft review never activates a redirect.

## Application boundary

Recovered identities retain their original validation. Authored localized identities carry
their own ID, entity/presentation relation, revision and review state, referencing real source
identities without inventing WordPress provenance. A repository adapter supplies the same
shared renderers. next-intl supplies typed interface messages, plurals and formatting; the
existing resolver owns routing and language identity. There is no cookie/language detection
redirect or second locale middleware. Language transitions replace the document.

Arabic uses ar-SA, Gregorian dates, Western digits, logical spacing and self-hosted Noto Sans
Arabic. Latin contacts/code retain LTR isolation. Interface messages and meaningful content
blocks are authored separately; no visitor-time translation, DOM text replacement or raw HTML
translation service is used. Missing content fails validation instead of silently using an
English body. Header/footer, dialogs, forms, metadata and onward links are localization scope.

## Publication and internal editorial ownership

Translation states remain draft, inReview and approved for internal records. Do not invent
native approval, a reviewer or a timestamp. The owner manages linguistic acceptance internally;
neither a nomination nor an approval entry blocks implementation or normal page availability.
The separate `publication.ready` flag means the authored content is available for engineering
publication, with `acceptance: ownerManaged`. It does not claim a native linguistic review.
AI-assisted offline authoring and automated checks must be described honestly in internal
records. No translation provider is called while a visitor browses the site.

Publishable records resolve without an environment flag and receive normal equivalent-page
metadata and compatibility routing. No review banner, pending-translation badge or disabled
translation button appears on public pages. Unavailable destinations are omitted while their
content is being prepared, never replaced by English bodies. `ARABIC_REVIEW_MODE=1` is an
optional developer-only local/test switch for unpublished records; it never grants publication,
hreflang or redirects. Production fixture refusal and local non-indexing controls remain.

Source input checksums detect changed English revisions. Keep the approved revision while
preparing a replacement; review must be reopened for changed content. Preserve numbers,
names, dates, code, identifiers, internal anchors and link targets. Source defects and
translation questions are explicit issues, never silently corrected claims.

## Ordered work

1. Register, baseline, normalized identities, typed messages, review records and Arabic font.
2. Complete Home → Software & Apps → Contact pilot and glossary; owner-managed acceptance.
3. Nine core pages and the four focused offers.
4. Twenty-one supporting English service/location counterparts plus legacy Arabic reconciliation.
5. Thirty-five complete article translations and eight existing Arabic article migrations.
6. Generated Blog/category/author views, nine-card Arabic pagination, remaining active utilities.
7. Reconcile owner-managed acceptance records, ready redirects, SEO and handoff evidence.

Sanity integration, form transport and deployment are excluded. A disabled translated form
must not imply delivery. Marketing content is version-controlled; the repository boundary
allows later Sanity article documents with independent language review/publication.

## Verification and acceptance

Use focused contracts and browser checks during each chunk. The final verify:arabic gate
validates documentation/evidence/registers, formatting/lint/types/content, one production build,
all public HTTP contracts, old/new redirect behavior, raw metadata, draft isolation, localized
search/navigation and bounded cross-browser representative journeys. Capture Arabic previews
at 1440×1000, 768×1024 and 390×844, with 320px/zoom on representative layouts.

Every active identity needs an explicit publishable counterpart, generated view or documented
Arabic-only role. Every old Arabic URL needs a ready exact replacement before redirecting.
Reciprocal hreflang is only for real publishable equivalents. English metadata remains frozen;
new/migrated Arabic canonicals and URL-valued metadata reference their intended canonical paths.
Inherited noindex remains. Local robots/nonindexing controls remain. Search rankings are not
guaranteed by preservation tests. Owner language and visual acceptance remain separate
from automated results. Historical reports and source evidence remain unchanged.

## Work status

The current batch has forty Arabic 200 views: nine core pages, ten English specialist/regional
counterparts, the Arabic-only mobile service, eight migrated Arabic articles, and twelve
category/author roots. All fourteen compatibility moves have available targets. Seven
archive pagination records remain 404 until their published article counts justify a view.
See the [finite editorial and delivery record](page-reviews/arabic-foundation.md).

Eleven English specialists, thirty-five English article translations, remaining utilities and
the final reconciliation/gate are still open. `verify:arabic` is the planned completion gate,
not a currently passing whole-site command. The machine-readable register remains the full
queue; neither its presence nor internal review status constitutes completion or native
approval. Sanity, form transport and deployment remain separate.

Current commands: `npm run test:unit`, `npm run lint`, `npm run typecheck`, `npm run build`
(Webpack), and focused `node tooling/run-browser-tests.mjs http --grep=Arabic` / browser
selections. Production test clients assert approved-origin redirect Locations without
following them onto the live website.
