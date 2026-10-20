# Content and Sanity migration

Status: data contracts and implementation procedure. Dataset writes have not been performed.

## Current delivery order and Arabic content

[D-17](registers/decisions.md) prioritizes owner-directed redesign, then Arabic versions of the
locked redesigned pages. The [next-phase plan](12-redesign-and-arabic-delivery.md) owns the
translation workflow, source revisions, review and phase boundary. The schemas/import steps
below remain future contracts; this document does not direct immediate Sanity setup or bulk
translation ahead of design lock. Existing Arabic content and routes remain protected.

Arabic content must derive from the approved redesigned page's complete content, not an
independent translation of frozen WordPress layouts. Keep UI messages separate from editorial
content; use shared templates, linked language identities and reviewed per-language content.
Translated articles can publish independently after approval. Generated listings use actual
published localized articles; do not separately maintain translated snapshot cards.

Preserve legacy recovery/provenance checks while allowing new localized content without
inventing WordPress IDs. Store editorial translations outside generated recovery files. Source
revision changes must surface stale translations without overwriting approved editorial work.

## Content ownership

| Content | Initial owner | Reason |
| --- | --- | --- |
| Marketing/service/location pages and shared sections | Typed application content/composition | Preserve specific layouts without introducing an unnecessary page builder |
| Blog articles, authors, categories and tags | Sanity | Requested editorial workflow |
| Blog/category/author listings | Application templates over Sanity data | Preserve the layout while keeping editorial results current |
| Public path and reserved-route policy | Application routing with validated CMS article paths | Prevent collisions and silent SEO changes |
| Media identity and legacy compatibility | Asset mapping plus selected storage/CDN | Preserve originals, public links and deterministic imports |
| Credentials, recipients and provider secrets | Environment/secret manager | Must not become publicly queryable CMS content |

Moving additional marketing content into Sanity is a separate, justified scope decision. Do not make every repeated visual section a CMS document by default.

## Schema contracts

Implement only fields supported by actual content or a defined editorial requirement. Suggested document contracts:

| Type | Required responsibilities |
| --- | --- |
| `article` | Stable legacy identity; immutable public path for migrated content; editable title/excerpt/body; publication/modification dates; locale; author; categories/tags; featured image; SEO; translation references |
| `author` | Public identity, display name, profile/bio/image and supported public links; no private WordPress account details |
| `category` | Stable source identity, name, description, slug, parent relation and public archive path/SEO where retained |
| `tag` | Source identity, name and retained public route where applicable; no automatic creation of new indexable thin archives |
| Shared `seo` object | Resolved title/description, canonical override policy, robots, social image/title/description and supported structured-data attributes |
| Image object | Sanity asset reference, source attachment identity, alt text, caption, original dimensions and intentional focal/crop metadata |

Use deterministic imported IDs such as `wp.article.<postId>`. Store `wordpressId`, `legacyPath` and `sourceChecksum` as migration identity. Separate these fields from a newly authored article's slug workflow. Renaming a title must not silently change a published path.

Validate path uniqueness against articles, marketing routes, legacy source routes and reserved API/Studio/system paths. Validate locale and translation references; only declare actual language equivalents. Validate category ancestry against cycles and nonexistent parents.

Keep visible publication dates and source modification dates explicitly. Do not replace them with import time, infer a new publication year from a URL, or rely on Sanity system timestamps to represent WordPress publication history.

Interpret WordPress GMT fields as UTC and preserve the captured display date/formatting policy. The documentation's Asia/Karachi timezone does not automatically define the website's article-date display. Distinguish editorial modification from ingestion/revalidation time so an unchanged import does not falsely update every article's visible or structured-data modification date.

## Intermediate model before writes

Extract the XML/database into a versioned intermediate model independent of Sanity transport. It must include source ID/type/status, original path, canonical/public behavior, creator reference, complete body/excerpt, dates, term relations, featured/inline media, attachment metadata and SEO/schema references.

Preserve raw source body/checksum for reconciliation outside the public dataset. Record source parsing warnings and unsupported content. Never execute SQL, PHP, WordPress shortcodes or scripts as a conversion strategy.

Reconcile records that are published in WordPress but publicly redirect or return 410. Do not import all 43 published post records as 43 independently indexable articles. The retained canonical article set is determined from route/content evidence; preserve source records privately when useful for history.

## Rich-content conversion

Use structured Portable Text for editor-supported content, with explicit custom types for structures the default text blocks cannot preserve. Sanity's [Portable Text introduction](https://www.sanity.io/docs/developer-guides/beginners-guide-to-portable-text) describes the underlying content model; the fidelity requirements below come from this site's source content.

| Source structure | Required target handling/test |
| --- | --- |
| Paragraph/headings and inline marks | Preserve text, ordering, levels, emphasis and links; retain stable anchor IDs |
| Ordered/unordered/nested lists | Preserve nesting and numbering, including start values where present |
| Images and figures | Resolve attachment/asset identity, dimensions, alt, caption, alignment and displayed crop |
| Tables | Explicit table type preserving rows, headers, cell content and responsive overflow behavior |
| Code/preformatted examples | Preserve whitespace, language labels and escaping; horizontal scrolling/copy behavior only if part of the agreed design |
| Blockquotes/callouts | Typed rendering with original content/style |
| Embeds/iframes | Supported allowlisted provider type, dimensions, fallback and consent requirements |
| Links/downloads | Original meaningful destinations/fragments, target/rel behavior and accessible labels |
| FAQs/TOC/anchors | Preserve question/answer order, navigation targets and intentional schema relationships |
| Unrecognized HTML/shortcodes | Stop/report conversion loss; implement a supported type or narrowly sanitized, documented exception |

Do not flatten a table, remove code indentation, strip useful IDs, merge independent headings or drop an image simply because the importer still produces a valid Sanity document. Validation must compare semantic structures as well as text.

Generate stable block keys from source identity/structure, avoiding collisions within a document. An unchanged source imported twice must produce the same document/content identities.

## Media migration and legacy paths

Build an allowlist and a map for every required source reference. Record original URL/path, source archive/member, checksum, MIME type, dimensions, destination asset/storage identity, alt/caption ownership and each referring document/section.

Deduplicate byte-identical media while retaining all original URL aliases. Prefer an appropriate original for CMS image transforms; do not import every WordPress thumbnail as a separate editorial image. Retain externally referenced legacy derivative URLs through the compatibility layer where required.

Do not publish the entire uploads directory: it contains material such as logs and caches in addition to public assets. Never serve backed-up PHP or private configuration. Sanitize SVG and verify MIME types rather than trusting file extensions.

Determine and preserve original image crop/position in each use. An optimized image can still be visually wrong if its ratio, `object-position`, focal point or responsive source size changes. Track remote media and font provenance explicitly. See [ADR-0003](adr/0003-media-compatibility.md).

## Import procedure

1. Select an explicit nonproduction project/dataset; validate the environment and input manifest. Print identifiers and intended operations without printing secrets.
2. Dry run: resolve routes, build proposed documents, detect path conflicts, resolve assets, count retained/excluded records and produce a loss/error report. Perform no remote writes.
3. Import or reuse media by checksum and source map. Checkpoint successful mappings so a retry does not duplicate them.
4. Import taxonomy/author records, then article references. Use deterministic identity and supported Sanity import/client facilities; see [Sanity bulk import](https://www.sanity.io/docs/content-lake/importing-data).
5. Reconcile representative English/Arabic articles and difficult code/table/embed content before expanding the batch.
6. Import the full retained set. Re-run unchanged inputs to demonstrate idempotency and document permitted changes.
7. Produce a source-to-destination report with counts, IDs, checksums, lost/unsupported structures, unresolved references and excluded records with reasons.
8. Validate public rendering, metadata, dates, taxonomy, related articles, search and sitemap behavior on staging.

The import owns an explicit allowlist of fields. A later delta import must not overwrite editorial changes indiscriminately. Compare the last imported source hash, current WordPress hash and current Sanity content; surface concurrent changes for resolution. Never delete unmatched destination documents automatically.

Record operation IDs, dataset snapshot/export references and rollback steps. Dataset import/recovery authorization is separate from production cutover; do not use a production dataset as a test fixture.

## Editorial behavior

An editor can create, draft, preview, publish, amend and unpublish supported articles; select authors/categories/media; provide alt text and SEO; and understand validation failures. Reordering supported content must not require editing raw JSON or Tailwind strings.

Provide authenticated preview with safe return paths, a visible preview indication and a reliable exit. Draft content must not enter public queries, sitemaps, search, metadata caches or analytics publication counts. Sanity's [visual editing guidance](https://www.sanity.io/docs/visual-editing/introduction-to-visual-editing) is a capability reference; use only the integration needed by this workflow.

Validate webhook signature/authentication, payload and document identity. A duplicate valid event is safe. Publishing an article invalidates article, listing, taxonomy, related-content, search and sitemap dependencies according to an explicit map. Unpublishing a previously public path needs a recorded 404/410/redirect policy; it must not fall through to a different page.

## Reconciliation gate

G5 requires:

- Exact retained-document identity/count reconciliation, with every excluded source record explained.
- No missing required media references or unsupported blocks.
- Full normalized text/structure comparison and human review of each imported article's rendering.
- Correct dates, author/category links, language, canonical, robots, social metadata and schema.
- Passing retry/idempotency/concurrent-edit tests and verified recovery.
- A new English article and a new Arabic article visible at validated root paths through publishing alone.
- Working draft/public separation, preview and bounded content freshness.
- An editor guide that matches the actual Studio schema and deployed workflow.
