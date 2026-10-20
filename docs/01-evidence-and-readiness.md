# Evidence and readiness

Status: source assessment and Phase 0 work. This document describes verified evidence separately from work still required.

## Verified source inventory

| Source | Established facts | Use |
| --- | --- | --- |
| [Backup file checksums](../migration-review/backup_files.csv) | 16 supplied files, approximately 1.60 GiB total | Original-file identity and recovery evidence |
| [Backup audit](../migration-review/backup_audit.json) | Nine ZIPs passed CRC; full database gzip was parsed; 102 tables | Restore and content/configuration source |
| [Content inventory](../migration-review/content_inventory.csv) | 107 published public-content records: 40 pages, 43 posts, 9 services, 9 projects, 6 profiles | IDs, dates, taxonomies and route reconciliation |
| [Attachment inventory](../migration-review/attachment_inventory.csv) | All 424 exported attachment originals found in the upload archives | Original media reconciliation |
| [Template inventory](../migration-review/template_inventory.json) | 47 Elementor library records plus custom CSS; 45 template JSON documents extracted | Shared layout and popup reconstruction |
| [Elementor settings](../migration-review/design/elementor-site-settings.json) | Colors, typography and responsive settings | Token and style extraction |
| [Global CSS](../migration-review/design/elementor-global.css) and [custom CSS](../migration-review/design/wordpress-custom.css) | Original generated/site custom styles | Reference calculations and exceptions |
| [Public capture](../nalk-public-archive/summary.json) | 149 routes, 447 full-page screenshots, 447 rendered HTML files, seven state captures | Page and responsive baseline |
| [Archive verification](../nalk-public-archive/archive_verification.json) | All 149 source hashes and 447 PNG containers verified; all captured sitemap and backup seeds covered | Capture integrity, not replacement-site acceptance |
| [Legacy probes](../migration-review/legacy_status_baseline.json) | All 67 exact-rule initial statuses matched configuration | Redirect/gone baseline; destination quality still reviewed |

The Elementor kit contains zero blog posts and no `templates/` directory. It cannot replace the XML/database as the content source. Its 38 pages also do not equal the 40 published page records in the XML; reconciliation must use stable IDs and live behavior.

## Source authority

| Question | Primary evidence | Reconciliation rule |
| --- | --- | --- |
| What URL/status exists publicly? | HTTP capture/probes, then server/CDN exports | Retain observed behavior or record a deliberate correction |
| What content belongs to an article? | XML/database body and live article | Resolve backup/capture timing differences; retain history |
| What should the page look like? | Fixed-environment screenshots, rendered DOM, template data and CSS | Inspect the live/isolated site for missing states |
| What metadata is emitted? | Original HTTP HTML and response headers | Compare generated defaults and per-item overrides |
| What media is available? | Archive members, attachment metadata and asset requests | Build a public allowlist; investigate every unresolved required reference |
| How are forms delivered? | Forminator configuration, verified provider and owner-confirmed recipients | Public snapshots alone cannot prove delivery |
| Is a page indexed or valuable? | Search Console, analytics, backlinks and public behavior | Noindex/sitemap presence alone does not establish indexing or value |

## Capture limitations that affect testing

- The discovery frontier is complete for its inputs. Historical URLs outside those inputs may still exist.
- HTML refers to live assets. It is not a self-contained offline mirror.
- Browser captures use Chromium 156.0.8078.4, device scale 1, `en-US` locale and `Asia/Riyadh` timezone on the capture host. Re-create the comparison environment before using strict pixel thresholds.
- Full-page screenshots represent a settled static state. The capture scrolled lazy content, disabled animations and exposed delayed Elementor entrance visibility. Rendered HTML was saved before that visibility adjustment.
- Seven interaction states are representative. They are not an exhaustive recording of sliders, dropdown nesting, validation, focus, language transitions or video frames.
- Source and browser requests can differ due to cookies, redirects, caching, optimization plugins or device handling. A difference requires inspection, not averaging.
- The backup and public crawl were taken at different times on October 15, 2026. New content requires a deliberate delta process.

## Phase 0 recovery and inspection procedure

1. Preserve source files and hashes. Keep an additional recoverable copy outside this working directory; store access details privately.
2. Restore WordPress into an isolated environment with compatible versions. Do not import this database into production or expose restored personal/plugin data publicly.
3. Restore database and every wp-content archive part; install compatible core where absent. Verify permalink rules, uploads and active child theme.
4. Disable outbound email, payment actions, analytics and scheduled external calls in the isolated copy. Inspect forms/configuration without notifying real recipients.
5. Verify representative pages, shared templates, article bodies and attachments against the public archive. Check the parent/child theme, custom CSS, header/footer assignment, popup and archive conditions.
6. Inspect live and restored behavior for the states missing from the archive. Save new evidence separately with timestamp, route/state and environment.
7. Record the restore procedure, versions and remaining differences. Destroy no original material.

Exit evidence: successful restore log, representative comparisons, recovered-configuration checklist and unresolved differences with owners. If the isolated environment is temporarily unavailable, independent design/content work may proceed with the limitation recorded; it remains a launch recovery gate.

## Inputs to collect without blocking unrelated work

| Input | Needed by | Safe independent work |
| --- | --- | --- |
| Sanity project, dataset, roles and private write access | Import/preview integration | Schema design, dry-run conversion and fixtures |
| Hosting/CDN/DNS provider and current routing exports | Routing prototype and release planning | Local layout and content reconstruction |
| Real form recipients, provider, spam controls and consent | Functional acceptance | Form appearance, field model and test-transport integration |
| Analytics/tag manager, verification records and conversion definitions | Tracking/release gate | Page rendering and route tests |
| Search Console page/query/indexing and backlink exports | Final route reconciliation | Preserve every known URL by default |
| External media/font availability and usage rights | Asset/design acceptance | Recover locally available media and inspect fallback behavior |
| Current DNS/email/certificate configuration | Cutover/rollback | Application development and protected staging |

Store secrets in the selected secret manager/environment system, not these documents or exported JSON registers.

## Known issues to resolve deliberately

Use [decisions](registers/decisions.md) for disposition. Initial evidence includes:

- A displayed +92 telephone number links to a different +47 number; some email links point to theme example addresses.
- `/arbic/` redirects to `/arabic/`, whose final response is 410. The main Arabic-slug pages are separate live URLs.
- The Arabic-slug homepage declares English HTML language and lacks HTML direction/hreflang relationships.
- A theme-demo video request is blocked cross-origin. Referenced external media is not proven recoverable by attachment reconciliation.
- A Google Ads legacy redirect points to social-media marketing; some exact patterns contain ellipses/invisible characters, and one contains a literal asterisk.
- The captured robots file contains Disallow directives without a User-agent line.
- The [SEO observations](../migration-review/seo_observations.csv) and [resource failures](../migration-review/resource_failures.csv) contain observations with repeated route/profile references. Their row counts are not counts of unique defects.

## Completion records

Each recovered configuration records source, verification date, destination environment, owner and test evidence. Record only secret references and presence/verification status. A table full of unchecked assumptions is not a recovery result.
