# Engineering standards

Status: implementation and review rules. Applies to application code, migration utilities, tests and documentation.

## Code organization

Use the smallest structure that makes ownership and dependencies clear. Route files coordinate typed data and components; they do not contain CMS clients, email transports, giant content literals and SEO rules together. Put a capability with its owning feature rather than a generic `helpers`, `common`, `misc` or `services` dumping ground.

Avoid speculative frameworks, empty folders, unused scaffolding and libraries installed for hypothetical future use. A module/package split needs a real boundary or lifecycle. The architecture is a single application until evidence supports more.

Production runtime must not depend on the WordPress database, PHP, Elementor, the local backup directory or migration Python tools. The preserved reference files remain useful evidence, not runtime infrastructure.

## Component design

- Compose focused primitives, shared site components, real repeated sections and page templates. A hero with multiple genuine layouts should have explicit typed variants, not dozens of unrelated booleans.
- Keep content out of layout branching where possible. Define typed data for repeated service/location sections and separate a page's exceptional composition when it is materially different.
- Do not make a universal JSON page builder to avoid writing clear React composition. Do not create one component per paragraph or wrapper.
- Extract an abstraction after its responsibility and real variants are understood. Duplication of a small amount of straightforward composition can be clearer than a premature generalization.
- Keep interactive state near its owner. Use URL state for navigable search/pagination where appropriate, local state for menu/accordion interaction, and server data for published content. No global store without a demonstrated shared-state requirement.
- Server-render content by default. Mark the smallest appropriate client boundary. Do not turn the public layout into a Client Component to simplify a menu.
- Use stable semantic keys, native elements and accessible APIs. Keep visual wrappers meaningful; avoid reproducing Elementor's wrapper hierarchy.

## TypeScript and contracts

Enable strict checking. Use discriminated unions for route/template outcomes, explicit props and typed query results. Treat external inputs as unknown until validated at the boundary. Derive Sanity query types from schema/query tooling where supported; do not hand-maintain a competing document type that silently drifts.

Avoid broad `any`, unsafe assertions, unchecked non-null assertions and duplicated loosely typed objects. A necessary escape hatch must be narrow, explained and covered by a boundary test. Do not suppress compiler/linter failures to force a build through.

Do not add runtime validation to every internal function just to duplicate established types. Validate at trust boundaries and central mappings where failures can be handled meaningfully.

## Styling and visual responsibility

Maintain tokens in one source and use focused Tailwind utilities for composition. Repeated arbitrary values should become documented tokens/variants when they represent a shared design rule. A measured one-off value can remain explicit when that is the most faithful and readable implementation.

Use static, discoverable class variants; do not build Tailwind class names from arbitrary CMS strings. Keep rich-article styling in a bounded typography layer when utility-heavy markup would obscure content. Avoid broad selectors that leak into Studio, error pages or third-party embeds.

Keep responsive rules consistent with the original breakpoints. Do not copy all old theme/plugin CSS into the new application. Retain only deliberately reimplemented design rules, icon/font resources and required legacy asset responses.

## Security and reliability

- Secrets stay server-side; verify that client bundles and source maps do not contain them. Commit only secret-free examples and configuration schemas.
- Validate forms, webhook signatures, preview credentials, redirect targets and imported content at their boundaries.
- Serialize JSON-LD safely, including escaping unsafe HTML delimiters. Sanitize supported HTML exceptions and SVGs; prohibit imported executable scripts and arbitrary iframe hosts.
- Provide bounded network timeouts and deliberate retries. Never retry a non-idempotent delivery blindly or return success after swallowing an exception.
- Distinguish not-found content from upstream failures. Unknown routes produce real 404; known removed routes produce real 410; failed dependencies produce a deliberate error/fallback with observability.
- Restrict browser/CMS origins and image/iframe hosts to the actual requirements. Validate CSP against real embeds and preview rather than disabling it broadly.
- Logs and analytics omit secrets, private drafts and form-message contents. Error messages shown to visitors do not expose internal stack traces.

## Error handling

Handle an error where the application can make a meaningful decision. Add context to diagnostics once, retain correlation identity, and avoid repeated logging at every layer. Empty catches, silent fallback content and unbounded retries are review failures.

User-facing states must explain the next useful action. A form cannot show delivered/sent when the transport rejected or timed out. A CMS outage cannot be disguised as article deletion. Include retry/recovery behavior in the related tests and runbook.

## Dependencies and generated files

Use one package manager and committed lockfile. Pin the runtime/toolchain and installed direct dependencies through a reproducible policy established in Phase 2. Review updates separately from unrelated feature work and assess the production dependency graph.

Use existing platform/library facilities before writing bespoke implementations. Conversely, do not add a broad UI/animation/state library for a single simple control. Record meaningful additions, their purpose, bundle/runtime effect and maintenance implications.

Mark generated types, route matrices and import reports clearly. Regenerate from their source; never hand-edit generated outputs to cover a failure. Keep archives, test output, caches, build artifacts and local environments out of source control. Keep small deterministic fixtures and acceptance manifests in source control; retain large evidence by immutable artifact reference.

## Tests and review

Write tests for meaningful behavior, boundaries and regressions. Prefer real route/HTTP checks and representative content fixtures over snapshots of implementation structure. Do not assert private helper call order when externally observable behavior is what matters.

Use reviewed deterministic visual baselines. Tests must fail on unapproved regressions; automatically updating screenshots in a failing CI run is prohibited. Coverage figures are diagnostic, not a substitute for the route/requirement acceptance matrix.

Do not add no-op package scripts that return success for tests which are only planned. An unavailable check remains pending until its meaningful implementation exists; it cannot become a green release gate by naming convention alone.

Every change should be understandable by a reviewer without the chat history. Its description states the user-visible result, why the change is needed, relevant evidence/tests and remaining limits. Use focused changes; do not mix a formatting rewrite, dependency migration and page reconstruction into one review.

## Review checklist

1. Does the change satisfy a tracked requirement/route/decision?
2. Is the responsibility in the correct module, with clear names and a narrow API?
3. Is duplication or abstraction justified by actual use?
4. Are server/client, public/draft and trusted/untrusted boundaries correct?
5. Are failure and accessibility states implemented rather than implied?
6. Do content, metadata and responsive visuals match their evidence?
7. Are tests meaningful and passing in production mode where required?
8. Are dependencies, generated outputs and artifacts accounted for?
9. Do documentation and commands describe the final implementation accurately?
10. Is there leftover debug code, dead code, an unexplained suppression, placeholder content or an unresolved TODO hidden in the change?

## Definition of done for a change

The code works, relevant checks pass, required comparisons are reviewed, affected registers/docs are updated, and any real limitation is explicit. No unused scaffolding, temporary debug assets, example contact details or optimistic status claims remain. Larger work advances through reviewed increments rather than a single unreviewable final dump.
