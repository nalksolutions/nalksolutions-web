# Nalk Solutions

Next.js migration of the existing WordPress site. The local routing foundation is implemented;
the English homepage, all 43 articles and 30 service/location pages use reconstructed presentation components.
Five primary company layouts, 20 Blog/category/author listings and eight secondary layouts are implemented. All 118 captured
content pages render locally. Exact visual fidelity, complete interactions, Sanity
and deployment acceptance remain pending.

The owner has accepted the current design baseline and started [Arabic delivery](docs/14-arabic-localization.md).
Forty Arabic views, including the nine core pages, are available under `/ar/`; the remaining
specialists, English article translations, utilities and final bilingual gate are still open.
Language acceptance is handled internally without public review banners or a reviewer-nomination
gate. See the [current delivery/editorial record](docs/page-reviews/arabic-foundation.md).

The approved reconstruction scope is the active visitor-facing site reached through the
header/footer and their linked pages/subpages. The [scope audit](docs/chunks/12-active-navigation-scope.md)
identifies 107 active content pages: 99 ordinary journeys and eight reached only through the
visible HTML sitemap. Eleven disconnected project/demo pages are outside further reconstruction.
The 118-page count above records historical local coverage. English routes remain unchanged;
the fourteen existing Arabic URLs now have authored 301 compatibility moves to available `/ar/`
destinations. Archive-only URLs require reviewed SEO dispositions before release changes.

First-pass layouts cover all 107 active pages. The [visual and motion runbook](docs/chunks/15-visual-motion-alignment.md)
records source-based entrances, button smoothing, typography/spacing corrections and the
321-view production audit. The latest [article follow-up](docs/chunks/20-article-fidelity-follow-up.md)
passes the complete 1,140-test engineering gate. Exact visual
acceptance remains open for the documented differences; coverage counts do not accept pages.

Use Node 24.15.0 and npm 10.8.2. From the project root:

```powershell
npm.cmd ci
node node_modules/@playwright/test/cli.js install chromium firefox webkit
npm.cmd run verify:visual-engineering
```

The evidence checks require the preserved backup/archive and Python 3. The runner uses
the existing `.venv` when available; `PYTHON` can select another interpreter. Python
homepage verification additionally uses the pinned packages in `tooling/requirements.txt`:
`.venv/Scripts/python.exe -m pip install -r tooling/requirements.txt`. The engineering command
does not accept visual fidelity; the strict comparison command is documented in Chunk 2.

For development run `npm.cmd run dev`. For a local production build run
`npm.cmd run build` (Webpack), then `npm.cmd start`. Development/start bind to `127.0.0.1:3000`.
`APP_ENV` defaults to `local`; production fixture mode refuses to start.

See the [chunk runbook](docs/chunks/01-foundation-routing.md) for architecture,
commands, fixtures, evidence, limitations and remaining gates. The [documentation
index](docs/README.md) defines the complete migration.

See [Chunk 2](docs/chunks/02-homepage-visual-slice.md) for recovered assets, local fonts,
confirmed contact corrections, homepage checks and outstanding visual comparisons.

See [Chunk 3](docs/chunks/03-article-content-recovery.md) for complete API article body
recovery and media provenance. Run `npm.cmd run verify:article-content` to verify the
offline conversion and existing application regression suite. The article rendering follow-up is tracked in [Chunk 4](docs/chunks/04-article-rendering.md).
Run `npm.cmd run verify:article-rendering` for the complete-body renderer gate; template visual
acceptance remains open.

See [Chunk 5](docs/chunks/05-article-presentation.md) for measured article presentation,
adjacent thumbnails and related-post cards. Run `npm.cmd run verify:article-presentation`
for its engineering and capture-readiness checks; strict visual comparison remains separate.

See [Chunk 6](docs/chunks/06-article-fidelity.md) for stable article captures, source typography
and footer reconciliation, and interaction checks. Run `npm.cmd run verify:article-fidelity`.

See [Chunk 7](docs/chunks/07-article-visual-reconciliation.md) for source background breakpoints,
article button states and regional rendering evidence. Run `npm.cmd run verify:article-regions`.

See [Chunk 8](docs/chunks/08-reference-integrity.md) for complete source painting and article
detail corrections. Run `npm.cmd run verify:article-reference`; it creates and validates its
own recovered reference before building and testing the application.

See [Chunk 9](docs/chunks/09-complete-local-coverage.md) for complete local page coverage,
content/media recovery, exact HTTP content/SEO checks and multi-viewport browsing. These
pages use responsive baseline styles while faithful family layouts are reconstructed.

See [Chunk 10](docs/chunks/10-article-family.md) for shared presentation across all 43 articles,
including Arabic posts, multiple categories, complete body content and locale-aware navigation.
Run `npm.cmd run verify:article-family` for the complete engineering gate; visual acceptance remains open.

See [Chunk 11](docs/chunks/11-service-family.md) for the shared service/location layout, source column/statistic recovery and English-shell/Arabic-document corrections. Run `npm.cmd run verify:service-family` for its unfiltered gate.

See [Chunk 13](docs/chunks/13-company-pages.md) for the five primary company pages, reviewed
background recovery, content preservation and shared page frame. Run `npm.cmd run verify:company-pages`
for the complete production engineering gate; exact visual acceptance remains separate.

See [Chunk 14](docs/chunks/14-listing-pages.md) for the 20 Blog/category/author layouts, source
card and pagination preservation, and server-rendered Blog query views. Run
`npm.cmd run verify:listing-pages` for its production engineering gate.

See [Chunk 15](docs/chunks/15-visual-motion-alignment.md) for the eight secondary layouts,
source motion, service tabs, site-wide comparison tooling and outstanding visual differences.
Run `npm.cmd run verify:visual-engineering` for the current complete regression gate.
Visual, CMS and release acceptance remain separate.

## Homepage load and alignment follow-up

[Chunk 16](docs/chunks/16-homepage-load-alignment.md) fixes the homepage hero hydration flash,
wide-screen alignment, service-card gradients and crossed ribbons. Its focused production
verification passes 333 tests; exact visual acceptance remains open.

[Chunk 17](docs/chunks/17-services-interactions.md) brings the Services directory onto the
same homepage button system, makes full cards actionable and corrects source layout details.
Its focused verification passes 363 tests, including unchanged content/SEO contracts;
whole-page visual acceptance remains open.

[Chunk 18](docs/chunks/18-about-alignment.md) aligns About typography, backgrounds and
responsive details with the source, reuses homepage buttons and repairs its Services action.
Its runbook records production checks and the remaining exact visual acceptance gate.

[Chunk 19](docs/chunks/19-remaining-pages-alignment.md) extends shared action behavior across
the remaining active page templates and corrects Contact, listing, profile and sitemap
details, plus article image/table/quotation spacing. The complete engineering gate passes
1,110 tests; 321 production source/current capture pairs cover all 107 active routes.
Strict visual differences remain recorded and acceptance stays open. The chunk runbook links
the final build manifest, per-route results and native viewport review.

[Chunk 20](docs/chunks/20-article-fidelity-follow-up.md) follows the remaining article
differences through source typography, inline image flow, FAQ grouping and category wrapping.
It also corrects featured-image cropping, table diagnostics and floating menu alignment.
Related-post actions inherit homepage feedback; content, SEO and route identities are preserved.
The full 1,140-test gate passes. All 129 fresh article viewport pairs have matching document
heights and featured-image rectangles; strict pixel/state acceptance remains open.
