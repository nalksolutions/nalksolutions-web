"""Source-backed presentation and strict selector checks for singular template 107."""
import copy
import json
from pathlib import Path
import sys
import unittest

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from article_presentation import extract_presentation, image, one

ROOT = Path(__file__).resolve().parents[2]


class ArticlePresentationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.expected = json.loads((ROOT / 'src/content/articles/api.generated.json').read_text(encoding='utf8'))
        source = ROOT / 'nalk-public-archive/html/source/how-to-build-an-api-from-scratch-a-step-by-step-guide-fbbead80b209e23c.html'
        cls.soup = BeautifulSoup(source.read_bytes(), 'html.parser')

    def test_matches_existing_independent_api_presentation(self):
        extracted = extract_presentation(self.soup)
        self.assertEqual(extracted.pop('additionalCategories'), [])
        self.assertEqual(extracted, self.expected['presentation'])

    def test_preserves_second_category_without_inventing_separator_text(self):
        soup = copy.deepcopy(self.soup)
        original = one(soup, '[data-id="46571a65"] a')
        second = copy.deepcopy(original)
        second['href'] = 'https://nalksolutions.com/category/second/'
        second.string = 'Second category'
        original.insert_after(second)
        result = extract_presentation(soup)
        self.assertEqual(result['category'], self.expected['presentation']['category'])
        self.assertEqual(result['additionalCategories'], [{'label': 'Second category', 'href': '/category/second/'}])

    def test_missing_ambiguous_or_other_template_fails(self):
        with self.assertRaisesRegex(ValueError, 'Expected one'):
            one(BeautifulSoup('<p>A</p><p>B</p>', 'html.parser'), 'p')
        with self.assertRaisesRegex(ValueError, 'Expected one'):
            one(self.soup, '#missing')
        soup = copy.deepcopy(self.soup)
        one(soup, '[data-elementor-type="cmsmasters_singular"]')['data-elementor-id'] = '999'
        with self.assertRaisesRegex(ValueError, 'Unreviewed article template'):
            extract_presentation(soup)

    def test_local_images_keep_alt_sizes_and_candidates_and_reject_external(self):
        tag = BeautifulSoup('<img src="https://nalksolutions.com/wp-content/uploads/photo.png" alt="Diagram" width="20" height="10" sizes="100vw" srcset="https://nalksolutions.com/wp-content/uploads/photo.png 20w">', 'html.parser').img
        self.assertEqual(image(tag)['variants'], [{'src': '/wp-content/uploads/photo.png', 'width': 20}])
        self.assertEqual(image(tag)['alt'], 'Diagram')
        tag['src'] = 'https://example.com/photo.png'
        with self.assertRaisesRegex(ValueError, 'not a recovered upload'):
            image(tag)
