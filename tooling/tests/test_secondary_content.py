"""Frozen secondary layouts preserve content and reject unreviewed template data."""
import json
from pathlib import Path
import sys
import unittest
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tooling'))
from secondary_content import SecondaryConverter, SECONDARY_LAYOUTS
from secondary_evidence import expectations
from service_content import source_stylesheets
from site_content import Converter, source_main, text_content, walk


class SecondaryContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.styles = source_stylesheets(ROOT / 'nalksolutions.com_wordpress_backup')
        cls.routes = json.loads((ROOT / 'docs/registers/routes.json').read_text(encoding='utf8'))['routes']

    def test_all_eight_sources_preserve_text_headings_and_portrait_identity(self):
        count = 0
        for route in self.routes:
            ident = route['id']
            if ident not in SECONDARY_LAYOUTS:
                continue
            main = source_main(BeautifulSoup((ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes(), 'html.parser'))
            page = main if main.has_attr('data-elementor-id') else main.select_one('[data-elementor-type="wp-page"]')
            css = self.styles[f'uploads/elementor/css/post-{page["data-elementor-id"]}.css']['text']
            record = json.loads((ROOT / 'docs/registers' / route['baseline']['page_record']).read_text(encoding='utf8'))
            rendered = BeautifulSoup((ROOT / 'nalk-public-archive' / record['profiles']['desktop']['rendered_html']).read_bytes(), 'html.parser')
            converter = SecondaryConverter(main, ident, css, rendered)
            nodes = converter.children(main)
            baseline = Converter().children(main)
            self.assertEqual(text_content(nodes), text_content(baseline))
            headings = lambda items: [(n['tag'], text_content(n['children'])) for n in walk(items)
                                      if n['type'] == 'element' and n['tag'] in ('h1','h2','h3','h4','h5','h6')]
            self.assertEqual(headings(nodes), headings(baseline))
            if converter.layout == 'profile':
                self.assertIn(converter.backgrounds['portrait'], converter.media)
                self.assertEqual(sum(n.get('variant') == 'secondary-article-carousel' for n in walk(nodes)), 1)
            if converter.layout == 'team':
                self.assertEqual(expectations(self.styles, main)['teamColumns'], {'desktop':3,'tablet':2,'mobile':1})
            count += 1
        self.assertEqual(count, 8)

    def test_unknown_sections_and_missing_source_styles_fail(self):
        main = BeautifulSoup('<main><section class="e-parent" data-id="new"></section></main>', 'html.parser').main
        with self.assertRaisesRegex(ValueError, 'Unreviewed secondary sections'):
            SecondaryConverter(main, 'R-d5fcda349535d138', '', main)
        with self.assertRaisesRegex(ValueError, 'portrait heights'):
            expectations({'uploads/elementor/css/post-156.css':{'text':''}}, main)
