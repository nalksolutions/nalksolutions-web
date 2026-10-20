"""Archive public HTML, SEO, links, assets and three responsive screenshots.

Run with --help. This is a reference archive, not a self-contained offline mirror.
Only public GET navigation is used; no credentials or form submissions are supplied.
"""
from __future__ import annotations

import argparse
import asyncio
import collections
import csv
import hashlib
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, quote, unquote, urlencode, urljoin, urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

PROFILES = {
    "desktop": {"viewport": {"width": 1440, "height": 1000}, "device_scale_factor": 1},
    "tablet": {"viewport": {"width": 768, "height": 1024}, "device_scale_factor": 1, "is_mobile": True, "has_touch": True},
    "mobile": {"viewport": {"width": 390, "height": 844}, "device_scale_factor": 1, "is_mobile": True, "has_touch": True},
}
AGENT = "NalkPublicArchive/1.0 (+owner-requested migration baseline)"
CAPTURE_VERSION = 2
SKIP_PATH = re.compile(r"/(?:wp-admin|wp-login\.php|wp-json|xmlrpc\.php|wp-cron\.php|wp-comments-post\.php|cart|checkout|my-account)(?:/|$)", re.I)
ASSET_EXT = re.compile(r"\.(?:jpe?g|png|gif|webp|avif|svg|ico|pdf|zip|gz|mp[34]|mov|webm|woff2?|ttf|eot|css|js|json|xml|txt|docx?|xlsx?)(?:$)", re.I)
QUERY_KEYS = {"page", "paged", "lang", "p", "page_id", "s"}
SAFE_HEADERS = {"content-type", "content-language", "x-robots-tag", "link", "location", "last-modified", "etag", "cache-control"}


def now():
    return datetime.now(timezone.utc).isoformat()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)


def write_csv(path, rows, fields):
    temp = path.with_suffix(".csv.tmp")
    with temp.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            data = {}
            for k in fields:
                value = row.get(k, "")
                if isinstance(value, (list, dict)):
                    value = json.dumps(value, ensure_ascii=False)
                if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
                    value = "'" + value
                data[k] = value
            w.writerow(data)
    temp.replace(path)


def normalize_url(value, base):
    try:
        u = urlsplit(urljoin(base, value.strip()))
        if u.scheme not in {"http", "https"} or u.username or u.password:
            return None
        host = u.hostname.lower()
        port = u.port
        netloc = host + (f":{port}" if port and port not in (80, 443) else "")
        # Decode only unreserved escapes. Keep encoded path separators and URL identity.
        path = quote(u.path or "/", safe="/%:@!$&'()*+,;=-._~")
        path = re.sub(r"%[0-9a-fA-F]{2}", lambda m: m[0].upper(), path)
        query = urlencode(sorted((k, v) for k, v in parse_qsl(u.query, keep_blank_values=True) if k in QUERY_KEYS))
        return urlunsplit((u.scheme.lower(), netloc, path, query, ""))
    except (ValueError, AttributeError):
        return None


def file_id(url):
    label = re.sub(r"[^a-z0-9-]", "-", unquote(urlsplit(url).path).lower()).strip("-")[:65] or "home"
    return f"{label}-{hashlib.sha256(url.encode()).hexdigest()[:16]}"


def parse_html(html, base):
    soup = BeautifulSoup(html, "html.parser")
    base_tag = soup.find("base", href=True)
    document_base = urljoin(base, base_tag["href"]) if base_tag else base
    def meta(name):
        tag = soup.find("meta", attrs={"name": re.compile(f"^{re.escape(name)}$", re.I)})
        return tag.get("content", "") if tag else ""
    canonical = soup.find("link", rel=lambda r: r and "canonical" in r)
    headings = [{"level": int(h.name[1]), "text": h.get_text(" ", strip=True)} for h in soup.find_all(re.compile(r"^h[1-6]$"))]
    links = []
    for a in soup.find_all(["a", "area"], href=True):
        href = urljoin(document_base, a["href"])
        if urlsplit(href).scheme in {"http", "https"}:
            links.append({"target_url": href, "anchor_text": a.get_text(" ", strip=True),
                          "rel": " ".join(a.get("rel", [])), "origin": "source"})
    assets = []
    for tag, attr, kind in [("img", "src", "image"), ("img", "data-src", "image"), ("script", "src", "script"),
                            ("link", "href", "link"), ("source", "src", "media"), ("video", "src", "video"),
                            ("video", "poster", "image"), ("audio", "src", "audio"), ("iframe", "src", "iframe")]:
        for el in soup.find_all(tag, attrs={attr: True}):
            if tag == "link" and not set(el.get("rel", [])) & {"stylesheet", "preload", "icon", "apple-touch-icon", "modulepreload"}:
                continue
            value = urljoin(document_base, el[attr])
            if urlsplit(value).scheme in {"http", "https"}:
                assets.append({"asset_url": value, "kind": kind, "origin": "source"})
    for el in soup.find_all(["img", "source"]):
        for attr in ("srcset", "data-srcset"):
            for entry in el.get(attr, "").split(","):
                if entry.strip() and not entry.strip().startswith("data:"):
                    assets.append({"asset_url": urljoin(document_base, entry.strip().split()[0]), "kind": "image-srcset", "origin": "source"})
    for style in [s.get_text() for s in soup.find_all("style")] + [s["style"] for s in soup.find_all(style=True)]:
        for match in re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", style):
            if not match.startswith("data:"):
                assets.append({"asset_url": urljoin(document_base, match), "kind": "css-url", "origin": "source"})
    return {"title": soup.title.get_text(" ", strip=True) if soup.title else "", "description": meta("description"),
            "canonical": urljoin(document_base, canonical["href"]) if canonical and canonical.get("href") else "",
            "robots": meta("robots"), "googlebot": meta("googlebot"),
            "language": soup.html.get("lang", "") if soup.html else "", "direction": soup.html.get("dir", "") if soup.html else "",
            "headings": headings, "h1": [h["text"] for h in headings if h["level"] == 1],
            "hreflang": [{"language": el.get("hreflang"), "url": urljoin(document_base, el["href"])} for el in soup.find_all("link", hreflang=True, href=True)],
            "social": [{"property": el.get("property") or el.get("name"), "content": el.get("content", "")} for el in soup.find_all("meta")
                       if str(el.get("property") or el.get("name", "")).startswith(("og:", "twitter:"))],
            "json_ld": [el.get_text() for el in soup.find_all("script", type="application/ld+json")],
            "images": [{"src": urljoin(document_base, el.get("src", "")), "alt": el.get("alt"), "width": el.get("width"), "height": el.get("height")} for el in soup.find_all("img")],
            "forms": [{"action": el.get("action", ""), "method": el.get("method", "get"),
                       "fields": [{"name": x.get("name", ""), "type": x.get("type", x.name), "required": x.has_attr("required")} for x in el.find_all(["input", "select", "textarea"])]} for el in soup.find_all("form")],
            "links": links, "assets": assets}


class Capture:
    def __init__(self, args):
        self.args, self.out = args, args.output
        self.origin = args.origin.rstrip("/")
        self.host = urlsplit(self.origin).hostname.lower()
        self.started = now()
        self.queue = asyncio.Queue()
        self.discovered, self.records, self.skipped = {}, {}, {}
        self.discovery_errors = []
        self.render_gate = asyncio.Semaphore(args.browser_pages)
        self.robot = RobotFileParser()
        self.robot.parse([])
        for sub in ["html/source", "html/rendered", "screenshots", "pages", "discovery"]:
            (self.out / sub).mkdir(parents=True, exist_ok=True)
        if args.resume:
            for path in (self.out / "pages").glob("*.json"):
                record = json.loads(path.read_text(encoding="utf-8"))
                if not self.internal(record["url"]):
                    raise ValueError("The resume directory contains captures for a different origin")
                if record.get("capture_version") != CAPTURE_VERSION or not (self.out / record.get("source", {}).get("html", "missing")).is_file() or any(
                    not record.get("profiles", {}).get(profile, {}).get("complete")
                    or not (self.out / record["profiles"][profile].get("screenshot", "missing")).is_file()
                    or not (self.out / record["profiles"][profile].get("rendered_html", "missing")).is_file()
                    for profile in args.profiles
                ):
                    record["capture_complete"] = False
                self.records[record["url"]] = record

    def internal(self, url):
        return urlsplit(url).hostname in {self.host, "www." + self.host.removeprefix("www."), self.host.removeprefix("www.")}

    def add(self, value, source):
        url = normalize_url(value, self.origin + "/")
        if not url or not self.internal(url):
            return
        path = unquote(urlsplit(url).path)
        if SKIP_PATH.search(path) or ASSET_EXT.search(path) or re.search(r"/(?:feed|embed|trackback)/?$", path):
            self.skipped[url] = "non-page or operational path"
            return
        if not self.robot.can_fetch(AGENT, url):
            self.skipped[url] = "robots.txt disallows capture"
            return
        if url in self.discovered:
            self.discovered[url].add(source)
            return
        self.discovered[url] = {source}
        prior = self.records.get(url)
        if prior and prior.get("capture_complete"):
            return
        self.queue.put_nowait(url)

    async def fetch(self, url):
        chain = []
        for _ in range(12):
            if not self.internal(url):
                return {"status": chain[0]["status"], "final_status": None, "final_url": url, "redirects": chain, "headers": {}, "body": b"", "external_redirect": True}
            for attempt in range(self.args.retries + 1):
                try:
                    response = await self.http.get(url, timeout=self.args.timeout, max_redirects=0)
                except Exception:
                    if attempt == self.args.retries:
                        raise
                    await asyncio.sleep(2 ** (attempt + 1))
                    continue
                status, headers = response.status, response.headers
                body = await response.body()
                await response.dispose()
                if status not in {429, 500, 502, 503, 504} or attempt == self.args.retries:
                    break
                retry_after = headers.get("retry-after", "")
                await asyncio.sleep(min(float(retry_after), 30) if retry_after.isdigit() else 2 ** (attempt + 1))
            safe = {k: v for k, v in headers.items() if k in SAFE_HEADERS}
            if status in {301, 302, 303, 307, 308} and headers.get("location"):
                target = urljoin(url, headers["location"])
                chain.append({"url": url, "status": status, "location": target})
                url = target
            else:
                return {"status": chain[0]["status"] if chain else status, "final_status": status, "final_url": url,
                        "headers": safe, "redirects": chain, "body": body}
        raise RuntimeError("Redirect limit exceeded")

    async def discovery(self):
        try:
            robots = await self.fetch(self.origin + "/robots.txt")
            (self.out / "discovery/robots.txt").write_bytes(robots["body"])
            text = robots["body"].decode("utf-8", "replace")
            if robots["final_status"] == 200:
                self.robot.parse(text.splitlines())
            else:
                self.discovery_errors.append({"url": self.origin + "/robots.txt", "status": robots["final_status"]})
            maps = re.findall(r"(?im)^sitemap:\s*(\S+)", text)
        except Exception as e:
            self.discovery_errors.append({"url": self.origin + "/robots.txt", "error": str(e)})
            maps = []
        maps += [self.origin + "/sitemap_index.xml", self.origin + "/wp-sitemap.xml", self.origin + "/sitemap.xml"]
        self.add(self.origin + "/", "root")
        if self.args.seeds and self.args.seeds.exists():
            for url in self.args.seeds.read_text(encoding="utf-8-sig").splitlines():
                if url.strip() and not url.startswith("#"):
                    self.add(url.strip(), "backup-seed")
        seen = set()
        while maps and len(seen) < 100:
            url = maps.pop(0)
            if url in seen or not self.internal(url):
                continue
            seen.add(url)
            try:
                result = await self.fetch(url)
                if result["final_status"] != 200:
                    self.discovery_errors.append({"url": url, "status": result["final_status"]})
                    continue
                (self.out / "discovery" / (file_id(url) + ".xml")).write_bytes(result["body"])
                root = ET.fromstring(result["body"])
                urls = [el.text.strip() for el in root.iter() if el.tag.rsplit("}", 1)[-1] == "loc" and el.text]
                if root.tag.rsplit("}", 1)[-1] == "sitemapindex":
                    maps.extend(urls)
                elif root.tag.rsplit("}", 1)[-1] == "urlset":
                    for target in urls:
                        self.add(target, url)
                else:
                    raise ValueError("Response is not a sitemap")
            except Exception as e:
                self.discovery_errors.append({"url": url, "error": str(e)})
        # Reconstruct the frontier from completed records when resuming.
        for record in list(self.records.values()):
            self.add(record["url"], "resume")
            for link in record.get("links", []):
                self.add(link["target_url"], record["url"])
        print(f"Discovered {len(self.discovered)} URLs before link crawling", flush=True)

    async def render(self, browser, url, ident, profile):
        context = await browser.new_context(**PROFILES[profile], locale="en-US", timezone_id="Asia/Riyadh")
        page = await context.new_page()
        page.set_default_timeout(self.args.timeout)
        errors, failures, resources = [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)[:1000]))
        page.on("requestfailed", lambda request: failures.append({"url": request.url, "error": request.failure}))
        page.on("response", lambda response: resources.append({"asset_url": response.url, "kind": response.request.resource_type,
                                                                "status": response.status, "origin": profile}))
        result = {"viewport": PROFILES[profile], "errors": errors, "request_failures": failures, "warnings": []}
        try:
            try:
                response = await page.goto(url, wait_until="domcontentloaded", timeout=self.args.timeout)
            except Exception as e:
                # Preserve an already-loaded page after a timeout, but mark this profile incomplete.
                result["warnings"].append("Navigation: " + str(e)[:500])
                response = None
                result["navigation_error"] = str(e)[:500]
                if page.url == "about:blank":
                    raise
            result["browser_status"] = response.status if response else None
            try:
                await page.wait_for_load_state("networkidle", timeout=5000)
            except Exception:
                result["warnings"].append("Network did not become idle within 5 seconds")
            # Trigger deferred scripts with real input; smooth-scroll CSS otherwise prevents
            # a rapid scripted walk from actually reaching each viewport.
            await page.mouse.move(12, 12)
            # Trigger lazy images, scroll animations, counters and backgrounds before full-page capture.
            await page.evaluate("""async () => {
              const pause = ms => new Promise(r => setTimeout(r, ms));
              for(let y=0, steps=0; y<Math.min(document.documentElement.scrollHeight,80000) && steps<100; y+=Math.max(500,innerHeight*0.8),steps++) {
                window.scrollTo({top:y,behavior:'instant'}); await pause(300);
              }
              window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
              await pause(1200);
              window.scrollTo({top:0,behavior:'instant'});
            }""")
            try:
                await page.evaluate("""() => Promise.race([
                  Promise.all([document.fonts.ready,...Array.from(document.images).filter(i=>i.currentSrc).map(i=>i.decode().catch(()=>{}))]),
                  new Promise((_, reject)=>setTimeout(()=>reject(new Error('Font/image wait exceeded 8s')),8000))])""")
            except Exception as e:
                result["warnings"].append(str(e)[:500])
            await page.wait_for_timeout(self.args.settle_ms)
            result["final_url"] = page.url
            html_path = f"html/rendered/{ident}--{profile}.html"
            html = await page.content()
            (self.out / html_path).write_text(html, encoding="utf-8")
            result["rendered_html"] = html_path
            result["metadata"] = parse_html(html, page.url)
            for link in result["metadata"]["links"]:
                link["origin"] = profile
            result["visual"] = await page.evaluate("""() => ({
              width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
              fonts:Array.from(document.fonts).map(f=>({family:f.family,weight:f.weight,status:f.status})),
              bodyStyle:{fontFamily:getComputedStyle(document.body).fontFamily,color:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor},
              brokenImages:Array.from(document.images).filter(i=>i.currentSrc && (!i.complete || !i.naturalWidth)).map(i=>i.currentSrc)
            })""")
            screenshot = f"screenshots/{ident}--{profile}.png"
            # Elementor can leave delayed entrance animations invisible when they move
            # offscreen. Expose their final static visibility without changing responsive
            # display:none rules. The rendered HTML above remains an untouched DOM snapshot.
            invisible_count = await page.locator(".elementor-invisible").count()
            if invisible_count:
                await page.add_style_tag(content=".elementor-invisible { visibility: visible !important; }")
                result["screenshot_adjustments"] = [{"selector": ".elementor-invisible", "property": "visibility:visible!important",
                    "element_count": invisible_count, "reason": "Final static state of delayed entrance animations"}]
            await page.screenshot(path=str(self.out / screenshot), full_page=True, animations="disabled", timeout=self.args.timeout)
            result["screenshot"] = screenshot
            result["complete"] = not result.get("navigation_error") and result["browser_status"] is not None and result["browser_status"] < 500
        except Exception as e:
            result["error"] = str(e)[:2000]
            result["complete"] = False
        finally:
            result["resources"] = resources
            await context.close()
        return result

    async def render_with_retries(self, browser, url, ident, profile):
        for attempt in range(self.args.retries + 1):
            async with self.render_gate:
                rendered = await self.render(browser, url, ident, profile)
            if rendered.get("complete"):
                return profile, rendered
            await asyncio.sleep(2 ** attempt)
        return profile, rendered

    async def capture(self, browser, url):
        ident = file_id(url)
        record = {"url": url, "id": ident, "capture_version": CAPTURE_VERSION, "captured_at": now(), "source": {}, "profiles": {}, "links": [], "assets": []}
        try:
            fetched = await self.fetch(url)
            body = fetched.pop("body")
            record["source"] = fetched
            if "html" not in fetched["headers"].get("content-type", "").lower():
                record["error"] = "Source did not return HTML; browser capture skipped"
            else:
                path = f"html/source/{ident}.html"
                (self.out / path).write_bytes(body)
                record["source"]["html"] = path
                record["source"]["sha256"] = hashlib.sha256(body).hexdigest()
                # Let the HTML parser detect the original response encoding.
                metadata = parse_html(body, fetched["final_url"])
                record["source"]["metadata"] = metadata
                record["links"].extend(metadata["links"])
                record["assets"].extend(metadata["assets"])
                results = await asyncio.gather(*(self.render_with_retries(browser, url, ident, profile) for profile in self.args.profiles))
                for profile, rendered in results:
                    record["profiles"][profile] = rendered
                    if "metadata" in rendered:
                        record["links"].extend(rendered["metadata"]["links"])
                        record["assets"].extend(rendered["metadata"]["assets"])
                    record["assets"].extend(r for r in rendered["resources"] if r["kind"] not in {"document", "xhr", "fetch", "ping"})
        except Exception as e:
            record["error"] = str(e)[:2000]
        record["capture_complete"] = (not record.get("error") and len(record["profiles"]) == len(self.args.profiles)
                                      and all(p.get("complete") for p in record["profiles"].values()))
        self.records[url] = record
        write_json(self.out / "pages" / f"{ident}.json", record)
        for link in record["links"]:
            self.add(link["target_url"], url)
        for item in record["source"].get("metadata", {}).get("hreflang", []):
            self.add(item["url"], "hreflang:" + url)
        print(f"[{len(self.records)}/{len(self.discovered)}] {'OK' if record['capture_complete'] else 'INCOMPLETE'} {url}", flush=True)
        self.export()

    def export(self, final=False):
        rows, links, assets = [], {}, {}
        for url, record in sorted(self.records.items()):
            source = record.get("source", {})
            meta = source.get("metadata", {})
            rows.append({"url": url, "http_status": source.get("status"), "final_status": source.get("final_status"),
                "final_url": source.get("final_url"), "title": meta.get("title"), "description": meta.get("description"),
                "canonical": meta.get("canonical"), "robots": meta.get("robots"), "x_robots_tag": source.get("headers", {}).get("x-robots-tag"),
                "language": meta.get("language"), "direction": meta.get("direction"), "h1": meta.get("h1", []),
                "headings": meta.get("headings", []), "hreflang": meta.get("hreflang", []), "social": meta.get("social", []),
                "json_ld_count": len(meta.get("json_ld", [])), "redirects": source.get("redirects", []),
                "source_html": source.get("html"), "page_record": f"pages/{record['id']}.json", "capture_complete": record.get("capture_complete"),
                "desktop_screenshot": record.get("profiles", {}).get("desktop", {}).get("screenshot", ""),
                "tablet_screenshot": record.get("profiles", {}).get("tablet", {}).get("screenshot", ""),
                "mobile_screenshot": record.get("profiles", {}).get("mobile", {}).get("screenshot", ""),
                "discovered_from": sorted(self.discovered.get(url, [])), "error": record.get("error", "")})
            for link in record.get("links", []):
                if self.internal(link["target_url"]):
                    key = (url, link["target_url"], link["anchor_text"], link["origin"])
                    links[key] = {"source_url": url, **link}
            for asset in record.get("assets", []):
                key = (url, asset["asset_url"], asset["origin"])
                assets[key] = {"page_url": url, **asset}
        fields = ["url", "http_status", "final_status", "final_url", "title", "description", "canonical", "robots", "x_robots_tag",
                  "language", "direction", "h1", "headings", "hreflang", "social", "json_ld_count", "redirects", "source_html",
                  "page_record", "capture_complete", "desktop_screenshot", "tablet_screenshot", "mobile_screenshot", "discovered_from", "error"]
        write_csv(self.out / "url_inventory.csv", rows, fields)
        write_csv(self.out / "internal_links.csv", links.values(), ["source_url", "target_url", "anchor_text", "rel", "origin"])
        write_csv(self.out / "asset_urls.csv", assets.values(), ["page_url", "asset_url", "kind", "status", "origin"])
        pending = sorted(set(self.discovered) - self.records.keys())
        incomplete = [u for u, r in self.records.items() if not r.get("capture_complete")]
        summary = {"origin": self.origin, "started_at": self.started, "updated_at": now(),
            "run_finished": final, "archive_complete": final and not pending and not incomplete,
            "profiles": {k: PROFILES[k] for k in self.args.profiles}, "browser": getattr(self, "browser_version", None),
            "discovered_urls": len(self.discovered), "attempted_urls": len(self.records),
            "complete_pages": sum(r.get("capture_complete", False) for r in self.records.values()),
            "source_html_files": sum(bool(r.get("source", {}).get("html")) for r in self.records.values()),
            "screenshots": sum(bool(p.get("screenshot")) for r in self.records.values() for p in r.get("profiles", {}).values()),
            "status_counts": dict(collections.Counter(str(r.get("source", {}).get("status")) for r in self.records.values())),
            "incomplete_urls": incomplete, "pending_urls": pending, "skipped_urls": self.skipped,
            "discovery_errors": self.discovery_errors, "internal_link_rows": len(links), "asset_rows": len(assets),
            "limitations": ["HTML files reference live assets; this is not an offline mirror.",
                "Screenshots expose Elementor entrance-animation visibility after scrolling and disable animations; adjustments are recorded per profile. Rendered HTML is saved before this adjustment.",
                "Screenshots capture default page states after lazy scrolling; menus, hover states, form validation and slider states require separate review.",
                "Network resource inventory covers loaded fonts/CSS dependencies; unrequested CSS resources may require the WordPress assets backup.",
                "A complete discovered frontier is not proof that every public URL exists in discovery sources.",
                "Browser requests may appear in website analytics; forms are never submitted."]}
        write_json(self.out / "summary.json", summary)

    async def run(self):
        async with async_playwright() as p:
            self.http = await p.request.new_context(user_agent=AGENT, ignore_https_errors=False)
            browser = await p.chromium.launch(headless=True, executable_path=self.args.browser_executable)
            self.browser_version = browser.version
            try:
                await self.discovery()
                self.export()
                # Keep workers occupied as the frontier grows; record overflow as pending.
                attempted = 0
                active = set()
                try:
                    while active or (not self.queue.empty() and attempted < self.args.max_pages):
                        while len(active) < self.args.workers and not self.queue.empty() and attempted < self.args.max_pages:
                            url = self.queue.get_nowait()
                            active.add(asyncio.create_task(self.capture(browser, url)))
                            attempted += 1
                            await asyncio.sleep(self.args.delay)
                        done, active = await asyncio.wait(active, return_when=asyncio.FIRST_COMPLETED)
                        for task in done:
                            task.result()
                finally:
                    for task in active:
                        task.cancel()
                    await asyncio.gather(*active, return_exceptions=True)
                self.export(final=True)
            finally:
                self.export()
                await browser.close()
                await self.http.dispose()
            self.export(final=True)
        summary = json.loads((self.out / "summary.json").read_text(encoding="utf-8"))
        print(json.dumps({k: summary[k] for k in ["archive_complete", "discovered_urls", "attempted_urls", "complete_pages", "screenshots"]}, indent=2))
        return 0 if summary["archive_complete"] else 2


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--origin", default="https://nalksolutions.com")
    ap.add_argument("--output", type=Path, default=Path("nalk-public-archive"))
    ap.add_argument("--seeds", type=Path, default=Path("migration-review/public_seed_urls.txt"))
    ap.add_argument("--profiles", nargs="+", choices=PROFILES, default=list(PROFILES))
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--browser-pages", type=int, default=4, help="Maximum simultaneous responsive browser pages")
    ap.add_argument("--delay", type=float, default=1.0, help="Seconds between starting URLs")
    ap.add_argument("--max-pages", type=int, default=500, help="Maximum pages attempted in this invocation; overflow is recorded")
    ap.add_argument("--timeout", type=int, default=45000, help="Navigation/request timeout in milliseconds")
    ap.add_argument("--retries", type=int, default=1)
    ap.add_argument("--settle-ms", type=int, default=1200)
    ap.add_argument("--resume", action="store_true", help="Skip complete records, rediscover links and retry incomplete records")
    ap.add_argument("--browser-executable", help="Optional Chromium executable if not using Playwright's bundled browser")
    args = ap.parse_args()
    if args.workers < 1 or args.browser_pages < 1 or args.max_pages < 1 or args.timeout < 1 or args.retries < 0 or args.delay < 0:
        ap.error("Invalid limits")
    if list(dict.fromkeys(args.profiles)) != args.profiles:
        ap.error("Profiles must be unique")
    if urlsplit(args.origin).scheme not in {"http", "https"}:
        ap.error("Origin must be an HTTP(S) URL")
    if (args.output / "pages").exists() and any((args.output / "pages").glob("*.json")) and not args.resume:
        ap.error("Output has existing captures. Use --resume or select a new --output directory.")
    try:
        sys.exit(asyncio.run(Capture(args).run()))
    except KeyboardInterrupt:
        print("Interrupted. Completed page records are preserved; run again with --resume.", file=sys.stderr)
        sys.exit(130)


if __name__ == "__main__":
    main()
