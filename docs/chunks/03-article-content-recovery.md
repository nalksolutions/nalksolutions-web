# Chunk 3 — Article content recovery and conversion contract

Status: offline recovery implemented; engineering verification recorded under `tmp/chunk3/latest.json`.
Article rendering, visual review and Sanity publishing remain open. October 17, 2026.

## Outcome and sequencing

Recover the complete captured body of the English API article into a deterministic,
CMS-independent semantic tree. This is the next bounded content work package under
P3.1–P3.5, preparing P4.3 and the eventual Sanity conversion. It is deliberately independent
of unfinished homepage pixel matching. The user's instruction to move to the next chunk
does not accept Chunk 2: its strict screenshot comparison still fails.

At this recovery checkpoint the API route remained the labelled Chunk 1 excerpt.
[Chunk 4](04-article-rendering.md) now implements full-body rendering; its template review is separate. This chunk does not ship an
unreviewed article template, change published identities, connect Sanity, publish media,
alter SEO responses or authorize deployment. No route becomes accepted from this work.

## Source identity

| Field                   | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| Stable content identity | `wordpress-post-59034`                                    |
| Route identity          | `R-fbbead80b209e23c`                                      |
| Public path             | `/how-to-build-an-api-from-scratch-a-step-by-step-guide/` |
| Locale                  | English, assigned from verified content identity          |
| Body selector           | `[data-id="1b907200"] .entry-content`                     |
| Source baseline         | `nalk-wordpress-2026-10-15`                               |

The exact source HTML and page-record paths and SHA-256 fingerprints are recorded in
[the generated recovery artifact](../../tooling/sources/api-article.generated.json).
The archive and ZIP files remain immutable. The source title, canonical entries, metadata
and JSON-LD are preserved as evidence, separate from the existing runtime metadata mapping.
WordPress publication dates/authors in JSON-LD are retained as observed data; a full WXR
identity/taxonomy reconciliation remains necessary before a Sanity import.

## Implemented responsibilities

| File                                                                           | Responsibility                                                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [article_content.py](../../tooling/article_content.py)                         | Strict semantic conversion, URL checks, text reconstruction and node traversal                             |
| [extract-article.py](../../tooling/extract-article.py)                         | Select the source body, capture SEO provenance, reconcile text and recover media identities from ZIP bytes |
| [test_article_content.py](../../tooling/tests/test_article_content.py)         | Fidelity, unsupported-markup failures, unsafe-link rejection and source reconciliation                     |
| [api-article.generated.json](../../tooling/sources/api-article.generated.json) | Reviewable intermediate content, media hashes, source counts and ordered headings/links                    |
| [verify-engineering.mjs](../../tooling/verify-engineering.mjs)                 | Evidence checks, conversion tests and existing production regression checks with a run manifest            |

These are offline migration tools. The application does not import the artifact, parse old
HTML, read backups, or render raw archived markup. No new JavaScript dependencies are added.
Python uses the existing pinned [requirements](../../tooling/requirements.txt).

## Conversion contract

1. Select exactly one article body and one source H1; ambiguity fails extraction.
2. Preserve every text node, including whitespace, entities after HTML decoding, Arabic
   characters, nonbreaking spaces and empty paragraphs. No prose is summarized or rewritten.
3. Represent paragraphs, heading levels, inline emphasis/code, lists, links and images as
   semantic nodes. Code blocks retain exact text and an explicit source language.
4. Preserve image alt text, intrinsic dimensions, responsive variants and source sizing.
   Source classes/loading attributes are provenance, not instructions for a future renderer.
5. Preserve link paths, queries and fragments. Reject executable URL schemes, control
   characters, credentials and ambiguous protocol-relative authorities. Unknown tags,
   attributes, comments and unsupported code shapes fail rather than being dropped.
6. Compare reconstructed text with the complete selected source text before writing output.
7. Locate each referenced image variant in exactly one uploads ZIP. Read original bytes,
   compute SHA-256 and dimensions, and check HTML dimensions/width descriptors against them.
   Missing, conflicting or external media fails extraction and requires explicit recovery.
8. Serialize deterministically without timestamps; `--check` regenerates in memory and
   fails on any artifact drift. A later source update requires deliberate regeneration.

The intermediate tree is not a Sanity schema or Portable Text document. A future importer
must map it explicitly, preserving stable identities and producing its own reconciliation.
The converter supports the structures exercised here; it is not a universal HTML converter.
Other articles must fail visibly on unsupported structures until those cases are reviewed.

## Recovered coverage

The source body contains 82 paragraphs, 31 H2/H3 headings, 13 lists with 49 items,
nine code blocks, 16 inline-code nodes, four links and three diagrams. All 21 referenced
image files (originals plus responsive variants) resolve to backup members with hashes.

There are no HTML tables in this article. Table headings, captions and spans are covered
by an explicitly synthetic test, not counted as source recovery. Related posts, navigation,
comments, share controls, featured media outside the body and template styling are outside
the selected body and must be recovered before claiming a complete article page.

## Commands and verification

Run from the repository root with the existing Node 24/npm environment and Python venv:

```powershell
# Deliberate regeneration after reviewing source changes:
.venv/Scripts/python.exe tooling/extract-article.py

# Read-only consistency check and focused conversion tests:
.venv/Scripts/python.exe tooling/extract-article.py --check
.venv/Scripts/python.exe -m unittest discover -s tooling/tests -p test_article_content.py -v

# Complete engineering gate, including existing production HTTP/browser regression tests:
npm.cmd run verify:article-content
```

The full command validates frozen documentation/evidence, routing and homepage source
inputs, article artifact consistency, eight conversion tests, formatting, linting, strict
types, existing unit tests, production build/traces, HTTP and browser suites. The harness
owns a loopback test server and stops only its own process. Failures return nonzero.
No browser test in this gate claims to render the complete recovered article: the original recovery checkpoint exercised excerpt content, while subsequent Chunk 4 runs
include the full-body renderer tests.

Ignored evidence is written under `tmp/chunk3/<timestamp>/`, indexed by
`tmp/chunk3/latest.json`. The manifest records source fingerprints, dependency/build
identity and test results. The generated content artifact is the durable reconciliation
record; temporary logs are not a substitute for it.

## Handoff and remaining gates

The recovery checkpoint requires a passing source comparison, zero unsupported elements,
zero missing media, unchanged code whitespace, exact heading/link order and passing
negative conversion tests. It accepts only this offline content-recovery scope.

Next implementation work:

1. Measure the archived article shell and body at all three viewports. Recover its template
   assignment, fonts, featured image, author/date/taxonomy presentation and related posts.
2. Introduce a typed article renderer for the recovered structures, with safe React output,
   accessible code/table overflow, original image paths and full source text reconciliation.
3. Extend the repository content contract deliberately; replace the excerpt only when
   metadata and visible content resolve through the same validated article identity.
4. Verify raw HTML, structured data, keyboard behavior and screenshots before accepting
   the English article. Exercise Arabic content with a separately recovered source example.
5. Design/import Sanity data from the proven model, then test real publication and freshness.

Homepage visual acceptance, article page acceptance, full-site conversion, real Sanity,
hosting, form delivery and deployment remain open. No screenshot baseline or acceptance
threshold changes as a consequence of moving to this chunk.
