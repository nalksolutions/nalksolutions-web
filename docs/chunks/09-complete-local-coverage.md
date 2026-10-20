# Chunk 9 — Complete local content coverage

## Delivery order

The owner requested complete local site coverage before further page-by-page polish on October 17, 2026. This changes sequencing, not preservation or release standards. The existing homepage/API article pixel differences remain open. Sanity, external integrations, full visual reconstruction and deployment still require their own evidence.

No delivery date has been agreed. This chunk establishes the remaining page inventory and a runnable content baseline; it does not turn a route count into a release estimate.

## Scope and implementation

The frozen register contains 118 retained HTTP 200 routes. Two already use reconstructed presentation components: the English homepage and API article. This chunk recovers the other 116 captured main documents and replaces the five remaining excerpt proofs. There are no new manually copied page components.

| Recovered family              | Documents |
| ----------------------------- | --------: |
| Articles                      |        42 |
| Arabic marketing              |         6 |
| Service/location              |        25 |
| Corporate/special             |         6 |
| Blog/category/author listings |        20 |
| Profile details/taxonomies    |         6 |
| Project details/taxonomies    |        11 |
| Total                         |       116 |

`tooling/survey-pages.py` records the actual source widget/tag inventory under the ignored `tmp/chunk9` directory. `tooling/prepare-site.py` converts each source main into a validated, CMS-independent semantic tree using `tooling/site_content.py`. Unknown elements, unsafe URLs, missing media and unsupported controls fail recovery. The source backups and captures are not edited.

Runtime boundaries:

- `src/content/site/pages.generated.json`: published identities and source SEO, used by the existing routing/repository contracts.
- `src/content/site/documents/`: content data keyed by stable route ID. These are data documents, not independent page implementations.
- `src/content/site/schema.ts`: allowed nodes, attributes, links, local images and form-field contracts.
- `src/content/repository.ts`: reads current published identities without a cross-request cache; loads and validates only the requested body. Proxy checks the requested document before forwarding.
- `src/components/content/`: shared document renderer, page composition, searchable content and enquiry-field UI. Source HTML is never injected. Source scripts, event handlers, inline styles, theme classes/settings and WordPress transport credentials do not reach the runtime.
- `src/components/site/locale-link.tsx`: same-language Next.js links and full document requests across languages. Shared header/footer/search use the request's content locale, including Arabic articles with Latin slugs.
- `src/styles/content.css`: readable responsive baseline styling, scoped to the new content template. It does not claim to reproduce every source layout. Existing home/article styles remain separate.

Destination-language lookup uses all published identities, including `noindex` pages. Search filtering is separate. An actual Arabic article → English noindex taxonomy → back flow verifies that indexing policy cannot cause stale root language/direction.

The inline search input stays disabled until React has attached its handler. A delayed-script browser test verifies the transition and retained typed query. This follows [Playwright's hydration guidance](https://playwright.dev/docs/navigations#hydration); React's [server snapshot contract](https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering) keeps initial server/client markup consistent. No test-only sleep or retry hides lost input.

The production build includes the generated public content files. It must not trace source captures, SQL, ZIPs, private recovery data or test reports. No WordPress or plugin JavaScript is loaded.

## Content, media and SEO

The recovery report is `tooling/sources/site-recovery.generated.json`. It records source hashes, source/body text fingerprints, heading inventories, referenced image paths, known non-content omissions and explicit transformations for every document. The generated index retains titles, descriptions, canonical absence, robots/googlebot directives, social metadata and captured JSON-LD. Existing source duplicate/missing h1s are retained for later editorial review, rather than silently rewritten.

944 distinct images/image variants (about 379 MB) are allowlisted for these bodies, with bytes/hashes and backup member provenance in `src/content/site/assets.generated.json`. Images are published at their existing public paths. Eleven image paths need URL encoding. Existing homepage/API assets remain allowlisted too.

The one external Gravatar image used by five author pages was recovered separately and stored locally. Its retrieval timestamp, original public URL, dimensions and hash are in `tooling/sources/site-external-media.json`. It is a newly retrieved external reference, not falsely attributed to the frozen WordPress backup. Routine checks are offline and do not fetch it again.

This baseline preserves captured content order, text/code whitespace, tables, links, image alternatives and responsive candidates. Source counters resolve to their recorded final values. Native source accordions become disclosures. All source tab panels/carousel items remain visible; source animation and slider behavior are not replayed.

Source text uses browser HTML-tokenizer line-ending normalization (CRLF/CR to LF), preserving tabs and code indentation. Malformed source `<br>…</br>` pairs are normalized to a void break followed by sibling content so opening hours cannot disappear. These transformations have regression tests and are recorded in the recovery report.

Explicit remaining differences:

- Source backgrounds, decorative icon-font glyphs, exact layout, typography, tabs/carousel behavior and animation need family-specific reconstruction and three-viewport visual review.
- Source forms retain their visible fields but have no delivery transport. Submission is disabled and a real email link is available. There is no false success state and no WordPress nonce/action copied into the application.
- The contact map is an explicit Google Maps link; embedded-map parity remains open.
- Search covers published, indexable local titles. Full search ranking/content matching and integrations remain separate work.
- Other articles initially inherited the captured template's incorrect share destinations. [Chunk 10](10-article-family.md) extends the approved current-article behavior across the shared article layout and verifies those targets explicitly.
- The captured blog listing may be a subset of all articles. Preserve that captured listing rather than inventing source pagination or silently adding cards.

These differences are implementation backlog, not approved permanent design changes. This chunk establishes browsable content coverage, not a completed 1:1 site.

## Commands and verification

Use Node 24/npm 10 and the root lockfile. No new JavaScript dependencies are introduced.

```powershell
npm ci
.venv/Scripts/python.exe tooling/prepare-site.py --check
npm run verify:site-coverage
npm run start
```

The production server binds to loopback. The verification harness uses its own isolated fixture copy on port 3100, refuses occupied ports and stops only its own process. Source data is never edited by publication tests. Existing `APP_ENV`/fixture-mode production refusal and local noindex/robots controls remain active.

`FIXTURE_CONTENT_PATH` and `FIXTURE_DOCUMENTS_PATH` select the harness-owned temporary identity file/body directory. Normal local runs omit both. Publication and failed-body tests change only these copies. A requested body failure returns 503 before streaming; unrelated valid pages and legacy statuses remain available.

For focused diagnostics, the harness accepts `node tooling/run-browser-tests.mjs browser --project=chromium-desktop --grep=complete.captured`. Focused results are not a substitute for the unfiltered gate; `all` rejects filters.

The coverage gate runs documentation/frozen evidence validation, source regeneration checks, conversion tests, routing-data consistency, formatting, lint, strict types, unit contracts, production build/private trace checks, production HTTP and browser tests. Reports and source/build/dependency fingerprints go under ignored `tmp/chunk9/<timestamp>/`; any mandatory failure makes the command fail.

Browser/HTTP runs stop on the first failed test, keep its diagnostics, and clean up the owned server. A stopped/failed run is never reported as complete coverage. This avoids spending a whole-site sweep on an already failed build.

The site coverage gate uses two workers for independent browser files/profiles, with isolated browser contexts and distinct artifact paths. HTTP publication/failure tests remain serial because they deliberately modify the temporary repository. `BROWSER_TEST_WORKERS` accepts 1 or 2 for focused runs; other engineering scopes retain one worker. The worker count is recorded in the gate and runtime manifests.

HTTP checks cover every retained route's GET/HEAD, slash policy, locale, metadata and exact normalized body text. All legacy first responses remain independently tested. The image check validates every allowlisted image's bytes and GET/HEAD behavior. Browser coverage exercises every new document at 1440×1000, 768×1024 and 390×844; family/language representatives additionally run at 320px and in Firefox/WebKit. It records top-viewport diagnostic screenshots, traces, console/resource errors and horizontal overflow. These screenshots are not full-page visual comparisons or acceptance evidence.

## Results and handoff

The unfiltered `npm run verify:site-coverage` gate passed on October 17, 2026. Its [manifest](../../tmp/chunk9/2026-10-17T15-28-27-342Z/manifest.json) identifies every source file, dependency, check log and the built application. The run started at 15:28:27 UTC and finished at 15:45:56 UTC. Build ID: `OotX_4FqEOSQ0kFl_iPN2`; Node: `v24.15.0`; npm: `10.8.2`. No JavaScript dependencies changed.

| Mandatory suite                     | Passed |
| ----------------------------------- | -----: |
| Python conversion/capture contracts |     31 |
| Vitest routing/content contracts    |     18 |
| Production HTTP                     |    226 |
| Browser cases                       |    450 |
| Total                               |    725 |

HTTP/browser results contain zero unexpected failures, skipped tests or flaky cases. All 15 gate commands passed, including frozen-source validation, regeneration checks, formatting, lint, strict types, build and private-file trace checks. The build contains the 116 documents and public index, with no private reference files traced. Publication, update, draft/unpublish, collision and failed-body recovery use the same built server without rebuilding.

Evidence:

- [HTTP report](../../tmp/chunk9/2026-10-17T15-28-27-342Z/http/results.json).
- [Browser report](../../tmp/chunk9/2026-10-17T15-28-27-342Z/browser/results.json), with per-test screenshots and traces in the adjacent test-results directory.
- [Runtime ownership/cleanup record](../../tmp/chunk9/2026-10-17T15-28-27-342Z/runtime.json). The owned loopback test server stopped; the existing preview server was not stopped.
- [Post-gate documentation review](../../tmp/chunk9/2026-10-17T15-28-27-342Z/documentation-review.json) records the documentation-only reconciliation, unchanged application inputs and repeated documentation/format/runtime checks.
- [Published identity revision](../../src/content/site/pages.generated.json), SHA-256 `7cd8249a8f5b73200fb4c39193dc5469fa0cc595cc493904a611272606512429`. All document/media fingerprints are in the manifest.

The gate caught and resolved malformed break/line-ending conversion, equivalent encoded asset filenames, an outdated proof-heading expectation, noindex destination-language lookup and early typing before search hydration. The search regression deliberately blocks JavaScript before checking disabled → enabled input and retained results. Earlier failed/interrupted diagnostics remain under the ignored run directories and are not represented as passing evidence. Routing screenshots now use ordinary viewports; dedicated home/article suites retain their full-page capture checks.

Manual screenshot inspection covered Arabic marketing and Contacts on desktop, an English service page, About Us on tablet and Arabic marketing on mobile. Content is readable in these samples. Source backgrounds, exact typography/alignment and statistics label/value grouping still need reconstruction. This inspection does not accept a whole page or compare all 447 historical captures.

The local content coverage milestone is complete: all 118 retained pages are available, including complete main documents for the other 116 routes. No route is marked accepted by this chunk. Next work is to replace baseline presentation with faithful shared family templates across the site, then complete real Sanity, integrations and release gates. Do not resume isolated article pixel polishing as a prerequisite for other families' reconstruction.
