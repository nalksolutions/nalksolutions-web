"""Pixel-paint guards for the recovered article, independent of visual acceptance."""
import json
from pathlib import Path
from urllib.parse import urlsplit

from PIL import Image, ImageStat


def painted_region(image, box):
    bounds = tuple(round(value) for value in (
        box['x'], box['y'], box['x'] + box['width'], box['y'] + box['height']
    ))
    left, top, right, bottom = bounds
    in_bounds = 0 <= left < right <= image.width and 0 <= top < bottom <= image.height
    region = image.crop(bounds) if in_bounds else None
    opaque = region is not None and ('A' not in region.getbands() or region.getextrema()[-1] == (255, 255))
    extrema = ImageStat.Stat(region.convert('RGB')).extrema if region else []
    return {
        'bounds': bounds,
        'inBounds': in_bounds,
        'channelExtrema': extrema,
        'opaque': opaque,
        'painted': in_bounds and opaque and any(high > low for low, high in extrema),
    }


def reference_integrity(directory: Path):
    profiles = {}
    for profile in ['desktop', 'tablet', 'mobile']:
        data = json.loads((directory / f'{profile}.json').read_text())
        images = [element for element in data['body'] if element['tag'] == 'IMG']
        featured = next(element for element in data['elements'] if element['id'] == '2114cf22')
        rows = []
        with Image.open(directory / f'{profile}.png') as image:
            dimensions_match = image.size == (
                data['viewportSequence']['viewport']['width'], data['height']
            )
            for label, element in [('featured', featured), *[(f'diagram-{index + 1}', item) for index, item in enumerate(images)]]:
                box = element['box']
                rows.append({'image': label, **painted_region(image, {
                    'x': box['x'], 'y': box['y'], 'width': box['w'], 'height': box['h']
                })})
        blocked_tracking = [url for url in data['failedImages']
                            if (urlsplit(url).scheme, urlsplit(url).netloc, urlsplit(url).path)
                            == ('https', 'pixel.wp.com', '/g.gif')]
        failed_content = [url for url in data['failedImages'] if url not in blocked_tracking]
        stable = (
            data['height'] == data['heightAfterCapture']
            and data['codePlatformFontsBefore'] == data['codePlatformFontsAfter']
            and data['codeFontCalibration'] == 'Consolas'
            and bool(data['codePlatformFontsBefore']['fonts'])
            and all(font['familyName'] == 'Consolas' for font in data['codePlatformFontsBefore']['fonts'])
            and not failed_content
        )
        profiles[profile] = {
            'passed': stable and dimensions_match and len(images) == 3 and all(row['painted'] for row in rows),
            'stable': stable, 'dimensionsMatch': dimensions_match, 'images': rows,
            'blockedTrackingPixels': blocked_tracking, 'failedContentImages': failed_content,
        }
    return {
        'passed': all(profile['passed'] for profile in profiles.values()),
        'policy': 'Three complete source captures with painted featured images and all nine diagrams. Painting is not image identity or visual acceptance.',
        'profiles': profiles,
    }
