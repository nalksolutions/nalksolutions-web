"""Read-only HTTP verification of legacy redirects and retired URLs from the backup."""
import argparse
import asyncio
import collections
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from playwright.async_api import async_playwright
from capture_public_site import AGENT, normalize_url, now, write_csv, write_json


def rules_from_backup(path, origin):
    rules = []
    for row in json.loads(path.read_text(encoding="utf-8")):
        if row.get("status") not in {"active", "enabled"}:
            continue
        if "sources" in row:
            sources = re.findall(r's:7:"pattern";s:\d+:"(.*?)";s:10:"comparison";s:\d+:"(.*?)";', row["sources"], re.S)
            pairs = [(pattern, comparison) for pattern, comparison in sources]
        else:
            pairs = [(row.get("url", ""), "regex" if row.get("regex") == "1" else "exact")]
        for source, kind in pairs:
            source_url = urljoin(origin + "/", source.lstrip("/"))
            rules.append({"rule_table": row["table"], "rule_id": row["id"], "source_pattern": source,
                "source_url": normalize_url(source_url, origin), "match_type": kind,
                "expected_status": int(row.get("header_code") or row.get("action_code") or 0),
                "target_url": row.get("url_to") or row.get("action_data") or "",
                "pattern_warning": "Non-exact rule needs representative URL tests" if kind != "exact" else
                                   ("Asterisk in an exact-match rule; do not reinterpret as a wildcard" if "*" in source else
                                   ("Contains ellipsis or invisible formatting characters" if "…" in source or "\u200e" in source or "\u200f" in source else ""))})
    return rules


async def run(args):
    origin = args.origin.rstrip("/")
    rules = rules_from_backup(args.rules, origin)
    write_csv(args.output / "legacy_url_rules.csv", rules, ["rule_table", "rule_id", "source_pattern", "source_url", "match_type", "expected_status", "target_url", "pattern_warning"])
    gate = asyncio.Semaphore(3)
    async with async_playwright() as p:
        http = await p.request.new_context(user_agent=AGENT)
        async def probe(rule):
            result = {**rule, "checked_at": now(), "redirect_chain": []}
            if rule["match_type"] != "exact":
                return {**result, "result": "needs representative URL", "actual_status": "", "final_url": ""}
            try:
                async with gate:
                    url = rule["source_url"]
                    for _ in range(12):
                        if urlsplit(url).hostname not in {urlsplit(origin).hostname, "www." + urlsplit(origin).hostname}:
                            break
                        response = await http.get(url, timeout=30000, max_redirects=0)
                        status, headers = response.status, response.headers
                        await response.dispose()
                        result.setdefault("actual_status", status)
                        result["final_status"] = status
                        result["final_url"] = url
                        if status in {301, 302, 303, 307, 308} and headers.get("location"):
                            target = urljoin(url, headers["location"])
                            result["redirect_chain"].append({"url": url, "status": status, "target": target})
                            url = target
                            result["final_url"] = url
                        else:
                            break
                    result["result"] = "matches status" if result["actual_status"] == rule["expected_status"] else "STATUS MISMATCH"
                    if rule["target_url"] and result.get("redirect_chain"):
                        first_target = result["redirect_chain"][0]["target"]
                        result["first_target_matches"] = normalize_url(first_target, origin) == normalize_url(rule["target_url"], origin)
                        if not result["first_target_matches"]:
                            result["result"] += "; TARGET MISMATCH"
            except Exception as e:
                result["result"] = "request failed"
                result["error"] = str(e)[:1000]
            return result
        results = await asyncio.gather(*(probe(rule) for rule in rules))
        await http.dispose()
    write_json(args.output / "legacy_status_baseline.json", results)
    write_csv(args.output / "legacy_status_baseline.csv", results,
              ["rule_table", "rule_id", "source_pattern", "source_url", "expected_status", "actual_status", "target_url",
               "final_status", "final_url", "first_target_matches", "result", "redirect_chain", "pattern_warning", "error", "checked_at"])
    print(json.dumps({"rules": len(rules), "results": dict(collections.Counter(r["result"] for r in results))}, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--origin", default="https://nalksolutions.com")
    ap.add_argument("--rules", type=Path, default=Path("migration-review/redirect_rules.json"))
    ap.add_argument("--output", type=Path, default=Path("migration-review"))
    args = ap.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
