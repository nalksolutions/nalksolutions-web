"""Article-specific exceptions remain finite, inert and text-preserving."""
import sys
from pathlib import Path
import unittest
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from article_document_content import ArticleDocumentConverter
from site_content import text_content, walk


def convert(html):
    converter = ArticleDocumentConverter()
    return converter, converter.children(BeautifulSoup(html, 'html.parser'))


class ArticleDocumentContentTests(unittest.TestCase):
    def test_table_formatting_keeps_exact_text_without_structural_text_children(self):
        source = '<table>\n<caption>Caption</caption>\n<thead>\n<tr>\n<th>One</th>\n<th>Two</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><p>Three</p></td>\n<td>Four</td>\n</tr>\n</tbody>\n</table>'
        converter, nodes = convert(source)
        self.assertEqual(text_content(nodes), BeautifulSoup(source, 'html.parser').get_text())
        for node in walk(nodes):
            if node['type'] == 'element' and node['tag'] in ('table', 'thead', 'tbody', 'tr'):
                self.assertTrue(all(child['type'] != 'text' for child in node['children']))
        self.assertGreater(converter.changes['table formatting whitespace relocated within cells'], 0)

    def test_nested_table_formatting_stays_outside_inner_cell_tail_text(self):
        source = '<table>\n<tr>\n<td>Before<table>\n<tr>\n<td>Inner</td>\n</tr>\n</table>After</td>\n</tr>\n</table>'
        _, nodes = convert(source)
        self.assertEqual(text_content(nodes), BeautifulSoup(source, 'html.parser').get_text())
        for source in ['<table>\n</table>', '<table>Unexpected<tr><td>Cell</td></tr></table>']:
            with self.subTest(source=source), self.assertRaises(ValueError):
                convert(source)

    def test_heading_led_prose_group_retains_native_margin_boundary(self):
        converter, nodes = convert('<p>Before</p><div class="editor-artifact"><h3>FAQ</h3><p>Answer</p></div>')
        self.assertEqual(nodes[1]['tag'], 'div')
        self.assertEqual(nodes[1]['variant'], 'prose')
        self.assertEqual(nodes[1]['children'][0]['tag'], 'h3')
        self.assertEqual(nodes[1]['attributes'], {})
        self.assertEqual(text_content(nodes), 'BeforeFAQAnswer')
        self.assertEqual(converter.changes['heading-led article prose group retained'], 1)

    def test_unaligned_image_uses_finite_role_without_source_classes(self):
        converter, nodes = convert('<img class="alignnone wp-image-58833 size-full" src="/wp-content/uploads/source.png" alt="Source">')
        self.assertEqual(nodes[0]['variant'], 'inline-image')
        self.assertNotIn('class', nodes[0]['attributes'])
        self.assertEqual(converter.changes['source unaligned image retained as inline image'], 1)
        _, ordinary = convert('<img class="aligncenter" src="/wp-content/uploads/source.png" alt="Source">')
        self.assertIsNone(ordinary[0]['variant'])

    def test_exact_fixed_text_style_is_mapped_without_replaying_css(self):
        _, nodes = convert('<p><span style="font-weight: 400; font-size: 16px;">Source text</span></p>')
        span = nodes[0]['children'][0]
        self.assertEqual(span['variant'], 'compact-text')
        self.assertEqual(span['attributes'], {})
        self.assertEqual(text_content(nodes), 'Source text')
        _, unrelated = convert('<span style="font-weight: 400; font-size: 16px; color: red;">Source</span>')
        self.assertEqual(unrelated, [{'type': 'text', 'text': 'Source'}])

    def test_only_known_empty_pasted_heading_is_omitted(self):
        converter, nodes = convert('<p>Before</p><h2 class="sr-only select-none"></h2><p>After</p>')
        self.assertEqual([n['tag'] for n in nodes], ['p', 'p'])
        self.assertEqual(text_content(nodes), 'BeforeAfter')
        self.assertEqual(converter.changes['empty pasted response-control heading omitted'], 1)
        for source in ['<h2 class="sr-only select-none">Title</h2>',
                       '<h2 id="anchor" class="sr-only select-none"></h2>',
                       '<h2 class="other"></h2>']:
            with self.subTest(source=source):
                _, retained = convert(source)
                self.assertEqual(retained[0]['tag'], 'h2')
