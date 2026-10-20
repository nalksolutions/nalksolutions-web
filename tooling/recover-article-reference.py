"""Recover a script-free article reference under tmp; publish no runtime files."""
import contextlib
import importlib.util
import json
import mimetypes
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import zipfile

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('reference', ROOT / 'tooling/recover-home-reference.py')
reference = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reference)
OUT = ROOT / 'tmp/chunk5-reference'
STEM = 'how-to-build-an-api-from-scratch-a-step-by-step-guide-fbbead80b209e23c'


def main():
    (OUT / 'assets').mkdir(parents=True, exist_ok=True)
    manifest = {'source': f'nalk-public-archive/pages/{STEM}.json', 'assets': {}, 'missing': []}
    record = json.loads((ROOT / manifest['source']).read_text(encoding='utf8'))
    pending = []
    for profile in ['desktop', 'tablet', 'mobile']:
        source = ROOT / 'nalk-public-archive' / record['profiles'][profile]['rendered_html']
        soup = BeautifulSoup(source.read_bytes(), 'html.parser')
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
        (OUT / f'{profile}.html').write_text(str(soup), encoding='utf8', newline='\n')
    with contextlib.ExitStack() as stack:
        index = {}
        for file in sorted(reference.BACKUP.glob('backup_*.zip')):
            archive = stack.enter_context(zipfile.ZipFile(file))
            for member in archive.namelist():
                index.setdefault(member, (file.name, archive, member))
        seen = set()
        while pending:
            url = pending.pop(0)
            parsed = urlsplit(url)
            if parsed.scheme not in ['https', 'http']:
                continue
            key = parsed.scheme + '://' + parsed.netloc + parsed.path
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
            archive_name, archive, member = index[member]
            data = archive.read(member)
            source_hash = reference.digest(data)
            if extension == '.css':
                def replace(match):
                    if match[1].startswith(('data:', '#')):
                        return match[0]
                    absolute = urljoin(reference.ORIGIN + '/wp-content/' + member, match[1])
                    pending.append(absolute)
                    return 'url("' + absolute + '")'
                data = reference.CSS_URL.sub(replace, data.decode('utf-8-sig')).encode()
            destination = OUT / 'assets' / (reference.digest(data)[:20] + extension)
            destination.write_bytes(data)
            info = {'file': destination.relative_to(ROOT).as_posix(),
                    'contentType': mimetypes.guess_type(member)[0] or 'application/octet-stream',
                    'sourceArchive': archive_name, 'sourceMember': member, 'sourceSha256': source_hash}
            manifest['assets'][key] = info
            manifest['assets'].setdefault(reference.ORIGIN + '/wp-content/' + member, info)
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps({'assets': len(manifest['assets']), 'missing': manifest['missing']}))


if __name__ == '__main__':
    main()
