import unittest
from pathlib import Path
import sys
from bs4 import BeautifulSoup
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from entrance_motion import entrance, attach_entrance


class EntranceMotionTests(unittest.TestCase):
    def element(self, settings, classes=''):
        import json
        soup = BeautifulSoup('<div data-id="test"></div>', 'html.parser')
        soup.div['data-settings'] = json.dumps(settings)
        soup.div['class'] = classes.split()
        return soup.div

    def test_source_settings_preserve_delay_responsive_override_and_duration(self):
        element = self.element({'_animation': 'cmsmasters-fade-in-left', '_animation_delay': 300,
                                '_animation_mobile': 'cmsmasters-fade-in-up'}, 'animated-fast')
        self.assertEqual(entrance(element), {'kind': 'left', 'delay': 300, 'duration': 750, 'mobile': 'up'})
        self.assertEqual(entrance(self.element({'animation': 'none'})), None)

    def test_unreviewed_settings_fail_instead_of_executing_plugin_data(self):
        for settings, classes in [({'animation': 'bounce'}, ''),
                                  ({'animation': 'cmsmasters-fade-in', 'animation_delay': -1}, ''),
                                  ({'animation': 'cmsmasters-fade-in'}, 'animated-extra')]:
            with self.assertRaises(ValueError):
                entrance(self.element(settings, classes))

    def test_flattening_retains_text_and_nested_animation_ownership(self):
        motion = {'kind': 'up', 'delay': 150}
        heading = {'type': 'element', 'tag': 'h1', 'attributes': {}, 'variant': None, 'children': []}
        nodes = [{'type': 'text', 'text': '\n'}, heading]
        self.assertIs(attach_entrance(nodes, motion), nodes)
        self.assertEqual(heading['entrance'], motion)
        outer = attach_entrance(nodes, {'kind': 'fade', 'delay': 0})
        self.assertEqual(outer[0]['children'], nodes)
        self.assertEqual(attach_entrance([{'type': 'text', 'text': ' '}], motion), [{'type': 'text', 'text': ' '}])
