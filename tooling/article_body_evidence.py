"""Independent article table, heading and quotation contracts from frozen theme CSS."""
import hashlib
import zipfile
from theme_evidence import heading_sizes, typography_sizes


def expectations(directory, kit):
    sources = []
    texts = []
    for glob, member in [('*uploads*.zip', 'uploads/elementor/css/softy-solutions-frontend.min.css'),
                         ('*-themes.zip', 'themes/softy-solutions/theme-config/assets/css/default-vars.min.css')]:
        matches = []
        for file in sorted(directory.glob(glob)):
            with zipfile.ZipFile(file) as archive:
                if member in archive.namelist():
                    raw = archive.read(member)
                    matches.append({'sourceArchive': file.name, 'sourceMember': member,
                                    'sha256': hashlib.sha256(raw).hexdigest()})
                    texts.append(raw.decode('utf8'))
        if len(matches) != 1:
            raise ValueError(f'Ambiguous or missing article theme stylesheet: {member}')
        sources.extend(matches)
    for fragment in ['margin-top:3rem;margin-bottom:3rem', '--cmsmasters-table-padding-top:20px',
                     'blockquote:not([class])',
                     '--cmsmasters-table-padding-right:30px', '--cmsmasters-blockquote-padding-top:60px',
                     'table,table th{text-align:inherit}',
                     'table thead td:first-child,table thead th:first-child{border-left-width:0;border-left-style:solid}']:
        if not any(fragment in text for text in texts):
            raise ValueError(f'Unreviewed article theme contract: {fragment}')
    header = next((block.rsplit('{', 1)[1] for block in texts[0].split('}')
                   if '{' in block and block.rsplit('{', 1)[0] == 'table thead td,table thead th'), '')
    if 'border-width:0 0 0 1px' not in header:
        raise ValueError('Unreviewed article table header borders')
    return {'headings': heading_sizes(kit['text']),
            'small': typography_sizes(kit['text'], 'small'),
            'quote': typography_sizes(kit['text'], 'blockquote'),
            'tableCellPadding': '20px 30px', 'quotePadding': '60px',
            'tableHeadingAlignment': 'inherit', 'tableHeadingFirstLeftBorder': '0px',
            'tableHeadingLastRightBorder': '0px',
            'sourceStylesheets': [*sources, {key: value for key, value in kit.items() if key != 'text'}]}
