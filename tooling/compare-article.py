"""Strict article screenshot comparison; never modifies historical baselines."""
import argparse
import importlib.util
import json
from pathlib import Path

from PIL import Image
from capture_integrity import reference_integrity

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('compare_home', ROOT / 'tooling/compare-home.py')
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)

REGIONS = {
    'header': ('.site-header', '630f426'),
    'heading': ('.article-heading h1', '6991331c'),
    'featured': ('.article-featured img', '2114cf22'),
    'body': ('[data-article-body]', '1b907200'),
    'adjacent': ('.article-adjacent', '66af6fea'),
    'related': ('.article-related-track', '1fcd562b'),
    'footer': ('.site-footer', 'b5558fb'),
}


def crop(image, box, target):
    with Image.open(image) as source:
        bounds = (round(box['x']), round(box['y']), round(box['x'] + box['width']), round(box['y'] + box['height']))
        if not (0 <= bounds[0] < bounds[2] <= source.width and 0 <= bounds[1] < bounds[3] <= source.height):
            raise ValueError(f'Region outside screenshot: {target.name}')
        source.crop(bounds).save(target)


def viewport_comparison(expected, actual, output, profile):
    source = json.loads((expected / 'manifest.json').read_text())
    runtime = json.loads((actual / 'manifest.json').read_text())
    for key in ['browser', 'viewport', 'height']:
        if source[key] != runtime[key]:
            raise ValueError(f'Viewport sequence {key} differs: {profile}')
    if source.get('launchArgs', []) != runtime.get('launchArgs', []):
        raise ValueError('Viewport browser launch arguments differ')
    if len(source['frames']) != len(runtime['frames']):
        raise ValueError(f'Viewport sequence coverage differs: {profile}')
    frames = []
    for index, (left, right) in enumerate(zip(source['frames'], runtime['frames'])):
        if left['scrollY'] != right['scrollY']:
            raise ValueError(f'Viewport scroll position differs: {profile}/{index}')
        for directory, frame in [(expected, left), (actual, right)]:
            if comparison.sha(directory / frame['file']) != frame['sha256']:
                raise ValueError('Viewport screenshot integrity failure')
        frames.append({'scrollY': left['scrollY'],
                       'sourceSha256': left['sha256'], 'actualSha256': right['sha256'],
                       **comparison.compare(expected / left['file'], actual / right['file'], output / f'{profile}-viewport-{index:03}-diff.png')})
    return {'passed': all(frame['passed'] for frame in frames),
            'sourceManifestSha256': comparison.sha(expected / 'manifest.json'),
            'actualManifestSha256': comparison.sha(actual / 'manifest.json'), 'viewport': source['viewport'],
            'height': source['height'], 'frames': frames}


def calibrated_comparison(directory, profile, capture, output):
    reference_file = directory / f'{profile}.json'
    reference = json.loads(reference_file.read_text())
    layout = json.loads(capture.with_name('article-layout.json').read_text())
    if reference['codeFontCalibration'] != 'Consolas' or reference['height'] != reference['heightAfterCapture']:
        raise ValueError('Expected a stable, explicitly calibrated reference')
    if not layout['stable'] or layout['before'] != layout['after']:
        raise ValueError('Runtime capture changed layout')
    reference_image = directory / f'{profile}.png'
    result = {'referenceMetadataSha256': comparison.sha(reference_file),
              'referenceImageSha256': comparison.sha(reference_image),
              'codeFontCalibration': reference['codeFontCalibration'],
              'referenceBrowser': reference['browser'], 'runtimeBrowser': layout['browser'],
              'browserLaunchArgs': reference.get('browserLaunchArgs', []),
              'fullPage': comparison.compare(reference_image, capture, output / f'{profile}-calibrated-diff.png'),
              'regions': {}}
    if reference['browser'] != layout['browser']['version']:
        raise ValueError('Compare the reference and runtime with the same browser version')
    if reference.get('browserLaunchArgs', []) != layout['browser'].get('launchArgs', []):
        raise ValueError('Compare source/runtime with the same text-rendering policy')
    if [item['tag'] for item in reference['body']] != [item['tag'] for item in layout['before']['body']]:
        raise ValueError('Article body element identity/order differs')
    body_deltas = []
    for index, (source, actual) in enumerate(zip(reference['body'], layout['before']['body'])):
        delta = {key: actual['box'][key] - source['box'][source_key]
                 for key, source_key in [('x', 'x'), ('y', 'y'), ('width', 'w'), ('height', 'h')]}
        if any(delta.values()):
            body_deltas.append({'index': index, 'tag': source['tag'], 'delta': delta})
    result['bodyGeometry'] = {'elements': len(reference['body']), 'passed': not body_deltas, 'differences': body_deltas}
    font_file = capture.with_name('article-platform-fonts.json')
    if reference.get('textPlatformFonts') and font_file.exists():
        fonts = json.loads(font_file.read_text())
        result['textPlatformFonts'] = {'source': reference['textPlatformFonts'], 'runtime': fonts,
                                       'passed': reference['textPlatformFonts'] == fonts}
    for name, (selector, source_id) in REGIONS.items():
        source_box = next(item['box'] for item in reference['elements'] if item['id'] == source_id)
        expected = {'x': source_box['x'], 'y': source_box['y'], 'width': source_box['w'], 'height': source_box['h']}
        actual = layout['before']['landmarks'][selector]
        left = output / f'{profile}-{name}-reference.png'
        right = output / f'{profile}-{name}-actual.png'
        crop(reference_image, expected, left)
        crop(capture, actual, right)
        result['regions'][name] = {'expected': expected, 'actual': actual,
                                   'geometryDelta': {key: actual[key] - expected[key] for key in expected},
                                   'pixels': comparison.compare(left, right, output / f'{profile}-{name}-diff.png')}
    if 'viewportSequence' in reference:
        result['ordinaryViewports'] = viewport_comparison(directory / f'{profile}-viewports', capture.parent / 'article-viewports', output, profile)
        result['ordinaryRegions'] = {
            name: comparison.compare(directory / f'{profile}-{name}-viewport.png', capture.with_name(f'article-{name}-viewport.png'), output / f'{profile}-{name}-viewport-diff.png')
            for name in ['heading', 'paragraph', 'footer']
        }
    regions_match = all(
        item['pixels']['passed'] and all(value == 0 for value in item['geometryDelta'].values())
        for item in result['regions'].values()
    )
    result['passed'] = all([
        result['fullPage']['passed'],
        result['bodyGeometry']['passed'],
        result.get('textPlatformFonts', {'passed': True})['passed'],
        regions_match,
        result.get('ordinaryViewports', {'passed': True})['passed'],
        all(item['passed'] for item in result.get('ordinaryRegions', {}).values()),
    ])
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run', type=Path)
    parser.add_argument('--calibrated-reference', type=Path)
    args = parser.parse_args()
    run = args.run.resolve()
    if not any(run.is_relative_to(ROOT / f'tmp/chunk{chunk}') for chunk in [4, 5, 6, 7, 8]):
        raise ValueError('Expected an owned Chunk 4, 5, 6, 7 or 8 evidence directory')
    calibrated = args.calibrated_reference.resolve() if args.calibrated_reference else None
    if calibrated and not calibrated.is_relative_to(ROOT / 'tmp'):
        raise ValueError('Expected a workspace-owned calibrated reference')
    integrity = reference_integrity(calibrated) if calibrated else None
    if integrity and not integrity['passed']:
        raise ValueError('Incomplete source reference capture; repair painting before pixel comparison')
    manifest = json.loads((run / 'manifest.json').read_text())
    build_id = (ROOT / '.next/BUILD_ID').read_text().strip()
    if manifest['status'] != 'passed' or manifest['buildId'] != build_id:
        raise ValueError('Compare only a successful run from the current build')
    output = run / 'visual-article'
    output.mkdir(exist_ok=True)
    report = {'buildId': build_id, 'baselineId': manifest['baselineId'],
              'policy': 'Exact dimensions and pixels; no masks, resizing or baseline changes.',
              'referenceIntegrity': integrity, 'profiles': {}}
    for profile in ['desktop', 'tablet', 'mobile']:
        captures = list((run / 'browser/test-results').glob(f'*-chromium-{profile}/article.png'))
        if len(captures) != 1:
            raise ValueError(f'Expected one article capture for {profile}')
        source = ROOT / f'nalk-public-archive/screenshots/how-to-build-an-api-from-scratch-a-step-by-step-guide-fbbead80b209e23c--{profile}.png'
        result = comparison.compare(source, captures[0], output / f'{profile}-diff.png')
        result['sourceSha256'] = comparison.sha(source)
        result['actualSha256'] = comparison.sha(captures[0])
        if calibrated:
            result['calibrated'] = calibrated_comparison(calibrated, profile, captures[0], output)
        report['profiles'][profile] = result
    report['passed'] = all(item['passed'] and item.get('calibrated', {'passed': True})['passed'] for item in report['profiles'].values())
    (output / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report['passed'] else 1)


if __name__ == '__main__':
    main()
