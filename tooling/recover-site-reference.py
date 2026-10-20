"""Recover script-free active-page references into ignored tmp for visual measurement."""
import contextlib
import importlib.util
import json
import mimetypes
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import zipfile
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('reference_assets', ROOT/'tooling/recover-home-reference.py')
reference = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reference)
OUT = ROOT/'tmp/visual-alignment/reference'


def main():
    (OUT/'assets').mkdir(parents=True, exist_ok=True)
    scope = json.loads((ROOT/'docs/registers/navigation-scope.json').read_text(encoding='utf8'))
    active = {r['route_id'] for r in scope['routes'] if r['disposition'] == 'in-scope'}
    routes = json.loads((ROOT/'docs/registers/routes.json').read_text(encoding='utf8'))['routes']
    manifest = {'baselineId': 'nalk-wordpress-2026-10-15', 'assets': {}, 'pages': [], 'missing': []}
    external_file = ROOT/'tooling/sources/site-external-media.json'
    external = json.loads(external_file.read_text(encoding='utf8'))
    data = (ROOT/'public'/external['path'].lstrip('/')).read_bytes()
    if len(data) != external['bytes'] or reference.digest(data) != external['sha256']:
        raise ValueError('Reviewed author avatar reference bytes changed')
    url = urlsplit(external['sourceUrl'])
    manifest['assets'][url.scheme+'://'+url.netloc+url.path] = {
        'file': 'public'+external['path'], 'contentType':'image/jpeg',
        'sha256':external['sha256'], 'provenance':external_file.relative_to(ROOT).as_posix(),
        'retrievedAt':external['retrievedAt']}
    pending = []
    for route in routes:
        if route['id'] not in active:
            continue
        page = {'id': route['id'], 'path': route['observed']['path'], 'family': route['plan']['candidate_template_family'], 'profiles': {}}
        record = json.loads((ROOT/'docs/registers'/route['baseline']['page_record']).read_text(encoding='utf8'))
        for profile in ['desktop', 'tablet', 'mobile']:
            file = ROOT/'nalk-public-archive'/record['profiles'][profile]['rendered_html']
            data = file.read_bytes()
            soup = BeautifulSoup(data, 'html.parser')
            for element in soup.select('script,iframe,link[rel="preconnect"],link[rel="dns-prefetch"],link[rel="preload"]'):
                element.decompose()
            for element in soup.find_all():
                for attribute in list(element.attrs):
                    if attribute.lower().startswith('on'):
                        del element[attribute]
                for attribute in ['href', 'src', 'poster']:
                    value = element.get(attribute)
                    if value and Path(urlsplit(value).path).suffix.lower() in reference.REFERENCE_EXTENSIONS:
                        pending.append(urljoin(reference.ORIGIN, value))
                if element.get('srcset'):
                    pending.extend(urljoin(reference.ORIGIN, item.strip().split()[0]) for item in element['srcset'].split(',') if item.strip())
                pending.extend(urljoin(reference.ORIGIN, value) for value in reference.CSS_URL.findall(element.get('style', '')))
            for style in soup.find_all('style'):
                pending.extend(urljoin(reference.ORIGIN, value) for value in reference.CSS_URL.findall(style.get_text()))
            visibility = soup.new_tag('style')
            visibility.string = '.elementor-invisible{visibility:visible!important}'
            soup.head.append(visibility)
            destination = OUT/f'{route["id"]}-{profile}.html'
            encoded = str(soup).encode('utf8')
            destination.write_bytes(encoded)
            page['profiles'][profile] = {'html': destination.relative_to(ROOT).as_posix(), 'sourceSha256': reference.digest(data), 'referenceSha256': reference.digest(encoded),
                                          'historicalScreenshot': (ROOT/'docs/registers'/route['baseline']['screenshots'][profile]).resolve().relative_to(ROOT).as_posix()}
        manifest['pages'].append(page)
    with contextlib.ExitStack() as stack:
        index = {}
        for file in sorted(reference.BACKUP.glob('backup_*.zip')):
            archive = stack.enter_context(zipfile.ZipFile(file))
            for member in archive.namelist():
                if not member.endswith('/'):
                    index.setdefault(member, (file.name, archive, member))
        seen = set()
        while pending:
            url = pending.pop()
            parsed = urlsplit(url)
            if parsed.scheme not in ['https', 'http']:
                continue
            key = parsed.scheme+'://'+parsed.netloc+parsed.path
            if key in seen:
                continue
            seen.add(key)
            member = reference.source_path(url)
            extension = Path(member).suffix.lower()
            if extension not in reference.REFERENCE_EXTENSIONS:
                continue
            if member not in index:
                manifest['missing'].append({'url': key, 'candidate': member})
                continue
            name, archive, member = index[member]
            data = archive.read(member)
            source_hash = reference.digest(data)
            if extension == '.svg':
                # Legacy SVG font files carry a static external SVG 1.1 declaration.
                # Strip that declaration in the isolated reference, retaining its source hash.
                if '/fonts/' in member and b'<font ' in data and b'<!ENTITY' not in data.upper():
                    data = re.sub(br'<!DOCTYPE[^>]*>', b'', data)
                reference.safe_svg(data, key)
            if extension == '.css':
                def replace(match):
                    if match[1].startswith(('data:', '#')):
                        return match[0]
                    absolute = urljoin(reference.ORIGIN+'/wp-content/'+member, match[1])
                    pending.append(absolute)
                    return 'url("'+absolute+'")'
                data = reference.CSS_URL.sub(replace, data.decode('utf-8-sig')).encode()
            destination = OUT/'assets'/(reference.digest(data)[:24]+extension)
            if not destination.exists():
                destination.write_bytes(data)
            info = {'file': destination.relative_to(ROOT).as_posix(), 'contentType': mimetypes.guess_type(member)[0] or 'application/octet-stream',
                    'sourceArchive': name, 'sourceMember': member, 'sourceSha256': source_hash, 'sha256': reference.digest(data)}
            manifest['assets'][key] = info
            manifest['assets'].setdefault(reference.ORIGIN+'/wp-content/'+member, info)
    (OUT/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
    print(json.dumps({'pages': len(manifest['pages']), 'assets': len(manifest['assets']), 'missing': manifest['missing']}))


if __name__ == '__main__':
    main()
