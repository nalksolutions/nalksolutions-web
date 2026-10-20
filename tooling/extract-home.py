"""Derive homepage text, links and provenance from frozen HTML, without runtime markup."""
import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "nalk-public-archive/html/rendered/home-91d9b62648d713d4--desktop.html"
TARGET = ROOT / "src/content/home/home.generated.json"


def href(value):
    url = urlsplit(value)
    if url.netloc == "nalksolutions.com":
        return url.path + ("?" + url.query if url.query else "") + ("#" + url.fragment if url.fragment else "")
    if url.scheme not in {"", "https", "http", "mailto", "tel"}:
        raise ValueError(f"Unsupported link: {value}")
    return value


def extract():
    raw = (ROOT / SOURCE).read_bytes()
    soup = BeautifulSoup(raw, "html.parser")

    def widget(identity):
        value = soup.select_one(f'[data-id="{identity}"]')
        if value is None:
            raise ValueError(f"Missing source widget: {identity}")
        return value

    def text(identity):
        return " ".join(widget(identity).get_text(" ", strip=True).split())

    def button(identity):
        node = widget(identity).select_one("a[href]")
        return {"label": node.get_text(" ", strip=True), "href": href(node["href"])}

    def card(identity):
        node = widget(identity)
        return {"sourceId": identity,
                "title": node.select_one(".elementor-widget-cmsmasters-featured-box__title").get_text(" ", strip=True),
                "description": node.select_one(".elementor-widget-cmsmasters-featured-box__description").get_text(" ", strip=True),
                "href": href(node.select_one("a[href]")["href"])}

    def rich(node):
        result = []
        for item in node.descendants:
            if not isinstance(item, NavigableString):
                continue
            token = {"text": str(item), "href": None}
            anchor = item.find_parent("a")
            if anchor:
                token["href"] = href(anchor["href"])
            result.append(token)
        return result

    features = []
    for ids in [("9a70885", "4a6c2b1", "29cc8b3", "774cf6d", "d82a1ed"),
                ("ec1ff6b", "a33cceb", "a40251d", "9bffff3", "ae7c0eb"),
                ("e13c424", "0c04181", "c224fe5", "ebbefc4", "9414a2c")]:
        features.append({"label": text(ids[0]), "title": text(ids[1]), "description": text(ids[2]),
                         "link": button(ids[3]), "image": href(widget(ids[4]).select_one("img")["src"])})
    reviews = []
    for identity in ["e925188", "187bcc8", "089b3bd", "1c6e845", "68e13b4", "9f47491", "f0cf1c6"]:
        node = widget(identity)
        reviews.append({"sourceId": identity,
                        "quote": node.select_one(".cmsmasters-testimonial__text").get_text(" ", strip=True),
                        "author": node.select_one(".cmsmasters-testimonial__author-name").get_text(" ", strip=True)})
    toggles = json.loads(widget("9253472")["data-settings"])["toggles"]
    lightbox_action = unquote(widget("4713dd1")["href"])
    lightbox_parameters = parse_qs(lightbox_action.removeprefix("#elementor-action:"))
    if lightbox_parameters.get("action") != ["lightbox"]:
        raise ValueError("Expected the source testimonial lightbox action")
    lightbox = json.loads(base64.b64decode(lightbox_parameters["settings"][0], validate=True))
    video_url = urlsplit(lightbox["url"])
    video_id = video_url.path.removeprefix("/embed/")
    if (lightbox["type"] != "video" or lightbox["videoType"] != "youtube"
            or video_url.scheme != "https" or video_url.netloc != "www.youtube.com"
            or video_url.path != f"/embed/{video_id}" or not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id)):
        raise ValueError("Unexpected source testimonial video")
    social_icons = []
    for node in soup.select('[data-elementor-id="81"] a.elementor-social-icon'):
        svg = node.select_one('svg')
        social_icons.append({"href": node["href"], "label": node.select_one('.elementor-screen-only').get_text(strip=True).replace('Facebook-f', 'Facebook').replace('X-twitter', 'X').replace('Linkedin', 'LinkedIn'), "viewBox": svg["viewbox"], "paths": [path["d"] for path in svg.select('path')]})
    return {"source": SOURCE, "sourceSha256": hashlib.sha256(raw).hexdigest(), "socialIcons": social_icons,
            "hero": {"heading": text("016a266"), "primary": button("60dfcd6"), "secondary": button("e77ee67")},
            "intro": text("405b0e3"), "tagline": text("49d2916"),
            "about": [rich(p) for p in widget("b833838").select("p")], "aboutLink": button("2f14a6f"),
            "services": [card(identity) for identity in ["3a1cb45", "d43e0c5", "089f545", "e5f392b"]],
            "features": features,
            "benefits": [card(identity) for identity in ["03265fb", "7d9c842", "adcbc57", "28d1c70"]],
            "reviews": reviews,
            "testimonialVideo": {"sourceId": "4713dd1", "embedUrl": lightbox["url"],
                                 "watchUrl": f"https://www.youtube.com/watch?v={video_id}"},
            "jsonLd": [json.loads(node.string) for node in soup.select('script[type="application/ld+json"]') if node.string],
            "faq": [{"question": item["toggle_title"], "answer": BeautifulSoup(item["toggle_content"], "html.parser").get_text(" ", strip=True)} for item in toggles],
            "hiddenSection": {"sourceId": "9e48ffa", "reason": "Hidden by source at all captured breakpoints; retained in source evidence, excluded from visible composition."}}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content = extract()
    icons = content.pop('socialIcons')
    for target, data in [(TARGET, content), (TARGET.with_name('social.generated.json'), icons)]:
        result = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        if args.check:
            if not target.exists() or target.read_text(encoding="utf-8") != result:
                raise SystemExit(f"Homepage content differs from frozen source: {target.name}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(result, encoding="utf-8", newline="\n")
    print("Homepage source content verified" if args.check else "Homepage content extracted")
