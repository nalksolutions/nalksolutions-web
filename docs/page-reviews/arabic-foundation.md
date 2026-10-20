# Arabic implementation: current delivery record

Owner direction, October 20, 2026: linguistic acceptance is handled internally. Do not
nominate a reviewer, display review notices or disable translated navigation because a
reviewer has not been named. Publication readiness and editorial review are separate.

## Implemented batch

- All nine main pages: Home, Services, About, Blog, Contact and the four offers.
- Ten English specialist/regional counterparts: SEO, API integration, cloud portals, B2B
  portals, and website-development/digital-marketing pages for Riyadh, Jeddah and Dammam.
- The Arabic-only mobile-app specialist and all eight existing Arabic articles, under `/ar/`.
- Generated Blog, eleven category roots and the existing author's root listing. Their content
  derives from available Arabic articles in captured order; empty categories remain noindex.
- Forty Arabic 200 views in total. Seven planned archive pagination records currently return
  404 because eight published Arabic articles do not fill their preceding pages. They are
  not empty published pagination pages.
- All fourteen compatibility destinations are available. Old Arabic URLs return exact 301s
  directly to them, preserving query strings from both slash forms.

English page content/metadata and the original 67 rules are preserved. The shared shell uses
Arabic UI messages, RTL, local Noto Sans Arabic, Gregorian dates and Western digits. Exact
language counterparts navigate by full document request. Arabic-only content explains the
absence of an English counterpart and offers explicit English destinations.

## Finite editorial differences

| Area | Recorded change |
| --- | --- |
| Public review UI | Removed the preview banner, pending badges and disabled translation controls. No reviewer or approval was invented. |
| Main-page copy | Authored Saudi business Arabic for the existing Home composition, four offers, Services introduction/directory, About summaries, Contact brief, navigation and footer. |
| Source protection | Published translations carry their actual recovered source snapshot, source checksums and independent authored provenance. Later English edits flag staleness without overwriting Arabic content. |
| Existing Arabic articles | Preserved substantive bodies, media, identifiers and dates. Two duplicated body H1s become H2s, retaining their wording and anchors. Feature-image alternatives and interface labels are localized. |
| Mobile-app specialist | Preserved the Arabic body and all statistics. Translated four inherited English statistic/coverage labels. Added a Software parent connection without inventing an English translation counterpart. |
| Arabic-only articles | Eight explicit offer assignments now connect their content to a relevant Arabic offer; translation relationships remain separate. |
| Automation | Retained the three distinct legacy Arabic FAQs about eligible tasks, small businesses and ongoing support. |
| SEO specialist | Retained the distinct Arabic-search capability and three legacy FAQs. Removed the inherited instruction to insert prices and a redundant self-link; no prices were invented. |
| Websites | Current English pricing/timing copy governs the new Arabic equivalent. The conflicting legacy simple-site estimate of 4–6 weeks remains in evidence; it is not repeated alongside the current standard-site 6–8-week estimate. Repeated bilingual/pricing information is consolidated. |
| Marketing | Repeated legacy bilingual FAQs are covered by the existing localized market/bilingual context. |
| Cloud portals | Distinguished duplicated English process labels as user-experience design and interface design, following their existing paragraph meanings. |
| API integration | Retained Make as the current platform name; omitted the truncated former-name fragment without inventing its missing text. |
| Regional metadata | Repaired the truncated Riyadh website description and the Dammam marketing description that incorrectly discussed website development. English metadata remains unchanged. |
| Body links | Available Arabic destinations resolve directly through identities. Established English body links remain usable where their Arabic counterpart is still being prepared. Full Arabic onward-link coverage is therefore still open. |
| Search | Current-language results, four-offer priority, Saudi capability aliases, Arabic query normalization and six-at-a-time expansion. |
| Build | Default Turbopack attempt failed on a memory allocation. Supported Webpack production compilation passed; `npm run build` now selects Webpack without suppressing type/lint failures. |

Individual content records also contain their finite `issues`, source inputs and translation
revision. These are internal records and are not rendered as visitor-facing notices.

## Still open

Eleven English specialist counterparts, all thirty-five English article translations, remaining
utility/profile/team content, the Arabic HTML sitemap, complete onward-link reconciliation and
the final whole-inventory bilingual gate remain open. The current batch is not acceptance of
the complete Arabic phase. Historical reports and frozen evidence remain unchanged.

Internal linguistic acceptance belongs to the owner. Real Sanity publishing, form delivery,
hosting and deployment remain separate phases. No native reviewer approval is claimed.

## Verification evidence

Focused unit, type/lint, production HTTP and representative browser reports are stored under
`tmp/arabic-foundation/`. Failed attempts are retained alongside later results. The latest
handoff manifest identifies exact source/content revisions and actual completed checks; it
does not substitute for the final `verify:arabic` gate, which is still pending full coverage.

The current batch passed 79 unit/contract tests, strict types, lint, formatting, frozen-evidence
validation and a Webpack production build. All 115 selected production HTTP tests passed,
covering the available Arabic identities, all fourteen new moves and the original 67 rules.
Browser evidence covers the
core composition, topic picker, unavailable-counterpart explanation and Home → Software →
Contact → English → Back across Chromium desktop/320px, Firefox and WebKit.

Failed browser attempts are retained: an obsolete selector for the mobile dialog was fixed;
Firefox tab-icon loads are now explicitly completed before deliberate Back navigation.
Verification clients map public-origin destinations to loopback and disable automatic API
redirect following. A dedicated browser regression verifies a canonical redirect cannot
escape to the live site. Native approval and the final full-site suite are not claimed.
