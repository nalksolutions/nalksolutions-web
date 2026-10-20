# Unified header and mobile menu

Decision: D-21, approved October 20, 2026. Implemented and engineering verified; owner visual review remains pending.

## Design and boundaries

Every page uses one enclosed, rounded dark glass header: logo left, centered navigation/search,
enquiry action right. Opaque dark fallback retains contrast without backdrop-filter support.
The existing page gutters, top-of-page absolute positioning and non-sticky behavior remain.
The five navigation destinations, Arabic link, search and Discuss Your Project action are unchanged.
No page copy, SEO data, public route, legacy rule, footer composition or translation is changed.

Desktop navigation is shown above 1180px. At 768-1180px the logo, enquiry action and menu
trigger remain; below 768px the logo and menu trigger remain, with the enquiry action in the menu.
One icon and CTA treatment replace both previous variants. Home now supplies its current identity
to the mobile menu through the shared component default, matching its desktop current-page state.

## Ownership and behavior

- `src/components/site/site-header.tsx` remains a Server Component. Its obsolete variant prop
  and generated alternate menu-icon dependency are removed from all consumers.
- `src/styles/header.css` owns shared header geometry, responsive controls and menu layout.
  Obsolete header rules are removed from the marketing, floating-shell and interaction styles;
  floating-shell footer rules remain intact.
- `src/components/site/use-menu-dialog.ts` owns the focused mobile modal lifecycle. Search
  retains its existing lifecycle and results behavior; no new dependency or generic modal system is added.

The native dialog remains modal during its 200ms opacity/8px movement dismissal. The backdrop
fades over the same interval. Escape and the close control request dismissal; repeated dismissal
requests are harmless. Links close immediately and proceed without an animation delay. Reduced
motion skips both animations, including when that preference changes while the dialog is open.
Switching to desktop closes the menu and releases document scrolling. Unmount cancels active
animation and removes media-query listeners.

The dialog header remains outside the independently scrolling content area. Dynamic viewport
height, safe-area insets and overscroll containment keep all links, contacts, socials and the
CTA reachable on short screens. The native modal makes background content inert; the existing
body overflow lock remains. Explicit Tab/Shift+Tab wrapping keeps keyboard focus in the menu,
and dismissal restores focus to the visible menu trigger without scrolling the page.

## Verification and review

Run focused production browser checks after `npm run build`:

```powershell
$env:CHUNK_RUN_DIR='tmp/unified-header/targeted'
$env:BROWSER_TEST_WORKERS='4'
node tooling/run-browser-tests.mjs browser '--grep=unified header:'
```

Run the complete gate with `npm run verify:visual-engineering`. Its isolated server binds to
loopback, refuses occupied test ports, and stops only its owned process. Existing development
servers are not reused or terminated. Reports and diagnostic previews remain under ignored `tmp/`.

The focused suite covers nine page families, including Arabic, across all six browser profiles;
all three browser engines also exercise 1181/1180 boundaries, tablet/mobile controls, short
portrait/landscape scrolling, focus wrapping/restoration, native modality through closing,
rapid interaction, reduced motion, navigation/history and 200% equivalent reflow.
Screenshots cover Home, About, an offer, an article, Arabic and the short-screen menu.

The complete gate retains source/documentation checks, strict quality checks, unit contracts,
production HTTP/SEO/status tests and all browser suites. The article header breakpoint assertion
is deliberately updated from the retired 1024px variant to the agreed shared 1180px boundary.

Initial focused verification exposed native Tab traversal leaving the document at its final
control. Explicit boundary wrapping was added rather than weakening the keyboard assertion.
The failed report is retained in `tmp/unified-header/targeted-1/`. A later harness check
incorrectly expected English `lang="en"`; it was corrected to the existing `en-US` contract.
An early shell-encoded Arabic route literal was corrected, and explicit 200/document-language
assertions now prevent an accidental Home request from counting as Arabic coverage.

The final focused production run passes all 36 cases across Chromium, Firefox and WebKit,
including the actual Arabic route, with no failures, skipped cases or retries. Reports and
screenshots: `tmp/unified-header/rotation-regression/`. Earlier runs remain available for diagnosis.
The complete engineering result is recorded below.

Owner visual review remains pending. This change establishes no whole-page design lock,
Arabic translation acceptance, form delivery, Sanity integration or deployment readiness.

## Complete-run diagnostic reconciliation

The first complete run (`tmp/chunk15/2026-10-20T10-06-25-493Z/`) passed 233 HTTP
and 938 browser cases before Firefox reported three aborted lazy brand-logo requests.
The trace shows the short-screen test resized the first document and immediately reloaded
Home, cancelling image requests initiated by that resize; the replacement requests returned
200. All menu behavior assertions had passed. The test now rotates the same document between
portrait and landscape rather than performing an unnecessary reload. Resource diagnostics
remain strict: no image-error allowance, retry or failure suppression is added. The failed
report remains available, and focused/full verification was repeated after this test correction.

After the rotation-test correction, all 36 focused cases pass again across all three engines
(`tmp/unified-header/rotation-regression/`). The passing complete gate below uses this corrected test.

## Complete engineering result

The complete `npm run verify:visual-engineering` gate passes 1,386 tests: 75 tooling, 37 unit, 233 production HTTP and 1,041 browser cases. No failures, skipped cases or retries. Source identity was rechecked after the run.

- Manifest: `tmp/chunk15/2026-10-20T10-38-18-095Z/manifest.json`.
- Build ID: `5HOlOe_FPbbZXKAPagJ5w`.
- Production previews: `tmp/unified-header/review/index.html` (42 screenshots from the complete gate).
- Handoff: `tmp/unified-header/handoff.json`; protected-content and post-verification checks are adjacent.

The failed and intermediate focused reports remain available. Only result documentation is updated after the gate; the post-verification record checks that application, asset, test and tooling inputs still match the passing run. Development remains available at loopback port 3000. Owner visual approval and all previously excluded release work remain open.
