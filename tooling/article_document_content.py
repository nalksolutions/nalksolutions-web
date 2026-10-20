"""Recover reviewed article typography and table structure without editor CSS."""
import re
from bs4 import Tag
from site_content import Converter

TABLE_STRUCTURE = {'table', 'thead', 'tbody', 'tfoot', 'tr'}


def cell_anchors(nodes):
    for node in nodes:
        if node['type'] != 'element':
            continue
        if node['tag'] in ('td', 'th', 'caption'):
            yield node
        else:
            yield from cell_anchors(node['children'])


class ArticleDocumentConverter(Converter):
    def children(self, element):
        nodes = super().children(element)
        if element.name not in TABLE_STRUCTURE:
            return nodes
        result, pending = [], []
        last_cell = None
        moved = 0
        for node in nodes:
            if node['type'] == 'text' and node['text']:
                if not re.fullmatch(r'[ \t\r\n\f]+', node['text']):
                    raise ValueError('Non-formatting text in article table structure')
                if last_cell is not None:
                    last_cell['children'].append(node)
                else:
                    pending.append(node)
                moved += 1
                continue
            anchors = list(cell_anchors([node]))
            if anchors:
                anchors[0]['children'][:0] = pending
                pending = []
                last_cell = anchors[-1]
            result.append(node)
        if pending:
            raise ValueError('Article table formatting has no content cell anchor')
        if moved:
            self.changes['table formatting whitespace relocated within cells'] += moved
        return result

    def variant(self, element):
        first = element.find(recursive=False) if element.name == 'div' else None
        if (first is not None and first.name in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')
                and first.get_text(strip=True) and super().variant(element) is None):
            self.changes['heading-led article prose group retained'] += 1
            return 'prose'
        if element.name == 'img' and 'alignnone' in element.get('class', []):
            self.changes['source unaligned image retained as inline image'] += 1
            return 'inline-image'
        if element.name == 'span' and re.fullmatch(
                r'font-weight:\s*400;\s*font-size:\s*16px;?', element.get('style', '').strip()):
            self.changes['source fixed 16px regular text retained as compact text'] += 1
            return 'compact-text'
        return super().variant(element)

    def node(self, element):
        # An empty heading pasted with an editor's response controls is not content.
        # Preserve headings with text, an anchor identity or any unreviewed attributes.
        if (isinstance(element, Tag) and element.name == 'h2' and not element.contents
                and set(element.attrs) == {'class'}
                and set(element['class']) == {'sr-only', 'select-none'}):
            self.changes['empty pasted response-control heading omitted'] += 1
            return []
        return super().node(element)
