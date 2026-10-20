"""Reject blank featured-image captures; this is not a visual-parity check."""
import argparse
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageStat
from capture_integrity import painted_region

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run', type=Path)
    args = parser.parse_args()
    run = args.run.resolve()
    if not run.is_relative_to(ROOT / 'tmp'):
        raise ValueError('Expected a workspace-owned capture directory')
    rows = []
    for capture in sorted((run / 'browser/test-results').glob('*/article.png')):
        geometry = json.loads(capture.with_name('article-geometry.json').read_text())
        layout = json.loads(capture.with_name('article-layout.json').read_text())
        stable = layout['stable'] and layout['before'] == layout['after']
        box = geometry['.article-featured img']
        footer = geometry['.site-footer']
        with Image.open(capture) as image:
            # Inspect the interior, excluding rounded corners and surrounding page pixels.
            left = round(box['x'] + box['width'] / 4)
            top = round(box['y'] + box['height'] / 4)
            right = round(box['x'] + box['width'] * 3 / 4)
            bottom = round(box['y'] + box['height'] * 3 / 4)
            in_bounds = 0 <= left < right <= image.width and 0 <= top < bottom <= image.height
            extrema = ImageStat.Stat(image.crop((left, top, right, bottom)).convert('RGB')).extrema
            nonflat = all(high > low for low, high in extrema)
            dimensions = image.size == (layout['before']['width'], layout['before']['height'])
            footer_in_bounds = footer['y'] + footer['height'] <= image.height + 1
            diagrams = [painted_region(image, element['box']) for element in layout['before']['body'] if element['tag'] == 'IMG']
            diagrams_painted = len(diagrams) == 3 and all(item['painted'] for item in diagrams)
        with Image.open(capture.with_name('article-footer.png')) as footer_image:
            footer_size = footer_image.size
            # Locator screenshots enclose fractional edges in whole pixels on both sides.
            expected_footer_size = (math.ceil(footer['x'] + footer['width']) - math.floor(footer['x']),
                                    math.ceil(footer['y'] + footer['height']) - math.floor(footer['y']))
            footer_complete = footer_size == expected_footer_size
        rows.append({'project': capture.parent.name, 'passed': in_bounds and nonflat and stable and dimensions and footer_in_bounds and footer_complete and diagrams_painted,
                     'layoutStable': stable, 'captureDimensionsMatchDocument': dimensions,
                     'footerInBounds': footer_in_bounds, 'footerRegionSize': footer_size, 'footerRegionComplete': footer_complete,
                     'interiorBounds': [left, top, right, bottom], 'channelExtrema': extrema,
                     'diagramsPainted': diagrams_painted, 'diagrams': diagrams,
                     'captureSha256': hashlib.sha256(capture.read_bytes()).hexdigest()})
    passed = len(rows) == 6 and all(row['passed'] for row in rows)
    report = {'passed': passed, 'policy': 'Six stable full-page captures with painted featured images, all 18 body diagrams and complete footer bounds/regions. No visual acceptance.', 'captures': rows}
    (run / 'article-capture-check.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))
    raise SystemExit(0 if passed else 1)


if __name__ == '__main__':
    main()
