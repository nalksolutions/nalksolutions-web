# ADR-0005 — Authored Arabic content and preserved URL identity

Status: owner-approved direction, implementation underway. October 20, 2026; D-26.

Use the existing resolver and shared Next.js server compositions with authored localized
identities, typed next-intl messages, semantic content blocks and explicit translation groups.
Do not modify recovered WordPress JSON to add translations or fabricate source provenance.

All Arabic canonical destinations use `/ar/`. English URLs stay fixed. Four corresponding
services retain their established Arabic slug inside that prefix. The retired Arabic landing
maps to `/ar/`; Arabic-only articles/mobile service retain distinct entities. Exact 301 rules
for all 14 old Arabic URLs activate only when a replacement is publishable and available.
The original 67 legacy rules remain unchanged and retain precedence.

Language comes from the resolved page identity. Cross-language links replace the document;
same-language links use Next navigation. No cookie/browser-language redirects. Drafts never
fall back to English bodies. Optional developer preview cannot enable publication,
hreflang, sitemap inclusion or legacy redirects. Real production fixture-mode refusal remains.

Use natural Saudi business Arabic with an explicit glossary and revision-bound records.
Owner clarification, October 20: do not nominate a reviewer, show review notices or disable
translated navigation. Linguistic acceptance is managed internally by the owner. A separate
publication-readiness flag controls availability; it never fabricates native approval.
Noto Sans Arabic is self-hosted with provenance/license. RTL follows
logical layout and selective LTR isolation. Dates stay Gregorian and factual source values
remain unchanged. Source changes reopen editorial review, not automatic translation overwrite.

This separates recovery evidence, commercial presentation, translated content and publishing.
It also allows a later Sanity adapter without duplicating the frontend or tying translation
identity to WordPress layout IDs. Sanity, real form delivery and deployment are later gates.

See [the implementation contract](../14-arabic-localization.md).
