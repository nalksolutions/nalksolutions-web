"""Strict visual measurements never conceal a dimension or one-channel difference."""
import sys
from pathlib import Path
import unittest
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from review_site_visuals import pixel_summary
from check_site_paint import region_difference


class VisualComparisonTests(unittest.TestCase):
    def test_image_paint_check_compares_the_same_document_region_without_resizing(self):
        full = Image.new('RGB', (4, 8), (0, 0, 0))
        full.putpixel((2, 5), (1, 0, 0))
        viewport = full.crop((0, 4, 4, 8))
        box = {'x': 0, 'y': 4, 'width': 4, 'height': 4}
        self.assertEqual(region_difference(full, viewport, box, 4)['changedPixels'], 0)
        blank = Image.new('RGB', (4, 8), (0, 0, 0))
        self.assertEqual(region_difference(blank, viewport, box, 4)['changedPixels'], 1)

    def test_image_outside_a_viewport_is_not_misreported_as_painted(self):
        image = Image.new('RGB', (4, 8), (0, 0, 0))
        self.assertIsNone(region_difference(image, image, {'x': 8, 'y': 0, 'width': 2, 'height': 2}, 0))

    def test_one_red_channel_step_is_a_real_pixel_difference(self):
        source = Image.new('RGB', (2, 2), (0, 0, 0))
        current = source.copy()
        current.putpixel((1, 1), (1, 0, 0))
        result = pixel_summary(source, current)
        self.assertFalse(result['strictEqual'])
        self.assertEqual(result['changedPixels'], 1)
        self.assertEqual(result['mismatchRatio'], .25)
        self.assertTrue(pixel_summary(source, source)['strictEqual'])

    def test_size_difference_is_not_padded_or_resized(self):
        result = pixel_summary(Image.new('RGB', (2, 2)), Image.new('RGB', (2, 3)))
        self.assertFalse(result['dimensionsMatch'])
        self.assertIsNone(result['changedPixels'])
