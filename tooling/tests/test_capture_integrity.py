"""Paint guards reject blank, clipped and transparent evidence without altering pixels."""
from pathlib import Path
import sys
import unittest
import json
import tempfile

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from capture_integrity import painted_region, reference_integrity


class CaptureIntegrityTests(unittest.TestCase):
    def test_blank_region_is_not_painted(self):
        result = painted_region(Image.new('RGB', (20, 20), '#020202'),
                                {'x': 0, 'y': 0, 'width': 20, 'height': 20})
        self.assertTrue(result['inBounds'])
        self.assertFalse(result['painted'])

    def test_outside_and_empty_regions_are_rejected(self):
        image = Image.new('RGB', (20, 20), 'white')
        for box in [{'x': -1, 'y': 0, 'width': 20, 'height': 20},
                    {'x': 0, 'y': 0, 'width': 21, 'height': 20},
                    {'x': 0, 'y': 0, 'width': 0, 'height': 20}]:
            self.assertFalse(painted_region(image, box)['painted'])

    def test_variation_outside_the_target_cannot_pass(self):
        image = Image.new('RGB', (20, 20), '#020202')
        image.putpixel((19, 19), (255, 255, 255))
        self.assertFalse(painted_region(image, {'x': 0, 'y': 0, 'width': 10, 'height': 10})['painted'])
        self.assertTrue(painted_region(image, {'x': 0, 'y': 0, 'width': 20, 'height': 20})['painted'])

    def test_invisible_rgb_variation_cannot_pass(self):
        image = Image.new('RGBA', (20, 20), (2, 2, 2, 0))
        image.putpixel((10, 10), (255, 255, 255, 0))
        self.assertFalse(painted_region(image, {'x': 0, 'y': 0, 'width': 20, 'height': 20})['painted'])

    def test_a_single_varying_color_channel_is_visible_paint(self):
        image = Image.new('RGB', (20, 20), (0, 0, 0))
        image.putpixel((10, 10), (255, 0, 0))
        self.assertTrue(painted_region(image, {'x': 0, 'y': 0, 'width': 20, 'height': 20})['painted'])


class ReferenceIntegrityTests(unittest.TestCase):
    def reference(self, directory, failures, font='Consolas'):
        image = Image.new('RGB', (20, 20), 'white')
        boxes = [{'x': position, 'y': position, 'w': 3, 'h': 3} for position in [1, 5, 9]]
        for box in boxes:
            image.putpixel((box['x'], box['y']), (0, 0, 0))
        data = {
            'height': 20, 'heightAfterCapture': 20, 'codeFontCalibration': 'Consolas',
            'viewportSequence': {'viewport': {'width': 20}}, 'failedImages': failures,
            'codePlatformFontsBefore': {'fonts': [{'familyName': font}]},
            'codePlatformFontsAfter': {'fonts': [{'familyName': font}]},
            'body': [{'tag': 'IMG', 'box': box} for box in boxes],
            'elements': [{'id': '2114cf22', 'box': {'x': 0, 'y': 0, 'w': 20, 'h': 20}}],
        }
        for profile in ['desktop', 'tablet', 'mobile']:
            image.save(directory / f'{profile}.png')
            (directory / f'{profile}.json').write_text(json.dumps(data))

    def test_intentionally_blocked_tracker_is_recorded(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            self.reference(directory, ['https://pixel.wp.com/g.gif?test=1'])
            result = reference_integrity(directory)
            self.assertTrue(result['passed'])
            self.assertEqual(result['profiles']['desktop']['blockedTrackingPixels'], ['https://pixel.wp.com/g.gif?test=1'])

    def test_required_image_failures_are_never_ignored(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            for url in ['https://nalksolutions.com/image.png', 'https://pixel.wp.com/required.png',
                        'https://pixel.wp.com.evil.invalid/g.gif']:
                self.reference(directory, [url])
                self.assertFalse(reference_integrity(directory)['passed'])

    def test_equal_but_incorrect_font_does_not_establish_stability(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            self.reference(directory, [], font='Courier New')
            self.assertFalse(reference_integrity(directory)['passed'])


if __name__ == '__main__':
    unittest.main()
