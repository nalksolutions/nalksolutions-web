"""Recover finite entrance data and verify the exact source keyframes offline."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile
from bs4 import BeautifulSoup
from entrance_motion import entrance

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    routes = json.loads((ROOT/'docs/registers/routes.json').read_text(encoding='utf8'))['routes']
    scope = json.loads((ROOT/'docs/registers/navigation-scope.json').read_text(encoding='utf8'))
    active = {r['route_id'] for r in scope['routes'] if r['disposition'] == 'in-scope'}
    pages = []
    home = None
    for route in routes:
        if route['id'] not in active:
            continue
        source = (ROOT/'docs/registers'/route['baseline']['source_html']).read_bytes()
        soup = BeautifulSoup(source, 'html.parser')
        records = {}
        for element in soup.select('[data-id][data-settings]'):
            motion = entrance(element)
            if motion:
                identity = element['data-id']
                if identity in records and records[identity] != motion:
                    raise ValueError(f'Conflicting entrance identity: {identity}')
                records[identity] = motion
        pages.append({'id': route['id'], 'sourceSha256': hashlib.sha256(source).hexdigest(), 'elements': records})
        if route['observed']['path'] == '/':
            home = records
    if len(pages) != 107 or not home:
        raise ValueError('Incomplete active motion inventory')
    archive = next(file for file in (ROOT/'nalksolutions.com_wordpress_backup').glob('*-plugins.zip')
                   if not file.name.endswith('-mu-plugins.zip'))
    member = 'plugins/cmsmasters-elementor-addon/assets/css/frontend.css'
    with zipfile.ZipFile(archive) as source_zip:
        css = source_zip.read(member)
        elementor_css = source_zip.read('plugins/elementor/assets/css/frontend.min.css')
        for rule in [b'.animated.animated-slow{animation-duration:2s}',
                     b'.animated.animated-fast{animation-duration:.75s}']:
            if rule not in elementor_css:
                raise ValueError('Source fast/slow duration changed')
    text = css.decode('utf8')
    for fragment in ['transform: translateY(60px)', 'transform: translateX(-60px)',
                     'transform: translateX(60px)', 'transform: scale(0.75)',
                     'animation-duration: 1s', 'animation-timing-function: ease']:
        if fragment not in text:
            raise ValueError(f'Source motion definition changed: {fragment}')
    common = {'logo': '4ec0e67', 'links': 'f1de1cf', 'blog': 'dc2034a',
              'contact': '436ccb8', 'copyright': '09fd358'}
    home_common = dict(zip(common, ['638481a4', '6615c7ca', '12aefbf7', '6df94005', '1b4c12f1'], strict=True))
    about_common = dict(zip(common, ['643b08f', '188951d', '5094ec6', '5bbeb7b', '2ef5de5'], strict=True))
    footer = {role: home[identity] for role, identity in home_common.items()}
    for page in pages:
        for role, identity in common.items():
            if page['elements'].get(identity, page['elements'].get(home_common[role], page['elements'].get(about_common[role]))) != footer[role]:
                raise ValueError(f'Source footer motion varies: {page["id"]} {role}')
    outputs = {
        'src/content/motion/presets.generated.json': {'home': home, 'footer': footer},
        'tooling/sources/motion.generated.json': {
            'baselineId': 'nalk-wordpress-2026-10-15', 'pages': pages,
            'definition': {'sourceArchive': archive.name, 'sourceMember': member,
                           'sha256': hashlib.sha256(css).hexdigest(), 'duration': 1000, 'easing': 'ease',
                           'elementorDurationSource': 'plugins/elementor/assets/css/frontend.min.css',
                           'elementorDurationSha256': hashlib.sha256(elementor_css).hexdigest()}},
    }
    for file, data in outputs.items():
        destination = ROOT/file
        encoded = json.dumps(data, ensure_ascii=False, indent=2)+'\n'
        if args.check:
            if destination.read_text(encoding='utf8') != encoded:
                raise ValueError(f'Generated motion drift: {file}')
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(encoded, encoding='utf8', newline='\n')
    print(json.dumps({'passed': True, 'pages': len(pages), 'elements': sum(len(p['elements']) for p in pages)}))


if __name__ == '__main__':
    main()
