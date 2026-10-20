"""Produce unmasked full-resolution pixel/geometry evidence and a review gallery.

No rescaling, padding, color tolerance or image registration enters the assertions.
Gallery thumbnails are only navigation aids; their linked originals are authoritative.
A report is not human acceptance. Default exit status fails on any strict difference;
--report-only writes the same failures without treating the audit as a release gate.
"""
import argparse
from collections import Counter
import hashlib
import html
import json
import os
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]


def pixel_summary(reference, current):
    if reference.size != current.size:
        return {'dimensionsMatch': False, 'referenceSize': list(reference.size),
                'currentSize': list(current.size), 'changedPixels': None, 'mismatchRatio': None,
                'strictEqual': False}
    diff = ImageChops.difference(reference.convert('RGB'), current.convert('RGB'))
    red, green, blue = diff.split()
    maximum = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    total = reference.width * reference.height
    changed = total - maximum.histogram()[0]
    return {'dimensionsMatch': True, 'referenceSize': list(reference.size),
            'currentSize': list(current.size), 'changedPixels': changed,
            'mismatchRatio': changed / total, 'differenceBounds': maximum.getbbox(),
            'strictEqual': changed == 0}


def file_hash(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('capture', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--report-only', action='store_true')
    args = parser.parse_args()
    for path in [args.capture, args.output]:
        if not path.resolve().is_relative_to(ROOT / 'tmp'):
            raise ValueError('Capture and report paths must stay inside tmp')
    args.output.mkdir(parents=True, exist_ok=False)
    raw = args.capture.read_bytes()
    capture = json.loads(raw)
    if not capture.get('finishedAt'):
        raise ValueError('Capture has not finished')
    report = {'baselineId': capture['baselineId'], 'capture': args.capture.as_posix(),
              'captureSha256': hashlib.sha256(raw).hexdigest(), 'browser': capture['browser'],
              'policy': {'colorTolerance': 0, 'masks': [], 'resizingForAssertions': False,
                         'geometryToleranceCssPx': 1, 'humanAcceptance': False}, 'cases': []}
    sections = []
    def link(path):
        return html.escape(Path(os.path.relpath(path, args.output)).as_posix(), quote=True)
    for row in capture['cases']:
        paths = {key: Path(row[key]['screenshot']) for key in ['reference', 'current']}
        for key, path in paths.items():
            if file_hash(path) != row[key]['sha256']:
                raise ValueError(f'Capture screenshot checksum drift: {path}')
        historical = Path(row['historicalScreenshot'])
        metrics = {key: row[key]['metrics'] for key in paths}
        record = {key: row[key] for key in ['id', 'path', 'family', 'profile', 'sourceHtmlSha256']}
        record['screenshots'] = {key: {'path': value.as_posix(), 'sha256': row[key]['sha256']}
                                 for key, value in paths.items()}
        record['historical'] = {'path': historical.as_posix(), 'sha256': file_hash(historical)}
        with Image.open(paths['reference']) as source, Image.open(paths['current']) as current, Image.open(historical) as original:
            record['alignedPixels'] = pixel_summary(source, current)
            record['historicalPixels'] = pixel_summary(original, current)
            record['referenceCalibration'] = {'historicalSize': list(original.size),
                                               'alignedSize': list(source.size),
                                               'dimensionsMatch': original.size == source.size}
            thumbnails = []
            for key, image in [('reference', source), ('current', current)]:
                thumb = args.output / f'{row["id"]}-{row["profile"]}-{key}.jpg'
                preview = image.convert('RGB')
                preview.thumbnail((320, 1800))
                preview.save(thumb, quality=80)
                thumbnails.append(f'<a href="{link(paths[key])}"><img loading="lazy" src="{link(thumb)}" alt="{key} preview; open full resolution"></a>')
        record['heightDelta'] = metrics['current']['height'] - metrics['reference']['height']
        record['footerDelta'] = {key: metrics['current']['footer']['box'][key] - metrics['reference']['footer']['box'][key]
                                 for key in ['x', 'y', 'width', 'height']}
        record['overflow'] = metrics['current']['width'] - metrics['current']['viewport']
        record['state'] = 'unreviewed'
        report['cases'].append(record)
        label = html.escape(f'{row["id"]} {row["path"]} — {row["profile"]}')
        difference = record['alignedPixels']['mismatchRatio']
        ratio = 'dimensions differ' if difference is None else f'{difference:.4%} pixels differ'
        sections.append(f'<article id="{row["id"]}-{row["profile"]}"><h2>{label}</h2><p>{ratio}; height delta {record["heightDelta"]}px. Unreviewed.</p><p><a href="{link(historical)}">Original archived screenshot</a></p><div class="pair">{"".join(thumbnails)}</div></article>')
    counts = Counter(row['alignedPixels']['strictEqual'] for row in report['cases'])
    report['summary'] = {'comparisons': len(report['cases']), 'strictEqual': counts[True],
                         'strictDifferent': counts[False], 'accepted': 0,
                         'captureFailures': capture.get('captureFailures', [])}
    (args.output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    document = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Nalk visual review</title><style>body{font:16px system-ui;background:#eee;color:#111;margin:24px}article{border-top:2px solid #666;margin-top:40px;padding-top:20px}.pair{display:flex;align-items:flex-start;gap:16px}.pair img{max-width:100%;height:auto}.pair a{max-width:48%}h2{font-size:18px;overflow-wrap:anywhere}</style><h1>Active page visual review</h1><p>Left: aligned frozen reference. Right: current application. Thumbnails aid navigation only; open originals for full-resolution inspection. No page is accepted by this report.</p>' + ''.join(sections) + '</html>'
    (args.output / 'index.html').write_text(document, encoding='utf8')
    print(json.dumps(report['summary']))
    if counts[False] and not args.report_only:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
