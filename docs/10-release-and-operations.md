# Release, cutover and operations

Status: runbook specification. Provider-specific commands/record IDs are populated after platform selection and rehearsal; no production change is authorized by this document alone.

## Release artifact

Every candidate identifies commit/build, exact lockfile/runtime, deployment artifact, environment configuration version, source baseline, dataset snapshot, import run, route/rule map and test reports. Deploy the same verified artifact; do not rebuild an unreviewed dependency tree during cutover.

Keep backups, old deployment configuration and original evidence recoverable outside a single developer machine. Secret stores contain credentials; release manifests contain references/presence checks only.

## CI and staging

CI executes the contracts in [testing](08-testing-and-acceptance.md) and fails on applicable quality, route, content, visual or integration failures. Store durable reports with release identity. Protect production write credentials from untrusted preview/PR execution.

Staging uses the actual deployment runtime, image optimization behavior, redirects and response headers. Protect access and indexing deliberately. Test performance/cache behavior on the deployed candidate, not only `next dev`.

Do not assume a local 410, forwarded header or revalidation behavior matches the selected CDN/platform. Phase 1 must prove the mechanism; the release rehearsal proves the final configuration again.

## Monitoring and recovery setup

Before launch, establish:

- Public synthetic checks for homepage, complex marketing page, English/Arabic article, a category/pagination route, known 301/410, unknown 404 and required legacy image URL.
- Application 5xx/upstream errors, form transport failures, webhook/revalidation failures and cache/content freshness.
- Safe request/correlation diagnostics without secrets, drafts or message contents.
- Performance/availability and Search Console/analytics verification with named recipients for operational alerts through the selected authorized process.
- Provider deployment rollback, dataset backup/recovery and DNS rollback procedures with permissions verified.

Initial incident criteria: a confirmed critical route wrong-status/content/indexing problem, draft/secret exposure, missing required content or failed critical delivery triggers immediate investigation. Set traffic-rate thresholds after measuring actual volume; a low-traffic site cannot rely only on percentage alerts. Calibrate operational targets during rehearsal and document the agreed response owner.

## Content freeze and delta procedure

1. Agree the cutoff and editor responsibilities. Capture any changes after the October 15 baseline; do not assume the site stayed unchanged during development.
2. Back up database/uploads again and save a new dated public reference. Keep the original baseline intact.
3. Compare WordPress source checksums, the last imported version and current Sanity edits. Resolve concurrent edits explicitly.
4. Apply the verified delta importer and corresponding marketing/media changes; preserve IDs and legacy paths.
5. Reconcile counts/content/media/routes, then run the affected comparisons and mandatory full release suite against this final content candidate.
6. Record the exact content cutoff/dataset snapshot. Hold or tightly coordinate editing through the initial verification window so rollback does not lose newly published content.

## Pre-cutover checklist

- G0–G9 evidence and per-route/requirement acceptance are complete; decisions and exceptions have reviewers.
- Production artifact, environment, content snapshot and public origin are fixed and verified.
- Real form recipient/delivery, preview/publish/revalidation, search, tracking and verification checks pass.
- Production robots/noindex/sitemap/canonical configuration is correct; staging settings cannot leak through a shared flag.
- DNS/CDN/TLS configuration and rollback values are privately recorded. Inspect apex, www, A/AAAA, redirects and cache rules.
- Preserve MX and all email-related SPF/DKIM/DMARC/verification/autodiscovery records unless a separately intended change requires otherwise.
- Plan TTL changes early enough for the existing TTL to expire. Verify authoritative and external resolution; do not promise instant global DNS reversal.
- Existing host remains available for recovery. Confirm how cached assets and old media paths survive cutover.
- Rehearse rollback, measure recovery time and populate provider-specific commands/owners. A proposed target is not a demonstrated recovery result.
- Prepare the reviewable release package and obtain cutover authorization as the final release step.

Google's [hosting migration procedure](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) is a reference for this same-URL move; the concrete platform steps must match the chosen provider. A domain Change of Address is not a routine requirement for retaining `nalksolutions.com`.

## Cutover sequence

1. Confirm the content cutoff, backups, release identity, on-call ownership and rollback readiness.
2. Deploy/activate the verified production artifact and configuration. Warm only useful critical routes; do not mask failed cold behavior.
3. Change the intended hosting/CDN/DNS routing records only. Verify A and AAAA paths and certificates; mixed old/new traffic must be understood.
4. Run public-hostname smoke checks: retained routes, one route per family, Arabic language, exact redirects/gone responses, invalid path, media compatibility, robots, sitemap, verification and cache headers.
5. Verify the controlled form procedure, search, analytics events, preview/public separation and new content visibility according to the agreed launch tests.
6. Confirm no production noindex/crawl block, staging canonical, wrong origin, secret exposure or critical missing content.
7. Watch traffic/errors on both environments and public resolution during propagation. Record start/end times and all configuration changes.
8. Make sitemap/monitoring submissions or updates through the authorized account workflow where needed. Preserve ownership verification.

## Rollback triggers and procedure

Immediate rollback or containment is considered for secret/draft exposure, widespread wrong content/status/indexing, lost required pages/media, critical form delivery failure, sustained dependency failure without an accepted fallback, or an unrecoverable deployment configuration error.

Prefer rolling back the application/configuration artifact while preserving the verified current content dataset when compatible. If DNS must return to WordPress, assess all content/messages created since the cutoff first; a stale WordPress copy is not a lossless rollback. Keep the initial editing freeze until this risk is controlled.

Procedure:

1. Record incident identity, observed impact and release/config/content versions. Preserve evidence without leaking private data.
2. Contain exposed credentials/drafts where necessary; restoring an old artifact alone does not revoke a leaked secret.
3. Revert the verified application/configuration pointer or use the rehearsed DNS fallback. Restore only the intended records, preserving email configuration.
4. Reconcile queued/delivered form operations and content changes; do not resend every message blindly or overwrite new data with an old dataset.
5. Repeat public smoke checks and monitor DNS/cache propagation. Purge only affected caches where required.
6. Record the root cause, data impact, recovery time and tests required before another release.

Never restore an entire old database/dataset over newer production edits without an explicit reconciled recovery procedure.

## Stabilization and handover

Check immediately after cutover and on days 1, 3, 7, 14 and 28. Monitor status/redirect errors, crawl/index coverage, sitemap processing, landing-page traffic, form delivery, CMS freshness and field performance. Distinguish actual regressions from normal traffic variation and independent content changes.

Retain legacy redirects/media compatibility and monitor their use. Do not retire old hosting until propagation/traffic evidence, recovery requirements and owner acceptance permit it.

Handover includes working developer commands, environment/secret ownership, architecture/ADRs, editor publishing guide, import/delta/recovery procedures, monitoring access, dependency maintenance, backup restoration and known limitations. Update this runbook with tested provider-specific steps rather than leaving placeholder prose after launch.
