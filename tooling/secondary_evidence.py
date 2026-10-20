"""Independent dimensions from the frozen profile CSS and team grid settings."""
import json
import re


def expectations(stylesheets, team_main):
    profile = stylesheets['uploads/elementor/css/post-156.css']
    heights = []
    for body in re.findall(r'\.elementor-element-42bb1d55\{([^}]*)\}', profile['text']):
        value = re.search(r'--min-height:(\d+)px;', body)
        if value:
            heights.append(int(value[1]))
    if heights != [730, 600, 400]:
        raise ValueError('Unreviewed profile portrait heights')
    settings = json.loads(team_main.select_one('[data-id="4e0ce9b"]')['data-settings'])
    values = [settings.get('columns'), settings.get('columns_tablet'), settings.get('columns_mobile')]
    if any(str(value) not in ('1','2','3') for value in values):
        raise ValueError('Unreviewed team grid setting')
    columns = [int(value) for value in values]
    if columns != [3, 2, 1]:
        raise ValueError(f'Unreviewed team grid columns: {columns}')
    return {'portraitHeights': dict(zip(['desktop', 'tablet', 'mobile'], heights, strict=True)),
            'teamColumns': dict(zip(['desktop', 'tablet', 'mobile'], columns, strict=True)),
            'sourceStylesheets': [{key: value for key, value in stylesheets[f'uploads/elementor/css/post-{id}.css'].items() if key != 'text'}
                                  for id in [7, 156, 63, 55736, 55267, 56, 110]]}
