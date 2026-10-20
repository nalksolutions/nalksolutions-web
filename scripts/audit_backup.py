"""Inspect a WordPress migration backup without executing PHP or importing its SQL."""
from __future__ import annotations

import argparse
import collections
import csv
import gzip
import hashlib
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

NS = {"wp": "http://wordpress.org/export/1.2/", "content": "http://purl.org/rss/1.0/modules/content/",
      "excerpt": "http://wordpress.org/export/1.2/excerpt/"}
PUBLIC = {"page", "post", "services", "projects", "cmsms_profile"}


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def save_csv(path, rows, fields=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        fields = fields or (list(rows[0]) if rows else [])
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for row in rows:
            # Prevent CSV formula evaluation when reviewing untrusted site text in Excel.
            w.writerow({k: ("'" + v if isinstance(v, str) and v.startswith(("=", "+", "-", "@")) else v)
                        for k, v in row.items()})


def sql_rows(text):
    """Parse mysqldump VALUES, including quoted commas, escapes and multi-row INSERTs."""
    row, value, quoted, escaped, in_row = [], [], False, False, False
    escapes = {"0": "\0", "n": "\n", "r": "\r", "t": "\t", "Z": "\x1a"}
    was_quoted = False
    for c in text:
        if not in_row:
            if c == "(":
                row, value, in_row, was_quoted = [], [], True, False
            continue
        if quoted:
            if escaped:
                value.append(escapes.get(c, c))
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == "'":
                quoted = False
            else:
                value.append(c)
        elif c == "'":
            if not was_quoted:
                value = []
            quoted, was_quoted = True, True
        elif c in ",)":
            token = "".join(value) if was_quoted else "".join(value).strip()
            row.append(None if not was_quoted and token == "NULL" else token)
            value, was_quoted = [], False
            if c == ")":
                yield row
                in_row = False
        elif not was_quoted:
            value.append(c)


def insert_statements(lines):
    """UpdraftPlus writes multi-row INSERT statements across physical lines."""
    chunks = []
    for line in lines:
        if line.startswith("INSERT INTO "):
            if chunks:
                raise ValueError("Unterminated INSERT in database dump")
            chunks = [line]
        elif chunks:
            chunks.append(line)
        if chunks and line.rstrip().endswith(";"):
            yield "".join(chunks)
            chunks = []
    if chunks:
        raise ValueError("Database dump ended during INSERT")


def inspect_database(path, out):
    tables, counts, options, redirects = {}, collections.Counter(), {}, []
    post_counts, db_posts, selected_meta = collections.Counter(), {}, []
    current = None
    translations = collections.Counter()
    wanted = {"siteurl", "home", "template", "stylesheet", "permalink_structure", "page_on_front",
              "page_for_posts", "show_on_front", "category_base", "tag_base", "blog_public",
              "active_plugins", "trp_settings", "elementor_active_kit", "timezone_string", "gmt_offset"}
    with gzip.open(path, "rt", encoding="utf-8", errors="strict") as f:
        for line in f:
            m = re.match(r"CREATE TABLE(?: IF NOT EXISTS)? `([^`]+)`", line)
            if m:
                current = m[1]
                tables[current] = []
                continue
            if current:
                col = re.match(r"\s+`([^`]+)`", line)
                if col:
                    tables[current].append(col[1])
                if line.startswith(")"):
                    current = None
    with gzip.open(path, "rt", encoding="utf-8", errors="strict") as f:
        for statement in insert_statements(f):
            m = re.match(r"INSERT INTO `([^`]+)`(?:\s*\([^;]*?\))? VALUES\s*(.*)", statement, re.S)
            if not m:
                continue
            table = m[1]
            for values in sql_rows(m[2]):
                counts[table] += 1
                row = dict(zip(tables.get(table, []), values))
                if table.endswith("_options") and row.get("option_name") in wanted:
                    options[row["option_name"]] = row.get("option_value")
                elif table.endswith("_posts"):
                    typ, status = row.get("post_type"), row.get("post_status")
                    post_counts[f"{typ}:{status}"] += 1
                    db_posts[row.get("ID")] = {k: row.get(k) for k in
                        ["ID", "post_type", "post_status", "post_title", "post_name", "post_parent"]}
                elif table.endswith("_postmeta"):
                    if row.get("meta_key") in {"_elementor_data", "_elementor_template_type", "_elementor_page_settings"}:
                        selected_meta.append((row.get("post_id"), row.get("meta_key"), row.get("meta_value")))
                elif table.endswith("_redirection_items") or table.endswith("_rank_math_redirections"):
                    # Public redirect rules only; exclude logs and visitor information.
                    redirects.append({"table": table, **{k: row.get(k) for k in
                        ["id", "url", "sources", "action_data", "url_to", "action_type", "action_code",
                         "header_code", "status", "regex", "match_type", "match_data"] if k in row}})
                elif "_trp_dictionary_" in table:
                    translations[table] += 1
    # PHP settings may include license keys; retain only public language configuration.
    raw_trp = options.pop("trp_settings", "") or ""
    options["translatepress_language_codes"] = sorted(set(re.findall(r"\b[a-z]{2}_[A-Z]{2}\b", raw_trp)))
    options["active_plugins"] = re.findall(r's:\d+:"([^\"]+\.php)"', options.get("active_plugins", ""))
    template_posts = [p for p in db_posts.values() if p["post_type"] in
                      {"elementor_library", "cmsms_theme_template", "custom_css", "wp_template", "wp_template_part"}]
    template_ids = {p["ID"] for p in template_posts}
    for ident, key, value in selected_meta:
        if ident in template_ids and key == "_elementor_data":
            try:
                save_json(out / "templates" / f"{ident}.json", json.loads(value))
            except (json.JSONDecodeError, TypeError):
                pass
    save_json(out / "redirect_rules.json", redirects)
    save_json(out / "template_inventory.json", template_posts)
    save_json(out / "database_public_settings.json", options)
    return {"gzip_integrity": "passed", "table_count": len(tables), "tables": tables,
            "row_counts": dict(counts), "post_counts": dict(post_counts), "public_settings": options,
            "redirect_rule_count": len(redirects), "translation_rows": dict(translations),
            "template_post_count": len(template_posts)}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--backup", type=Path, default=Path("nalksolutions.com_wordpress_backup"))
    ap.add_argument("--output", type=Path, default=Path("migration-review"))
    args = ap.parse_args()
    out = args.output
    out.mkdir(parents=True, exist_ok=True)
    report = {"audited_at": datetime.now(timezone.utc).isoformat(), "backup_directory": str(args.backup),
              "files": [], "archives": [], "limitations": [
                  "Archive CRC and gzip checks do not prove a successful WordPress restore.",
                  "The database is parsed read-only; PHP and SQL are never executed.",
                  "No hosting control-panel, DNS, mailbox, wp-config.php or server-root backup is assumed."]}
    asset_rows, upload_names = [], set()
    for path in sorted(args.backup.iterdir()):
        if not path.is_file():
            continue
        print(f"Checking {path.name}", flush=True)
        digest = hashlib.sha256()
        with path.open("rb") as f:
            for block in iter(lambda: f.read(1024 * 1024), b""):
                digest.update(block)
        report["files"].append({"file": path.name, "bytes": path.stat().st_size, "sha256": digest.hexdigest()})
        if path.suffix == ".zip":
            with zipfile.ZipFile(path) as z:
                bad = z.testzip()
                files = [i for i in z.infolist() if not i.is_dir()]
                report["archives"].append({"file": path.name, "file_count": len(files),
                    "uncompressed_bytes": sum(i.file_size for i in files), "crc_integrity": "passed" if bad is None else "FAILED",
                    "first_bad_entry": bad, "top_directories": dict(collections.Counter(i.filename.split('/')[0] for i in files))})
                for i in files:
                    if i.filename == "uploads/elementor/css/post-7.css":
                        (out / "design").mkdir(parents=True, exist_ok=True)
                        (out / "design" / "elementor-global.css").write_bytes(z.read(i))
                    if i.filename.startswith("uploads/"):
                        upload_names.add(i.filename)
                        asset_rows.append({"archive": path.name, "path": i.filename, "bytes": i.file_size,
                                           "extension": Path(i.filename).suffix.lower()})
                if "site-settings.json" in z.namelist():
                    settings = json.loads(z.read("site-settings.json"))
                    manifest = json.loads(z.read("manifest.json"))
                    save_json(out / "design" / "elementor-site-settings.json", settings)
                    report["elementor_export"] = {"elementor_version": manifest.get("elementor_version"),
                        "content_counts": {k: len(v) for k, v in manifest.get("content", {}).items()},
                        "templates_in_zip": [n for n in z.namelist() if n.startswith("templates/")],
                        "plugins": manifest.get("plugins", [])}
        elif path.name.endswith("db.gz"):
            report["database"] = inspect_database(path, out)
    save_csv(out / "backup_files.csv", report["files"])
    save_csv(out / "backup_assets.csv", asset_rows)
    report["uploads"] = {"files": len(asset_rows), "unique_paths": len(upload_names),
                          "extension_counts": dict(collections.Counter(a["extension"] for a in asset_rows))}
    wxr = next(args.backup.glob("*.xml"))
    root = ET.parse(wxr).getroot()
    items = root.findall("./channel/item")
    counts, metadata, rows, seeds, attachment_rows = collections.Counter(), collections.Counter(), [], set(), []
    missing_attachments = []
    for item in items:
        def wp(key):
            return item.findtext(f"wp:{key}", default="", namespaces=NS)
        typ, status, url = wp("post_type"), wp("status"), item.findtext("link", "")
        counts[f"{typ}:{status}"] += 1
        meta = {m.findtext("wp:meta_key", namespaces=NS): m.findtext("wp:meta_value", namespaces=NS)
                for m in item.findall("wp:postmeta", NS)}
        metadata.update(meta.keys())
        content = item.findtext("content:encoded", "", NS)
        if typ == "custom_css":
            (out / "design").mkdir(parents=True, exist_ok=True)
            (out / "design" / "wordpress-custom.css").write_text(content, encoding="utf-8")
        if typ == "attachment":
            asset_url = wp("attachment_url")
            asset_path = "uploads/" + unquote(urlsplit(asset_url).path.split("/uploads/", 1)[-1])
            exists = asset_path in upload_names
            attachment_rows.append({"id": wp("post_id"), "url": asset_url, "backup_path": asset_path,
                                    "found_in_uploads": exists, "alt_text": meta.get("_wp_attachment_image_alt", "")})
            if not exists:
                missing_attachments.append(asset_url)
        if typ in PUBLIC and status == "publish":
            seeds.add(url)
            rows.append({"id": wp("post_id"), "type": typ, "status": status, "url": url,
                "slug": wp("post_name"), "parent_id": wp("post_parent"), "title": item.findtext("title", ""),
                "published_gmt": wp("post_date_gmt"), "modified_gmt": wp("post_modified_gmt"),
                "seo_title": meta.get("rank_math_title", ""), "seo_description": meta.get("rank_math_description", ""),
                "canonical_override": meta.get("rank_math_canonical_url", ""), "robots": meta.get("rank_math_robots", ""),
                "featured_image_id": meta.get("_thumbnail_id", ""), "content_characters": len(content),
                "elementor_data": bool(meta.get("_elementor_data")),
                "arabic_title_or_slug": bool(re.search(r"[\u0600-\u06ff]", item.findtext("title", "") + unquote(url))),
                "taxonomy_terms": json.dumps([{**c.attrib, "name": c.text} for c in item.findall("category")], ensure_ascii=False)})
    report["wordpress_export"] = {"items": len(items), "type_status_counts": dict(counts), "metadata_key_counts": dict(metadata),
        "public_content_count": len(rows), "arabic_title_or_slug_count": sum(r["arabic_title_or_slug"] for r in rows),
        "published_missing_seo_title": sum(not r["seo_title"] for r in rows),
        "published_missing_seo_description": sum(not r["seo_description"] for r in rows),
        "attachments": len(attachment_rows), "attachment_originals_missing_from_uploads": missing_attachments}
    save_csv(out / "content_inventory.csv", rows)
    save_csv(out / "attachment_inventory.csv", attachment_rows)
    (out / "public_seed_urls.txt").write_text("\n".join(sorted(seeds)) + "\n", encoding="utf-8")
    acf = json.loads((args.backup / "acf-export-2026-10-15.json").read_text(encoding="utf-8-sig"))
    report["acf"] = [{"title": g.get("title"), "location": g.get("location"),
        "fields": [{k: f.get(k) for k in ["name", "label", "type", "required"]} for f in g.get("fields", [])]} for g in acf]
    rank = json.loads(next(args.backup.glob("rank-math*.json")).read_text(encoding="utf-8-sig"))
    report["rank_math"] = {"sections": list(rank), "redirections_setting_keys": list(rank.get("redirections", {})),
                           "note": "Settings export is not a complete per-post SEO or redirect-rule export; use WXR and database too."}
    try:
        from pypdf import PdfReader
        pdf = next(args.backup.glob("*.pdf"))
        reader = PdfReader(pdf)
        text = "\n\n".join(p.extract_text() or "" for p in reader.pages)
        (out / "site-kit-extracted.txt").write_text(text, encoding="utf-8")
        report["site_kit"] = {"file": pdf.name, "pages": len(reader.pages), "text_extracted": True,
                              "note": "PDF text is supplementary. Original PDF remains the visual source."}
    except (ImportError, StopIteration) as e:
        report["site_kit"] = {"text_extracted": False, "error": str(e)}
    save_json(out / "backup_audit.json", report)
    print(json.dumps({"files": len(report["files"]), "archives": len(report["archives"]),
        "public_content": len(rows), "missing_attachment_originals": len(missing_attachments),
        "database_tables": report.get("database", {}).get("table_count"), "output": str(out)}, indent=2))


if __name__ == "__main__":
    main()
