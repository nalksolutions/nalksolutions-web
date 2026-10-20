"""Service role extraction must preserve content and reject unknown source layouts."""
import sys
import unittest
from pathlib import Path

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from service_content import ServiceConverter
from site_content import Converter, text_content, walk


def source(extra=''):
    return BeautifulSoup(
        '<main><section class="elementor-top-section" data-id="3784a1d3">'
        '<div class="elementor-container">'
        '<div class="elementor-column elementor-col-100"><h1>Service</h1>'
        '</div></div></section>'
        '<section class="elementor-top-section" data-id="710b7eea">'
        + ''.join(
            '<div data-to-value="' + str(n) + '">0</div>'
            for n in [15, 200, 98]
        )
        + '</section>' + extra + '</main>',
        'html.parser',
    ).main


class ServiceContentTests(unittest.TestCase):
    def test_tabs_preserve_all_source_labels_panels_and_copy(self):
        tabs = ''.join(f'<div class="elementor-tab-title elementor-tab-desktop-title" id="elementor-tab-title-20{n}" '
                       f'aria-controls="elementor-tab-content-20{n}" data-tab="{n}">Step {n}</div>' for n in range(1, 6))
        panels = ''.join(f'<div class="elementor-tab-title elementor-tab-mobile-title" data-tab="{n}">Step {n}</div>'
                         f'<div class="elementor-tab-content" id="elementor-tab-content-20{n}" data-tab="{n}"><p>Body {n}</p></div>' for n in range(1, 6))
        main = source('<div class="elementor-tabs-view-horizontal" data-widget_type="tabs.default">'
                      '<div class="elementor-tabs-wrapper">' + tabs + '</div>'
                      '<div class="elementor-tabs-content-wrapper">' + panels + '</div></div>')
        nodes = ServiceConverter(main, 'min-height:100vh;').children(main)
        self.assertEqual(text_content(nodes), text_content(Converter().children(main)))
        self.assertEqual(sum(n.get('variant') == 'service-tab-panel' for n in walk(nodes)), 5)
        self.assertEqual(sum(n.get('variant') == 'service-tab-mobile' for n in walk(nodes)), 5)
        main.select_one('.elementor-tab-desktop-title')['aria-controls'] = 'wrong-panel'
        with self.assertRaisesRegex(ValueError, 'identity or label'):
            ServiceConverter(main, 'min-height:100vh;')

    def test_frozen_rendered_state_overrides_pre_script_closed_markup(self):
        main = source('<div class="elementor-accordion-item"><div class="elementor-tab-title" id="faq-1">Question</div>'
                      '<div class="elementor-tab-content"><p>Answer</p></div></div>')
        rendered = BeautifulSoup(str(main), 'html.parser').main
        rendered.select_one('.elementor-tab-title')['class'].append('elementor-active')
        nodes = ServiceConverter(main, 'min-height:100vh;', rendered).children(main)
        self.assertTrue(next(n for n in walk(nodes) if n['type'] == 'disclosure')['open'])
        rendered.select_one('.elementor-tab-title')['id'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'identities differ'):
            ServiceConverter(main, 'min-height:100vh;', rendered)

    def test_layout_roles_preserve_all_text_and_empty_source_columns(self):
        main = source(
            '<section class="elementor-top-section">'
            '<div class="elementor-container">'
            '<div class="elementor-column elementor-col-50"></div>'
            '<div class="elementor-column elementor-col-50">'
            '<p>Right column <strong>content</strong></p>'
            '</div></div></section>'
        )
        nodes = ServiceConverter(main, 'min-height:100vh;').children(main)
        self.assertEqual(text_content(nodes), text_content(Converter().children(main)))
        roles = [n.get('variant') for n in walk(nodes)]
        self.assertEqual(roles.count('service-column-50'), 2)
        self.assertEqual(roles.count('service-hero'), 1)
        self.assertEqual(roles.count('service-statistics'), 1)

    def test_unreviewed_hero_columns_or_height_fail(self):
        with self.assertRaisesRegex(ValueError, 'hero height'):
            ServiceConverter(source(), 'min-height:80vh;')
        main = source()
        main.h1.decompose()
        with self.assertRaisesRegex(ValueError, 'title/counters'):
            ServiceConverter(main, 'min-height:100vh;')
        main = source('<div class="elementor-column elementor-col-20">X</div>')
        with self.assertRaisesRegex(ValueError, 'column width'):
            ServiceConverter(main, 'min-height:100vh;').children(main)

    def test_only_reviewed_alignment_is_extracted_from_source_css(self):
        main = source(
            '<div data-widget_type="heading.default" data-id="abcdef">'
            '<h2>Heading</h2></div>'
        )
        nodes = ServiceConverter(
            main,
            '.elementor-element-abcdef{text-align:center;} min-height:100vh;',
        ).children(main)
        self.assertTrue(
            any(n.get('variant') == 'service-heading-center' for n in walk(nodes))
        )
        self.assertNotIn('abcdef', str(nodes))

    def test_counter_numbers_and_labels_remain_separate_without_text_changes(self):
        main = source(
            '<div data-widget_type="counter.default">'
            '<div class="elementor-counter-title">Experience</div>'
            '<div class="elementor-counter-number-wrapper">'
            '<span data-to-value="15">0</span>+</div></div>'
        )
        nodes = ServiceConverter(main, 'min-height:100vh;').children(main)
        self.assertEqual(text_content(nodes), text_content(Converter().children(main)))
        self.assertTrue(
            any(n.get('variant') == 'service-counter-number' for n in walk(nodes))
        )

    def test_native_faq_retains_recorded_initial_open_state(self):
        main = source(
            '<div class="elementor-accordion-item">'
            '<div class="elementor-tab-title elementor-active">Question</div>'
            '<div class="elementor-tab-content">Answer</div></div>'
        )
        nodes = ServiceConverter(main, 'min-height:100vh;').children(main)
        details = next(n for n in walk(nodes) if n['type'] == 'disclosure')
        self.assertTrue(details['open'])
