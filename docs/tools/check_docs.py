"""Validate documentation links, frozen evidence and working-register consistency."""
import argparse
import collections
import csv
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

DOCS = Path(__file__).resolve().parents[1]
ROOT = DOCS.parent
STATUSES = {"not_started", "in_progress", "blocked", "ready_for_review", "accepted"}
AREAS = {"implementation", "visual", "content", "seo", "behavior", "acceptance"}


def load(name):
    return json.loads((DOCS / "registers" / name).read_text(encoding="utf-8"))


def check_progress(record, label, errors):
    if record.get("status") not in STATUSES:
        errors.append(f"{label}: unknown status")
    if not isinstance(record.get("evidence"), list):
        errors.append(f"{label}: evidence must be a list")
    if record.get("status") == "accepted" and (not record.get("evidence") or not record.get("reviewer")):
        errors.append(f"{label}: accepted without evidence and reviewer")
    if record.get("status") == "blocked" and not record.get("blocker"):
        errors.append(f"{label}: blocked without a stated dependency")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--with-evidence", action="store_true", help="Require external baseline files and verify frozen fingerprints")
    args = parser.parse_args()
    errors, deferred = [], set()
    baseline, routes_data, legacy_data = load("baseline.json"), load("routes.json"), load("legacy-rules.json")
    routes, rules = routes_data["routes"], legacy_data["rules"]
    for data in (routes_data, legacy_data):
        if data["baseline_id"] != baseline["baseline_id"]:
            errors.append("Register baseline identity differs")
    if len(routes) != baseline["counts"]["routes"] or len(rules) != baseline["counts"]["legacy_rules"]:
        errors.append("Register count differs from frozen baseline")
    ids, urls = set(), set()
    for route in routes:
        ident = route["id"]
        if ident in ids or route["url"] in urls:
            errors.append(f"{ident}: duplicate route identity or URL")
        ids.add(ident)
        urls.add(route["url"])
        if set(route["progress"]) != AREAS:
            errors.append(f"{ident}: missing/unknown acceptance area")
        for area, progress in route["progress"].items():
            check_progress(progress, f"{ident}/{area}", errors)
        if route["progress"]["acceptance"]["status"] == "accepted" and any(
            p["status"] != "accepted" for p in route["progress"].values()
        ):
            errors.append(f"{ident}: final acceptance precedes required areas")
        if route["progress"]["acceptance"]["status"] == "accepted" and not (
            route["plan"]["template_family_reviewed"] and route["plan"]["locale_reviewed"]
        ):
            errors.append(f"{ident}: final acceptance precedes template/locale review")
        if route["plan"]["expected_initial_status"] != route["observed"]["initial_status"] and not route["plan"]["decision_ids"]:
            errors.append(f"{ident}: status change has no decision")
        if set(route["baseline"]["screenshots"]) != {"desktop", "tablet", "mobile"}:
            errors.append(f"{ident}: missing baseline profile")
        paths = [route["baseline"]["page_record"], route["baseline"]["source_html"], *route["baseline"]["screenshots"].values()]
        if args.with_evidence:
            for relative in paths:
                target = (DOCS / "registers" / relative).resolve()
                if not target.is_relative_to(ROOT) or not target.is_file():
                    errors.append(f"{ident}: missing or invalid baseline file {relative}")
    expected_statuses = baseline["counts"]["initial_statuses"]
    if dict(collections.Counter(str(r["observed"]["initial_status"]) for r in routes)) != expected_statuses:
        errors.append("Observed route status totals differ from frozen baseline")
    noindex = sum(r["observed"]["initial_status"] == 200 and "noindex" in r["observed"]["robots"] for r in routes)
    if noindex != baseline["counts"]["noindex_200_routes"]:
        errors.append("Observed noindex count differs")
    rule_ids = set()
    for rule in rules:
        if rule["id"] in rule_ids:
            errors.append("Duplicate legacy rule ID")
        rule_ids.add(rule["id"])
        check_progress(rule["implementation"], rule["id"] + "/implementation", errors)
        check_progress(rule["verification"], rule["id"] + "/verification", errors)
    if dict(collections.Counter(str(r["observed"]["expected_status"]) for r in rules)) != baseline["counts"]["legacy_statuses"]:
        errors.append("Legacy configured-status totals differ")
    md_files = sorted(DOCS.rglob("*.md"))
    for path in md_files:
        text = path.read_text(encoding="utf-8")
        if text.count("```") % 2:
            errors.append(f"{path.relative_to(DOCS)}: unclosed code fence")
        for href in re.findall(r"(?<!!)\[[^\]]*\]\(([^)]+)\)", text):
            href = href.strip().strip("<>")
            if urlsplit(href).scheme or href.startswith("#"):
                continue
            target = (path.parent / unquote(href.split("#", 1)[0])).resolve()
            if target.exists():
                continue
            if target.is_relative_to(DOCS) or args.with_evidence:
                errors.append(f"{path.relative_to(DOCS)}: missing link {href}")
            else:
                deferred.add(href)
    if args.with_evidence:
        for entry in baseline["source_files"]:
            target = (ROOT / entry["path"]).resolve()
            if not target.is_relative_to(ROOT) or not target.is_file():
                errors.append("Missing frozen source: " + entry["path"])
            elif hashlib.sha256(target.read_bytes()).hexdigest() != entry["sha256"]:
                errors.append("Frozen source changed: " + entry["path"])
        source_manifest = ROOT / "migration-review/route_manifest.csv"
        if source_manifest.is_file():
            with source_manifest.open(encoding="utf-8-sig", newline="") as stream:
                observed_routes = {r["url"]: r for r in csv.DictReader(stream)}
            if set(observed_routes) != urls:
                errors.append("Working route URL set differs from frozen source manifest")
            mapping = {"initial_status": "http_status", "final_status": "final_status", "final_url": "final_url",
                       "canonical": "canonical", "robots": "robots", "html_language": "language", "html_direction": "direction",
                       "wordpress_id": "wordpress_id", "wordpress_type": "wordpress_type"}
            for route in routes:
                source = observed_routes.get(route["url"], {})
                for field, original in mapping.items():
                    if str(route["observed"].get(field) or "") != str(source.get(original) or ""):
                        errors.append(f"{route['id']}: frozen observed field changed: {field}")
        source_rules = ROOT / "migration-review/legacy_status_baseline.json"
        if source_rules.is_file():
            originals = {(r["rule_table"], str(r["rule_id"])): r for r in json.loads(source_rules.read_text(encoding="utf-8"))}
            for rule in rules:
                observed = rule["observed"]
                if observed != originals.get((observed["rule_table"], str(observed["rule_id"]))):
                    errors.append(rule["id"] + ": frozen observed legacy rule changed")
    print(json.dumps({"passed": not errors, "mode": "with_evidence" if args.with_evidence else "documentation_only",
        "markdown_files": len(md_files), "routes": len(routes), "legacy_rules": len(rules),
        "accepted_replacement_routes": sum(r["progress"]["acceptance"]["status"] == "accepted" for r in routes),
        "deferred_external_evidence_links": len(deferred), "errors": errors}, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
