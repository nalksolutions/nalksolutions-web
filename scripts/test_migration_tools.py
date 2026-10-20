"""Regression checks for archive parsing and crawl identity/coverage rules."""
import json
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path

from audit_backup import insert_statements, sql_rows
from capture_public_site import CAPTURE_VERSION, Capture, file_id, normalize_url, parse_html, write_json


class BackupParsingTests(unittest.TestCase):
    def test_multi_line_insert_with_quoted_comma_and_escaped_quote(self):
        lines = ["INSERT INTO `wp_posts` VALUES (1, 'post', 'a,b'),\n",
                 "(2, 'page', 'it\\'s valid');\n", "-- trailing comment\n"]
        statements = list(insert_statements(lines))
        self.assertEqual(len(statements), 1)
        rows = list(sql_rows(statements[0].split("VALUES", 1)[1]))
        self.assertEqual(rows, [["1", "post", "a,b"], ["2", "page", "it's valid"]])

    def test_null_and_string_whitespace_are_distinct(self):
        self.assertEqual(list(sql_rows("(NULL, 'NULL', ' keep ', '', 12);")),
                         [[None, "NULL", " keep ", "", "12"]])

    def test_truncated_insert_is_rejected(self):
        with self.assertRaises(ValueError):
            list(insert_statements(["INSERT INTO `x` VALUES (1),\n"]))


class PublicCaptureTests(unittest.TestCase):
    def test_arabic_escaped_path_identity_and_tracking(self):
        arabic = normalize_url("/شركة/?utm_source=x#contact", "https://nalksolutions.com/")
        escaped = normalize_url("/%d8%b4%d8%b1%d9%83%d8%a9/", "https://nalksolutions.com/")
        self.assertEqual(arabic, escaped)
        self.assertNotEqual(normalize_url("/blog/page/2/", "https://nalksolutions.com/"), normalize_url("/blog/", "https://nalksolutions.com/"))
        self.assertNotEqual(normalize_url("/?paged=2", "https://nalksolutions.com/"), normalize_url("/", "https://nalksolutions.com/"))
        self.assertIsNone(normalize_url("javascript:alert(1)", "https://nalksolutions.com/"))

    def test_source_metadata_and_forms_do_not_store_values(self):
        html = '''<html lang="ar" dir="rtl"><head><base href="/assets/">
          <title>Original title</title><meta name="description" content="Preserve me">
          <link rel="canonical" href="/original/"><link rel="alternate" hreflang="en" href="/en/">
          <script type="application/ld+json">{"@type":"Article"}</script></head><body>
          <h1>Heading</h1><a href="/blog/">Blog</a><img src="photo.png" alt="Portrait">
          <form action="/submit" method="post"><input name="email" value="private" required></form></body></html>'''
        result = parse_html(html, "https://nalksolutions.com/page/")
        self.assertEqual(result["canonical"], "https://nalksolutions.com/original/")
        self.assertEqual(result["h1"], ["Heading"])
        self.assertEqual(result["assets"][0]["asset_url"], "https://nalksolutions.com/assets/photo.png")
        self.assertNotIn("private", json.dumps(result))
        self.assertEqual(result["direction"], "rtl")

    def test_resume_validates_files_and_reports_overflow(self):
        with tempfile.TemporaryDirectory() as temp:
            args = Namespace(origin="https://nalksolutions.com", output=Path(temp), resume=False, profiles=["desktop"], browser_pages=2)
            capture = Capture(args)
            capture.add("/", "root")
            capture.add("/wp-admin/", "root")
            capture.add("https://example.com/", "root")
            capture.records["https://nalksolutions.com/"] = {
                "url": "https://nalksolutions.com/", "id": file_id("https://nalksolutions.com/"),
                "capture_complete": True, "source": {}, "profiles": {},
                "links": [{"target_url": "https://nalksolutions.com/orphan/", "anchor_text": "Next", "rel": "", "origin": "source"}]}
            capture.add("/orphan/", "root")
            capture.export(final=True)
            summary = json.loads((Path(temp) / "summary.json").read_text(encoding="utf-8"))
            self.assertFalse(summary["archive_complete"])
            self.assertEqual(summary["pending_urls"], ["https://nalksolutions.com/orphan/"])
            record = capture.records["https://nalksolutions.com/"]
            record["capture_version"] = CAPTURE_VERSION
            record["source"] = {"html": "html/source/home.html"}
            (Path(temp) / "html/source/home.html").write_text("fixture", encoding="utf-8")
            record["profiles"] = {"desktop": {"complete": True, "screenshot": "screenshots/home.png", "rendered_html": "html/rendered/home.html"}}
            (Path(temp) / "screenshots/home.png").write_bytes(b"fixture")
            (Path(temp) / "html/rendered/home.html").write_text("fixture", encoding="utf-8")
            write_json(Path(temp) / "pages/home.json", record)
            args.resume = True
            resumed = Capture(args)
            resumed.add("/", "root")
            self.assertEqual(resumed.queue.qsize(), 0)
            (Path(temp) / "screenshots/home.png").unlink()
            damaged = Capture(args)
            damaged.add("/", "root")
            self.assertEqual(damaged.queue.qsize(), 1)


if __name__ == "__main__":
    unittest.main()
