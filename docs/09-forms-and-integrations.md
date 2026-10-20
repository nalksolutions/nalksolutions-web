# Forms, search and integrations

Status: implementation contracts. Real account configuration and delivery acceptance remain pending.

## Integration inventory

| Capability | Source evidence | Work required |
| --- | --- | --- |
| Contact/other forms | Three Forminator forms plus a quiz in XML; rendered form definitions | Identify live usage and recover fields, validation, messages, transport, recipients and spam/consent settings |
| Site search | Shared search popup and WordPress search behavior | Inspect queries/results/pagination and define retained content/language scope |
| Language navigation | Live Arabic-slug pages and legacy Arabic paths | Map real equivalents and preserve page-specific destinations |
| Analytics/tagging | Site Kit/WPCode/tag scripts and account configuration | Recover actual identifiers/events/consent; verify intentional deployment |
| SEO ownership | Existing verification methods and sitemap endpoints | Preserve verification and test production indexing configuration |
| Editorial preview | New Sanity integration | Authenticated draft/public separation and safe exit |
| Publishing | Sanity webhook and public cached data | Verified event handling, dependency invalidation and freshness checks |
| Media | Local backup plus external fonts/video/assets | Recover required public assets and resolve remote failures deliberately |

Do not rebuild unused plugin capabilities just because their records exist. Conversely, a visible control cannot become a nonfunctional decorative element.

## Form implementation contract

Recover the actual live field order, labels, types, required rules, choices, helper text, consent, validation, loading/success/failure messages and any redirect-after-submit behavior. Identify which of the four exported form/quiz records are used publicly.

Share a typed field/validation contract where appropriate; the server remains authoritative. Bound body size and lengths, normalize safely, verify permitted origins, apply abuse controls/rate limiting and avoid trusting hidden client fields for recipient/transport decisions.

Keep recipient addresses/provider secrets in validated server configuration. Confirm the intended destinations rather than retaining theme example contact details. Preserve meaningful visible design and record corrected `tel:`/`mailto:` links in a decision.

Use a small transport boundary with a test implementation. Return structured errors and accessible feedback. Define exactly what success means: accepted by the intended transport or durably queued for delivery, with observable follow-up failures. Do not claim final inbox delivery from a successful HTTP handler alone.

Handle provider rejection, timeout, partial acceptance, duplicate clicks, retry, throttling and spam rejection without silently losing messages or creating duplicate deliveries. Track an operation ID and safe status; do not log message bodies or personal fields.

## Form acceptance

- Component/browser tests cover empty, invalid, submitting, accepted and failed states with keyboard/focus/announcement checks.
- Server tests cover bypassed client validation, malformed/oversized input, origin/rate/spam controls and transport failure.
- Integration tests use an isolated sink/test transport and explicit test recipients.
- A controlled provider-to-agreed-recipient test demonstrates actual delivery and correct reply-to/routing before launch. Coordinate this test explicitly; do not send unannounced messages to real visitors or business recipients.
- Production smoke uses the agreed procedure and records the test identifier without private message content.

## Search

Inspect the existing search before choosing its replacement. Define indexed content types, locales, matching/ordering, excerpts, pagination and empty/error behavior. A small server search across the required public content is the starting scope; add a separate search service only if measured needs require it.

Queries must be safely bounded/encoded and must not expose drafts/private content. Results link to canonical public paths, preserve language context and remain usable with keyboard and without layout shifts. Decide and test result-page indexing/canonical policy.

Test new/updated/unpublished articles in search after publication invalidation. A search index that never receives CMS updates is not a working integration.

## Analytics, consent and verification

Inventory actual tag sources and remove duplication from old plugin/theme snippets in the replacement. Retain the agreed measurement property and event meaning. Define pageview, contact interaction, submission acceptance/delivery and any other real conversion separately.

Verify client navigation does not double-fire pageviews, preview/test sessions are handled intentionally, events omit personal form data, and consent state behaves as required by the site's actual chosen policy. Do not invent legal text or change consent behavior without confirming it.

Preserve Search Console verification through the actual DNS/file/meta method. Record which production records/files must remain available. Confirm each required tag/verification endpoint after deployment; configuration existing in an environment is not evidence that it works publicly.

## Preview and revalidation

Authenticate preview entry; validate return paths against site-owned paths. Use safe cookie settings and a visible preview indicator. Exit clears draft mode and returns to the correct public path without retaining private cached content.

Verify webhook authentication/signature using the provider's supported integration, bound and validate its body, and handle duplicates safely. Validate the current Sanity integration APIs at implementation time. The publish flow invalidates dependent article/listing/category/related/search/sitemap data and then proves public freshness.

Define an initial freshness objective during Phase 5 and verify it under cold/warm requests, failed events and retries. Add alerting/manual recovery for missed events instead of requiring a developer to deploy every article.

## Environment matrix

| Environment | Content/access | Delivery/tracking |
| --- | --- | --- |
| Local | Fixtures or development dataset; explicit secrets where needed | Sink/test transport; test tracking or disabled |
| CI | Deterministic fixtures/controlled dataset; least-privilege credentials | No real recipients; no production writes |
| Staging | Protected deployment; controlled content snapshot; preview tested | Explicit test recipients/property; non-indexing policy |
| Production | Published production data; restricted editorial/preview access | Confirmed recipients/property/consent; production indexing policy |

Create a documented environment schema and a secret-free example. Distinguish public identifiers from private tokens. On startup/build, report missing required configuration clearly without printing values. Studio authorization, hosting deploy rights, provider permissions and dataset exports must be owned by named account holders before handover.
