"""Extract only the reviewed global heading sizes and service-card breakpoints."""
import math
import re
import hashlib
import zipfile
from theme_evidence import heading_sizes


def icon_stylesheet(directory):
    member = 'uploads/elementor/cmsmasters-local-icons/cmsmasters-demo-icons/style.css'
    matches = []
    for file in sorted(directory.glob('*uploads*.zip')):
        with zipfile.ZipFile(file) as archive:
            if member in archive.namelist():
                data = archive.read(member)
                matches.append({'text': data.decode('utf8'), 'sourceArchive': file.name,
                                'sourceMember': member, 'sha256': hashlib.sha256(data).hexdigest()})
    if len(matches) != 1:
        raise ValueError('Expected exactly one source icon stylesheet')
    return matches[0]


def presentation_expectations(theme, services, icons):
    theme_text = theme['text']
    headings = heading_sizes(theme_text)
    widths = []
    for declarations in re.findall(r'\.elementor-element-31173f0\{([^}]*)\}', services['text']):
        width = re.search(r'max-width:([\d.]+)%;', declarations)
        if width:
            widths.append(float(width[1]))
    if widths != [31.5, 47, 100]:
        raise ValueError(f'Unreviewed service-card widths: {widths}')
    accent = re.search(r'--e-global-color-accent:#([a-fA-F0-9]{6});', theme_text.split('@media', 1)[0])
    if not accent:
        raise ValueError('Missing reviewed theme accent')
    rgb = [int(accent[1][offset:offset + 2], 16) for offset in (0, 2, 4)]
    glyphs = {}
    for source_family, public_family, count in (('shape', 'shape', 5), ('icon', 'solution', 4)):
        for index in range(1, count + 1):
            pattern = r'\.cmsms-demo-icon-' + source_family + '-' + str(index) + r':before\s*\{\s*content:\s*"\\([a-fA-F0-9]+)";\s*\}'
            match = re.search(pattern, icons['text'])
            if not match:
                raise ValueError('Missing reviewed source icon glyph')
            glyphs[f'{public_family}{index}'] = chr(int(match[1], 16))
    return {
        'glyphs': glyphs,
        'graphicFill': f'rgb({rgb[0]}, {rgb[1]}, {rgb[2]})',
        'headings': headings,
        'serviceColumns': {profile: math.floor(100 / width) for profile, width in
                           zip(('desktop', 'tablet', 'mobile'), widths, strict=True)},
        'sourceStylesheets': [{key: value for key, value in source.items() if key != 'text'}
                              for source in (theme, services, icons)],
    }
