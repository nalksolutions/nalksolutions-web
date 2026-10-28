# Contact form: direct email delivery

Owner update, October 28, 2026: remove all published business phone numbers, including
Saudi and Pakistan numbers, in both languages. Call actions and phone links are removed
from Contact, the mobile menu and footer; structured-data output omits telephone/fax facts.
Inherited profile/template phone links are also omitted by the shared document renderer.
Contact introductions now direct visitors to email or the enquiry form. The optional visitor
phone field remains available for enquiries. Frozen recovery evidence remains unchanged;
the structured-data publication boundary applies this explicit owner-directed exception.

Owner direction, October 21, 2026: host on Vercel and deliver contact enquiries by email,
without a database. D-27 supersedes the earlier unavailable Contact form state. The Arabic
content work continues independently; this change does not accept the entire bilingual site
or authorize deployment.

Subsequent owner direction, October 21: disable Turnstile for now. It defaults off on local
and Vercel deployments. Existing Turnstile keys alone cannot activate it; no widget/script
is rendered and no Cloudflare verification request is made while disabled. Email delivery
requires only its Resend configuration. Origin checks, validation, honeypot and attempt limits
remain enabled.

## Implemented flow

The English `/contacts/` and Arabic `/ar/contacts/` pages share one form and one Node.js
`POST /api/contact/` handler. Name, email and a message are required; phone is optional.
Recovered field names and the existing glass panel/button design remain. Labels, instructions,
validation feedback and submission outcomes are localized. Visible labels now identify
required fields. Inherited scheduling/template forms remain outside this delivery feature.

The browser validates fields, locks only while sending and preserves entered text on a
failure. A retry of unchanged details retains its operation UUID; editing details creates a
new operation. Resend receives that UUID as an idempotency key. No automatic retry or visitor
confirmation email is sent. A confirmed provider response produces the success state and
clears the form. This confirms transport acceptance, not final inbox delivery.

If explicitly re-enabled, the Turnstile widget uses compact mode below its documented 300px flexible-width minimum.
Changing across that size boundary clears the old token and recreates the widget. Ordinary
resizes within one mode retain it; navigation cleanup removes the widget and observer.

The server independently validates all fields, rejects unknown properties and bounds JSON
bodies to 16 KiB, including streamed bodies without Content-Length. Maximum lengths are
100 characters for name, 254 for email, 40 for phone and 5,000 for message. Name has a
two-character minimum; message has a ten-character minimum. Arabic text, factual numbers
and meaningful message line breaks are preserved. Phone numbers are not restricted to one
country. All email content is plaintext; client data cannot select recipients or sender.

The API accepts only approved origins and checks the honeypot. Optional Turnstile verification
uses the explicit opt-in described below. The hidden honeypot is read-only and initially empty
so normal browser autofill cannot edit it. Direct submissions with a filled trap are still
rejected. A 403 logs only `contact_rejected`, its reason (`origin`, `honeypot` or `verification`)
and a random reference in server logs; submitted values and credentials are omitted.
Turnstile runs only with `CONTACT_TURNSTILE_ENABLED=true`, which requires both keys. Incomplete explicit
opt-in and hosted test transport fail closed. Origin matching is independent of Host
and forwarded-host headers. Only the exact authored API path bypasses page resolution;
other reserved API paths stay unavailable. The endpoint has noindex/no-store responses.

## Modules

| Module                                         | Responsibility                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/components/content/contact-form.tsx`      | Accessible bilingual interaction, duplicate-click protection, retained retry identity and visible outcomes |
| `src/components/content/contact-turnstile.tsx` | Explicit widget lifecycle, expiration, failure and navigation cleanup                                      |
| `src/lib/contact/contract.ts`                  | Small shared types and length limits                                                                       |
| `src/lib/contact/validation.ts`                | Authoritative validation and bounded request reading                                                       |
| `src/lib/contact/config.ts`                    | Server credentials, exact allowed origins and isolated test mode                                           |
| `src/lib/contact/rate-limit.ts`                | Bounded per-instance attempt limiting                                                                      |
| `src/lib/contact/delivery.ts`                  | Turnstile verification and fixed Resend HTTP transport                                                     |
| `src/lib/contact/handler.ts`                   | Request outcomes and safe operational events                                                               |
| `src/app/api/contact/route.ts`                 | Node runtime endpoint; 25-second maximum duration                                                          |

No dependency, database, CRM, submission archive or background queue was added. Notification
failures cannot be recovered from a local lead store because none exists. Resend's retry-key
retention is 24 hours; an unchanged browser operation is not a permanent deduplication record.
Refreshing or closing the page discards its entered details and operation identity.

## Configuration

Use the checked-in `.env.example` as a template. Add credentials privately to `.env.local`
for development and Vercel project environment variables for the intended deployment.
Never commit credentials or expose the Resend/Turnstile secret using a public variable.

| Variable                         | Value / requirement                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `CONTACT_EMAIL_MODE`             | `resend` for actual email; the default when absent                                               |
| `RESEND_API_KEY`                 | Sending key from the owner's Resend account                                                      |
| `CONTACT_EMAIL_FROM`             | A single raw email address on the verified sending domain, e.g. `forms@notify.nalksolutions.com` |
| `CONTACT_EMAIL_TO`               | Intended inbox; defaults to `info@nalksolutions.com`                                             |
| `CONTACT_TURNSTILE_ENABLED`      | `false` by default, including Vercel; set `true` only to explicitly restore Turnstile            |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public widget key, used only with explicit Turnstile opt-in                                      |
| `TURNSTILE_SECRET_KEY`           | Server verification secret, used only with explicit Turnstile opt-in                             |
| `CONTACT_ALLOWED_ORIGINS`        | Optional comma-separated exact HTTPS origins without trailing slashes                            |

The public root, www and owned `https://nalksolutions-web.vercel.app` origins are allowed.
Exact server-provided `VERCEL_URL`, `VERCEL_BRANCH_URL` and `VERCEL_PROJECT_PRODUCTION_URL`
origins are also allowed; arbitrary `*.vercel.app` origins are not. Additional owned aliases
can use `CONTACT_ALLOWED_ORIGINS`. Request Host/forwarded headers do not grant access.
Local HTTP loopback origins are allowed only outside hosted execution. Turnstile keys
are not needed while it is off. To restore it later, set the flag to `true`, configure both keys
and configure widget hostnames to match each allowed form origin.

Create and verify the sending domain in Resend, apply its supplied DNS records, then configure
the sender and recipient. Visitor addresses are Reply-To addresses, never sending identities.
Keep preview/test recipients separate from business recipients. Environment changes require
the usual application restart/redeployment. No DNS or account changes were performed here.

The existing application still uses local fixture content and refuses `APP_ENV=production`.
This form adapter is Vercel-compatible, but its implementation does not remove that independent
content/deployment gate or make the entire website production-ready.

## Abuse controls and failure handling

The application allows five attempts per ten minutes per observed client IP, with a bounded
1,000-entry in-memory map. This is a per-process safeguard and resets on cold starts. It is
not a distributed Vercel quota. Before public launch, configure a Vercel Firewall rate-limit
rule for `POST /api/contact/` (and the slashless equivalent if used), using the account's
available controls. Turnstile is currently disabled by owner direction. Outside a
trusted hosting proxy, forwarded IP headers are not authoritative.

Provider redirects are rejected and both upstream calls have explicit timeouts. Server events
contain only an outcome and server-generated reference; names, addresses, phone numbers,
message bodies, challenge tokens and credentials are not logged or returned to the browser.
No CORS permission is granted to unrelated sites. A filled honeypot, failed challenge or
unapproved origin cannot send mail. Missing configuration returns a controlled 503; provider
rejection or uncertainty returns 502. All failure states keep the message in the current form.

Without JavaScript, the form fields are hidden and the working email alternative remains
available. The form's native method is POST, preventing personal fields from becoming URL
query parameters if scripts fail before handling submission.

## Verification and remaining connection work

Unit tests cover independent validation, origin/recipient trust, streamed-size limits,
attempt windows, real transport payloads, idempotency headers, provider failures, verification
hostname/action checks and safe logging. Production HTTP tests exercise the actual handler
with a local-only fake transport. Browser tests cover English/Arabic validation, pending state,
duplicate clicks, successful acceptance, retained failure values and retry identity across
Chromium, Firefox and WebKit, including 320px. Reports and diagnostic previews are ignored
under `tmp/contact-email/`.

The harness explicitly selects `CONTACT_EMAIL_MODE=test`, removes inherited transport secrets
and sets `APP_ENV=test`. This mode cannot operate on Vercel or under `APP_ENV=production`.
It performs no network email delivery and stores no submissions. Failure-state browser cases
intercept only their intended API response; they do not mark a failed delivery as successful.

Actual inbox delivery still requires the owner's Resend credentials and sending-domain
setup. Turnstile setup is optional and currently disabled. No real email was sent during automated verification. Once
configured, submit a controlled English and Arabic enquiry to the agreed inbox, verify the
content and Reply-To, and record the result before public release. Test provider failures
without sending repeated business notifications.

Focused commands (after `npm ci`):

```powershell
npm run test:unit
npm run lint
npm run typecheck
npm run build
$env:CHUNK_RUN_DIR='tmp/contact-email/http'
node tooling/run-browser-tests.mjs http '--grep=Contact API'
$env:CHUNK_RUN_DIR='tmp/contact-email/browser'
node tooling/run-browser-tests.mjs browser '--grep=Contact delivery:' --project=chromium-desktop --project=chromium-narrow --project=firefox-desktop --project=webkit-desktop
```

The bounded checks are recorded with actual outcomes in the ignored handoff manifest. The
complete historic site suite was not rerun for this focused feature.

Initial October 21 verification: 93 unit tests in twelve files passed; lint, formatting, strict types
and the Webpack production build passed. The final HTTP selection passed seventy tests,
including the actual Contact API, English/Arabic Contact content/SEO and all 67 original
legacy rules. All sixteen Contact browser cases passed across Chromium desktop/320px,
Firefox and WebKit, including the no-JavaScript fallback. The existing Home/Contact/Blog
UI-polish smoke also passed. Frozen-evidence and build-trace checks passed; no real email
or live Turnstile verification was performed. Reports remain under `tmp/contact-email/`.

The subsequent Turnstile-off change passed 95 unit tests, strict types, lint, formatting,
evidence validation and a production build. Two focused English/Arabic Chromium submission
flows passed with an explicit assertion that no Cloudflare script is loaded. A hosted-handler
unit test proves leftover keys do not require a token or cause a Cloudflare network call.
These follow-up reports are under `tmp/contact-email/turnstile-off/`.

## Git history

This workspace had no Git repository. The first commit establishes the existing application,
localized content, public assets and evidence references as a baseline. Later commits isolate
email delivery and its verification/documentation. `.gitattributes` preserves exact bytes on
checkout because recovery and translation records bind files to SHA-256 checksums. Local
secrets, archives, backups, dependencies, build output and reports are ignored. No remote was
configured and no push or deployment was performed.

References: [Vercel email guidance](https://vercel.com/kb/guide/sending-emails-from-an-application-on-vercel),
[Resend domain verification](https://resend.com/docs/dashboard/domains/introduction),
[Resend email API](https://resend.com/docs/api-reference/emails/send-email),
[Turnstile server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
