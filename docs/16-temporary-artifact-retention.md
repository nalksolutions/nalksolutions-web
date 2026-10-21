# Temporary artifacts: retention and cleanup plan

October 22, 2026: the owner authorized retaining important material and removing redundant
contents of `tmp`. The live application does not require this directory; Git ignores it and
production tracing excludes it.

## Execution status

**Planned, not executed.** Automatic approval review rejected the bulk deletion command and
then rejected a narrower command naming one duplicated HTML-report directory. Both commands
were rejected before process creation with the reason `blocked by policy`; no more specific
reason was provided. The system also refused direct execution of the local `.ps1` file under
its existing PowerShell execution policy. No settings were changed and no alternative tool
was used to bypass the deletion block.

No original temporary artifacts have been deleted. Only the ignored inventory/planning
directory and this documentation were added. No application source, public assets, original
WordPress backup or captured archive was changed.

## Checked retention plan

The inventory contains 173,050 existing files totaling 174,006,246,908 bytes (162.06 GiB).
The plan retains 34,489 files totaling 11,142,369,496 bytes (10.38 GiB), before the small new
audit files. It identifies 162,863,877,412 bytes (151.68 GiB) for removal in 51,516 specific
file/directory operations. These are estimates of recoverable logical file space, not space
already reclaimed.

Keep:

- Arabic authoring scripts, translation caches and unfinished authored material.
- Source/reference captures, calibration inputs and required gallery images.
- Before/final visual captures; image dependencies used by retained review viewers.
- Exact existing documentation/tooling references, result JSON, logs and milestone manifests.
- Failed-case diagnostics and selected recent Arabic/Contact previews.

Remove:

- Duplicate isolated fixture/document copies used by completed test runs.
- Generated interactive test reports duplicating the raw test outcomes.
- Repeated passing-case traces/screenshots not used by retained galleries.
- Superseded intermediate visual captures and regenerable caches.

The final planning pass followed static gallery image dependencies and proved that no
retained file overlaps a proposed deletion target. It recorded SHA-256 checksums for 5,564
important authored/reference/cited files. The full inventory found no reparse points.

## Local handoff

The ignored audit directory is [tmp/retention-audit-2026-10-22](../tmp/retention-audit-2026-10-22/).
It includes:

- [Summary](../tmp/retention-audit-2026-10-22/summary.json).
- [Exact deletion targets](../tmp/retention-audit-2026-10-22/targets.json).
- [Compressed file inventory and retention decisions](../tmp/retention-audit-2026-10-22/inventory.json.gz).
- [Important retained-file checksums](../tmp/retention-audit-2026-10-22/retained-hashes.json).
- [Native PowerShell cleanup script](../tmp/retention-audit-2026-10-22/remove-redundant.ps1).

The script checks the exact workspace root and validates each target stays strictly under
`tmp`, excludes the audit folder, resolves the final absolute path before recursive removal
and rejects changed/reparse targets. It uses native PowerShell file operations throughout,
records removed targets and captures errors. It has not run. A person can review it and
execute its contents in their own authorized interactive PowerShell session from the project
root; no global execution-policy change is part of this handoff.

After any later execution, verify every retained file still exists with its recorded size,
recheck the important SHA-256 checksums and run the frozen-evidence checker. Keep the deletion
log/result and reconcile the actual reclaimed space. Historical manifests remain original;
their full intermediate traces/fixture copies would no longer be retained under this owner
cleanup direction. No build or site-wide browser rerun is necessary for artifact-only cleanup.
