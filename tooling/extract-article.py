"""Recover the API article body and its media provenance without publishing assets."""
import argparse
from collections import Counter
import contextlib
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit
import zipfile

from bs4 import BeautifulSoup
from PIL import Image

from article_content import convert_body, text_content, walk

ROOT = Path(__file__).resolve().parents[1]
NAME = 'how-to-build-an-api-from-scratch-a-step-by-step-guide-fbbead80b209e23c'
SOURCE = ROOT / f'nalk-public-archive/html/source/{NAME}.html'
RECORD = ROOT / f'nalk-public-archive/pages/{NAME}.json'
TARGET = ROOT / 'tooling/sources/api-article.generated.json'
SELECTOR = '[data-id="1b907200"] .entry-content'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def media_inventory(nodes):
    references = Counter()
    for node in walk(nodes):
        if node['type'] == 'image':
            references[node['src']] += 1
            references.update(variant['src'] for variant in node['variants'])
    with contextlib.ExitStack() as stack:
        archives = [(file, stack.enter_context(zipfile.ZipFile(file)))
                    for file in sorted((ROOT / 'nalksolutions.com_wordpress_backup').glob('*uploads*.zip'))]
        media = []
        for url, count in sorted(references.items()):
            parsed = urlsplit(url)
            if parsed.netloc != 'nalksolutions.com' or parsed.query or parsed.fragment:
                raise ValueError(f'Media requires separate external-source recovery: {url}')
            prefix = '/wp-content/uploads/'
            path = unquote(parsed.path)
            if not path.startswith(prefix) or '..' in path.split('/'):
                raise ValueError(f'Unexpected media path: {path}')
            member = 'uploads/' + path.removeprefix(prefix)
            matches = [(file, archive) for file, archive in archives if member in archive.namelist()]
            if len(matches) != 1:
                raise ValueError(f'Expected one backup member for {member}, found {len(matches)}')
            file, archive = matches[0]
            data = archive.read(member)
            with Image.open(io.BytesIO(data)) as image:
                width, height = image.size
            media.append({'sourceUrl': url, 'publicPath': path, 'references': count,
                          'sourceArchive': file.name, 'sourceMember': member,
                          'sha256': sha(data), 'bytes': len(data), 'width': width, 'height': height})
    return media


def extract():
    source = SOURCE.read_bytes()
    soup = BeautifulSoup(source, 'html.parser')
    matches = soup.select(SELECTOR)
    if len(matches) != 1:
        raise ValueError(f'Expected exactly one article body, found {len(matches)}')
    body = matches[0]
    nodes = convert_body(body)
    counts = Counter(node['type'] for node in walk(nodes))
    headings = [{'level': node['level'], 'text': text_content(node['children'])}
                for node in walk(nodes) if node['type'] == 'heading']
    links = [node['href'] for node in walk(nodes) if node['type'] == 'link']
    media = media_inventory(nodes)
    image_by_url = {item['sourceUrl']: item for item in media}
    for node in walk(nodes):
        if node['type'] == 'image':
            asset = image_by_url[node['src']]
            if (node['width'], node['height']) != (asset['width'], asset['height']):
                raise ValueError('Image HTML dimensions disagree with backup bytes')
            for variant in node['variants']:
                if variant['width'] != image_by_url[variant['src']]['width']:
                    raise ValueError('Responsive image descriptor disagrees with backup bytes')
    h1 = soup.find_all('h1')
    if len(h1) != 1:
        raise ValueError('Expected exactly one source article title')
    return {
        'schemaVersion': 1, 'baselineId': 'nalk-wordpress-2026-10-15',
        'id': 'wordpress-post-59034', 'sourceRouteId': 'R-fbbead80b209e23c',
        'path': '/how-to-build-an-api-from-scratch-a-step-by-step-guide/',
        'locale': 'en', 'title': h1[0].get_text(),
        'provenance': {'sourceHtml': SOURCE.relative_to(ROOT).as_posix(), 'sourceSha256': sha(source),
                       'pageRecord': RECORD.relative_to(ROOT).as_posix(), 'pageRecordSha256': sha(RECORD.read_bytes()),
                       'bodySelector': SELECTOR, 'bodyTextSha256': sha(body.get_text().encode('utf8'))},
        'seo': {'title': soup.title.get_text(),
                'canonicals': [link['href'] for link in soup.select('head link[rel="canonical"]')],
                'meta': [{key: tag[key] for key in ('name', 'property', 'content') if tag.has_attr(key)}
                         for tag in soup.select('head meta[content]') if tag.has_attr('name') or tag.has_attr('property')],
                'jsonLd': [json.loads(tag.get_text()) for tag in soup.select('script[type="application/ld+json"]')]},
        'body': nodes, 'media': media,
        'reconciliation': {'sourceTextCharacters': len(body.get_text()), 'convertedTextCharacters': len(text_content(nodes)),
                           'nodeCounts': dict(sorted(counts.items())), 'headings': headings, 'links': links,
                           'unsupportedElements': [], 'missingMedia': [],
                           'scope': 'Complete captured article body only; excludes template, related posts and comments.'},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = extract()
    output = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        if TARGET.read_text(encoding='utf8') != output:
            raise ValueError('Article extraction drift; review source and regenerate explicitly')
    else:
        TARGET.write_text(output, encoding='utf8', newline='\n')
    print(json.dumps({'passed': True, 'mode': 'check' if args.check else 'generate',
                      'nodes': result['reconciliation']['nodeCounts'], 'mediaFiles': len(result['media'])}))


if __name__ == '__main__':
    main()
