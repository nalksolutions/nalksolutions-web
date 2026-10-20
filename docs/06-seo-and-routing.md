# SEO and URL preservation

Status: routing and search-preservation contract. Exact runtime implementation is resolved in Phase 1.

Under [D-17](registers/decisions.md), redesign does not authorize changing existing URLs,
canonicals, indexability or legacy rules. Arabic versions follow the locked redesigned pages
and the confirmed phase transition in the [next-phase plan](12-redesign-and-arabic-delivery.md).
The proposed `/ar/` namespace for new translations is not an approved route policy; preserve
existing English/Arabic paths and resolve actual translation pairs before adding alternates.
Approved redesigned visuals do not waive SEO reconciliation or production indexing checks.

## Scope and authority

Treat the migration primarily as a hosting/implementation change with existing visible URLs retained. Google's [hosting migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) supports preparation, verification and post-cutover monitoring. This project's detailed mapping below is derived from the captured site.

Use [routes.json](registers/routes.json) for the 149 captured routes and [legacy-rules.json](registers/legacy-rules.json) for configured legacy behavior. Reconcile Search Console, analytics, inbound links and hosting/CDN rules before final freeze. The WordPress permalink setting is `/%postname%/`; preserve root article paths.

The initial capture has 118 HTTP 200, 18 HTTP 301 and 13 HTTP 410 routes. The legacy-rule register contains 32 configured 301 and 35 configured 410 rules, overlapping the capture. Tests operate on their reconciled union.

## Route policy

| Case | Required handling |
| --- | --- |
| Existing retained page/article | Same public path; correct content, locale, canonical and indexability |
| Existing redirect | Exact configured/observed source matching, status and approved destination; identify chains |
| Gone route | True HTTP 410 under GET/HEAD, intentional body, excluded from sitemap |
| Unmapped nonexistent route | True HTTP 404; no blanket homepage redirect |
| Existing noindex page | Keep noindex and public behavior unless a specific decision changes it |
| Category/author/pagination | Preserve actual path, content sequence, pagination links and intended canonical/indexability |
| Legacy media URL | Serve or intentionally map the public asset with correct content type and stable availability |
| Malformed path/query | Controlled 400/404 or documented normalization; no open redirect, crash or unrelated content |

Do not reinterpret literal asterisks, regex characters, Unicode punctuation or invisible characters in legacy exact rules. Preserve their exact semantics until a deliberate correction is recorded. URL decoding, trailing slash, case and host normalization must be tested separately.

Do not introduce locale redirects based on browser preference that change a known public page's language/URL. A requested Arabic path must serve that Arabic page consistently. Unknown internal/system paths must not expose the public renderer's implementation namespace.

## Canonical host, HTTPS and redirects

Discover the current host/protocol behavior and define one canonical origin. Test apex/www, HTTP/HTTPS, slash variants and query/fragments. Preserve legitimate redirects while avoiding chains caused by normalization occurring in several layers.

Use exact 301 responses where required. The framework's `permanent` shortcut normally selects 308; use a supported explicit status policy and verify the deployment. See [Next.js redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects).

Review destinations, not only the first status. The current `/arbic/` chain ends at a 410 `/arabic/`; a passing configured-status probe does not make that a good language destination. A Google Ads legacy source points to a social-media service. Correct such rules only with an approved map and tests for the intended destination.

Maintain redirect rules as data with stable identity and a single precedence policy. Detect cycles, conflicting sources, destinations that are not approved external origins, chains, self-redirects and references to missing/retired content in CI. Use the same definitions for deployment configuration and contract tests.

## Metadata specification per retained page

Record expected title, description, canonical, robots/Googlebot/X-Robots-Tag behavior, HTML language/direction, actual alternate-language relationships, Open Graph/Twitter metadata and relevant JSON-LD. Use live resolved values as the starting point; do not blindly import unresolved Rank Math placeholder strings.

The page model owns SEO. Layouts may provide stable defaults, but a page cannot accidentally inherit the homepage canonical, an English title or a generic description. Explicitly handle empty overrides versus inherited defaults.

Return readable content and required metadata in server responses, with no JavaScript execution required to discover the document's identity. Verify the pinned Next.js metadata/streaming behavior and response headers directly. See [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).

Canonical comparison distinguishes harmless percent-escape casing from a different path, scheme, host, trailing-slash policy or query meaning. Do not lower-case all paths or decode reserved separators. Avoid canonicalizing every pagination page to page one unless that is a reviewed current policy.

## Structured data

Inventory each live schema type and source. Preserve supported factual Article/BlogPosting, Organization, Breadcrumb and Service semantics where appropriate. Map dates, authors, images, canonical IDs and language consistently with visible content.

Do not carry conflicting plugin-generated duplicates, fabricated reviews or schema that contradicts visible content. Removal/consolidation of baseline schema must be recorded with rationale and validation. JSON-LD must parse, serialize safely and use correct public identifiers; passing JSON syntax does not establish semantic correctness.

Test representative schema with appropriate search-engine validation tooling and retain reports. Do not promise rich-result eligibility or rankings based on schema presence.

## Language and content semantics

Preserve actual English/Arabic documents at their existing paths. Correct the observed Arabic `lang=en-US`/missing direction through a recorded semantic change, with layout regression tests. Use actual translated-document pairs for reciprocal hreflang; do not invent equivalents for untranslated content.

Preserve public heading content and meaningful hierarchy. Correct missing/duplicate semantic H1s where needed without changing the visual title/layout, documenting the delta. Distinguish an actual content change from a semantic markup correction.

Keep links crawlable with real hrefs, including internal article links, taxonomy, pagination, related content and language navigation. Preserve article anchor targets referenced externally and within tables of contents.

## Robots, sitemap and staging

Generate a valid robots policy. The captured unscoped Disallow lines are evidence of the old configuration, not a configuration template for the new site. Confirm Googlebot can fetch intended public assets and pages.

Generate a sitemap from approved canonical, indexable, successful routes. The current 76 sitemap entries must be reconciled against statuses/metadata, not copied blindly or replaced with every discovered URL. Exclude drafts, preview, Studio/API/system routes, redirects, 404/410 and noindex pages. Use truthful modification dates, not deployment time for every page.

Preserve the public sitemap endpoint behavior or map it explicitly, including `/sitemap_index.xml` if external systems use it. Test actual XML content types, escaping, absolute URLs and limits. Verify Search Console ownership methods survive the move.

Staging is access-controlled where practical and has explicit non-indexing controls. Production and staging indexing policies must be independently tested so a staging environment flag cannot ship as production noindex. Robots blocking alone is not a substitute for access control or an intentional indexing policy.

## Query and search behavior

Inventory observed search and pagination parameters in Phase 0. Define handling for meaningful WordPress identifiers/query routes, empty/invalid page values, duplicate parameters, tracking parameters and fragments. Do not assume the capture's normalization rules are the production URL policy.

Search results must have an intentional indexing/canonical policy. Preserve existing search behavior or record a deliberate replacement. Never build redirect destinations from unchecked user-supplied URLs.

## SEO test contract

For every captured route and additional verified historical URL:

1. Fetch directly without JavaScript; record initial status, relevant headers, full chain and destination.
2. Compare expected title, canonical, indexability, language, social metadata, headings and schema to the accepted page model/baseline.
3. Verify retained content and media render server-side and internal links resolve to the correct final pages.
4. Assert sitemap membership/nonmembership and correct robots/verification behavior.
5. Exercise cold/cache-hit requests, client navigation, trailing-slash/host variants and actual Arabic paths.
6. Reconcile every difference with a decision/defect ID; no generic allowlist for all changed metadata.

Release blockers include lost indexable routes, unexpected noindex, wrong canonical/locale, false 200/404/410 behavior, redirect loops, missing critical article content and broken required legacy media. Search monitoring after launch is necessary even when these tests pass.
