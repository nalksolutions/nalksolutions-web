"""Finite source entrance settings; no plugin settings or executable CSS reach React."""
import json

KINDS = {'cmsmasters-fade-in': 'fade', 'cmsmasters-fade-in-up': 'up',
         'cmsmasters-fade-in-left': 'left', 'cmsmasters-fade-in-right': 'right',
         'cmsmasters-pop-in': 'pop'}


def entrance(element):
    if not element.has_attr('data-settings') or not element.has_attr('data-id'):
        return None
    settings = json.loads(element['data-settings'])
    prefix = '_' if settings.get('_animation') else ''
    name = settings.get(prefix + 'animation')
    if not name or name == 'none':
        return None
    if name not in KINDS:
        raise ValueError(f'Unreviewed entrance: {name}')
    durations = [value for value in element.get('class', []) if value.startswith('animated-')]
    if any(value not in ('animated-fast', 'animated-slow') for value in durations) or len(durations) > 1:
        raise ValueError('Unreviewed entrance duration class')
    motion = {'kind': KINDS[name], 'delay': settings.get(prefix + 'animation_delay') or 0}
    if durations:
        motion['duration'] = 750 if durations[0] == 'animated-fast' else 2000
    if type(motion['delay']) is not int or not 0 <= motion['delay'] <= 2000:
        raise ValueError('Unreviewed entrance delay')
    for breakpoint in ('mobile', 'tablet'):
        override = settings.get(prefix + 'animation_' + breakpoint)
        if override:
            if override not in KINDS:
                raise ValueError('Unreviewed responsive entrance')
            motion[breakpoint] = KINDS[override]
    return motion


def attach_entrance(nodes, motion):
    if not motion:
        return nodes
    if all(node['type'] == 'text' and not node['text'].strip() for node in nodes):
        return nodes
    elements = [node for node in nodes if node['type'] == 'element']
    if len(elements) != 1 or 'entrance' in elements[0] or any(node['type'] != 'element' and
                                (node['type'] != 'text' or node['text'].strip()) for node in nodes):
        return [{'type': 'element', 'tag': 'div', 'attributes': {}, 'variant': None,
                 'children': nodes, 'entrance': motion}]
    elements[0]['entrance'] = motion
    return nodes
