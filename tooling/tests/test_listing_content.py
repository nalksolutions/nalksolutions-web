"""Listing roles preserve content; supplemental Blog views cannot introduce unknown articles."""
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tooling'))
from listing_content import ListingConverter, LISTING_FAMILIES, query_views
from listing_evidence import presentation_expectations
from service_content import source_stylesheets
from site_content import Converter, source_main, text_content, walk


class ListingContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.styles = source_stylesheets(ROOT / 'nalksolutions.com_wordpress_backup')
        cls.routes = [route for route in json.loads((ROOT / 'docs/registers/routes.json').read_text())['routes']
                      if route['observed']['initial_status'] == 200 and route['plan']['candidate_template_family'] in LISTING_FAMILIES]

    def test_all_twenty_listings_preserve_text_headings_links_and_current_state(self):
        self.assertEqual(len(self.routes), 20)
        for route in self.routes:
            main = source_main(BeautifulSoup((ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes(), 'html.parser'))
            source_page = main if main.has_attr('data-elementor-id') else main.select_one('[data-elementor-type="wp-page"]')
            css = self.styles[f'uploads/elementor/css/post-{source_page["data-elementor-id"]}.css']['text']
            converter = ListingConverter(main, LISTING_FAMILIES[route['plan']['candidate_template_family']], css)
            nodes, baseline = converter.children(main), Converter().children(main)
            self.assertEqual(text_content(nodes), text_content(baseline))
            def headings(items):
                return [(node['tag'], text_content(node['children'])) for node in walk(items)
                        if node['type'] == 'element' and node['tag'] in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')]
            def links(items):
                return [node['attributes'].get('href') for node in walk(items) if node['type'] == 'element' and node['tag'] == 'a']
            self.assertEqual(headings(nodes), headings(baseline))
            self.assertEqual(links(nodes), links(baseline))
            self.assertEqual(sum(node.get('attributes', {}).get('aria-current') == 'page' for node in walk(nodes)), len(main.select('[aria-current="page"]')))

    def test_unknown_templates_sections_widgets_and_backgrounds_fail(self):
        route = self.routes[0]
        data = (ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes()
        main = source_main(BeautifulSoup(data, 'html.parser'))
        css = self.styles['uploads/elementor/css/post-136.css']['text']
        for kind in ('section', 'widget', 'entry'):
            changed = BeautifulSoup(str(main), 'html.parser')
            if kind == 'section':
                changed.select_one('.e-parent')['data-id'] = 'unreviewed'
            elif kind == 'widget':
                changed.select_one('[data-widget_type]')['data-widget_type'] = 'unreviewed.default'
            else:
                changed.select_one('[data-elementor-type="cmsmasters_entry"]')['data-elementor-id'] = '999'
            with self.assertRaisesRegex(ValueError, 'Unreviewed listing'):
                ListingConverter(changed, 'author', css)
        with self.assertRaisesRegex(ValueError, 'Unreviewed listing background'):
            ListingConverter(main, 'author', '')

    def test_source_css_contract_rejects_unreviewed_dimensions(self):
        result = presentation_expectations(self.styles)
        self.assertEqual(result['blogColumns'], {'desktop': 3, 'tablet': 1, 'mobile': 1})
        self.assertEqual(result['rowImageHeight'], 300)
        changed = dict(self.styles)
        key = 'uploads/elementor/css/post-26492.css'
        changed[key] = {**changed[key], 'text': changed[key]['text'].replace('--cmsmasters-blog-columns:3;', '--cmsmasters-blog-columns:4;')}
        with self.assertRaisesRegex(ValueError, 'Unreviewed listing presentation'):
            presentation_expectations(changed)

    def test_query_views_match_archived_articles_and_reject_unknown_cards(self):
        articles = {}
        for route in self.routes:
            if route['plan']['candidate_template_family'] != 'author-listing':
                continue
            main = source_main(BeautifulSoup((ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes(), 'html.parser'))
            for card in main.select('article:has([data-elementor-id="152"])'):
                heading = card.select_one('[data-widget_type="cmsmasters-post-title.default"]')
                articles[card['id']] = (heading.get_text(' ', strip=True), heading.select_one('a')['href'])
        views, reports, media = query_views(ROOT, self.styles, articles)
        self.assertEqual([view['page'] for view in views], [2, 3, 4, 5, 6])
        self.assertEqual([len(report['cards']) for report in reports], [9, 9, 9, 7, 0])
        self.assertTrue(media)
        with self.assertRaisesRegex(ValueError, 'differs from archived article'):
            query_views(ROOT, self.styles, {})
        original_read = Path.read_bytes
        def tampered_read(file):
            data = original_read(file)
            return data + b'changed' if file == ROOT / 'migration-review/blog-query-pages/page-2.html' else data
        with patch.object(Path, 'read_bytes', tampered_read):
            with self.assertRaisesRegex(ValueError, 'query-view source changed'):
                query_views(ROOT, self.styles, articles)


if __name__ == '__main__':
    unittest.main()
