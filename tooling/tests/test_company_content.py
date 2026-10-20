"""Company presentation must retain complete content and reviewed source boundaries."""
import json
from pathlib import Path
import sys
import unittest

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tooling'))
from company_content import CompanyConverter, COMPANY_LAYOUTS, BACKGROUND_ROLES
from company_evidence import presentation_expectations, icon_stylesheet
from service_content import source_stylesheets
from site_content import Converter, source_main, text_content, walk


class CompanyContentTests(unittest.TestCase):
    def test_all_five_sources_keep_exact_text_headings_and_reviewed_backgrounds(self):
        routes = json.loads((ROOT / 'docs/registers/routes.json').read_text(encoding='utf8'))['routes']
        styles = source_stylesheets(ROOT / 'nalksolutions.com_wordpress_backup')
        expectations = presentation_expectations(styles['uploads/elementor/css/post-7.css'],
                                                 styles['uploads/elementor/css/post-55355.css'],
                                                 icon_stylesheet(ROOT / 'nalksolutions.com_wordpress_backup'))
        self.assertEqual(expectations['serviceColumns'], {'desktop': 3, 'tablet': 2, 'mobile': 1})
        count = 0
        for route in routes:
            if route['id'] not in COMPANY_LAYOUTS:
                continue
            main = source_main(BeautifulSoup((ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes(), 'html.parser'))
            page = main.select_one('[data-elementor-type="wp-page"]')
            css = styles[f'uploads/elementor/css/post-{page["data-elementor-id"]}.css']['text'] if page else ''
            converter = CompanyConverter(main, route['id'], css)
            nodes = converter.children(main)
            baseline = Converter().children(main)
            self.assertEqual(text_content(nodes), text_content(baseline))
            headings = lambda items: [(n['tag'], text_content(n['children'])) for n in walk(items)
                                      if n['type'] == 'element' and n['tag'].startswith('h')]
            self.assertEqual(headings(nodes), headings(baseline))
            self.assertEqual(set(converter.backgrounds.values()),
                             {path for identity, _, path in BACKGROUND_ROLES.values() if identity == route['id']})
            if converter.layout == 'about':
                hidden = [n for n in walk(nodes) if n.get('variant') == 'company-hidden']
                self.assertEqual(len(hidden), 1)
                self.assertIn('Meet the Team', text_content(hidden))
                services = [n for n in walk(nodes) if n.get('variant') == 'company-button'
                            and text_content(n['children']) == 'View All Services']
                self.assertEqual(len(services), 1)
                self.assertEqual(services[0]['attributes']['href'], '/our-services/')
                self.assertEqual(converter.changes[
                    'About placeholder services CTA linked to existing Services directory'], 1)
            if converter.layout == 'contacts':
                details = next(n for n in walk(nodes) if n.get('variant') == 'company-contact-details')
                self.assertEqual([n['attributes']['href'] for n in walk([details]) if n.get('tag') == 'a'],
                                 ['tel:+966506000843', 'tel:+923055518777', 'mailto:info@nalksolutions.com'])
            count += 1
        self.assertEqual(count, 5)

    def test_unknown_sections_and_backgrounds_fail_instead_of_silently_degrading(self):
        with self.assertRaisesRegex(ValueError, 'Missing reviewed theme breakpoint'):
            presentation_expectations({'text': ''}, {'text': ''}, {'text': ''})
        main = BeautifulSoup('<main><section class="e-parent" data-id="new-section"></section></main>', 'html.parser').main
        with self.assertRaisesRegex(ValueError, 'Unreviewed company section'):
            CompanyConverter(main, 'R-71192976f0e75fcc', '')
        main.section['data-id'] = '9962cea'
        with self.assertRaisesRegex(ValueError, 'Unreviewed company background'):
            CompanyConverter(main, 'R-71192976f0e75fcc', '')

    def test_only_recorded_glyphs_are_recovered_without_adding_text(self):
        converter = CompanyConverter(BeautifulSoup('<main></main>', 'html.parser').main, 'R-393cf74e2e96e1c4', '')
        nodes = converter.children(BeautifulSoup('<div><i class="cmsms-demo-icon-shape-3"></i>'
                                                '<i class="cmsms-demo-icon-shape-7"></i></div>', 'html.parser').div)
        self.assertEqual(text_content(nodes), '')
        self.assertEqual(nodes[0]['variant'], 'company-icon-shape3')
        self.assertEqual(len(nodes), 1)
        service = converter.node(BeautifulSoup('<i class="cmsms-demo-icon-icon-1"></i>', 'html.parser').i)
        self.assertEqual(service[0]['variant'], 'company-icon-solution1')
        self.assertEqual(text_content(service), '')
        with self.assertRaisesRegex(ValueError, 'Unreviewed company icon glyph'):
            converter.node(BeautifulSoup('<i class="cmsms-demo-icon-shape-8"></i>', 'html.parser').i)


if __name__ == '__main__':
    unittest.main()
