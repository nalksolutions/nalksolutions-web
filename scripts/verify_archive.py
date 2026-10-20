"""Verify checkpoint coverage, source hashes, PNG containers and sitemap/seed coverage."""
import csv
import hashlib
import io
import json
import struct
import sys
import zlib
import xml.etree.ElementTree as ET
from pathlib import Path

from capture_public_site import normalize_url, now, write_json


def png_dimensions(path):
    with io.BytesIO(path.read_bytes()) as f:
        if f.read(8) != b"\x89PNG\r\n\x1a\n":
            raise ValueError("Invalid PNG signature")
        dimensions = None
        while True:
            header = f.read(8)
            if len(header) != 8:
                raise ValueError("Truncated PNG")
            size, kind = struct.unpack(">I4s", header)
            if size > 128 * 1024 * 1024:
                raise ValueError("Unexpected PNG chunk size")
            body, crc_bytes = f.read(size), f.read(4)
            if len(body) != size or len(crc_bytes) != 4:
                raise ValueError("Truncated PNG chunk")
            if zlib.crc32(kind + body) & 0xFFFFFFFF != struct.unpack(">I", crc_bytes)[0]:
                raise ValueError("PNG chunk CRC mismatch")
            if kind == b"IHDR":
                dimensions = struct.unpack(">II", body[:8])
            if kind == b"IEND":
                if f.read(1) or not dimensions or min(dimensions) < 1:
                    raise ValueError("Invalid PNG end or dimensions")
                return dimensions


def main():
    archive = Path("nalk-public-archive")
    summary = json.loads((archive / "summary.json").read_text(encoding="utf-8"))
    records = [json.loads(p.read_text(encoding="utf-8")) for p in (archive / "pages").glob("*.json")]
    print(f"Checking {len(records)} page checkpoints", flush=True)
    errors, pngs, sources, rendered = [], 0, 0, 0
    ids, urls = set(), set()
    for position, record in enumerate(records, 1):
        url = record["url"]
        if record["id"] in ids or url in urls:
            errors.append({"url": url, "error": "Duplicate checkpoint identity"})
        ids.add(record["id"])
        urls.add(url)
        if not record.get("capture_complete"):
            errors.append({"url": url, "error": "Incomplete checkpoint"})
        try:
            source = record["source"]
            raw = (archive / source["html"]).read_bytes()
            if hashlib.sha256(raw).hexdigest() != source["sha256"]:
                raise ValueError("Original source hash mismatch")
            sources += 1
            for profile in summary["profiles"]:
                data = record["profiles"][profile]
                (archive / data["rendered_html"]).read_text(encoding="utf-8")
                rendered += 1
                png_dimensions(archive / data["screenshot"])
                pngs += 1
        except Exception as exc:
            errors.append({"url": url, "error": str(exc)})
        if position % 25 == 0:
            print(f"Verified {position} pages / {pngs} PNGs", flush=True)
    with (archive / "url_inventory.csv").open(encoding="utf-8-sig", newline="") as f:
        inventory_urls = {r["url"] for r in csv.DictReader(f)}
    if inventory_urls != urls:
        errors.append({"error": "URL inventory does not match durable checkpoints"})
    missing_seeds, missing_sitemap = [], []
    seeds = Path("migration-review/public_seed_urls.txt")
    for url in seeds.read_text(encoding="utf-8").splitlines():
        normalized = normalize_url(url, summary["origin"])
        if normalized not in urls and normalized not in summary["skipped_urls"]:
            missing_seeds.append(normalized)
    sitemap_urls = set()
    for path in (archive / "discovery").glob("*.xml"):
        root = ET.parse(path).getroot()
        if root.tag.rsplit("}", 1)[-1] == "urlset":
            for el in root.findall("./{*}url/{*}loc"):
                sitemap_urls.add(normalize_url(el.text, summary["origin"]))
    missing_sitemap = sorted(sitemap_urls - urls - set(summary["skipped_urls"]))
    print("Checked sitemap and seed coverage", flush=True)
    if missing_seeds or missing_sitemap:
        errors.append({"error": "Uncaptured seed/sitemap URLs", "seeds": missing_seeds, "sitemap": missing_sitemap})
    if not summary.get("archive_complete") or summary.get("pending_urls") or summary.get("incomplete_urls"):
        errors.append({"error": "Capture summary does not declare a completed discovered frontier"})
    if len(records) != summary["complete_pages"] or pngs != summary["screenshots"]:
        errors.append({"error": "Summary/checkpoint totals differ"})
    result = {"verified_at": now(), "passed": not errors, "page_checkpoints": len(records), "original_source_hashes": sources,
              "rendered_html_files": rendered, "png_files_crc_checked": pngs, "sitemap_page_urls": len(sitemap_urls),
              "backup_seed_urls": len(seeds.read_text(encoding="utf-8").splitlines()),
              "archive_bytes": sum(p.stat().st_size for p in archive.rglob("*") if p.is_file()),
              "errors": errors,
              "limits": ["PNG CRC checks verify file containers, not pixel-level design fidelity.",
                         "Coverage is checked against captured discovery sources, not Search Console or private server logs."]}
    write_json(archive / "archive_verification.json", result)
    print(json.dumps(result, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
