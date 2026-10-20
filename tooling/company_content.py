"""Reviewed company-page structure and backgrounds, without a WordPress CSS runtime."""
import re

from bs4 import Tag

from site_content import Converter, walk

COMPANY_LAYOUTS = {
    'R-71192976f0e75fcc': 'about',
    'R-e83c0ad06ef3deb6': 'services',
    'R-a0ac0f2631af30d8': 'contacts',
    'R-56afdad51c5c96c4': 'arabic-company',
    'R-393cf74e2e96e1c4': 'sitemap',
}
SECTIONS = {
    '9962cea': 'company-about-hero', 'c199c19': 'company-values',
    '3717430': 'company-statements', 'c844222': 'company-message',
    '29155be': 'company-hidden', 'f598f62': 'company-offerings',
    '090a579': 'company-showcase', '4190d23': 'company-reviews-heading',
    'ebbcec3': 'company-testimonials', 'ced2686': 'company-contacts-hero',
    '739d881': 'company-contact-information', '8f2ff79': 'company-locations-heading',
    'e5bce08': 'company-locations', 'a8b3e6e': 'company-enquiry',
    '494dbaf': 'company-services-hero', 'bb79823': 'company-service-group',
    'bbb1f3f': 'company-service-group', '73f0e7d': 'company-service-group',
    '8632f19': 'company-service-group', 'a7880d8': 'company-service-grid',
    'ca2421d': 'company-service-grid', 'e230b43': 'company-service-grid',
    'e90a609': 'company-service-grid', '790c75f': 'company-services-cta',
    'b47f524': 'company-empty', '00de89d': 'company-ar-intro',
    'cff3fb1': 'company-ar-grid', '28c6043': 'company-ar-grid',
    '234735b': 'company-ar-cta',
}
BACKGROUND_ROLES = {
    'about-hero': ('R-71192976f0e75fcc', '9962cea', '/wp-content/uploads/2025/08/71-background-4.webp'),
    'values': ('R-71192976f0e75fcc', '0046639', '/wp-content/uploads/2025/06/3524367-scaled.jpg'),
    'message': ('R-71192976f0e75fcc', 'c844222', '/wp-content/uploads/2025/10/71-projects-background-1.webp'),
    'offerings': ('R-71192976f0e75fcc', 'f598f62', '/wp-content/uploads/2025/08/71-background-5-1.webp'),
    'showcase': ('R-71192976f0e75fcc', '090a579', '/wp-content/uploads/2025/10/71-shop-background-1.webp'),
    'contacts-hero': ('R-a0ac0f2631af30d8', 'ced2686', '/wp-content/uploads/2025/08/71-background-3.webp'),
    'services-hero': ('R-e83c0ad06ef3deb6', '494dbaf', '/wp-content/uploads/2025/08/71-background-5.webp'),
}
ROWS = {'282181c', '2dd9fc5', '48d6ae1', '684a7f0', '1e8235a', '09a5709'}
BADGES = {'c2e5399', '75e7deb', 'a652c60'}
SMALL_COPY = {'de43764', 'cfaf156', '43ebddd', '34eb902', 'ac7345f', 'a1619d8', 'c69d3d4'}
MAJOR_CARDS = {'ad047bb', 'e56d58b', 'a8593fc', '50149dd'}


class CompanyConverter(Converter):
    def __init__(self, main, route_id, stylesheet):
        super().__init__()
        self.route_id = route_id
        self.layout = COMPANY_LAYOUTS[route_id]
        sections = main.select('.e-parent, .elementor-top-section')
        for section in sections:
            if section.get('data-id') not in SECTIONS:
                raise ValueError(f'Unreviewed company section: {section.get("data-id")}')
        if self.layout != 'sitemap' and not sections:
            raise ValueError('Missing company page sections')
        self.backgrounds = {}
        for role, (identity, source_id, path) in BACKGROUND_ROLES.items():
            if identity != route_id:
                continue
            rules = [body for selector, body in re.findall(r'([^{}]+)\{([^{}]*)\}', stylesheet)
                     if f'.elementor-element-{source_id}' in selector and 'background-image:url(' in body]
            urls = {url for body in rules for url in re.findall(r'background-image:url\("([^"]+)"\)', body)}
            if urls != {'https://nalksolutions.com' + path}:
                raise ValueError(f'Unreviewed company background: {role}')
            self.backgrounds[role] = path
            self.media[path] += 1

    def node(self, element):
        if isinstance(element, Tag) and element.name == 'i' and not element.get_text():
            solutions = [value.removeprefix('cmsms-demo-icon-icon-') for value in element.get('class', [])
                         if value.startswith('cmsms-demo-icon-icon-')]
            if solutions:
                if len(solutions) != 1 or solutions[0] not in ('1', '2', '3', '4'):
                    raise ValueError('Unreviewed company service glyph')
                self.changes['reviewed decorative service glyph uses existing local icon font'] += 1
                return [{'type': 'element', 'tag': 'span', 'attributes': {},
                         'variant': 'company-icon-solution' + solutions[0], 'children': []}]
            shapes = [value.removeprefix('cmsms-demo-icon-shape-') for value in element.get('class', [])
                      if value.startswith('cmsms-demo-icon-shape-')]
            if shapes:
                if len(shapes) != 1 or shapes[0] not in ('1', '2', '3', '4', '5', '6', '7'):
                    raise ValueError('Unreviewed company icon glyph')
                if shapes[0] in ('6', '7'):
                    self.omitted['source shape class has no glyph in captured icon stylesheet'] += 1
                    return []
                self.changes['reviewed decorative shape uses existing local icon font'] += 1
                return [{'type': 'element', 'tag': 'span', 'attributes': {},
                         'variant': 'company-icon-shape' + shapes[0], 'children': []}]
        nodes = super().node(element)
        if (self.layout == 'contacts' and isinstance(element, Tag)
                and element.get('data-id') == '1ea9183'):
            wrapper = nodes[0]
            anchors = [node for node in wrapper['children'] if node.get('tag') == 'a']
            if len(anchors) != 1 or anchors[0]['attributes'] != {'href': 'tel:%20+923055518777'}:
                raise ValueError('Unreviewed Contacts link wrapper')
            anchors[0].update(tag='div', attributes={})
            destinations = {'+966 50 6000 843': 'tel:+966506000843',
                            '+92 305 551 8777': 'tel:+923055518777',
                            'info@nalksolutions.com': 'mailto:info@nalksolutions.com'}
            replaced = set()
            for node in walk(wrapper['children']):
                if node.get('variant') != 'company-feature-description':
                    continue
                children = []
                for child in node['children']:
                    match = next((label for label in destinations
                                  if child['type'] == 'text' and label in child['text']), None)
                    if match is None:
                        children.append(child)
                        continue
                    before, after = child['text'].split(match)
                    children.extend([{'type': 'text', 'text': before},
                                     {'type': 'element', 'tag': 'a', 'variant': None,
                                      'attributes': {'href': destinations[match]},
                                      'children': [{'type': 'text', 'text': match}]},
                                     {'type': 'text', 'text': after}])
                    replaced.add(match)
                node['children'] = children
            if replaced != set(destinations):
                raise ValueError('Contacts phone/email values differ from reviewed source')
            self.changes['Contacts phone and email values linked to their individual destinations'] += 1
        if (self.layout == 'about' and isinstance(element, Tag) and element.name == 'a'
                and element.get('href') in (None, '#') and element.get_text(strip=True) == 'View All Services'):
            if len(nodes) != 1 or nodes[0].get('variant') != 'company-button':
                raise ValueError('Unreviewed About services action')
            nodes[0]['attributes']['href'] = '/our-services/'
            self.changes['About placeholder services CTA linked to existing Services directory'] += 1
        return nodes

    def variant(self, element):
        classes = element.get('class', [])
        identity = element.get('data-id')
        widget = element.get('data-widget_type', '').split('.')[0]
        if (self.layout == 'arabic-company' and element.name == 'p' and
                element.get('style') == 'text-align:center; font-size:1.15rem;'):
            return 'company-ar-lead'
        if element.name == 'span' and element.get('style', '').strip() == 'font-size: 18px;text-align: start;white-space: normal':
            return 'company-inline-18'
        if element.name == 'span' and element.get('style', '').strip() == 'font-weight: 400;':
            return 'company-regular'
        if element.name == 'span' and element.get('style', '').strip() == 'background: linear-gradient(90deg, #f94c2d, #6d2785)':
            return 'company-highlight'
        if 'elementor-screen-only' in classes:
            return 'company-sr-only'
        if 'cmsmasters-testimonial__rating' in classes:
            if element.get_text(strip=True) != '5/5':
                raise ValueError('Unreviewed company testimonial rating')
            return 'company-rating'
        if identity == '49e8c48':
            return 'company-quote'
        if identity in ('6e51618', 'a8e5096', 'ab968fb'):
            return 'company-signature'
        if identity == '34d2ed2':
            return 'company-message-divider'
        if identity == '6cdc94a':
            if 'elementor-hidden-tablet' not in classes:
                raise ValueError('Unreviewed testimonial breakpoint visibility')
            return 'company-tablet-hidden-column'
        if identity in SECTIONS:
            return SECTIONS[identity]
        if identity == '0046639':
            return 'company-values-image'
        if identity in ROWS:
            return 'company-row'
        if identity in BADGES:
            return 'company-badge'
        if identity in SMALL_COPY:
            return 'company-small-copy'
        if identity == '1ea9183':
            return 'company-contact-details'
        if 'e-con-inner' in classes or 'elementor-container' in classes:
            return 'company-inner'
        if 'elementor-column' in classes:
            return 'company-column-third' if 'elementor-col-33' in classes else 'company-column'
        if 'e-con' in classes:
            return 'company-column'
        if widget == 'cmsmasters-featured-box':
            return 'company-major-card' if identity in MAJOR_CARDS else 'company-feature'
        if 'elementor-widget-cmsmasters-featured-box__graphic-wrapper' in classes:
            return 'company-feature-graphic'
        if 'elementor-widget-cmsmasters-featured-box__description' in classes:
            return 'company-feature-description'
        if 'elementor-widget-cmsmasters-featured-box__button' in classes:
            return 'company-feature-button'
        if widget == 'cmsmasters-testimonial':
            return 'company-testimonial'
        if 'cmsmasters-testimonial__author-info' in classes:
            return 'company-testimonial-author'
        if widget in ('heading', 'cmsmasters-title', 'cmsmasters-page-title'):
            return 'company-heading'
        if widget == 'text-editor':
            return 'company-copy'
        if widget == 'image':
            return 'company-image'
        if element.name == 'a' and any(value in classes for value in (
                'cmsmasters-button-link', 'elementor-button', 'elementor-widget-cmsmasters-button__button')):
            return 'company-button'
        return super().variant(element)
