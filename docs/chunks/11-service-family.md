# Chunk 11 — Service and location layouts

## Scope

Extend source-derived presentation to the 25 English service/location pages and five Arabic service pages that share the same captured layout. The survey confirms all 30 begin with source sections `3784a1d3` (full-height hero) and `710b7eea` (statistics). Preserve complete content, identities, links/media, headings and metadata. Six distinct corporate designs and the Arabic company page remain a subsequent family pass; archives/detail pages also remain open.

This is a broad layout rollout, not whole-page visual acceptance. Existing Sanity, integration, map, form and deployment gates stay open. No dependency changes or deployment are planned.

## Design and implementation

- `tooling/service_content.py` maps reviewed source structure to a finite vocabulary of semantic service roles. Column widths, hero/statistics identity, centered headings and source CSS hashes are checked offline. No WordPress classes, CSS interpreter, scripts or source data settings enter the runtime. Existing safe fragment IDs remain preserved.
- `tooling/prepare-site.py` emits the same complete semantic documents with those roles and an explicit service-layout identity. Source text/order remains unchanged; counters retain recorded final values while CSS places labels/values correctly.
- A shared service page composes the floating header, responsive sections, statistics, source column layouts, body content, native FAQ disclosures and footer. Missing decorative/background behavior remains explicit rather than being guessed from content.
- Floating header/footer styles move to their own stylesheet shared with articles. English shell copy has explicit English/LTR attributes even when the document is Arabic/RTL. Arabic fallback typography is calibrated against the selected archived system-font behavior; correct server HTML attributes remain intact.
- Source tabs remain fully readable content in this pass; their interactive tab state and exact visual comparison stay open. Forms/embedded integrations are not introduced.

## Commands and verification

```powershell
.venv/Scripts/python.exe tooling/prepare-site.py
.venv/Scripts/python.exe tooling/prepare-site.py --check
npm run verify:service-family
npm run start
```

The unfiltered gate runs frozen evidence/docs, all source regeneration and Python contracts, routing consistency, formatting/lint/types, unit contracts, a production build/private-file trace check and complete production HTTP/browser tests. The isolated harness owns loopback port 3100, refuses occupied ports and stops only its own server. Mutable publication/failure data stays in a temporary copy. Source/build/dependency fingerprints and reports live under ignored `tmp/chunk11/<timestamp>/`.

Mandatory checks preserve all 118 retained routes and 67 configured rules. Added checks account for all 30 service documents and roles, exact body text/metadata, responsive hero/statistic/column behavior, keyboard FAQ use, navigation/history and correct Arabic document versus English-shell attributes. Existing API article geometry/font/capture and navigation regressions remain mandatory. Every retained page still runs at archived Chromium dimensions; representatives additionally run at 320px and in Firefox/WebKit.

## Completion and open work

The layout rollout is engineering-verified by the unfiltered gate below. No route is marked accepted from this gate. Corporate/archive/detail-family layouts, tab interactions, strict historical screenshot comparisons, source decorative effects, real Sanity and operational release remain open.

## Results and handoff

The unfiltered `npm run verify:service-family` gate passed on October 17, 2026, from 18:05:15 to 18:21:42 UTC. All 15 mandatory commands passed. The [manifest](../../tmp/chunk11/2026-10-17T18-05-15-425Z/manifest.json) records every input/dependency fingerprint and check log. Build: `7UdzQv7LySvpGaX3ZmPcy`; source digest: `cadcad6b4378f252355d7ce339e9ea5a99a7bf5ffd54cfa167798f930da9004d`. Node remains `v24.15.0`, npm `10.8.2`; no dependencies changed.

| Mandatory suite                            | Passed |
| ------------------------------------------ | -----: |
| Python source/conversion/capture contracts |     40 |
| Vitest routing/content contracts           |     20 |
| Production HTTP                            |    226 |
| Browser cases                              |    486 |
| Total                                      |    772 |

HTTP/browser reports contain zero unexpected failures, skipped tests or flaky cases. Browser files used two workers; mutable HTTP tests remained serial. The build guard confirms all 116 documents and the published index are available without private evidence in the build trace.

- [HTTP results](../../tmp/chunk11/2026-10-17T18-05-15-425Z/http/results.json) preserve every retained page's body text/metadata, all legacy first responses, asset bytes/HEAD semantics and publication/error behavior. Service-role enrichment is independently reconciled against the preceding semantic conversion before generated data is written.
- [Browser results](../../tmp/chunk11/2026-10-17T18-05-15-425Z/browser/results.json) retain the whole-site sweep and API article regressions. Added cases exercise three service representatives across six profiles, including source counter order, h5 typography, native FAQ keyboard interaction, navigation/history and document/shell locale separation. Chromium records actual Arabic heading fonts and asserts the measured Times New Roman fallback on Windows; other operating systems require their own calibration.
- [Runtime ownership](../../tmp/chunk11/2026-10-17T18-05-15-425Z/runtime.json) records cleanup of the owned port-3100 server. Handoff checks found the earlier port-3000 preview unavailable; a new hidden loopback development preview was started separately. Its process/logs and verified page responses are recorded in [post-gate checks](../../tmp/chunk11/2026-10-17T18-05-15-425Z/post-gate-checks.json).
- [Diagnostic visual review](../../tmp/chunk11/2026-10-17T18-05-15-425Z/visual-review.json) compares selected English/Arabic service and article captures. The selected English consultation button's vertical pixels match the archived interval, 628–666 at desktop width. Source physical column/counter order is retained while Arabic content columns remain RTL. The selected Arabic article title again wraps to the archived two-line form, with the English shell preserved LTR.
- [Final documentation review](../../tmp/chunk11/2026-10-17T18-05-15-425Z/documentation-review.json) records documentation-only reconciliation and unchanged application/test/tooling inputs after the gate.

These diagnostics do not establish whole-page equality. Remaining visual work includes exact body spacing, text alignment/colors, button font metrics, pasted inline typography, decorative icon-font recovery and all historical full-page comparisons. Service body links keep readable light underlined styling; that difference from low-contrast source links remains explicit in visual review. Source tabs still show all captured content rather than claiming completed tab interaction parity.

Two earlier runs remain failed/superseded evidence: [layout-review stop](../../tmp/chunk11/2026-10-17T17-49-59-129Z/review-stop.json) and [heading-audit/runner stop](../../tmp/chunk11/2026-10-17T18-04-02-932Z/review-stop.json). Review corrected counter suffix spacing, source h4/h5 scales and RTL-induced physical column reversal. The final run above began after those corrections and ran without source changes; no interrupted run is represented as passing.

Starting the restored preview generated the framework-owned root [AGENTS.md](../../AGENTS.md). It points future changes to the installed Next.js documentation. This development guidance is recorded separately from the production gate inputs; application/test/tooling sources remain unchanged after verification.

All 118 retained pages have local content. The homepage, 43 articles and 30 service/location pages now use reconstructed presentation, for 74 pages with a layout first pass. The remaining 44 use baseline styling: seven corporate/company pages, 24 archive/taxonomy pages and 13 profile/project detail pages. Next reconstruct the seven corporate/company pages, then archive and detail families. Final visual/state acceptance, real Sanity, integrations and deployment remain separate gates.
