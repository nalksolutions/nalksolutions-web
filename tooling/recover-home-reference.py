"""Recover allowlisted homepage reference assets; never extract executable WordPress files.

Original HTML/CSS lives only under ignored tmp for browser measurement. Runtime receives only
referenced image/icon assets, with source archive/member hashes. Requires the existing bs4.
"""
import contextlib
import hashlib
import json
import mimetypes
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
import zipfile
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BACKUP = ROOT / "nalksolutions.com_wordpress_backup"
OUT = ROOT / "tmp/chunk2-reference"
PUBLIC = ROOT / "public"
ORIGIN = "https://nalksolutions.com"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif"}
REFERENCE_EXTENSIONS = IMAGE_EXTENSIONS | {".css", ".woff", ".woff2", ".ttf", ".eot"}
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", re.I)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def source_path(url):
    path = unquote(urlsplit(url).path)
    path = re.sub(r"/wp-content/cache/min/\d+/", "/", path)
    if "/wp-content/" in path:
        path = path.split("/wp-content/", 1)[1]
    else:
        path = path.lstrip("/")
    path = re.sub(r"^uploads/sites/\d+/", "uploads/", path)
    return path


def safe_svg(data, url):
    if b"<!DOCTYPE" in data.upper() or b"<!ENTITY" in data.upper():
        raise ValueError(f"SVG document entities in {url}")
    for node in ET.fromstring(data).iter():
        if node.tag.rsplit("}", 1)[-1] in {"script", "foreignObject", "iframe"}:
            raise ValueError(f"Executable SVG element in {url}")
        if any(name.rsplit("}", 1)[-1].lower().startswith("on") for name in node.attrib):
            raise ValueError(f"Executable SVG attribute in {url}")
        if any(value.strip().lower().startswith("javascript:") for value in node.attrib.values()):
            raise ValueError(f"Executable SVG destination in {url}")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "assets").mkdir(exist_ok=True)
    manifest = {"schemaVersion": 1, "baselineId": "nalk-wordpress-2026-10-15",
                "source": "nalk-public-archive/pages/home-91d9b62648d713d4.json",
                "assets": {}, "missing": [], "publication": []}
    pending = []
    seen = set()
    with contextlib.ExitStack() as stack:
        index = {}
        for file in sorted(BACKUP.glob("backup_*.zip")):
            archive = stack.enter_context(zipfile.ZipFile(file))
            for name in archive.namelist():
                if not name.endswith("/"):
                    index.setdefault(name, (file.name, archive, name))

        record = json.loads((ROOT / manifest["source"]).read_text(encoding="utf-8"))
        for profile in ["desktop", "tablet", "mobile"]:
            source = ROOT / "nalk-public-archive" / record["profiles"][profile]["rendered_html"]
            soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
            for node in soup.find_all(["script", "iframe"]):
                node.decompose()
            for node in soup.select('link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="preload"]'):
                node.decompose()
            for node in soup.find_all():
                for attr in list(node.attrs):
                    if attr.lower().startswith("on"):
                        del node[attr]
                for attr in ["src", "href", "poster"]:
                    value = node.get(attr)
                    if value and Path(urlsplit(value).path).suffix.lower() in REFERENCE_EXTENSIONS:
                        pending.append(urljoin(ORIGIN, value))
                if node.get("srcset"):
                    pending.extend(urljoin(ORIGIN, x.strip().split()[0]) for x in node["srcset"].split(",") if x.strip())
                for value in CSS_URL.findall(node.get("style", "")):
                    pending.append(urljoin(ORIGIN, value))
            for style in soup.find_all("style"):
                pending.extend(urljoin(ORIGIN, value) for value in CSS_URL.findall(style.get_text()))
            for meta in soup.select('meta[property="og:image"], meta[name="twitter:image"]'):
                pending.append(urljoin(ORIGIN, meta["content"]))
            # Same entrance-visibility adjustment as the historical screenshot capture.
            style = soup.new_tag("style")
            style.string = ".elementor-invisible{visibility:visible!important}"
            soup.head.append(style)
            (OUT / f"{profile}.html").write_text(str(soup), encoding="utf-8", newline="\n")

        while pending:
            url = pending.pop(0)
            if url.startswith(("data:", "#")):
                continue
            parsed = urlsplit(url)
            key = parsed.scheme + "://" + parsed.netloc + parsed.path
            if key in seen:
                continue
            seen.add(key)
            member = source_path(url)
            ext = Path(member).suffix.lower()
            if ext not in REFERENCE_EXTENSIONS:
                continue
            entry = index.get(member)
            if entry is None:
                manifest["missing"].append({"url": key, "candidate": member})
                continue
            archive_name, archive, name = entry
            data = archive.read(name)
            raw_hash = digest(data)
            content_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
            if ext == ".css":
                css = data.decode("utf-8-sig")
                native_url = ORIGIN + "/wp-content/" + member
                def replace(match):
                    value = match[1]
                    if value.startswith(("data:", "#")):
                        return match[0]
                    absolute = urljoin(native_url, value)
                    pending.append(absolute)
                    return 'url("' + absolute + '")'
                data = CSS_URL.sub(replace, css).encode()
                content_type = "text/css"
            file = OUT / "assets" / (digest(data)[:20] + ext)
            file.write_bytes(data)
            info = {"file": file.relative_to(ROOT).as_posix(), "contentType": content_type,
                    "sourceArchive": archive_name, "sourceMember": name,
                    "sourceSha256": raw_hash, "referenceSha256": digest(data), "bytes": len(data)}
            manifest["assets"][key] = info
            # The reference alias restores original relative stylesheet dependencies.
            manifest["assets"].setdefault(ORIGIN + "/wp-content/" + member, info)
            if ext in IMAGE_EXTENSIONS and member.startswith("uploads/") and "/fonts/" not in member:
                if ext == ".svg":
                    safe_svg(data, key)
                destination = PUBLIC / "wp-content" / member
                if not destination.resolve().is_relative_to(PUBLIC.resolve()):
                    raise ValueError("Asset destination escapes public root")
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(data)
                public_path = "/wp-content/" + member
                if not any(row["path"] == public_path for row in manifest["publication"]):
                    manifest["publication"].append({"path": public_path, "sha256": raw_hash,
                        "bytes": len(data), "sourceArchive": archive_name, "sourceMember": name})

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"referenceAssets": len(manifest["assets"]), "publishedImages": len(manifest["publication"]), "missing": manifest["missing"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
