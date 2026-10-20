"""Contract tests for complete-content conversion and publication boundaries."""
import sys
from pathlib import Path
import unittest

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from site_content import Converter, media_path, safe_link, source_main, text_content, walk


def convert(html):
    converter = Converter()
    return converter, converter.children(BeautifulSoup(html, 'html.parser'))


class SiteContentTests(unittest.TestCase):
    def test_classed_quote_is_a_plain_role_without_copying_source_classes(self):
        _, nodes = convert('<blockquote class="ml-2 border-l-4"><p>Source quote</p></blockquote>')
        self.assertEqual(nodes[0]['variant'], 'plain-quote')
        self.assertEqual(nodes[0]['attributes'], {})
        self.assertEqual(text_content(nodes), 'Source quote')
        _, ordinary = convert('<blockquote><p>Decorative source quote</p></blockquote>')
        self.assertIsNone(ordinary[0]['variant'])

    def test_exact_source_regular_weight_is_a_finite_role_not_inline_css(self):
        nodes = Converter().children(BeautifulSoup('<div><span style="font-weight: 400;">Source</span></div>', 'html.parser').div)
        self.assertEqual(nodes[0]['variant'], 'regular')
        self.assertEqual(nodes[0]['attributes'], {})

    def test_text_and_code_whitespace_are_retained(self):
        _, nodes = convert('<p>Hello <strong>world</strong></p><pre><code>\n  &lt;tag&gt;\n</code></pre>')
        self.assertEqual(text_content(nodes), 'Hello world\n  <tag>\n')

    def test_malformed_source_br_does_not_lose_opening_hours(self):
        _, nodes = convert('<p>Monday<br>11am – 8pm</br></p>')
        self.assertEqual(text_content(nodes), 'Monday11am – 8pm')
        self.assertEqual(nodes[0]['children'][1]['children'], [])
        self.assertEqual(nodes[0]['children'][2]['text'], '11am – 8pm')

    def test_html_line_endings_follow_browser_tokenization_without_losing_spacing(self):
        _, nodes = convert('<p>Phone:\r\n\t123</p><pre>A\r\n  B</pre>')
        self.assertEqual(text_content(nodes), 'Phone:\n\t123A\n  B')

    def test_scripts_styles_and_tracking_metadata_do_not_enter_tree(self):
        converter, nodes = convert('<p style="color:red" onclick="bad()">Visible</p><script>bad()</script><style>x{}</style>')
        self.assertEqual(text_content(nodes), 'Visible')
        self.assertEqual(nodes[0]['attributes'], {})
        self.assertEqual(converter.omitted, {'script': 1, 'style': 1})

    def test_unknown_content_fails_instead_of_disappearing(self):
        with self.assertRaisesRegex(ValueError, 'Unreviewed element'):
            convert('<object data="movie.swf">Content</object>')

    def test_internal_links_keep_queries_fragments_and_encoded_identity(self):
        self.assertEqual(safe_link('https://nalksolutions.com/category/x/page/2/?a=b#heading'), '/category/x/page/2/?a=b#heading')
        self.assertEqual(safe_link('https://nalksolutions.com/%D8%B4/'), '/%D8%B4/')

    def test_icon_links_keep_accessible_names_and_nofollow(self):
        _, nodes = convert('<a href="https://example.com" aria-label="Share" target="_blank" rel="nofollow">Icon</a>')
        self.assertEqual(nodes[0]['attributes']['aria-label'], 'Share')
        self.assertEqual(set(nodes[0]['attributes']['rel'].split()), {'nofollow', 'noopener', 'noreferrer'})

    def test_unsafe_links_and_asset_traversal_fail(self):
        for url in ('javascript:alert(1)', '//attacker.example/a', 'https://user:pass@example.com/', '/a\\b'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                safe_link(url)
        for url in ('https://nalksolutions.com/wp-content/uploads/../secret.png', '/wp-content/uploads/%252e%252e/a.png', 'https://other.example/image.jpg'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                media_path(url)

    def test_responsive_images_are_all_accounted_for(self):
        converter, nodes = convert('<img src="https://nalksolutions.com/wp-content/uploads/a.png" alt="A" srcset="https://nalksolutions.com/wp-content/uploads/b.png 300w">')
        self.assertEqual(len(converter.media), 2)
        self.assertEqual(nodes[0]['attributes']['srcset'], '/wp-content/uploads/b.png 300w')

    def test_counters_resolve_final_value_with_explicit_transform_record(self):
        converter, nodes = convert('<span data-to-value="200">0</span>')
        self.assertEqual(text_content(nodes), '200')
        self.assertEqual(sum(converter.changes.values()), 1)

    def test_native_disclosure_keeps_question_and_answer(self):
        _, nodes = convert('<div class="elementor-accordion-item"><div class="elementor-tab-title">Question</div><div class="elementor-tab-content"><p>Answer</p></div></div>')
        self.assertEqual(nodes[0]['type'], 'disclosure')
        self.assertEqual(text_content(nodes), 'QuestionAnswer')

    def test_form_keeps_fields_but_drops_nonce_and_submission_target(self):
        _, nodes = convert('<form action="/wp-admin/admin-ajax.php"><input type="hidden" name="nonce" value="secret"><input name="email" type="email" placeholder="Email"><button>Send</button></form>')
        self.assertEqual(nodes[0]['type'], 'enquiry')
        self.assertEqual(nodes[0]['fields'][0]['label'], 'Email')
        self.assertNotIn('secret', str(nodes))
        self.assertNotIn('wp-admin', str(nodes))

    def test_map_only_accepts_reviewed_source(self):
        _, nodes = convert('<iframe src="https://maps.google.com/maps?q=Place" title="Place"></iframe>')
        self.assertEqual(nodes[0]['type'], 'map')
        with self.assertRaisesRegex(ValueError, 'Unreviewed embedded'):
            convert('<iframe src="https://attacker.example"></iframe>')

    def test_content_root_does_not_include_shared_header_popups(self):
        soup = BeautifulSoup('<header>Popup</header><main><div data-elementor-type="cmsmasters_singular"><p>Body</p></div></main><footer>Footer</footer>', 'html.parser')
        self.assertEqual(source_main(soup).get_text(), 'Body')

    def test_no_source_plugin_attributes_survive(self):
        _, nodes = convert('<div data-settings="{}" class="elementor-element elementor-invisible"><p data-id="x">Full body</p></div>')
        for node in walk(nodes):
            self.assertFalse(any(key.startswith('data-') for key in node.get('attributes', {})))


if __name__ == '__main__':
    unittest.main()
