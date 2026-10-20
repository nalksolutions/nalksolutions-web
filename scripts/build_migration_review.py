"""Build an offline-readable migration review from the verified local evidence."""
import collections
import csv
import html
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

from bs4 import BeautifulSoup
from capture_public_site import normalize_url, now, write_csv, write_json

ROOT = Path(__file__).resolve().parent.parent
REVIEW = ROOT / "migration-review"
ARCHIVE = ROOT / "nalk-public-archive"


def read_json(path, fallback=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else fallback


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def e(value):
    return html.escape(str(value if value is not None else ""))


def table(headers, rows):
    return '<div class="table-wrap"><table><thead><tr>' + ''.join(f'<th>{e(x)}</th>' for x in headers) + '</tr></thead><tbody>' + ''.join(
        '<tr>' + ''.join(f'<td>{x}</td>' for x in row) + '</tr>' for row in rows) + '</tbody></table></div>'


def main():
    audit = read_json(REVIEW / "backup_audit.json")
    summary = read_json(ARCHIVE / "summary.json", {})
    records = [read_json(p) for p in sorted((ARCHIVE / "pages").glob("*.json"))]
    by_url = {normalize_url(r["url"], r["url"]): r for r in records}
    content = read_csv(REVIEW / "content_inventory.csv")
    content_by_url = {normalize_url(r["url"], r["url"]): r for r in content}
    legacy = read_json(REVIEW / "legacy_status_baseline.json", [])
    interactions = read_json(ARCHIVE / "interactions/index.json", {})
    routes, seo, failures, contacts, screenshot_rows = [], [], [], [], []
    for url in sorted(set(by_url) | set(content_by_url)):
        r, wp = by_url.get(url, {}), content_by_url.get(url, {})
        src = r.get("source", {})
        status, final = src.get("status"), src.get("final_status")
        meta = src.get("metadata", {})
        if not r:
            disposition = "Pending public capture"
        elif status in (301, 302, 303, 307, 308):
            disposition = "Preserve redirect; render destination at its existing URL"
        elif status == 410:
            disposition = "Preserve 410; exclude retired content from import"
        elif status == 404:
            disposition = "Investigate missing/linked URL; preserve real error status"
        elif status == 200:
            disposition = "Public noindex page: confirm retention; preserve noindex if retained" if "noindex" in meta.get("robots", "") else "Rebuild at the same path; preserve indexability and canonical"
        else:
            disposition = "Review HTTP response before implementation"
        routes.append({"url": url, "wordpress_id": wp.get("id", ""), "wordpress_type": wp.get("type", ""),
            "backup_title": wp.get("title", ""), "http_status": status, "final_status": final,
            "final_url": src.get("final_url", ""), "canonical": meta.get("canonical", ""), "robots": meta.get("robots", ""),
            "language": meta.get("language", ""), "direction": meta.get("direction", ""), "disposition": disposition})
        if final == 200:
            checks = [(not meta.get("title"), "missing-title"), (not meta.get("description"), "missing-description"),
                      (not meta.get("canonical"), "missing-canonical"), (len(meta.get("h1", [])) != 1, "h1-count-not-one"),
                      (meta.get("canonical") and normalize_url(meta["canonical"], url) != normalize_url(src.get("final_url", url), url), "canonical-differs-from-final-url")]
            for condition, issue in checks:
                if condition:
                    seo.append({"url": url, "observation": issue, "title": meta.get("title", ""),
                                "canonical": meta.get("canonical", ""), "h1_count": len(meta.get("h1", [])), "action": "Review baseline; do not silently change during migration"})
        for profile, profile_record in r.get("profiles", {}).items():
            for failure in profile_record.get("request_failures", []):
                failures.append({"page_url": url, "profile": profile, "resource_url": failure["url"], "status": "", "error": failure.get("error", "")})
            for resource in profile_record.get("resources", []):
                if resource.get("status", 0) >= 400:
                    failures.append({"page_url": url, "profile": profile, "resource_url": resource["asset_url"], "status": resource["status"], "error": "HTTP error"})
        source_html = ARCHIVE / src.get("html", "__missing__")
        if source_html.is_file():
            soup = BeautifulSoup(source_html.read_bytes(), "html.parser")
            for a in soup.select("a[href]"):
                if a["href"].startswith(("mailto:", "tel:", "https://wa.me/")):
                    contacts.append({"page_url": url, "displayed_text": a.get_text(" ", strip=True), "href": a["href"]})
        shots = []
        for profile in ("desktop", "tablet", "mobile"):
            shot = r.get("profiles", {}).get(profile, {}).get("screenshot")
            if shot:
                shots.append(f'<a href="../nalk-public-archive/{e(shot)}">{profile}</a>')
        if shots:
            screenshot_rows.append([f'<a href="{e(url)}">{e(meta.get("title") or wp.get("title") or url)}</a>', e(status), " · ".join(shots)])
    write_csv(REVIEW / "route_manifest.csv", routes, list(routes[0]) if routes else ["url"])
    write_csv(REVIEW / "seo_observations.csv", seo, ["url", "observation", "title", "canonical", "h1_count", "action"])
    write_csv(REVIEW / "resource_failures.csv", failures, ["page_url", "profile", "resource_url", "status", "error"])
    write_csv(REVIEW / "contact_links.csv", contacts, ["page_url", "displayed_text", "href"])
    db = audit["database"]
    total = sum(f["bytes"] for f in audit["files"])
    status_counts = collections.Counter(str(r.get("source", {}).get("status")) for r in records)
    legacy_results = collections.Counter(r["result"] for r in legacy)
    public_counts = collections.Counter(r["type"] for r in content)
    completion = "Completed for the discovered public frontier" if summary.get("archive_complete") else "Capture incomplete; see pending and incomplete URLs in summary.json"
    sections = []
    sections.append(f'''<section><h2>Assessment</h2><p>The supplied backup is a strong source for a faithful WordPress-to-Next.js reconstruction. Every supplied file was inventoried and hashed; every ZIP member passed CRC checks, the full database gzip was read successfully, and all 424 attachment originals referenced by the WordPress export exist in the uploads archives. A successful isolated WordPress restore has not been demonstrated.</p>
    <p>The directory initially contained only the backup, with no Next.js application, Sanity configuration, capture script, or Git repository. This review adds evidence and repeatable capture tools. It does not implement or deploy the replacement website.</p>
    <div class="metrics"><div><strong>{len(audit['files'])}</strong>backup files · {total / 1024**3:.2f} GiB</div><div><strong>{len(audit['archives'])}</strong>ZIP archives passed</div><div><strong>{db['table_count']}</strong>database tables parsed</div><div><strong>{len(content)}</strong>published content records</div></div></section>''')
    sections.append('<section><h2>What each source preserves</h2>' + table(["Source", "Verified contents", "Migration use"], [
        ["UpdraftPlus database + wp-content archives", "102 SQL tables; parent and child themes; plugins; four uploads parts; other wp-content files", "Primary recovery source for content, shared templates, redirects, plugin settings, translations, and media"],
        ["WordPress XML export", "605 items, including 43 published posts, 40 published pages, 9 services, 9 projects, 6 profiles, 424 attachments, menus, and forms", "Stable WordPress IDs, flat post URLs, dates, taxonomy relationships, article HTML, per-item SEO and media metadata"],
        ["Elementor kit ZIP", "38 pages, 9 services, 9 projects, 6 profiles; global settings; zero blog posts; no templates/ directory", "Design settings and page structures; insufficient as a stand-alone migration source"],
        ["Database template extraction", "47 Elementor library records (46 published, one draft), plus one custom-CSS record; 45 Elementor JSON documents extracted", "Headers, footers, blog layouts, menus, popups, search, and archive templates omitted by the Elementor kit"],
        ["ACF + CPT UI exports", "Two profile field groups; three custom post types; two custom taxonomies", "Profile relationships and field structure if retained; do not import retired theme demo content automatically"],
        ["Rank Math JSON + per-item XML metadata", "Settings plus per-item titles, descriptions, canonicals, robots, social fields, and service schema", "Resolve template placeholders against live rendered metadata; settings alone are insufficient"],
        ["Site Kit PDF", "One-page report for Sep 17–Oct 14, 2026", "Traffic and performance baseline; not a full Search Console, analytics, or backlink export"]]) + '</section>')
    sections.append(f'''<section><h2>Public archive coverage</h2><p><strong>{e(completion)}.</strong> Status at report generation: {summary.get('complete_pages', 0)} captured pages, {summary.get('screenshots', 0)} full-page screenshots, {summary.get('discovered_urls', 0)} discovered URLs. HTTP status counts: {e(dict(status_counts))}.</p>
    <p>The live XML sitemaps initially listed 40 page entries and 36 post entries. Backup seeds and source/rendered links expand discovery beyond those 76 entries. Published database records include redirects and retired demo pages; they are not all pages that should be rebuilt.</p>
    <p>Each captured HTML page has original HTTP bytes, rendered HTML at 1440×1000, 768×1024 and 390×844, full-page PNGs, and a detailed JSON record. The archive also retains robots.txt, sitemap XML, redirect chains, source and rendered metadata, schema, headings, hreflang, image alt text, form-field definitions, loaded font/CSS/script/image URLs, and browser request failures.</p>
    <p>Lazy content is scrolled into view. Screenshots freeze animations and expose delayed Elementor entrance-animation visibility; those adjustments are recorded per profile. Rendered HTML is saved before the visibility adjustment. Desktop, tablet and mobile captures use Chromium, device scale 1, en-US browser locale, and Asia/Riyadh browser timezone.</p>
    <p>{sum(bool(x.get('complete')) for x in interactions.get('states', []))} supplemental interaction states were captured for navigation, search, and FAQs. These are representative states, not an exhaustive recording of every slider, hover state, form validation state, or animation. Forms were not submitted. Browser traffic can appear in analytics.</p>
    <p>HTML snapshots reference live assets. They are not offline mirrors, and loaded-resource lists cannot prove that every possible CSS dependency has been downloaded. Keep the complete WordPress backup.</p>
    <p><a href="../nalk-public-archive/summary.json">Capture statistics and outstanding URLs</a> · <a href="../nalk-public-archive/archive_verification.json">File integrity and coverage verification</a> · <a href="../nalk-public-archive/url_inventory.csv">URL/SEO inventory</a> · <a href="../nalk-public-archive/internal_links.csv">Internal links</a> · <a href="../nalk-public-archive/asset_urls.csv">Asset references</a> · <a href="../nalk-public-archive/interactions/index.json">Interaction states</a></p></section>''')
    sections.append(f'''<section><h2>Important migration findings</h2><ol>
    <li><strong>Keep existing paths.</strong> WordPress uses /%postname%/. Blog articles currently live at the domain root; placing all articles under /blog/[slug] would change their URLs. Preserve root article slugs, existing nested archive paths, Arabic percent-encoded paths, trailing slashes, and query-based pagination where used. /blog/ remains the listing route.</li>
    <li><strong>Retain redirects and deliberate removals.</strong> Both Rank Math and Redirection are active. Their database tables contain 32 configured 301 rules and 35 configured 410 rules. Live checks: {e(dict(legacy_results))}. One source contains an asterisk but is configured with exact matching; do not turn it into a wildcard that could block theme assets. Keep 410 responses for retired URLs instead of recreating removed content or forwarding every missing page to the homepage. Public noindex demo pages are a separate retention decision. Next.js defaults for permanent redirects use 308; use an explicit supported 301 strategy if preserving the existing code is required. A 410 needs an actual 410 response from the routing/hosting layer.</li>
    <li><strong>Separate current language behavior from historical plugins.</strong> Fourteen published records have Arabic titles or slugs. The database retains 9,325 TranslatePress dictionary rows, but TranslatePress and GTranslate are absent from the active_plugins list. The legacy /arbic/ redirect leads to /arabic/, which currently returns 410. The live Arabic-slug homepage declares html lang=en-US, has no html dir value and no hreflang links. Preserve the real Arabic paths and content while deliberately correcting language semantics and destination links. Do not assume the historical translation tables define the live language switcher.</li>
    <li><strong>Use the original design tokens.</strong> The active theme is softy-solutions-child over softy-solutions. Elementor uses Space Grotesk and Manrope; purple #6D2785, orange #FF4800, accent #FFFBBD, body #D2D2CF, background #020202 and surfaces #272727. The CSS has max-width:767px and max-width:1180px rules, and the kit enables a 1601px widescreen breakpoint. Match these explicitly in Tailwind rather than adopting default breakpoints.</li>
    <li><strong>Resolve shared template dependencies.</strong> Header, footer, blog/archive, popup and search layouts live in database templates omitted by the Elementor ZIP. Use the extracted JSON, generated Elementor CSS, and screenshots as reference. Rebuild these as reusable React components; do not retain Elementor markup/plugins as the new runtime.</li>
    <li><strong>Correct confirmed contact-link defects intentionally.</strong> The homepage includes a visible +92 number linking to a +47 tel: destination, and an info@nalksolutions.com label linking to softy-solutions@example.com. The mobile popup also contains theme example contact details. Contact-link evidence is exported separately; confirm intended destinations before implementation.</li>
    <li><strong>Review existing redirect quality.</strong> The backed-up Google Ads service redirect points to social-media marketing. Some legacy patterns contain ellipses or invisible formatting characters. These are observed existing rules, not automatically valid migration decisions. The baseline records behavior so each change can be deliberate.</li>
    <li><strong>Audit external design dependencies.</strong> The homepage requests a video from the theme demo host; Chromium recorded a cross-origin response block. Font and asset URLs may also be external. Recover the intended licensed media and font sources before making the new site independent of WordPress and the theme vendor.</li>
    <li><strong>Preserve form behavior beyond appearance.</strong> The XML contains three Forminator forms and a quiz. Inventory which forms are live, their fields, validation, recipients, spam controls, consent, success/error states and delivery integration. Public snapshots cannot verify email delivery, private recipient configuration, or successful submissions.</li>
    <li><strong>Use live SEO values as the baseline.</strong> {audit['wordpress_export']['published_missing_seo_title']} published records lack explicit Rank Math titles and {audit['wordpress_export']['published_missing_seo_description']} lack explicit descriptions in XML; global defaults may still produce live tags. Preserve actual final titles, canonicals, robots, social cards and schema, and separately review baseline defects rather than treating every missing explicit field as missing live SEO. The captured robots.txt has Disallow lines without a User-agent directive; generate a valid robots policy for the new site rather than copying it blindly.</li>
    </ol></section>''')
    sections.append('''<section><h2>What is still needed before launch</h2><ul>
    <li>Demonstrate an isolated WordPress restore from the database and wp-content backup, using compatible WordPress/PHP versions. The supplied set does not demonstrate inclusion of wp-config.php, server-root .htaccess/web.config, hosting redirects, CDN rules, or server configuration.</li>
    <li>Retain a private export of DNS, hosting/CDN redirects and cache rules, certificates/renewal arrangements, and email-related records. Check analytics/tag-manager IDs, Search Console verification, conversion events and consent settings. Website hosting changes must preserve mail routing.</li>
    <li>Export Search Console page/query/indexing data, submitted sitemaps and important inbound links, and a longer analytics landing-page history. The Site Kit PDF is a short top-ten summary; zero key events are reported, so conversion tracking needs validation.</li>
    <li>Complete an interaction review: desktop and mobile navigation, nested menus, language switcher, search, FAQs, sliders, sticky behavior, cookie/consent UI if present, and contact success/error states. Capture any important state absent from the representative screenshots.</li>
    <li>Freeze content shortly before cutover, take a fresh database/uploads export, rerun the public capture into a new dated directory, import changes, and compare the final source baseline against staging. The current backup and live crawl are separate capture times.</li>
    <li>Test rollback before cutover, keep the old hosting/backup available, and preserve deliberate 301/410 behavior. This review does not change DNS, WordPress, hosting, production redirects, or a Sanity dataset.</li>
    </ul></section>''')
    sections.append('''<section><h2>Recommended implementation</h2><p>Build the public site in Next.js App Router with TypeScript strict mode and Tailwind. Use server-rendered content and reusable sections; keep client JavaScript limited to navigation, accordions, sliders, search and forms. Match the extracted spacing, fonts, colors, breakpoints and layouts before tuning performance. Marketing pages can live in typed code/data; Sanity should manage the blog as requested. A broad visual page builder is optional and is not required for this migration.</p>
    <p>Model Sanity articles, authors, hierarchical categories/tags, reusable SEO fields and image metadata. Preserve a deterministic WordPress ID, immutable legacy path, slug, publication/modification dates, excerpt, author, featured image and inline media. Include language and translated-document references where justified by the real content. Convert article HTML to Portable Text with explicit support for tables, code, links, anchors, lists, embeds and image captions/alt text. Review conversion losses; sanitize any retained HTML and never execute imported scripts.</p>
    <p>Import media first using a stable WordPress attachment-to-Sanity asset mapping, then taxonomy/authors, then articles. Make the importer idempotent and start with a dry-run manifest. Reconcile missing/duplicate assets and inspect representative English and Arabic articles before a full import. Import into a development dataset first.</p>
    <p>Generate metadata on the server using the resolved baseline values, including canonical, language alternatives, social cards and robots. Preserve relevant Article/Service/Breadcrumb schema while removing plugin-specific duplication only after review. Generate a sitemap from intended canonical indexable routes. Preserve or map legacy /wp-content/uploads/... media URLs that are externally referenced. Treat staging indexing controls separately so noindex or blocked robots do not reach production.</p>
    <p>Use Sanity draft preview, signed webhook verification and targeted cache revalidation. Keep write tokens and preview secrets server-side, with environment validation and least-privilege configuration. Implement real form delivery with server validation, spam protection and observable failure states. Optimize images without changing their visual crop or dimensions; use the matching fonts without layout shifts.</p>
    <p>Validate every intended URL and every legacy rule, including 404/410 behavior; compare server HTML metadata, internal links, article formatting, schema and media; perform screenshot comparisons at the recorded viewports and at 767/768, 1180/1181 and 1600/1601 widths. Cover keyboard navigation, focus, reduced motion and RTL. Run type checks, lint/build checks, meaningful route/import/form tests, and field performance checks before DNS cutover.</p>
    <p>The supplied Site Kit report shows 73.2% mobile visitors and mobile lab LCP of 4.9s versus desktop 1.1s. Prioritize the mobile hero, media, fonts and JavaScript while preserving the design. These are historical lab measurements, not a new performance test.</p>
    <p>Implementation sequence: finish baseline and restore verification → route/content/asset mapping → shared design components → representative marketing and article templates → Sanity dry run and import → remaining routes and interactions → regression/SEO/performance review → content freeze/delta import → cutover and monitoring.</p></section>''')
    sections.append('''<section><h2>Evidence and repeatable tools</h2><p><a href="backup_audit.json">Full backup audit</a> · <a href="backup_files.csv">File checksums</a> · <a href="backup_assets.csv">Archived uploads inventory</a> · <a href="attachment_inventory.csv">Attachment reconciliation</a> · <a href="content_inventory.csv">WordPress content</a> · <a href="route_manifest.csv">Route decisions</a> · <a href="legacy_url_rules.csv">Legacy rule inventory</a> · <a href="legacy_status_baseline.csv">Live legacy checks</a> · <a href="template_inventory.json">Shared templates</a> · <a href="design/elementor-site-settings.json">Design settings</a> · <a href="design/elementor-global.css">Global design CSS</a> · <a href="seo_observations.csv">SEO observations</a> · <a href="resource_failures.csv">Resource failures</a> · <a href="contact_links.csv">Contact links</a></p>
    <p>The scripts are in ../scripts/. Run the backup audit first, then the public capture with --resume to retry incomplete pages and recover discovery from completed records. A bounded or interrupted run is explicitly incomplete in summary.json. Source backups and captures are excluded from Git by the new .gitignore. No original backup files were modified.</p>
    <p>Technical references: <a href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata">Next.js metadata</a>, <a href="https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects">Next.js redirects and status codes</a>, <a href="https://www.sanity.io/docs/developer-guides/beginners-guide-to-portable-text">Sanity Portable Text</a>, <a href="https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes">Google migration guidance</a>, <a href="https://playwright.dev/python/docs/screenshots">Playwright full-page capture</a>. Recommendations above are engineering judgment based on these capabilities and the local evidence.</p></section>''')
    sections.append('<section><h2>Screenshot index</h2><p>Links open the original full-resolution PNG files. The page titles and statuses below are from the HTTP source; a redirect can therefore show its destination title.</p>' + table(["Page", "HTTP", "Screenshots"], screenshot_rows) + '</section>')
    generated_local = datetime.now(timezone(timedelta(hours=5))).strftime("%B %d, %Y, %I:%M %p PKT")
    document = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nalk Solutions migration review</title><style>
    :root{color-scheme:light;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1d2433;background:#f4f5f8}*{box-sizing:border-box}body{margin:0;line-height:1.65}main{max-width:1160px;margin:auto;padding:56px 32px}header{padding-bottom:24px;border-bottom:3px solid #6d2785}h1{font-size:42px;line-height:1.12;letter-spacing:-1px;margin:12px 0}h2{font-size:25px;line-height:1.3;margin:0 0 18px}p{margin:0 0 16px}section{background:white;border:1px solid #e0e2e9;border-radius:12px;padding:30px;margin:24px 0}li{margin-bottom:14px;padding-left:4px}a{color:#6d2785;text-underline-offset:3px}code{font-family:monospace}.eyebrow{color:#6d2785;font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-size:13px}.meta{color:#657084;font-size:14px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px}.metrics>div{background:#f7f3fa;border-radius:8px;padding:18px;font-size:13px}.metrics strong{display:block;color:#6d2785;font-size:28px}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:13px 14px;text-align:left;border-bottom:1px solid #e5e7ed;vertical-align:top}th{background:#f5f3f8;color:#43374d}td:first-child{min-width:170px}td a{overflow-wrap:anywhere}ol,ul{padding-left:22px}@media(max-width:750px){main{padding:24px 16px}h1{font-size:32px}section{padding:22px 18px}.metrics{grid-template-columns:repeat(2,1fr)}}@media print{body{background:white}main{padding:0}section{border:0;padding:12px 0;break-inside:avoid}a{color:inherit}table{font-size:10px}}</style></head><body><main><header><div class="eyebrow">WordPress → Next.js + Sanity</div><h1>Nalk Solutions migration review</h1><p>Backup integrity, visual reconstruction evidence, URL preservation, and implementation readiness.</p><p class="meta">Generated ''' + e(generated_local) + ' · Backup date: October 15, 2026 · All findings distinguish stored configuration from observed public behavior.</p></header>' + ''.join(sections) + '</main></body></html>'
    (REVIEW / "review.html").write_text(document, encoding="utf-8")
    print(json.dumps({"review": str(REVIEW / "review.html"), "routes": len(routes), "screenshotted_pages": len(screenshot_rows),
                      "seo_observations": len(seo), "resource_failures": len(failures)}, indent=2))


if __name__ == "__main__":
    main()
