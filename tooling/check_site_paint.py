"""Check visible image regions against the same page's ordinary viewport evidence.

This verifies capture painting, not source-to-application design fidelity. Pixel checks
use unscaled RGB data, integer interior intersections and zero color tolerance.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]


def region_difference(full, viewport, box, scroll_y):
    left = max(0, math.ceil(box['x']))
    right = min(full.width, viewport.width, math.floor(box['x'] + box['width']))
    top = max(scroll_y, 0, math.ceil(box['y']))
    bottom = min(full.height, scroll_y + viewport.height, math.floor(box['y'] + box['height']))
    if left >= right or top >= bottom:
        return None
    full_region = full.crop((left, top, right, bottom)).convert('RGB')
    view_region = viewport.crop((left, top - scroll_y, right, bottom - scroll_y)).convert('RGB')
    diff = ImageChops.difference(full_region, view_region)
    red, green, blue = diff.split()
    maximum = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    changed = (right - left) * (bottom - top) - maximum.histogram()[0]
    return {'rect': [left, top, right, bottom], 'changedPixels': changed}


def checksum(file):
    with file.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('capture', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    if not all(path.resolve().is_relative_to(ROOT / 'tmp') for path in [args.capture, args.output]):
        raise ValueError('Capture evidence must remain inside tmp')
    data = json.loads(args.capture.read_bytes())
    if (data.get('capturePreparation') != 'ordinary-viewport-captures-v2' or
            data.get('captureStatus') != 'passed' or len(data['cases']) != len(data['selected']) * 3):
        raise ValueError('Complete viewport-prepared capture is required')
    result = {'capture': args.capture.as_posix(), 'captureSha256': checksum(args.capture),
              'colorTolerance': 0, 'resizing': False, 'cases': [], 'failures': []}
    for row in data['cases']:
        for kind in ['reference', 'current']:
            capture = row[kind]
            screenshot = Path(capture['screenshot'])
            if checksum(screenshot) != capture['sha256']:
                raise ValueError(f'Screenshot checksum drift: {screenshot}')
            checked = {'id': row['id'], 'profile': row['profile'], 'kind': kind, 'regions': 0, 'changedPixels': 0}
            with Image.open(screenshot) as full:
                sequence = capture['viewportSequence']
                for frame in sequence['frames']:
                    file = Path(sequence['directory']) / frame['file']
                    if checksum(file) != frame['sha256']:
                        raise ValueError(f'Viewport checksum drift: {file}')
                    with Image.open(file) as viewport:
                        for image in capture['metrics']['images']:
                            difference = region_difference(full, viewport, image['box'], frame['scrollY'])
                            if difference is None:
                                continue
                            checked['regions'] += 1
                            checked['changedPixels'] += difference['changedPixels']
                            if difference['changedPixels']:
                                result['failures'].append({'id': row['id'], 'profile': row['profile'],
                                    'kind': kind, 'image': image['src'], 'viewport': file.as_posix(),
                                    'fullPage': screenshot.as_posix(), **difference})
            result['cases'].append(checked)
    result['passed'] = not result['failures']
    result['summary'] = {'pageCaptures': len(result['cases']),
                         'imageRegions': sum(row['regions'] for row in result['cases']),
                         'failedRegions': len(result['failures'])}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open('x', encoding='utf8') as stream:
        stream.write(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'passed': result['passed'], **result['summary']}))
    if not result['passed']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
