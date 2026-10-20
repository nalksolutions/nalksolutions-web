"""Map the reviewed service template to semantic roles; never replay source CSS."""
import hashlib
import re
import zipfile

from site_content import Converter

SERVICE_FAMILIES = {'service-or-location', 'arabic-marketing'}
COMPANY_ROUTE = 'R-56afdad51c5c96c4'


def is_service(route):
    return route['plan']['candidate_template_family'] in SERVICE_FAMILIES and route['id'] != COMPANY_ROUTE


def source_stylesheets(directory):
    result = {}
    for file in sorted(directory.glob('*uploads*.zip')):
        with zipfile.ZipFile(file) as archive:
            for member in archive.namelist():
                if re.fullmatch(r'uploads/elementor/css/post-\d+\.css', member):
                    if member in result:
                        raise ValueError(f'Ambiguous source stylesheet: {member}')
                    data = archive.read(member)
                    result[member] = {'text': data.decode('utf8'), 'sourceArchive': file.name,
                                      'sourceMember': member, 'sha256': hashlib.sha256(data).hexdigest()}
    return result


class ServiceConverter(Converter):
    def __init__(self, main, stylesheet, rendered=None):
        super().__init__()
        self.active_disclosures = None
        if rendered is not None:
            original = [element.get('id') for element in main.select('.elementor-accordion-item .elementor-tab-title')]
            captured = [element.get('id') for element in rendered.select('.elementor-accordion-item .elementor-tab-title')]
            if original != captured or any(not identity for identity in original):
                raise ValueError('Rendered service accordion identities differ')
            self.active_disclosures = {element['id'] for element in rendered.select('.elementor-accordion-item .elementor-tab-title.elementor-active')}
        sections = main.select('.elementor-top-section')
        if [section.get('data-id') for section in sections[:2]] != ['3784a1d3', '710b7eea']:
            raise ValueError('Unreviewed service hero/statistics structure')
        if len(sections[0].select('h1')) != 1 or len(sections[1].select('[data-to-value]')) != 3:
            raise ValueError('Unreviewed service title/counters')
        if 'min-height:100vh' not in stylesheet:
            raise ValueError('Missing recorded service hero height')
        # Extract just the reviewed alignment setting, not arbitrary CSS declarations.
        self.centered = set(re.findall(r'\.elementor-element-([a-f0-9]+)\{text-align:center;\}', stylesheet))
        for widget in main.select('[data-widget_type="tabs.default"]'):
            titles = widget.select('.elementor-tab-desktop-title')
            mobile = widget.select('.elementor-tab-mobile-title')
            panels = widget.select('.elementor-tab-content')
            if ('elementor-tabs-view-horizontal' not in widget.get('class', []) or
                    not 5 <= len(titles) <= 7 or len(titles) != len(mobile) or len(titles) != len(panels)):
                raise ValueError('Unreviewed service tabs structure')
            for index, (title, small, panel) in enumerate(zip(titles, mobile, panels, strict=True), 1):
                if (not re.fullmatch(r'elementor-tab-title-\d+', title.get('id', '')) or
                        not re.fullmatch(r'elementor-tab-content-\d+', panel.get('id', '')) or
                        title.get('aria-controls') != panel['id'] or
                        [node.get('data-tab') for node in (title, small, panel)] != [str(index)] * 3 or
                        title.get_text() != small.get_text()):
                    raise ValueError('Service tab identity or label mismatch')
            if rendered is not None:
                captured = rendered.select(f'[data-id="{widget["data-id"]}"] .elementor-tab-desktop-title.elementor-active')
                if [title.get('id') for title in captured] != [titles[0]['id']]:
                    raise ValueError('Unreviewed service tab initial state')

    def node(self, element):
        result = super().node(element)
        if len(result) == 1 and result[0]['type'] == 'disclosure':
            summary = element.select_one('.elementor-tab-title')
            result[0]['open'] = (summary.get('id') in self.active_disclosures if self.active_disclosures is not None
                                 else 'elementor-active' in summary.get('class', []))
        return result

    def variant(self, element):
        classes = element.get('class', [])
        widget = element.get('data-widget_type', '').split('.')[0]
        if widget == 'tabs':
            return 'service-tabs'
        for source, role in [('elementor-tabs-wrapper', 'service-tabs-list'),
                             ('elementor-tabs-content-wrapper', 'service-tabs-body'),
                             ('elementor-tab-desktop-title', 'service-tab'),
                             ('elementor-tab-mobile-title', 'service-tab-mobile')]:
            if source in classes:
                return role
        if 'elementor-tab-content' in classes and element.find_parent(attrs={'data-widget_type': 'tabs.default'}):
            return 'service-tab-panel'
        if 'elementor-icon-box-wrapper' in classes:
            return 'service-feature-inner'
        if 'elementor-icon-box-icon' in classes:
            return 'service-feature-icon'
        if 'elementor-icon-box-content' in classes:
            return 'service-feature-copy'
        if 'elementor-accordion-icon' in classes:
            return 'service-faq-icon'
        if 'elementor-accordion-icon-opened' in classes:
            return 'service-faq-open-icon'
        if 'elementor-accordion-icon-closed' in classes:
            return 'service-faq-closed-icon'
        if 'elementor-top-section' in classes:
            return {'3784a1d3': 'service-hero', '710b7eea': 'service-statistics'}.get(element.get('data-id'), 'service-section')
        if 'elementor-inner-section' in classes:
            return 'service-inner'
        if 'elementor-container' in classes:
            return 'service-columns'
        if 'elementor-column' in classes:
            widths = [value.removeprefix('elementor-col-') for value in classes if value.startswith('elementor-col-')]
            if len(widths) != 1 or widths[0] not in ('25', '33', '50', '100'):
                raise ValueError(f'Unreviewed service column width: {widths}')
            return f'service-column-{widths[0]}'
        if 'elementor-counter-title' in classes:
            return 'service-counter-title'
        if 'elementor-counter-number-wrapper' in classes:
            return 'service-counter-number'
        if any(value in classes for value in ('elementor-counter-number', 'elementor-counter-number-prefix', 'elementor-counter-number-suffix')):
            return 'service-counter-part'
        if widget == 'counter':
            return 'service-counter'
        if widget in ('heading', 'text-editor', 'button'):
            role = {'heading': 'heading', 'text-editor': 'copy', 'button': 'action'}[widget]
            centered = element.get('data-id') in self.centered or 'elementor-align-center' in classes
            return f'service-{role}' + ('-center' if centered else '')
        if element.name == 'a' and 'elementor-button' in classes:
            return 'service-button'
        if widget == 'icon-box':
            return 'service-feature'
        return super().variant(element)
