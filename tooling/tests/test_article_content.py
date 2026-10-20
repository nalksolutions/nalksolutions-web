"""Conversion failure and fidelity contracts; table fixtures are synthetic."""
import importlib.util
from pathlib import Path
import sys
import unittest

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from article_content import convert_body, text_content, walk


def convert(html):
    return convert_body(BeautifulSoup(f'<div>{html}</div>', 'html.parser').div)


class ArticleConversionTests(unittest.TestCase):
    def test_preserves_code_whitespace_and_entities(self):
        code = '  if x &lt; 2:\n\tprint("مرحبا &amp; hello")\n\n'
        nodes = convert(f'<pre><code class="language-python">{code}</code></pre>')
        self.assertEqual(nodes, [{'type': 'codeBlock', 'language': 'python',
                                 'text': '  if x < 2:\n\tprint("مرحبا & hello")\n\n'}])

    def test_inline_marks_nested_lists_and_nonbreaking_space(self):
        html = '<h2><strong>Title</strong></h2><p>A&nbsp;<em>word</em> <code>x</code></p><ol start="3"><li>One<ul><li>Nested</li></ul></li></ol>'
        nodes = convert(html)
        self.assertEqual(text_content(nodes), 'TitleA\xa0word xOneNested')
        lists = [node for node in walk(nodes) if node['type'] == 'list']
        self.assertEqual([(node['ordered'], node.get('start')) for node in lists], [(True, 3), (False, None)])

    def test_synthetic_table_spans_headers_caption(self):
        nodes = convert('<table><caption>Comparison</caption><thead><tr><th scope="col">API</th></tr></thead><tbody><tr><td colspan="2">REST</td></tr></tbody></table>')
        self.assertEqual(text_content(nodes), 'ComparisonAPIREST')
        self.assertEqual(next(node for node in walk(nodes) if node['type'] == 'tableCell')['colspan'], 2)
        self.assertEqual(next(node for node in walk(nodes) if node['type'] == 'tableHeader')['scope'], 'col')

    def test_unsafe_links_fail(self):
        for url in ('javascript:alert(1)', 'data:text/html,x', '//evil.example/x', 'https://user:secret@example.com', 'java\nscript:alert(1)'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                convert(f'<p><a href="{url}">link</a></p>')

    def test_safe_links_preserve_query_fragment_and_unicode(self):
        for url in ('/شركة-تقنية/?a=1#heading', '#local', 'https://example.com/x?q=1', 'mailto:info@nalksolutions.com'):
            nodes = convert(f'<p><a href="{url}">link</a></p>')
            self.assertEqual(nodes[0]['children'][0]['href'], url)

    def test_unknown_markup_or_attributes_fail(self):
        for html in ('<script>alert(1)</script>', '<iframe src="https://example.com"></iframe>', '<p style="color:red">x</p>', '<p onclick="evil()">x</p>', '<!--review-->', '<pre>unclassified</pre>', '<pre><code><b>x</b></code></pre>'):
            with self.subTest(html=html), self.assertRaises(ValueError):
                convert(html)

    def test_image_requires_alt_and_valid_dimensions(self):
        for html in ('<img src="https://example.com/x" width="1" height="1">', '<img src="https://example.com/x" alt="" width="0" height="1">'):
            with self.subTest(html=html), self.assertRaises(ValueError):
                convert(html)

    def test_recovered_article_reconciles_to_source(self):
        spec = importlib.util.spec_from_file_location('extract_article', Path(__file__).resolve().parents[1] / 'extract-article.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        article = module.extract()
        counts = article['reconciliation']['nodeCounts']
        self.assertEqual((counts['heading'], counts['codeBlock'], counts['image'], counts['listItem']), (31, 9, 3, 49))
        self.assertNotIn('table', counts)
        self.assertEqual(len(article['media']), 21)
        self.assertEqual(article['reconciliation']['sourceTextCharacters'], article['reconciliation']['convertedTextCharacters'])


if __name__ == '__main__':
    unittest.main()
