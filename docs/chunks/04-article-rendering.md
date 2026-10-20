# Chunk 4 — Full API article rendering

Status: initial implementation; article visual acceptance remains open. October 17, 2026.

## Scope and result

Replace the API article's excerpt with its complete captured body at the original public path.
Render semantic React components on the server, resolve metadata and body together, and
publish only recovered media referenced by this page. Five other routes remain excerpt proofs.
This extends the vertical slice; it does not accept the homepage, all article templates,
Sanity publishing or deployment.

The source uses header 71, singular template 107, related-entry template 110 and footer 117.
These differ from the homepage's templates. The initial composition uses the existing English
shell, a dedicated article heading/body layout and recovered adjacent/related links. Complete
header/footer variant matching, related-card images/metadata, pixel refinement remain open. D-14 records the owner-approved correction of archived share
buttons that pointed to another article: all four now share the current canonical URL.

## Content and repository contract

The source identity remains `wordpress-post-59034`, route `R-fbbead80b209e23c` at
`/how-to-build-an-api-from-scratch-a-step-by-step-guide/`. Chunk 3's intermediate recovery
artifact remains offline evidence. [prepare-article.py](../../tooling/prepare-article.py)
projects it into the allowlisted [runtime document](../../src/content/articles/api.generated.json)
and [media inventory](../../src/content/articles/assets.generated.json). It also recovers the
source title excerpt, date label, category, featured image and adjacent/related article links.
The full source JSON-LD graph replaces the earlier Article-only proof subset.

The fixture selects this document explicitly through `content.articleId`. The repository:

1. Reads and validates the current fixture dataset, excluding drafts.
2. Reads the runtime article file only if a published identity selects it.
3. Validates every node and URL, then checks ID, source route, path, locale, content kind,
   title and canonical against the selected page identity.
4. Returns the enriched page, including body and SEO, to the existing request-local resolver.

The same resolved page drives layout language, metadata, visible content and structured data.
No process cache or hidden path fallback is introduced. Invalid/mismatched documents fail the
repository boundary and produce the existing controlled 503 response; they do not become 404.
Missing/draft pages retain the routing contract. Runtime code reads only generated public
content, never SQL, ZIP archives, source HTML or documentation registers.

## Component responsibilities

| Module                                                         | Responsibility                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Article schema](../../src/content/articles/schema.ts)         | Recursive discriminated nodes, safe links and public image paths  |
| [Article resolution](../../src/content/articles/resolve.ts)    | Identity checks and one enriched content/SEO result               |
| [ArticleBody](../../src/components/article/article-body.tsx)   | Semantic headings, lists, links, code, images and table rendering |
| [ArticleImage](../../src/components/article/article-image.tsx) | Original dimensions, alt text and local responsive variants       |
| [ArticlePage](../../src/components/article/article-page.tsx)   | Title, excerpt, date, body, navigation and JSON-LD composition    |
| [Article styles](../../src/styles/article.css)                 | Scoped article layout and responsive reading/overflow behavior    |

All article components are Server Components. React escapes prose and code; raw archived HTML
is never injected. JSON-LD uses the existing safe serializer. Tables and code can scroll within
their own focusable regions. Internal article links retain original paths; Arabic destinations
use full document navigation so root language attributes cannot remain stale.

The source body has 82 paragraphs, 31 headings, nine code blocks, 49 list items and three
diagrams. The featured image adds eight source variants to the 21 body-image files: 29 files
are verified against backup bytes and added to the Proxy asset allowlist. None is fetched from
WordPress at runtime. Empty featured-image alt text is preserved as observed, not invented.

## Layout evidence and limits

The archived template defines an 800 px body column, a 1280 px maximum title and an 800 px
three-line excerpt. Initial desktop composition uses the source 82 px title, centered featured
image and recovered local fonts. Article-specific styles avoid applying homepage section
layouts to the body. Responsive sizing is an initial reconstruction and remains subject to
full screenshot comparison, including code styling, vertical spacing and template variants.

Related links are present as a simple list; this is not the archived slider/card reconstruction.
Adjacent links lack their source thumbnails. Sharing controls use the four recovered source SVGs and the approved current-article targets.
Their visual placement still requires comparison. These are explicit remaining work, not accepted substitutions.
The page is complete with respect to the recovered main body, not the whole archived template.

## Verification commands

```powershell
.venv/Scripts/python.exe tooling/prepare-article.py
.venv/Scripts/python.exe tooling/prepare-article.py --check
npm.cmd run verify:article-rendering
.venv/Scripts/python.exe tooling/compare-article.py tmp/chunk4/<successful-run-directory>
```

Regeneration is deliberate; `--check` does not write content or public files. The full gate
checks documentation/frozen evidence, generated article/body/media consistency, eight offline
conversion tests, formatting, linting, strict types, unit tests, production build tracing,
HTTP behavior and browser tests. It uses an owned loopback server and isolated fixture copy.
Reports and screenshots are ignored under `tmp/chunk4/`, indexed by `latest.json`.

The production HTTP test compares the entire rendered body and all code blocks with Chunk 3's
source-derived recovery artifact. Browser checks repeat those comparisons, verify heading
order and image decoding, exercise keyboard access to code, check document overflow and
capture the full article in six projects (Chromium desktop/tablet/mobile/320 px, Firefox,
WebKit). Existing raw SEO tests assert the complete source JSON-LD graph. Asset GET/HEAD tests
now verify all article images byte for byte.

HTML parsers normalize CRLF/CR to LF, including in the archived document. DOM comparison
accounts only for that standard newline conversion. Source code text in the recovery and
runtime artifacts retains its original endings; indentation and blank lines are not trimmed.
The renderer unit test verifies that literal script-shaped code is escaped, not executed.

Strict visual comparison is a separate failing gate until reviewed differences are resolved.
It requires the successful current build, compares original screenshot dimensions/pixels,
records hashes and never resizes images, masks differences or replaces baselines.

## Remaining work

[Chunk 5](05-article-presentation.md) continues the presentation work below. This document
retains Chunk 4's historical implementation and verification boundaries.

1. Reconstruct and measure article-specific header/footer variants and complete title/body styling.
2. Recover adjacent thumbnails and related-post cards, dates, categories and slider behavior.
3. Complete visual review of sharing controls; approved D-14 targets and keyboard-accessible links are implemented.
4. Correct desktop/tablet/mobile screenshot differences and verify direct entry, refresh and
   navigation using the completed composition before accepting the page.
5. Recover an Arabic article and taxonomy examples, then map the proven model into Sanity.

No route, whole-site content, full visual parity or deployment gate is accepted by this chunk's
engineering tests alone. Chunk 2's remaining visual differences continue to be tracked there.

## Approved share correction and initial review

D-14 was approved by the owner during this implementation: share the current API article.
`articleShareUrls` derives Facebook, X, LinkedIn and email destinations from the resolved
canonical and current heading, validates the public origin and encodes parameters. Source
SVG paths are recovered by the generation script. External web links use `noopener noreferrer`;
email remains a normal mailto link. No sharing service is contacted on page load, and tests
inspect destinations without posting or sending anything.

The first full regression run exposed a stale excerpt assertion containing project-popup copy.
The complete body/code reconciliation supersedes that assertion only for this article. Runtime
plain-text paragraphs now derive from its actual body too. Initial screenshot inspection found
the homepage's absolute header overlapping the article category on mobile; the article shell
now puts the header in normal flow. A browser geometry assertion prevents that overlap.

The article wrapper establishes its own block formatting context so the header margin cannot
collapse outside its dark background. Browser checks assert the wrapper starts at the viewport
top, in addition to checking that the category clears the header.

Screenshot capture waits for viewport repaint after the code-block keyboard check returns
to the page top, then rechecks image decoding and nonzero natural dimensions. A diagnostic
mobile capture had omitted the featured image even though direct browser inspection showed
it loaded and visible. The issue reproduced with Chromium mobile emulation. A preceding
viewport capture helped in an isolated diagnostic, but the final regression's full-page
mobile capture still omitted the image while its viewport capture displayed it. This capture
discrepancy remains unresolved and must be fixed before visual acceptance. Tests retain both
`article-top.png` and `article.png`, without modifying page styles or historical baselines.

The final engineering run `tmp/chunk4/2026-10-17T10-01-49-788Z/manifest.json` passed all eight
conversion tests, 15 unit tests, 114 production HTTP tests and 42 browser tests. This final
review note was added after that run; subsequent documentation validation is recorded in its
`documentation-review.json`. Application and test sources were not changed after the run.
