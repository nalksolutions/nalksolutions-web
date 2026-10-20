"""Publish only the homepage's referenced images and fonts, with immutable provenance."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import contextlib
import zipfile

from PIL import Image
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src/content/home/assets.generated.json"
ROLES = {
    "logo": "2025/10/Nalk-solution-1-e1760980726789.png",
    "footerLogo": "2025/10/23-e1760999812942.png",
    "heroFrame": "2025/09/71-home-2-background-1.webp",
    "hero": "2025/09/71-home-2-1.webp",
    "intro": "2025/09/71-home-2-background-2.webp",
    "ring": "2025/09/71-home-2-2-1024x1024.webp",
    "benefits": "2025/09/71-home-2-3.webp",
    "testimonials": "2025/09/71-home-2-background-4.webp",
    "videoPoster": "2025/09/71-home-1-8.webp",
    "stats": "2025/09/71-home-2-background-5.webp",
    "cta": "2025/09/71-home-2-background-6.webp",
    "footer": "2025/10/71-home-2-footer-background.webp",
    "socialImage": "2026/02/cropped-Nalk-logo.png",
}


def main(check):
    if check:
        recorded = json.loads(TARGET.read_text(encoding="utf-8"))
        expected_roles = {key: "/wp-content/uploads/" + value for key, value in ROLES.items()}
        if recorded["roles"] != expected_roles:
            raise ValueError("Asset role drift")
        with contextlib.ExitStack() as stack:
            archives = {}
            for item in recorded["images"] + recorded["fonts"]:
                file = ROOT / "public" / item["path"].lstrip("/")
                data = file.read_bytes()
                if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
                    raise ValueError(f"Asset bytes changed: {item['path']}")
                if "sourceArchive" in item:
                    name = item["sourceArchive"]
                    if name not in archives:
                        archives[name] = stack.enter_context(zipfile.ZipFile(ROOT / "nalksolutions.com_wordpress_backup" / name))
                    if archives[name].read(item["sourceMember"]) != data:
                        raise ValueError(f"Backup asset differs: {item['path']}")
                if "width" in item:
                    with Image.open(file) as image:
                        if image.size != (item["width"], item["height"]):
                            raise ValueError(f"Asset dimensions changed: {item['path']}")
        print(f"Verified {len(recorded['images'])} images and {len(recorded['fonts'])} font/license files against committed hashes and backup bytes")
        return
    manifest = json.loads((ROOT / "tmp/chunk2-reference/manifest.json").read_text(encoding="utf-8"))
    content = json.loads((ROOT / "src/content/home/home.generated.json").read_text(encoding="utf-8"))
    roles = {key: "/wp-content/uploads/" + value for key, value in ROLES.items()}
    soup = BeautifulSoup((ROOT / "tmp/chunk2-reference/desktop.html").read_text(encoding="utf-8"), "html.parser")
    # Preserve the entire original client-logo sequence, without WordPress carousel machinery.
    logos = list(dict.fromkeys(image["src"].replace("https://nalksolutions.com", "") for image in soup.select('[data-id="6da7140"] img')))
    paths = set(roles.values()) | set(logos) | {feature["image"] for feature in content["features"]}
    images = []
    for public_path in sorted(paths):
        source = next((row for row in manifest["publication"] if row["path"] == public_path), None)
        if source is None:
            raise ValueError(f"Recover missing asset first: {public_path}")
        file = ROOT / "public" / public_path.lstrip("/")
        if hashlib.sha256(file.read_bytes()).hexdigest() != source["sha256"]:
            raise ValueError(f"Changed asset: {public_path}")
        with Image.open(file) as image:
            width, height = image.size
        images.append({**source, "width": width, "height": height})
    fonts = json.loads((ROOT / "tooling/sources/home-fonts.json").read_text())
    demo = next(row for url, row in manifest["assets"].items() if url.endswith("cmsmasters-demo-icons.woff"))
    font_path = "/fonts/cmsmasters-demo-icons.woff"
    shutil.copyfile(ROOT / demo["file"], ROOT / "public" / font_path.lstrip("/"))
    fonts.append({"path": font_path, "sha256": demo["sourceSha256"], "bytes": demo["bytes"], "sourceArchive": demo["sourceArchive"], "sourceMember": demo["sourceMember"]})
    for font in fonts:
        if hashlib.sha256((ROOT / "public" / font["path"].lstrip("/")).read_bytes()).hexdigest() != font["sha256"]:
            raise ValueError(f"Changed font/license: {font['path']}")
    result = json.dumps({"schemaVersion": 1, "roles": roles, "logos": logos, "images": images, "fonts": fonts}, ensure_ascii=False, indent=2) + "\n"
    TARGET.write_text(result, encoding="utf-8", newline="\n")
    # Remove only exact files recovered by this tool's companion, never arbitrary directories.
    for row in manifest["publication"]:
        if row["path"] not in paths:
            file = (ROOT / "public" / row["path"].lstrip("/")).resolve()
            if not file.is_relative_to((ROOT / "public/wp-content/uploads").resolve()):
                raise ValueError("Unexpected cleanup path")
            file.unlink(missing_ok=True)
    print(f"Verified {len(images)} images and {len(fonts)} font/license files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    main(parser.parse_args().check)
