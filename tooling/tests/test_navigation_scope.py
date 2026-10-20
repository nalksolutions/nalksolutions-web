"""Prove navigation scope comes from actionable link journeys, not archive counts."""
import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location(
    'navigation_scope', Path(__file__).resolve().parents[1] / 'audit-navigation-scope.py')
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class NavigationScopeTests(unittest.TestCase):
    def test_public_paths_keep_identity_without_query_or_assets(self):
        for value in ('/wp-admin/', '/wp-content/uploads/a.png', '/thing.pdf',
                      '/?s=test', 'https://example.org/page/', 'mailto:a@example.org',
                      '/double%2520encoded/', '/unsafe%5cpath/', '/feed/'):
            with self.subTest(value=value):
                self.assertIsNone(AUDIT.public_path(value, AUDIT.ORIGIN))
        self.assertEqual(AUDIT.public_path('/%D8%B4%D8%B1%D9%83%D8%A9/', AUDIT.ORIGIN), '/شركة/')
        self.assertEqual(AUDIT.public_path('../page/#section', AUDIT.ORIGIN + '/parent/child/'),
                         '/parent/page/')

    def test_header_dropdowns_are_navigation_even_when_initially_collapsed(self):
        links = AUDIT.links_from(
            '<header><nav><a href="/blog/">Blog</a>'
            '<ul class="sub-menu"><li><a href="/category/topic/">Topic</a></li></ul>'
            '</nav></header>', '/')
        self.assertEqual([row['target'] for row in links], ['/blog/', '/category/topic/'])
        self.assertTrue(all(row['region'] == 'header' for row in links))
        self.assertTrue(all(not row['hidden_at_all_breakpoints'] for row in links))

    def test_hidden_all_breakpoints_does_not_make_demo_pages_active(self):
        links = AUDIT.links_from(
            '<main><div class="elementor-hidden-desktop elementor-hidden-tablet">'
            '<div class="elementor-hidden-mobile"><a href="/demo/">Demo</a></div></div>'
            '<div class="elementor-hidden-mobile"><a href="/real/">Real</a></div></main>', '/')
        self.assertTrue(links[0]['hidden_at_all_breakpoints'])
        self.assertFalse(links[1]['hidden_at_all_breakpoints'])

    def test_duplicate_links_and_implementation_roots_are_not_evidence(self):
        links = AUDIT.links_from(
            '<link rel="canonical" href="/canonical/">'
            '<aside><a href="/outside/">Outside</a></aside>'
            '<main><a href="/real/">Real</a><a href="/real/">Real</a></main>', '/')
        self.assertEqual(len(links), 1)
        self.assertEqual(links[0]['target'], '/real/')

    def test_visible_html_sitemap_is_distinguished_from_ordinary_navigation(self):
        records = {
            '/': {'status': 200, 'links': AUDIT.links_from(
                '<footer><a href="/nalk-solutions-sitemap/">Sitemap</a></footer>', '/')},
            '/nalk-solutions-sitemap/': {'status': 200, 'links': AUDIT.links_from(
                '<main><a href="/utility/">Utility</a></main>', '/nalk-solutions-sitemap/')},
        }
        self.assertIn('/utility/', AUDIT.reachable(records))
        self.assertNotIn('/utility/', AUDIT.reachable(records, use_sitemap=False))
        self.assertEqual(AUDIT.reachable(records)['/utility/'][-1]['region'], 'html-sitemap')

    def test_orphan_noindex_and_dead_responses_do_not_propagate_scope(self):
        records = {
            '/': {'status': 200, 'links': AUDIT.links_from(
                '<main><a href="/gone/">Gone</a></main>', '/')},
            '/gone/': {'status': 410, 'links': AUDIT.links_from(
                '<main><a href="/demo/">Demo</a></main>', '/gone/')},
            '/orphan/': {'status': 200, 'links': []},
        }
        self.assertEqual(set(AUDIT.reachable(records)), {'/', '/gone/'})

    def test_redirect_journeys_are_explicit_and_loops_terminate(self):
        records = {
            '/': {'status': 200, 'links': AUDIT.links_from(
                '<main><a href="/old/">Old</a></main>', '/')},
            '/old/': {'status': 301, 'location': AUDIT.ORIGIN + '/new/'},
            '/new/': {'status': 301, 'location': '/old/'},
        }
        journey = AUDIT.reachable(records)['/new/']
        self.assertEqual(journey[-1]['region'], 'redirect')
        self.assertEqual(len(AUDIT.reachable(records)), 3)

    def test_external_redirect_never_expands_the_crawl(self):
        self.assertEqual(AUDIT.reachable({'/': {'status': 301, 'location': 'https://example.org/'}}),
                         {'/': []})

    def test_error_documents_and_non_html_bodies_are_not_navigation_evidence(self):
        body = '<main><a href="/demo/">Error template link</a></main>'
        for status, content_type in ((410, 'text/html'), (404, 'text/html'), (200, 'text/plain')):
            self.assertEqual(AUDIT.response_links(body, {
                'status': status, 'content_type': content_type, 'path': '/gone/'}), [])


if __name__ == '__main__':
    unittest.main()
