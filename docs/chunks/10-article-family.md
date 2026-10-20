# Chunk 10 — Shared article reconstruction

## Scope and contract

All 118 retained pages already have local content under [Chunk 9](09-complete-local-coverage.md). This chunk extends the reconstructed API article presentation to the other 42 captured articles (34 English and eight Arabic). It preserves their published identities, source metadata, complete body text, headings, links, images and responsive candidates. It does not mark pages visually accepted, connect Sanity or deliver forms.

The source survey confirms the same singular template 107 across all 43 articles: title, one or two categories, excerpt, date, featured image, complete body, two adjacent articles and three related posts. Extraction must fail on missing or ambiguous required selectors. Source duplicate body h1s remain documented source defects.

## Implementation boundaries

- `tooling/article_presentation.py` extracts source presentation using the captured widget identities; it performs no network requests.
- `tooling/prepare-site.py` retains the complete-main recovery inventory, but article documents now contain their complete body nodes plus typed presentation. The recovery report identifies the body-only HTTP text comparison scope explicitly. Original source hashes remain unchanged.
- The existing validated semantic document nodes handle body variations, including tables, pasted spans, explicit text direction and source link attributes. Captured HTML, scripts, inline styles and WordPress settings never execute.
- A single article layout serves the original API article and recovered article documents. The existing API body schema/provenance stays intact. Shared presentation components own headings, media, adjacent cards, related cards, sharing and footer composition.
- Links choose Next.js navigation within a language and full document navigation across languages, using all published identities, including noindex pages. Language is independent of slug characters.

D-14's owner-approved current-article sharing behavior and D-15's readable underlined body links extend consistently across this shared article family. Share tests inspect URLs without contacting social networks or sending email. Metadata is preserved independently of these interface corrections.

Six noindex articles have no recorded canonical. Their canonical metadata stays absent; share controls use the known public origin and published path. The other 37 articles use their recorded canonical. Incoming Host headers never determine a share URL.

## Verification and commands

Use the existing Node 24/npm 10 lockfile; no dependency additions are planned.

```powershell
.venv/Scripts/python.exe tooling/prepare-site.py
.venv/Scripts/python.exe tooling/prepare-site.py --check
npm run verify:article-family
npm run start
```

The article-family gate includes frozen evidence/docs, deterministic source regeneration, Python conversion tests, routing consistency, formatting, lint, strict types, unit contracts, a production build/private-file trace check and the complete HTTP/browser suite. The loopback harness owns port 3100, isolates mutable content and refuses unrelated servers. Evidence, source/dependency/build fingerprints and screenshots remain under ignored `tmp/chunk10/<timestamp>/`.

Mandatory checks cover all retained routes and legacy statuses; exact article body text and source-derived presentation; metadata and canonical absence; image allowlisting; the API article regression suite; cross-language category navigation and history; sharing, adjacent/related navigation; horizontal overflow at archived sizes and 320px; browser/resource errors. Browser diagnostic captures do not establish visual parity with historical screenshots.

## Open gates and handoff

Exact visual review remains open, including Arabic font calibration, source pasted inline typography, existing API regional differences, and every page's historical screenshot comparison. Non-article families still use their semantic baseline pending reconstruction. Sanity, real publishing, forms, map embedding, staging and deployment remain separate gates. No delivery date or page acceptance is implied.

## Results and evidence

The unfiltered `npm run verify:article-family` gate passed on October 17, 2026, from 16:49:14 to 17:05:13 UTC. All 15 mandatory commands passed. The [manifest](../../tmp/chunk10/2026-10-17T16-49-14-898Z/manifest.json) records the source baseline, every input hash, exact dependency versions and logs. Build: `EiVk_-LxglHz4koS6yFGk`; source digest: `6e1a7f923e69905af138d657817e51f474dd79f0e8fa4b3dc42220d84843e351`. Node remains `v24.15.0`, npm `10.8.2`; no dependencies changed.

| Mandatory suite                     | Passed |
| ----------------------------------- | -----: |
| Python conversion/capture contracts |     35 |
| Vitest routing/content contracts    |     19 |
| Production HTTP                     |    226 |
| Browser cases                       |    468 |
| Total                               |    748 |

HTTP/browser reports contain zero unexpected failures, skips or flaky cases. Browser files used two workers; mutable HTTP publication tests remained serial. The production build includes all 116 recovered documents and the public index, with no private evidence traced into output. The [owned server record](../../tmp/chunk10/2026-10-17T16-49-14-898Z/runtime.json) confirms the harness stopped its own port-3100 server. The existing user preview was not stopped.

- [HTTP results](../../tmp/chunk10/2026-10-17T16-49-14-898Z/http/results.json): all 118 retained pages, all 67 configured rules, captured non-200 dispositions, assets, publication and failure recovery. Every recovered article has exact source-derived body text, heading identity, excerpt/date/categories, featured image, adjacent/related titles, share URLs and unchanged SEO checks.
- [Browser results](../../tmp/chunk10/2026-10-17T16-49-14-898Z/browser/results.json): complete coverage at archived Chromium dimensions, with family representatives at 320px, Firefox and WebKit. Added article flows cover a table-heavy multi-category post, a Latin-slug Arabic post and a noindex post with absent canonical across all six profiles.
- [Manual capture readiness record](../../tmp/chunk10/2026-10-17T16-49-14-898Z/visual-review/review.json): selected English/Arabic desktop captures explicitly wait for fonts, visible images to decode and two animation frames. One earlier cold diagnostic screenshot preceded logo painting; the explicit-readiness capture confirms the logo renders. Ordinary coverage screenshots remain diagnostics, not prepared visual-acceptance references.

Screenshot inspection compared selected English/Arabic article headings with unchanged historical captures and inspected related cards at mobile/tablet widths. Concrete open differences include the multi-category badge being split into separate pills, Arabic heading fallback/wrapping (three lines versus two in the selected archived desktop example), and English header/footer direction under the corrected Arabic root. Reconcile font metrics and English shell direction while retaining correct server HTML language/direction. Pasted source inline typography, existing API regional details and full-page visual comparisons also remain open. These are defects/backlog, not accepted exceptions or new screenshot tolerances.

An earlier [stopped run](../../tmp/chunk10/2026-10-17T16-45-38-810Z/review-stop.json) is retained as failed evidence. Review found the six absent-canonical posts would lose share controls; the final implementation derives their sharing URL from published identity without adding canonical metadata. The complete gate above ran after that correction.

The [documentation reconciliation](../../tmp/chunk10/2026-10-17T16-49-14-898Z/documentation-review.json) records final documentation-only changes and unchanged application/test/tooling inputs. No route is accepted by this chunk. All 43 articles now use the shared reconstructed layout; the remaining 74 retained non-home/non-article pages keep complete content with baseline styling. Next work broadens corporate, service/location and archive layouts, with shared Arabic shell/font corrections, before detail-family refinement and the separate Sanity/integration/release gates.
