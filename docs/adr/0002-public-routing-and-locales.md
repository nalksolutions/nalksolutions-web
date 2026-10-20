# ADR-0002: Public routing, locales and rendering

Date: October 15, 2026. Updated: October 17, 2026. Status: selected and implemented for local production-mode proof; actual deployment and CMS evidence remain required.

## Context

Articles use flat root URLs; Arabic uses existing Arabic slugs rather than a universal locale prefix. The source contains real 301/410 rules. New CMS articles must publish without manually adding/deploying route files. Server HTML must identify the correct language and preserve public paths.

## Selected local decision

Use the implemented Proxy public-path boundary and request-local server public-page resolver. The request boundary overwrites a trusted internal pathname header. A deduplicated server resolver identifies marketing/CMS content and locale for root layout, page and metadata. Legacy statuses and invalid routes are resolved before successful streaming. Cache public content explicitly; preview data remains separate.

This approach uses request-rendered HTML at the public root. It does not claim whole-page static generation/ISR. Its simplicity and new-article correctness are the starting preference; measure its latency/cache behavior against the actual hosting runtime.

Because a shared root layout can persist during client navigation, this approach requires full-document navigation when changing language, with normal client routing allowed within a language. The prototype must demonstrate correct HTML attributes and shell after language changes and browser back/forward, without relying on a client-only attribute patch.

## Deferred alternative

An internal rewrite to locale-parameter root layouts can support different rendering/caching behavior while keeping visible paths unchanged. It adds requirements for coherent route/locale index updates, duplicate/internal URL protection and publication freshness. It is not part of Chunk 1. Reconsider it only if deployment measurements demonstrate a worthwhile benefit and those contracts pass. Do not expose `/en/` or `/ar/` as accidental new canonical URLs.

## Required proof

Test homepage, English/Arabic root content, nested archive/pagination, newly published articles in both languages, reserved-route collisions, unknown/malformed paths, true 301/410/404, GET/HEAD, direct/client navigation, cold/cache-hit responses, metadata, draft isolation and content freshness. Test the chosen branded 410 mechanism on the real deployment target.

Also verify that attacker-supplied routing headers do not select private/incorrect content and that API/Studio/assets/robots/sitemap bypass rules are narrow and correct.

## Finalization

Record the chosen implementation, measured tradeoffs, relevant framework/runtime versions and test artifact references here before G1 acceptance. Update the file tree, cache contract and SEO tests accordingly. Neither approach is accepted merely because it appears in a framework example.

## Chunk 1 implementation

The [chunk runbook](../chunks/01-foundation-routing.md) defines the executable implementation.
Proxy directly returns exact 301/410, missing 404 and source-failure 503 responses before
streaming; framework automatic slash redirects are disabled. A small generated manifest
preserves 67 configured rules plus five additional captured non-200 responses.

Published fixture identities supply canonical path policy. Rendering deduplicates its content
snapshot with React request cache, with no cross-request data cache or shared Proxy state.
The root layout emits content-derived language/direction. Cross-language links perform native
document navigation; same-language links use Next Link. Blocking metadata is verified in raw
HTML. The fixture provider is server-only, with production APP_ENV refused.

Tests use an optimized Next 16.4.1 / React 19.3.1 Node 24 build. New English and Latin-slug
Arabic documents, edits, unpublication, drafts and source failures are exercised without
rebuilding. Full-gate manifests identify source fingerprints, build, environment and results.
This selects the local architecture; real-platform HTTP/cache behavior, Sanity publication,
preview isolation and the final branded status documents still require later evidence.
