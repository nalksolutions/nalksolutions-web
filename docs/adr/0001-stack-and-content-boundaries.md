# ADR-0001: Stack and content boundaries

Date: October 15, 2026. Status: accepted planning constraint; implementation pending.

## Context

The owner requests a faithful WordPress replacement with Next.js, Tailwind, TypeScript and Sanity for blogs. The source is predominantly a marketing/content site with substantial shared design and existing page-specific variants.

## Decision

Use a single Next.js App Router application, strict TypeScript and Tailwind. Compose server-rendered pages from typed marketing data and focused components. Sanity owns blog/editorial content, not an automatic generic page-builder representation of the entire site. Keep direct integration boundaries rather than microservices or internal packages without a concrete need.

No production dependency on WordPress/PHP/Elementor or the backup filesystem is allowed. Preserve public behavior through explicit route/content/media contracts.

## Consequences

Marketing layout changes remain code-reviewed; article publication remains editorial. Public-page, route and SEO models provide a shared contract. Sanity integration and Studio stay outside the public client bundle. Additional CMS-managed marketing requirements would need a specific schema/design decision rather than an unplanned expansion.

Versions are pinned and tested during foundation work; this ADR does not claim a package version has already been installed.
