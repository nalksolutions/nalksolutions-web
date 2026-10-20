Nalk Solutions migration evidence tools
======================================

Run commands from the workspace root in PowerShell.

Setup (Python 3.11+):
  python -m venv .venv
  .\.venv\Scripts\python.exe -m pip install -r scripts/requirements.txt
  .\.venv\Scripts\python.exe -m playwright install chromium

The existing task environment uses Python 3.13, Playwright 1.64.0 and Chromium
156.0.8078.4. Dependency and browser installation need internet access.
An activated PowerShell environment is not required.

1. Audit every supplied backup file:
  .\.venv\Scripts\python.exe scripts/audit_backup.py

Produces migration-review/backup_audit.json, SHA-256 checksums, ZIP CRC and gzip
integrity results, upload/attachment/content inventories, a public URL seed file,
whitelisted database settings, shared template JSON, design settings/CSS and
raw redirect rules. PHP and SQL are never executed. The source backup is unchanged.
The optional PDF text extraction uses pypdf; visual PDF review remains separate.

2. Capture public pages:
  .\.venv\Scripts\python.exe scripts/capture_public_site.py

Resume or retry an interrupted run:
  .\.venv\Scripts\python.exe scripts/capture_public_site.py --resume

The task used --workers 3 --browser-pages 6; defaults are two URL workers and at
most four browser pages. --delay controls spacing between starting URLs. Use
--max-pages to bound one invocation. An interrupted or bounded run is explicitly
incomplete; completed per-page JSON files are the durable checkpoints.

Capture discovers robots/sitemaps, backup seeds, HTML/rendered links and language
alternates. Operational WordPress/account/checkout paths, non-page assets, feeds,
external domains and robots-disallowed URLs are excluded from page navigation.
All exclusions, sitemap failures, pending URLs and incomplete captures appear in
summary.json. Query identity preserves pagination, language and legacy WordPress
post identifiers while dropping tracking and unknown query parameters.

Outputs:
  nalk-public-archive/url_inventory.csv
  nalk-public-archive/html/source/*.html
  nalk-public-archive/html/rendered/*--desktop.html (also tablet/mobile)
  nalk-public-archive/screenshots/*--desktop.png (also tablet/mobile)
  nalk-public-archive/internal_links.csv
  nalk-public-archive/asset_urls.csv
  nalk-public-archive/summary.json
  nalk-public-archive/pages/*.json
  nalk-public-archive/discovery/*

HTTP HTML is saved as original response bytes. Source and rendered metadata,
headings, schema, language alternates, image alt text, form definitions, resource
responses and browser failures are available in pages/*.json. Browser contexts
are fresh for each URL/profile, use device scale 1 and Asia/Riyadh timezone.

Lazy content is scrolled into view before capture. Screenshots disable animations
and expose Elementor entrance-animation visibility; adjustments are recorded.
Rendered HTML is saved before that visibility adjustment. No forms are submitted.
Screenshots represent a final static state, not the animation sequence. Browser
requests may appear in site analytics.

HTML snapshots are references, not self-contained offline mirrors. Assets are
inventoried but not bulk-downloaded. Retain the WordPress backup. Font/layout
differences between OS/browser versions are possible. Discoverability is bounded
by the supplied sources; a completed frontier does not prove every public URL
has been found. Supplement with Search Console, analytics and server/CDN exports.

3. Verify legacy rules independently:
  .\.venv\Scripts\python.exe scripts/probe_legacy_urls.py

Creates legacy_url_rules.csv and legacy_status_baseline.csv/.json in
migration-review/. Uses unauthenticated public GET requests. Exact rules are
checked, including literal asterisks; non-exact rules require representative URLs. Actual source status,
redirect chain, first-target match and final status are preserved. Public checks
do not prove private server or CDN rules are all represented in the SQL.

4. Supplement with known homepage interactions:
  .\.venv\Scripts\python.exe scripts/capture_interactions.py

Saves menu, search-popup and FAQ states under nalk-public-archive/interactions/.
Use --profiles desktop to refresh only that profile. These are known selectors
from the current site, so redesigns may require updating them. No search or form
submission is performed. Errors appear in interactions/index.json.

5. Generate/update the human-readable review and route/SEO evidence:
  .\.venv\Scripts\python.exe scripts/build_migration_review.py

Open migration-review/review.html. It links the full-resolution screenshots,
evidence inventories and technical references. Rerun after capture finishes;
its coverage counts reflect the generation time. It also generates route_manifest,
seo_observations, resource_failures and contact_links CSV files.

6. Verify the completed archive:
  .\.venv\Scripts\python.exe scripts/verify_archive.py

Checks every source SHA-256, rendered HTML file and PNG chunk CRC, checkpoint/CSV
totals, seed coverage and sitemap coverage. Writes archive_verification.json.
Run this after capture finishes. It checks file integrity, not pixel-level design
fidelity or unknown URLs absent from the discovery sources.

Regression checks:
  .\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_migration_tools.py -v

No original backup, production site, DNS, hosting, or Sanity dataset is modified.
The workspace .gitignore excludes private source backups and large public captures.
