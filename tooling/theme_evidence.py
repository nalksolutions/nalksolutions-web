"""Read the reviewed global kit heading contract for independent browser expectations."""
import re


def theme_blocks(theme_text):
    blocks = {'desktop': theme_text.split('@media', 1)[0]}
    for profile, width in (('tablet', 1180), ('mobile', 767)):
        match = re.search(r'@media\(max-width:' + str(width) + r'px\)\{:root\{([^}]*)\}', theme_text)
        if not match:
            raise ValueError(f'Missing reviewed theme breakpoint: {profile}')
        blocks[profile] = match[1]
    return blocks


def typography_sizes(theme_text, name):
    result = {}
    previous = None
    for profile, block in theme_blocks(theme_text).items():
        match = re.search(r'--e-global-typography-' + re.escape(name) + r'-font-size:(\d+)px;', block)
        if match:
            previous = int(match[1])
        if previous is None:
            raise ValueError(f'Missing reviewed typography size: {name}')
        result[profile] = previous
    return result


def heading_sizes(theme_text):
    blocks = theme_blocks(theme_text)
    headings = {}
    for profile, block in blocks.items():
        sizes = {}
        for level in range(1, 7):
            match = re.search(r'--e-global-typography-h' + str(level) + r'-font-size:(\d+)px;', block)
            if not match:
                raise ValueError(f'Missing reviewed heading size: {profile}/h{level}')
            sizes[f'h{level}'] = int(match[1])
        headings[profile] = sizes
    return headings
