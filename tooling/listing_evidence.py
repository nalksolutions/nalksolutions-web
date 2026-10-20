"""Read the finite reviewed listing dimensions from backup CSS, outside runtime imports."""
import re
from theme_evidence import heading_sizes, typography_sizes


def presentation_expectations(styles):
    sources = [styles[f'uploads/elementor/css/post-{ident}.css'] for ident in (7, 133, 136, 26492, 110, 152, 149)]
    def values(index, pattern, expected):
        found = [int(value) for value in re.findall(pattern, sources[index]['text'])]
        if found != expected:
            raise ValueError(f'Unreviewed listing presentation: {found} != {expected}')
        return found
    columns = values(3, r'--cmsmasters-blog-columns:(\d+);', [3, 1, 1])
    padding = values(1, r'elementor-element-605f92a5\{[^{}]*?--padding-top:(\d+)px;', [245, 200, 160])
    heights = values(4, r'elementor-element-38c150fe\{height:(\d+)px;', [280, 172])
    photo = values(5, r'elementor-element-67240464\{[^{}]*?--padding-bottom:(\d+)px;', [300])
    return {'headings': heading_sizes(sources[0]['text']),
            'taxonomySize': typography_sizes(sources[0]['text'], 'taxonomy'),
            'blogColumns': dict(zip(('desktop', 'tablet', 'mobile'), columns, strict=True)),
            'heroPaddingTop': dict(zip(('desktop', 'tablet', 'mobile'), padding, strict=True)),
            'blogImageHeight': {'tablet': heights[0], 'mobile': heights[1]},
            'rowImageHeight': photo[0],
            'sourceStylesheets': [{key: value for key, value in source.items() if key != 'text'} for source in sources]}
