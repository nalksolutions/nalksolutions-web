"""Convert captured page bodies to inert, typed content, without WordPress runtime code.

This is the complete-content baseline, not a visual reconstruction. Layout wrappers
become a small vocabulary of semantic groups. Unknown elements fail conversion.
"""
from collections import Counter
import re
from urllib.parse import unquote, urlsplit

from bs4 import Comment, NavigableString, Tag
from entrance_motion import entrance, attach_entrance

TAGS = {
    'div', 'section', 'article', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'p', 'img', 'figure', 'figcaption', 'strong', 'b', 'em', 'i', 'br',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
    'caption', 'blockquote', 'code', 'pre', 'hr', 'svg', 'g', 'path', 'circle',
}
OMIT = {'script', 'style', 'meta', 'animate'}
ATTRS = {
    'a': ('href', 'title', 'target', 'rel', 'aria-label', 'aria-current'),
    'img': ('src', 'alt', 'title', 'width', 'height', 'srcset', 'sizes'),
    'ol': ('start',), 'td': ('colspan', 'rowspan'), 'th': ('colspan', 'rowspan', 'scope'),
    'svg': ('viewbox', 'width', 'height', 'fill'),
    'path': ('d', 'fill', 'stroke', 'stroke-width', 'fill-rule', 'clip-rule'),
    'circle': ('cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'),
    'g': ('fill', 'stroke', 'transform'),
}
MEDIA_PREFIX = '/wp-content/uploads/'
EXTERNAL_AVATAR = 'https://secure.gravatar.com/avatar/579a7bde0ace771a4bb782feeb83aba48d2b689bebee8d20b924c6b2991e04fa?s=300&d=mm&r=g'
AVATAR_PATH = '/media/recovered/author-avatar.jpg'


def safe_link(value):
    value = value.strip()
    parsed = urlsplit(value)
    if (any(ord(char) < 32 for char in value) or '\\' in value or value.startswith('//')
            or parsed.username or parsed.password
            or parsed.scheme.lower() not in ('', 'http', 'https', 'mailto', 'tel')):
        raise ValueError(f'Unsafe content URL: {value!r}')
    if parsed.netloc.lower() in ('nalksolutions.com', 'www.nalksolutions.com'):
        return parsed.path or '/' if not parsed.query and not parsed.fragment else (
            (parsed.path or '/') + ('?' + parsed.query if parsed.query else '')
            + ('#' + parsed.fragment if parsed.fragment else ''))
    return value


def media_path(value):
    if value == EXTERNAL_AVATAR:
        return AVATAR_PATH
    path = unquote(safe_link(value))
    parsed = urlsplit(path)
    if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or not path.startswith(MEDIA_PREFIX):
        raise ValueError(f'Media is not a recovered upload: {value!r}')
    if '..' in path.split('/') or '%' in path or '\\' in path:
        raise ValueError(f'Unsafe media path: {value!r}')
    return path


def text_content(nodes):
    result = ''
    for node in nodes:
        if node['type'] == 'text':
            result += node['text']
        elif node['type'] == 'element':
            result += text_content(node['children'])
        elif node['type'] == 'disclosure':
            result += text_content(node['summary']) + text_content(node['children'])
    return result


def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get('summary', []))
        yield from walk(node.get('children', []))


def variant(element):
    classes = element.get('class', [])
    widget = element.get('data-widget_type', '').split('.')[0]
    # The captured theme applies its decorative quotation only to classless quotes.
    if element.name == 'blockquote' and classes:
        return 'plain-quote'
    if element.name == 'span' and element.get('style', '').strip() == 'font-weight: 400;':
        return 'regular'
    if element.name == 'a' and any('button' in item for item in classes):
        return 'button'
    if element.name == 'article':
        return 'card'
    if 'elementor-top-section' in classes or 'e-parent' in classes:
        return 'section'
    if 'elementor-container' in classes:
        return 'columns'
    if 'elementor-column' in classes:
        return 'column'
    if 'e-con' in classes:
        return 'group'
    if any(item in classes for item in ('swiper-wrapper', 'cmsmasters-blog__posts')):
        return 'cards'
    if any('pagination' in item for item in classes):
        return 'pagination'
    if widget in ('text-editor', 'cmsmasters-post-content'):
        return 'prose'
    if widget in ('cmsmasters-post-featured-image', 'image'):
        return 'media'
    if widget in ('cmsmasters-featured-box', 'icon-box', 'cmsmasters-testimonial', 'counter'):
        return {'counter': 'statistic', 'cmsmasters-testimonial': 'testimonial'}.get(widget, 'feature')
    if widget in ('cmsmasters-post-excerpt',):
        return 'excerpt'
    if widget in ('cmsmasters-meta-data', 'cmsmasters-breadcrumbs'):
        return 'metadata'
    if 'elementor-tab-title' in classes or any(item.endswith('__tab-title') for item in classes):
        return 'tab-heading'
    return None


class Converter:
    def __init__(self):
        self.motion_enabled = False
        self.media = Counter()
        self.omitted = Counter()
        self.changes = Counter()
        self.ids = set()
        self.forms = 0

    def variant(self, element):
        return variant(element)

    def children(self, element):
        return [node for child in element.children for node in self.node(child)]

    def form(self, element):
        if element.select_one('input[name="s"]'):
            self.changes['source search replaced by local content search'] += 1
            return [{'type': 'search'}]
        self.forms += 1
        fields = []
        for control in element.select('input:not([type="hidden"]), textarea, select'):
            field_id = control.get('id')
            label = element.find('label', attrs={'for': field_id}) if field_id else None
            if label is None:
                field = control.find_parent(class_='forminator-field')
                label = field.find('label') if field else None
            label_text = label.get_text(' ', strip=True) if label else control.get('placeholder', '')
            if control.get('data-field') in ('hours', 'minutes', 'ampm'):
                label_text = (label_text + ' ' + control['data-field']).strip()
            if not label_text:
                raise ValueError(f'Unlabelled enquiry field requires review: {control}')
            selected = control.select('option[selected]')
            if len(selected) > 1:
                raise ValueError('Multiple selected values require an explicit form contract')
            # Local controls use the recovered visible option labels as values; no legacy
            # Forminator transport is replayed. Preserve the actual initial selection.
            default = selected[0].get_text(' ', strip=True) if selected else control.get('value')
            fields.append({'label': label_text, 'name': control.get('name', ''),
                           'kind': control.name if control.name != 'input' else control.get('type', 'text'),
                           'required': control.has_attr('required') or control.get('aria-required') == 'true',
                           'options': [item.get_text(' ', strip=True) for item in control.select('option')],
                           **({'defaultValue': default} if default else {})})
        button = element.select_one('button, input[type="submit"]')
        self.changes['source form UI recovered; transport remains unconfigured'] += 1
        return [{'type': 'enquiry', 'fields': fields,
                 'buttonLabel': button.get_text(' ', strip=True) if button else 'Submit'}]

    def node(self, element):
        if isinstance(element, Comment):
            self.omitted['comment'] += 1
            return []
        if isinstance(element, NavigableString):
            text = str(element)
            normalized = text.replace('\r\n', '\n').replace('\r', '\n')
            if normalized != text:
                self.changes['HTML tokenizer line endings normalized to LF'] += 1
            return [{'type': 'text', 'text': normalized}]
        if not isinstance(element, Tag):
            raise ValueError('Unsupported document node')
        if element.name in OMIT:
            self.omitted[element.name] += 1
            return []
        if element.name == 'form':
            return self.form(element)
        if element.name == 'iframe':
            url = element.get('src', '')
            if not url.startswith('https://maps.google.com/maps?'):
                raise ValueError(f'Unreviewed embedded content: {url}')
            self.changes['map retained as explicit external map link'] += 1
            return [{'type': 'map', 'href': url, 'title': element.get('title', 'Map')}]
        if element.name in ('label', 'input', 'button', 'select', 'option', 'textarea'):
            raise ValueError(f'Control outside recovered form: {element.name}')
        if element.name not in TAGS:
            raise ValueError(f'Unreviewed element: {element.name}')
        classes = element.get('class', [])
        # Source icon fonts carry no text. Decorative SVGs remain inert paths.
        if element.name == 'i' and not element.get_text():
            self.omitted['decorative icon font'] += 1
            return []
        if 'elementor-tab-title' in classes and element.find_parent(attrs={'data-widget_type': 'accordion.default'}):
            # Accordion titles are handled with their sibling content below.
            return self.children(element)
        if 'elementor-accordion-item' in classes:
            summary = element.select_one('.elementor-tab-title')
            body = element.select_one('.elementor-tab-content')
            if summary is None or body is None:
                raise ValueError('Incomplete source accordion item')
            self.changes['accordion converted to native disclosure'] += 1
            summary_nodes = self.children(summary)
            # A source click handler lived on these title anchors. Native summary
            # owns activation now; nested links would intercept keyboard/clicks.
            for node in walk(summary_nodes):
                if node['type'] == 'element' and node['tag'] == 'a':
                    node.update(tag='span', attributes={}, variant=None)
            return [{'type': 'disclosure', 'summary': summary_nodes, 'children': self.children(body)}]
        attrs = {}
        for key in ATTRS.get(element.name, ()):
            if element.has_attr(key):
                value = element[key]
                attrs[key] = ' '.join(value) if isinstance(value, list) else str(value)
        if element.has_attr('id'):
            identifier = element['id']
            if identifier not in self.ids and identifier not in ('main-content', 'top'):
                self.ids.add(identifier)
                attrs['id'] = identifier
            else:
                self.changes['duplicate or shell-reserved source id removed'] += 1
        for key in ('lang', 'dir'):
            if element.has_attr(key):
                attrs[key] = element[key]
        if element.name == 'a':
            attrs['href'] = safe_link(attrs.get('href', '#'))
            if 'elementor-action' in attrs['href'] or attrs['href'].startswith('#cmsmasters-popup'):
                attrs['href'] = '/contacts/'
                self.changes['source popup CTA linked to contact page'] += 1
            if attrs.get('target') == '_blank':
                attrs['rel'] = ' '.join(sorted(set(attrs.get('rel', '').split()) | {'noopener', 'noreferrer'}))
        if element.name == 'img':
            attrs['src'] = media_path(attrs['src'])
            attrs['alt'] = attrs.get('alt', '')
            self.media[attrs['src']] += 1
            if attrs.get('srcset'):
                variants = []
                for item in attrs['srcset'].split(','):
                    match = re.fullmatch(r'\s*(\S+)\s+(\d+(?:\.\d+)?[wx])\s*', item)
                    if not match:
                        raise ValueError(f'Unreviewed responsive image: {item}')
                    path = media_path(match[1])
                    self.media[path] += 1
                    variants.append(f'{path} {match[2]}')
                attrs['srcset'] = ', '.join(variants)
        children = self.children(element)
        if element.has_attr('data-to-value'):
            children = [{'type': 'text', 'text': str(element['data-to-value'])}]
            self.changes['animated counter resolved to recorded final value'] += 1
        kind = self.variant(element)
        tag = element.name
        motion = entrance(element) if self.motion_enabled else None
        if tag in ('div', 'span') and not attrs and not kind:
            try:
                return attach_entrance(children, motion)
            except ValueError as error:
                raise ValueError(f'Entrance {str(element)[:550]}: {error}; children '
                                 f'{[(n["type"], n.get("tag")) for n in children]}') from error
        node = {'type': 'element', 'tag': tag, 'attributes': attrs,
                'variant': kind, 'children': children}
        if motion:
            node['entrance'] = motion
        if tag in ('br', 'hr', 'img') and children:
            # html.parser retains text inside malformed source </br> pairs.
            # HTML void elements cannot own children; retain that text as siblings.
            node['children'] = []
            self.changes['void-element content normalized to siblings'] += 1
            return [node, *children]
        return [node]


def source_main(soup):
    matches = soup.select('main, [data-elementor-type="cmsmasters_singular"], [data-elementor-type="cmsmasters_archive"]')
    # Some source templates nest singular content inside main; select the outer one.
    matches = [item for item in matches if not any(parent in matches for parent in item.parents)]
    if len(matches) != 1:
        raise ValueError(f'Expected one source content root, found {len(matches)}')
    return matches[0]
