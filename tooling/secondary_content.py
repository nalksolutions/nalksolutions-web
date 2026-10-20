"""Reviewed active sitemap destinations: profiles, team, taxonomy and credits."""
import re
from bs4 import Tag
from site_content import Converter, media_path
from listing_content import ROLES as ENTRY_ROLES

SECONDARY_LAYOUTS = {
    'R-d5fcda349535d138': 'profile', 'R-8b1cabf904936a64': 'profile',
    'R-5b73d2c286b38347': 'profile', 'R-e075d151655dd535': 'profile',
    'R-b107566e96d3190e': 'profile-archive', 'R-5fd6127e85ea3748': 'profile-archive',
    'R-1ca4c50f71a6a456': 'credits', 'R-ae01622fce47a3ac': 'team',
}
SECTIONS = {
    'profile': ('326c11b3', '51b11bb2', '45db4c2d'),
    'profile-archive': ('9d0aace', '75dfd851'),
    'credits': ('aeddc6f', '2a2f733'), 'team': ('f09bb51', 'e26245e', 'f1a8c65'),
}
ROLES = {
    '326c11b3': 'profile-hero', '4b2fd6e7': 'profile-intro', '42bb1d55': 'portrait',
    '33651b25': 'profile-taxonomy', '3f73ef04': 'profile-contacts', '1fc16215': 'socials',
    '51b11bb2': 'profile-body', '1de7d71c': 'appointment', 'f16f8e3': 'appointment-card',
    '4959ac6b': 'profile-content', '8306b30': 'education',
    '3aa5fa54': 'education-row', '207fd9c6': 'education-row',
    '20da807d': 'education-row', '3f439050': 'education-row',
    '4c27c64': 'shifts', '302f1da9': 'shift-grid', 'cab745a': 'shift-grid', '45db4c2d': 'adjacent',
    '9d0aace': 'hero', '75dfd851': 'team-grid-section',
    'aeddc6f': 'hero', '2a2f733': 'credits-body',
    'f09bb51': 'hero', 'e26245e': 'team-grid-section', 'f1a8c65': 'enquiry',
    'ffe5093': 'enquiry-image', 'be06543': 'enquiry-copy',
    '47d88e72': 'team-image', '4610cd08': 'team-arrow',
    '5c18a86b': 'team-name', 'd05f039': 'team-taxonomy',
}
BACKGROUNDS = {
    'profile': '/wp-content/uploads/2025/10/71-profile-background-1.webp',
    'profile-archive': '/wp-content/uploads/2025/10/71-background-2.webp',
    'credits': '/wp-content/uploads/2025/08/71-background-2.webp',
    'team': '/wp-content/uploads/2025/08/71-background-5.webp',
}


class SecondaryConverter(Converter):
    def __init__(self, main, identity, stylesheet, rendered):
        super().__init__()
        self.layout = SECONDARY_LAYOUTS[identity]
        self.credit_columns = {match.group(1) for match in re.finditer(r'\.elementor-element-([a-f0-9]+)\{columns:2;\}', stylesheet)} if self.layout == 'credits' else set()
        observed = tuple(element.get('data-id') for element in main.select('.e-parent,.elementor-top-section')
                         if not element.find_parent('article') and not element.find_parent(attrs={'data-elementor-type': 'wp-post'}))
        if observed != SECTIONS[self.layout]:
            raise ValueError(f'Unreviewed secondary sections: {identity}: {observed}')
        self.backgrounds = {'hero': BACKGROUNDS[self.layout]}
        if 'https://nalksolutions.com' + self.backgrounds['hero'] not in stylesheet:
            raise ValueError('Secondary background differs from reviewed source')
        if self.layout == 'profile':
            rules = '\n'.join(style.get_text() for style in rendered.select('style'))
            portraits = {media_path(url) for selector, body in re.findall(r'([^{}]+)\{([^{}]*)\}', rules)
                         if 'elementor-element-42bb1d55' in selector
                         for url in re.findall(r'background-image:url\("([^"]+)"\)', body)}
            if len(portraits) != 1 or not re.fullmatch(r'/wp-content/uploads/2025/08/71-profile-\d+\.webp', next(iter(portraits))):
                raise ValueError('Missing or unreviewed frozen profile portrait')
            self.backgrounds['portrait'] = portraits.pop()
        for path in self.backgrounds.values():
            self.media[path] += 1
        templates = {element['data-elementor-id'] for element in main.select('[data-elementor-type="cmsmasters_entry"]')}
        if not templates <= ({'110'} if self.layout == 'profile' else {'56'}):
            raise ValueError('Unreviewed secondary card template')

    def node(self, element):
        if isinstance(element, Tag) and element.name == 'i' and 'cmsms-demo-icon-arrow-right' in element.get('class', []):
            return [{'type': 'element', 'tag': 'span', 'attributes': {},
                     'variant': 'listing-arrow' if element.find_parent('article') else 'secondary-arrow', 'children': []}]
        return super().node(element)

    def variant(self, element):
        ident = element.get('data-id')
        widget = element.get('data-widget_type', '').split('.')[0]
        classes = element.get('class', [])
        if 'cmsmasters-screen-only' in classes or 'elementor-screen-only' in classes:
            return 'secondary-sr-only'
        if 'elementor-widget-cmsmasters-post-navigation__wrap' in classes:
            return 'secondary-navigation'
        if 'elementor-widget-cmsmasters-featured-box__graphic-wrapper' in classes:
            return 'secondary-shift-graphic'
        if 'elementor-widget-cmsmasters-featured-box__description' in classes:
            return 'secondary-shift-description'
        if element.find_parent('article') and 'cmsmasters-button-link' in classes:
            return 'listing-read-more'
        if ident in self.credit_columns:
            return 'secondary-credit-copy'
        if element.find_parent('article') and ident in ENTRY_ROLES:
            return 'listing-' + ENTRY_ROLES[ident]
        if ident in ROLES:
            return 'secondary-' + ROLES[ident]
        if element.name == 'article':
            template = element.select_one('[data-elementor-type="cmsmasters_entry"]')
            return 'listing-blog-card' if template['data-elementor-id'] == '110' else 'secondary-team-card'
        if 'swiper-wrapper' in classes and self.layout == 'profile':
            return 'secondary-article-carousel'
        if 'cmsmasters-blog__posts' in classes:
            return None if self.layout == 'profile' else 'secondary-team-grid'
        if 'e-con-inner' in classes or 'elementor-container' in classes:
            return 'secondary-inner'
        if widget in ('cmsmasters-page-title', 'cmsmasters-woo-archive-title', 'cmsmasters-post-title', 'heading'):
            return 'secondary-heading'
        if widget == 'cmsmasters-breadcrumbs':
            return 'secondary-breadcrumbs'
        if widget == 'cmsmasters-featured-box':
            return 'secondary-shift'
        if widget in ('text-editor', 'cmsmasters-post-content'):
            return 'secondary-copy'
        if widget == 'cmsmasters-blog-slider':
            return 'secondary-articles'
        if 'cmsmasters-widget-breadcrumbs__sep' in classes:
            return 'secondary-breadcrumb-separator'
        return None
