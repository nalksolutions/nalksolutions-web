# ADR-0003: Media identity and legacy compatibility

Date: October 15, 2026. Status: selected strategy; storage/provider details and complete asset map pending G3.

## Context

The backup contains all 424 exported attachment originals and many WordPress variants. Content/backlinks may use `/wp-content/uploads/...` paths. Some font/video resources are external. Upload archives also contain material that must not be published wholesale.

## Decision

Recover a public allowlist from real content/template/style references and request evidence. Identify files by source path and checksum, preserving multiple original URL aliases. Import suitable article originals into Sanity, while maintaining required legacy public URLs through an explicitly tested compatibility delivery layer. Prefer serving identical media successfully at valuable old paths; use redirects only where intentionally selected and validated.

Do not bulk-expose uploads, PHP, logs, caches, draft/private material or configuration. Verify MIME types and sanitize applicable SVG/HTML. Preserve displayed crop, aspect ratio, dimensions and captions independently of storage optimization.

## Consequences

Some public compatibility aliases may coexist with optimized CMS delivery; that is deliberate, not accidental document duplication. Storage/CDN choice must support exact paths/content types, immutable versioning where appropriate, cache invalidation and recoverability. External assets require explicit recovery/approved fallback rather than a permanent dependency on a theme demo host.

The final asset map, compatibility tests and ownership are required before accepting affected pages.
