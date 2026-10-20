# Remaining active pages: light tidy pass

Later shared-shell change: D-21 replaces both historical header variants with the
[unified header and mobile menu](unified-header.md).

Owner direction, October 20, 2026: tidy the remaining public pages before a deeper design
pass. Keep content and overall designs. This follows the homepage, service detail, About
and Services overview work; it does not lock designs or start expanded Arabic delivery.

## Scope

The [active navigation register](../registers/navigation-scope.md) remains authoritative:
107 active pages, including the eight visible-sitemap journeys. The remaining 74 pages are:

| Page family                          | Pages | Light-pass work                                                                                                                               |
| ------------------------------------ | ----: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Articles                             |    43 | Balance featured/body, adjacent-navigation and related/footer spacing; preserve body typography, code, tables, media, sharing and source copy |
| Blog, categories and author listings |    20 | Align Blog image ratios, card heights and actions; use two tablet columns; improve pagination contrast and target sizes; tidy hero spacing    |
| Contact                              |     1 | Reduce excessive gaps, balance enquiry image/copy, make the existing map-link fallback more deliberate and keep mobile fields readable        |
| Existing Arabic company page         |     1 | Align existing card headings, descriptions and actions; retain Arabic copy, current font and locale handling                                  |
| Team, profiles and profile archives  |     7 | Balance hero/body spacing and portrait sizes, reduce cramped appointment-card padding and tidy enquiry/adjacent sections                      |
| Image credits                        |     1 | Improve long-URL wrapping, column spacing and reading rhythm                                                                                  |
| Visible HTML sitemap                 |     1 | Improve desktop list scanning and spacing, retaining all lists, nesting and destinations                                                      |

Shared footer branding is bounded once in `floating-shell.css`, replacing the earlier
About/Services page-specific patches. Tablet logos no longer stretch across the viewport,
and negative logo offsets are removed. The homepage keeps its own existing footer rules.
The previous 33 reviewed pages receive shared-shell regression checks; they are not redesigned.
The eleven disconnected project/demo pages remain outside further visual reconstruction.
Their existing responses and the six gone team destinations remain unchanged.

## Implementation boundaries

Changes stay in the existing five stylesheets: `article.css`, `company.css`, `listings.css`,
`secondary.css` and `floating-shell.css`. No new application component, client dependency or
button type is introduced. Shared homepage button appearance, focus, hover and reduced-motion
behavior remain protected. Smaller-screen form and search fields use readable 16px text.

Source documents, public paths, SEO metadata, public assets and frozen presentation evidence
remain unchanged. Blog thumbnails use a consistent 3:2 crop of the original images; full
article images retain their existing aspect-derived geometry. Profile hero portraits use
600/480/400px at desktop/tablet/mobile; enquiry portraits use 560/480/400px. These are intentional presentation changes, recorded
in the browser expectations without rewriting historical WordPress evidence.

Contact and team enquiry delivery, profile appointment transport and the embedded map remain
open integration work. Existing disabled submit states and explanatory contact links remain
honest. This pass does not rewrite source placeholder copy, invent contact details or resurrect
gone profile links. Content/business decisions belong in the later directed pass.

## Verification and review

The existing coverage suite adds active-page footer bounds, equal Blog row/action alignment,
thumbnail geometry and accessible pagination target checks. Listing, company and secondary
tests retain source identities, order, counts, destinations and controls. Updated expectations
describe only the approved tablet Blog layout and portrait sizing.

Development checks caught an accidental Arabic button-padding override; spacing now belongs
to its surrounding description, leaving the shared button contract intact. They also exposed
a screenshot-helper race: changing lazy image attributes before hydration can create a test
hydration mismatch. The listing/company/secondary suites now load images through normal
scrolling and decoding, then restore scroll positions, without changing React-owned markup.
Unexpected console/resource errors remain failures.

The first complete regression run also found an older menu-alignment test that assumed
service details still used the floating header. D-19 intentionally switched them to the
homepage header. The check now measures the menu glyph in both existing header variants;
its centering and focus requirements remain unchanged. The interrupted run remains separate
from final passing evidence.

The additional 320px audit caught a long author-email heading expanding the mobile viewport.
Listing titles now fit their container and can wrap within a long word. The listing journey
checks compare document width with the configured viewport, rather than an already-expanded
`innerWidth`. Verification was restarted after this correction; preliminary runs are retained.
The listing shell also fills the viewport on the source's empty Blog query page, keeping the
dark page background continuous below its short content without inventing posts or an empty state.

Use `npm.cmd run verify:visual-engineering` for the complete engineering gate: source/evidence
checks, Python tests, formatting, lint, strict types, unit tests, production build/bundle guard,
HTTP checks and the complete browser suite. Keep inputs frozen during this gate. Then audit
all 107 active pages at desktop/tablet/mobile and 320px against the same production build,
with route-level captures and native representative section review. Reports record actual
counts, errors, build/dependency identity, source checksums and termination of owned servers.

## Completed light-pass review

Completed October 20, 2026 (Asia/Karachi), against production build
`4ijun8UcxG2y8HcwzVAtX`. All 74 remaining active pages received the family changes above.
The other 33 active pages received regression coverage for the shared shell.

| Review                    | Result                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source and documentation  | 49 documents, 149 frozen routes and 67 legacy rules validated; zero replacement routes marked accepted                                              |
| Content and public assets | 1,169 protected content, asset and source-recovery files match the earlier article-fidelity baseline                                                |
| Quality and build         | Formatting, lint, strict types, 75 Python tests, 30 unit tests, production build and private-file bundle guard pass                                 |
| HTTP                      | All 232 production HTTP cases pass, including raw content/SEO and legacy responses                                                                  |
| Browser coverage          | All 963 unique cases have final passing evidence across six browser/viewport projects, reconciled by file, project and test title                   |
| Additional layout audit   | 448 views pass: 107 active routes plus five Blog query views at 1440, 768, 390 and 320px; no unexpected console or resource errors                  |
| Screenshots               | 474 captures with verified checksums; all 18 page-overview sheets reviewed, with nine native full-page/section samples                              |
| Family review             | Blog rows/actions, Contact spacing/forms, existing Arabic cards, profile portraits/appointments, article end sections, credits and sitemap reviewed |

The full command stopped on the Firefox lazy-image helper race described above. The helper
now waits for an actual image load before decoding, with explicit error and timeout failures.
All 156 caller tests pass after that correction. A subsequent WebKit run exposed an existing
FAQ test polling a short-lived animation after it had finished. That test now records animation
starts without altering playback and still checks completion, interruption, keyboard and reduced
motion. Its six project cases and the complete 86-case WebKit project pass.

The full command was **not rerun from the beginning after these test-only corrections**.
Instead, the original production HTTP/build evidence and completed Chromium cases were combined
with the corrected caller, Firefox and WebKit results. Every one of the original 963 browser
cases has passing final evidence; no skipped case or earlier failure is counted as a pass.
All 1,241 application/build inputs remain identical to the original production-run fingerprint.
Only the two test observers and final documentation changed afterward. Final formatting, lint
and strict types were rerun successfully. Failed/interrupted reports remain intact.

Evidence locations:

- `tmp/site-tidy/handoff.json`: final build, dependencies, source checksums, test results and server checks.
- `tmp/site-tidy/browser-reconciliation.json`: each unique browser case and its final report.
- `tmp/chunk15/2026-10-19T20-46-15-432Z/`: original build, source, unit, HTTP and interrupted browser evidence.
- `tmp/site-tidy/final-helper-callers/`, `final-cross-browser/`, `final-webkit/` and `final-faq/`: correction and completion reports.
- `tmp/site-tidy/production-review-2026-10-19T20-49-38-824Z/`: 448-view audit, screenshots, galleries and visual review.

The light tidy pass is complete. Owner visual acceptance, the deeper page-by-page redesign,
expanded Arabic content, Sanity, real form delivery and deployment remain open. Existing source
placeholders and gone destinations still need the separate business/content decisions already
documented; this pass does not silently rewrite them.
