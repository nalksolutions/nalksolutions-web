"""Strict offline conversion to a CMS-independent semantic tree.

Unknown markup fails conversion. Text (including code whitespace) is never trimmed.
This intermediate model is evidence for a later renderer/Sanity importer, not HTML
to inject into a page and not a claim of complete template reconstruction.
"""
import re
from urllib.parse import urlsplit

from bs4 import Comment, NavigableString, Tag


TYPES = {
    'p': 'paragraph', 'h2': 'heading', 'h3': 'heading', 'h4': 'heading',
    'h5': 'heading', 'h6': 'heading', 'strong': 'strong', 'em': 'emphasis',
    'code': 'inlineCode', 'ul': 'list', 'ol': 'list', 'li': 'listItem',
    'a': 'link', 'img': 'image', 'br': 'break', 'blockquote': 'quote',
    'table': 'table', 'thead': 'tableHead', 'tbody': 'tableBody',
    'tfoot': 'tableFoot', 'tr': 'tableRow', 'td': 'tableCell',
    'th': 'tableHeader', 'caption': 'caption', 'figure': 'figure',
    'figcaption': 'figureCaption',
}
ATTRIBUTES = {
    'a': {'href', 'title', 'target', 'rel', 'class'},
    'img': {'src', 'alt', 'width', 'height', 'srcset', 'sizes', 'class',
            'decoding', 'fetchpriority', 'loading'},
    'code': {'class'}, 'ol': {'start'},
    'td': {'colspan', 'rowspan'}, 'th': {'colspan', 'rowspan', 'scope'},
}


def safe_url(value, image=False):
    if not value or any(ord(char) < 32 for char in value) or '\\' in value:
        raise ValueError(f'Invalid URL: {value!r}')
    parsed = urlsplit(value)
    allowed = {'http', 'https'} if image else {'http', 'https', 'mailto', 'tel'}
    if parsed.scheme and parsed.scheme.lower() not in allowed:
        raise ValueError(f'Unsafe URL scheme: {value!r}')
    if parsed.username or parsed.password or value.startswith('//'):
        raise ValueError(f'Unsupported URL authority: {value!r}')
    if image and parsed.scheme != 'https':
        raise ValueError('Source images must have explicit HTTPS URLs')
    return value


def attributes(element):
    unknown = set(element.attrs) - ATTRIBUTES.get(element.name, set())
    if unknown:
        raise ValueError(f'Unreviewed attributes on {element.name}: {sorted(unknown)}')


def language(element):
    classes = element.get('class', [])
    if not classes:
        return None
    if len(classes) != 1 or not re.fullmatch(r'language-[a-zA-Z0-9_+-]+', classes[0]):
        raise ValueError(f'Unreviewed code classes: {classes}')
    return classes[0].removeprefix('language-')


def convert_node(element):
    if isinstance(element, Comment):
        raise ValueError('Comments require explicit review')
    if isinstance(element, NavigableString):
        return {'type': 'text', 'text': str(element)}
    if not isinstance(element, Tag):
        raise ValueError('Unknown source node')
    attributes(element)
    if element.name == 'pre':
        children = list(element.children)
        if len(children) != 1 or not isinstance(children[0], Tag) or children[0].name != 'code':
            raise ValueError('Code blocks must contain exactly one code element')
        code = children[0]
        attributes(code)
        if any(isinstance(child, Tag) for child in code.children):
            raise ValueError('Nested markup in code requires review')
        return {'type': 'codeBlock', 'language': language(code), 'text': code.get_text()}
    if element.name not in TYPES:
        raise ValueError(f'Unsupported element: {element.name}')
    node = {'type': TYPES[element.name]}
    if element.name.startswith('h') and element.name[1:].isdigit():
        node['level'] = int(element.name[1])
    if element.name in ('ul', 'ol'):
        node['ordered'] = element.name == 'ol'
        if element.has_attr('start'):
            node['start'] = int(element['start'])
    if element.name == 'code':
        node['language'] = language(element)
    if element.name == 'a':
        node['href'] = safe_url(element.get('href'))
        node['title'] = element.get('title')
        node['target'] = element.get('target')
        node['rel'] = element.get('rel', [])
        node['sourceClasses'] = element.get('class', [])
    if element.name in ('td', 'th'):
        for key in ('colspan', 'rowspan'):
            if element.has_attr(key):
                value = int(element[key])
                if value < 1:
                    raise ValueError('Invalid table span')
                node[key] = value
        if element.has_attr('scope'):
            node['scope'] = element['scope']
    if element.name == 'img':
        node['src'] = safe_url(element.get('src'), image=True)
        if not element.has_attr('alt'):
            raise ValueError('Missing image alt attribute')
        node['alt'] = element['alt']
        for key in ('width', 'height'):
            node[key] = int(element[key])
            if node[key] < 1:
                raise ValueError('Invalid image dimensions')
        node['sourceClasses'] = element.get('class', [])
        node['sizes'] = element.get('sizes')
        node['variants'] = []
        for candidate in element.get('srcset', '').split(','):
            if not candidate.strip():
                continue
            match = re.fullmatch(r'\s*(\S+)\s+(\d+)w\s*', candidate)
            if not match or int(match[2]) < 1:
                raise ValueError(f'Unsupported srcset entry: {candidate}')
            node['variants'].append({'src': safe_url(match[1], image=True), 'width': int(match[2])})
        node['sourceLoading'] = {key: element[key] for key in ('loading', 'decoding', 'fetchpriority') if element.has_attr(key)}
        return node
    node['children'] = [convert_node(child) for child in element.children]
    return node


def text_content(nodes):
    return ''.join(node.get('text', '') + text_content(node.get('children', [])) for node in nodes)


def walk(nodes):
    for node in nodes:
        yield node
        yield from walk(node.get('children', []))


def convert_body(element):
    nodes = [convert_node(child) for child in element.children]
    if text_content(nodes) != element.get_text():
        raise ValueError('Conversion changed source text')
    return nodes
