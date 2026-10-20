"""Generate small, public-only proof inputs from the preserved migration evidence.

Requires only Python's standard library and the existing SQL reader. Never changes evidence.
Use --check to verify committed inputs without writing them.
"""
import argparse
import gzip
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_backup import insert_statements, sql_rows

IDS = {
    "R-91d9b62648d713d4": ("marketing", "en"),
    "R-56afdad51c5c96c4": ("marketing", "ar"),
    "R-fbbead80b209e23c": ("article", "en"),
    "R-4cd90575d3ca57e7": ("archive", "en"),
    "R-5d7c48759714228a": ("archive", "en"),
    "R-d5fcda349535d138": ("profile", "en"),
    "R-a0ac0f2631af30d8": ("marketing", "en"),
}


def sha(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


class Paragraphs(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.current = None
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        if tag == "p":
            self.current = []

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag == "p" and self.current is not None:
            text = re.sub(r"\s+", " ", "".join(self.current)).strip()
            if len(text) >= 60 and text not in self.paragraphs:
                self.paragraphs.append(text)
            self.current = None


def fixtures():
    register = json.loads((ROOT / "docs/registers/routes.json").read_text(encoding="utf-8"))
    pages = []
    for route in register["routes"]:
        if route["id"] not in IDS:
            continue
        kind, locale = IDS[route["id"]]
        record_path = (ROOT / "docs/registers" / route["baseline"]["page_record"]).resolve()
        record = json.loads(record_path.read_text(encoding="utf-8"))
        html_path = ROOT / "nalk-public-archive" / record["source"]["html"]
        metadata = record["source"]["metadata"]
        parser = Paragraphs()
        parser.feed(html_path.read_text(encoding="utf-8"))
        # Only the Article node is used for this proof; organization/schema cleanup is later work.
        schemas = []
        if kind == "article":
            for raw in metadata["json_ld"]:
                schema = json.loads(raw)
                for node in schema.get("@graph", [schema]):
                    types = node.get("@type", [])
                    if isinstance(types, str):
                        types = [types]
                    if set(types) & {"Article", "BlogPosting"}:
                        schemas.append({"@context": "https://schema.org", **node})
        pages.append({
            "id": route["id"], "sourceRouteId": route["id"],
            "path": unquote(route["observed"]["path"]), "kind": kind,
            "locale": locale, "status": "published",
            "seo": {"title": metadata["title"], "description": metadata["description"] or None,
                    "canonical": metadata["canonical"] or None, "robots": metadata["robots"] or None,
                    "googlebot": metadata["googlebot"] or None, "social": metadata["social"], "jsonLd": schemas},
            "content": {"heading": next(iter(metadata["h1"]), metadata["title"]),
                        **({"articleId": "wordpress-post-59034"} if kind == "article" else {}),
                        "paragraphs": parser.paragraphs[:3] or [metadata["description"] or metadata["title"]]},
            "provenance": {"sourceHtml": html_path.relative_to(ROOT).as_posix(),
                           "sourceSha256": sha(html_path),
                           "pageRecord": record_path.relative_to(ROOT).as_posix(),
                           "pageRecordSha256": sha(record_path), "excerpt": True,
                           "headingFallback": not bool(metadata["h1"])},
        })
    assert len(pages) == 7
    return {"schemaVersion": 1, "baselineId": register["baseline_id"], "pages": pages}


def matching_settings():
    backup = ROOT / "nalksolutions.com_wordpress_backup"
    sql_path = next(backup.glob("*.gz"))
    saved = None
    with gzip.open(sql_path, "rt", encoding="utf-8", errors="strict") as stream:
        for statement in insert_statements(stream):
            if statement.startswith("INSERT INTO `wp_options`"):
                for row in sql_rows(statement):
                    if row[1] == "redirection_options":
                        saved = row[2]
    assert saved is not None
    assert 's:10:"flag_query";s:5:"exact"' in saved
    assert 's:9:"flag_case";b:1;' in saved
    assert 's:13:"flag_trailing";b:1;' in saved
    assert 's:10:"flag_regex";b:0;' in saved
    raw_path = ROOT / "migration-review/redirect_rules.json"
    rows = json.loads(raw_path.read_text(encoding="utf-8"))
    for row in rows:
        if row["table"] == "wp_rank_math_redirections":
            assert 's:6:"ignore";s:0:""' in row["sources"]
        else:
            assert row.get("match_data") is None and row.get("regex") == "0"
    plugins = next(p for p in backup.glob("*-plugins.zip") if not p.name.endswith("-mu-plugins.zip"))
    names = ["plugins/seo-by-rank-math/includes/modules/redirections/class-redirection.php",
             "plugins/seo-by-rank-math/includes/modules/redirections/class-db.php",
             "plugins/redirection/includes/url/class-source-flags.php",
             "plugins/redirection/includes/url/class-path.php",
             "plugins/redirection/includes/url/class-query.php"]
    with zipfile.ZipFile(plugins) as archive:
        source_hashes = {name: hashlib.sha256(archive.read(name)).hexdigest() for name in names}
    return {"schemaVersion": 1, "provenance": {
        "sqlFile": sql_path.relative_to(ROOT).as_posix(), "sqlSha256": sha(sql_path),
        "exportFile": raw_path.relative_to(ROOT).as_posix(), "exportSha256": sha(raw_path),
        "pluginSourceSha256": source_hashes,
    }, "plugins": {
        "wp_rank_math_redirections": {"plugin": "rank-math", "ignoreCase": False, "ignoreTrailingSlash": True, "query": "exact"},
        "wp_redirection_items": {"plugin": "redirection", "ignoreCase": True, "ignoreTrailingSlash": True, "query": "exact"},
    }}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    outputs = {"src/content/fixtures/pages.json": fixtures(),
               "tooling/sources/legacy-match-settings.json": matching_settings()}
    for relative, value in outputs.items():
        path = ROOT / relative
        text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
        if args.check:
            if path.read_text(encoding="utf-8") != text:
                raise SystemExit(f"Stale generated reference input: {relative}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8", newline="\n")
    print(json.dumps({"passed": True, "mode": "check" if args.check else "generate", "pages": 7, "matchingSettings": "recovered"}))


if __name__ == "__main__":
    main()
