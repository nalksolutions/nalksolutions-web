"""Inspect retained source structures before expanding local page coverage."""
from collections import Counter
import json
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]


def main():
    routes = json.loads((ROOT / 'docs/registers/routes.json').read_text(encoding='utf8'))['routes']
    pages = []
    for route in routes:
        if route['observed']['initial_status'] != 200:
            continue
        source = (ROOT / 'docs/registers' / route['baseline']['source_html']).resolve()
        soup = BeautifulSoup(source.read_bytes(), 'html.parser')
        main = soup.select_one('main, [data-elementor-type="cmsmasters_singular"], [data-elementor-type="cmsmasters_archive"]')
        if main is None:
            raise ValueError(f"Missing main: {route['id']}")
        pages.append({
            'id': route['id'], 'path': route['observed']['path'],
            'family': route['plan']['candidate_template_family'],
            'locale': route['plan']['locale_hint'],
            'characters': len(main.get_text()),
            'tags': dict(Counter(tag.name for tag in main.find_all(True))),
            'widgets': dict(Counter(tag['data-widget_type'] for tag in main.select('[data-widget_type]'))),
            'scripts': [tag.get('type', '') for tag in main.select('script')],
            'forms': len(main.select('form')), 'iframes': [tag.get('src') for tag in main.select('iframe')],
            'images': len(main.select('img')), 'headings': [tag.get_text(' ', strip=True) for tag in main.select('h1,h2,h3')],
        })
    directory = ROOT / 'tmp/chunk9'
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'source-survey.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps({'pages': len(pages), 'families': dict(Counter(row['family'] for row in pages)),
                      'tags': dict(sum((Counter(row['tags']) for row in pages), Counter())),
                      'widgets': dict(sum((Counter(row['widgets']) for row in pages), Counter())),
                      'forms': sum(row['forms'] for row in pages), 'iframes': sorted(set(url for row in pages for url in row['iframes']))}))


if __name__ == '__main__':
    main()
