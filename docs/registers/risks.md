# Risk register

Status: active planning risks tied to observed evidence and specific gates.

| ID | Risk / cause | Detection | Prevention / response | Owner / gate |
| --- | --- | --- | --- | --- |
| RISK-01 | Incomplete recovery despite valid ZIPs | Isolated restore fails or shared layout/config is missing | Restore all database/wp-content parts; retain additional backup/config exports; document unresolved differences | Lead / G0, G9 |
| RISK-02 | Missing historical URLs outside captured inputs | Search Console/backlink/server exports reveal unregistered routes | Reconcile the union; preserve/decide every new URL before freeze | Lead / G1, G9 |
| RISK-03 | Shared templates omitted by Elementor kit | Header/footer/archive mismatch or absent condition | Use database template extraction plus restored/live inspection; verify shell variants | Lead + visual QA / G3, G4 |
| RISK-04 | Wrong status/locale from framework streaming/caching/routing | Raw GET/HEAD or cold/warm/client-navigation tests fail | Prototype true 301/410/404 and server language on real runtime before expansion | Lead / G1, G8 |
| RISK-05 | Content conversion loses structure | Source-to-target code/table/list/anchor/media diff | Typed conversion, representative fixtures, loss report and per-document reconciliation | Lead + content QA / G3, G5 |
| RISK-06 | Missing/external fonts or media alter design | Resource errors, fallback metrics, wrong crop/frame | Recover allowlisted originals, self-host permitted assets, decide video/fallback and compare | Lead + visual QA / G3, G4 |
| RISK-07 | Visual suite hides real differences or has noisy baselines | Broad masks/thresholds, repeated flaky outcomes, old reference drift | Fixed runner, strict geometry/content plus pixel review; immutable originals and narrow exceptions | Visual QA / G2, G4, G8 |
| RISK-08 | Import overwrites editor changes or duplicates records | Repeat-run/concurrent-edit tests and identity checks | Deterministic IDs, checkpoints, field ownership, source hashes, conflict report and dataset recovery | Lead + editor / G5, G9 |
| RISK-09 | Form looks successful but loses messages | Transport/provider/test-recipient evidence disagrees with UI | Server validation, observable accepted/delivery status, controlled integration and error tests | Lead + owner / G7 |
| RISK-10 | Draft/private data or logs become public | Public query/cache/bundle/asset allowlist checks | Server-only secrets, preview cache separation, sanitized inputs and allowlisted static publication | Lead / G2, G5, G8 |
| RISK-11 | Staging noindex/canonical/verification policy leaks to production | Production-config and public-hostname SEO smoke fails | Separate environment policy, tested release artifact and cutover checks | Lead / G8–G10 |
| RISK-12 | DNS cutover breaks mail, IPv6 or rollback | Record comparison, A/AAAA/MX/TXT/TLS and external resolution checks | Preserve mail records, rehearse platform/DNS reversal and retain old host | Lead + owner / G9, G10 |
| RISK-13 | Final source changed since baseline | Dated capture/export and content hash comparison | Agreed cutoff, delta import, source-change review and full final regression suite | Lead + editor / G9 |
| RISK-14 | Rollback loses new content or duplicates message delivery | Rehearsal includes post-cutoff edits/transport IDs | Prefer artifact rollback, coordinate editing freeze, reconcile new data before DNS/database fallback | Lead + owner / G9–G11 |
| RISK-15 | Documentation becomes an optimistic duplicate of reality | Link/status/command checks or reviewer cannot find evidence | Single route/decision source, same-change updates, tested runbooks and explicit planned/completed states | Lead + reviewer / every gate |

Update detection/evidence and disposition when a risk is resolved or changes. A row's existence does not mean its mitigation has been implemented.
