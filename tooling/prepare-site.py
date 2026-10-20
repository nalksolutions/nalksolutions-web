"""Recover every retained captured page and allowlisted image from frozen inputs.

No network, SQL imports, arbitrary asset copying or raw HTML enters the runtime.
Use --check to reproduce content and validate published bytes without writing.
"""
import argparse
from collections import Counter
import contextlib
import hashlib
import io
import json
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup
from PIL import Image

from site_content import Converter, MEDIA_PREFIX, AVATAR_PATH, source_main, text_content, walk, safe_link
from article_presentation import extract_presentation, one
from service_content import ServiceConverter, is_service, source_stylesheets
from company_content import CompanyConverter, COMPANY_LAYOUTS, BACKGROUND_ROLES
from company_evidence import presentation_expectations, icon_stylesheet
from listing_content import ListingConverter, LISTING_FAMILIES, BACKGROUNDS as LISTING_BACKGROUNDS, BLOG_ID, query_views
from listing_evidence import presentation_expectations as listing_expectations
from secondary_content import SecondaryConverter, SECONDARY_LAYOUTS
from secondary_evidence import expectations as secondary_expectations
from article_body_evidence import expectations as article_body_expectations
from article_document_content import ArticleDocumentConverter

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'src/content/site'
SPECIAL = {'R-91d9b62648d713d4', 'R-fbbead80b209e23c'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def output(file, data, check):
    encoded = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if check:
        if file.read_text(encoding='utf8') != encoded:
            raise ValueError(f'Generated content drift: {file.relative_to(ROOT)}')
    else:
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(encoded, encoding='utf8', newline='\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    active_ids = {route['route_id'] for route in json.loads(
        (ROOT / 'docs/registers/navigation-scope.json').read_text(encoding='utf8'))['routes']
        if route['disposition'] == 'in-scope'}
    register = json.loads((ROOT / 'docs/registers/routes.json').read_text(encoding='utf8'))
    fixtures = json.loads((ROOT / 'src/content/fixtures/pages.json').read_text(encoding='utf8'))
    pages, reports, media = [], [], Counter()
    secondary_assets = {}
    secondary_presentation = None
    families = Counter()
    stylesheets = source_stylesheets(ROOT / 'nalksolutions.com_wordpress_backup')
    company_expectations = presentation_expectations(
        stylesheets['uploads/elementor/css/post-7.css'],
        stylesheets['uploads/elementor/css/post-55355.css'],
        icon_stylesheet(ROOT / 'nalksolutions.com_wordpress_backup'))
    archived_articles = {}
    for route in register['routes']:
        if route['observed']['initial_status'] != 200 or route['plan']['candidate_template_family'] != 'author-listing':
            continue
        source = BeautifulSoup((ROOT / 'docs/registers' / route['baseline']['source_html']).read_bytes(), 'html.parser')
        for card in source_main(source).select('article:has([data-elementor-id="152"])'):
            heading = card.select_one('[data-widget_type="cmsmasters-post-title.default"]')
            archived_articles[card['id']] = (heading.get_text(' ', strip=True), heading.select_one('a')['href'])
    if len(archived_articles) != 43:
        raise ValueError('Archived author journeys must account for all 43 articles')
    blog_views, blog_reports, blog_media = query_views(ROOT, stylesheets, archived_articles)
    media.update(blog_media)
    for route in register['routes']:
        if route['observed']['initial_status'] != 200:
            continue
        ident = route['id']
        if ident in SPECIAL:
            pages.append(next(page for page in fixtures['pages'] if page['id'] == ident))
            continue
        record_path = (ROOT / 'docs/registers' / route['baseline']['page_record']).resolve()
        source_path = (ROOT / 'docs/registers' / route['baseline']['source_html']).resolve()
        source = source_path.read_bytes()
        record = json.loads(record_path.read_text(encoding='utf8'))
        metadata = record['source']['metadata']
        soup = BeautifulSoup(source, 'html.parser')
        main = source_main(soup)
        service_style = None
        company_style = None
        listing_style = None
        secondary_style = None
        rendered_file = None
        listing_layout = LISTING_FAMILIES.get(route['plan']['candidate_template_family'])
        if ident in SECONDARY_LAYOUTS:
            source_page = main if main.has_attr('data-elementor-id') else one(main, '[data-elementor-type="wp-page"]')
            secondary_style = stylesheets[f'uploads/elementor/css/post-{source_page["data-elementor-id"]}.css']
            rendered_file = ROOT/'nalk-public-archive'/record['profiles']['desktop']['rendered_html']
            converter = SecondaryConverter(main, ident, secondary_style['text'], BeautifulSoup(rendered_file.read_bytes(), 'html.parser'))
            secondary_assets[ident] = converter.backgrounds
            if SECONDARY_LAYOUTS[ident] == 'team':
                secondary_presentation = secondary_expectations(stylesheets, main)
        elif listing_layout:
            source_page = main if main.has_attr('data-elementor-id') else one(main, '[data-elementor-type="wp-page"]')
            listing_style = stylesheets[f'uploads/elementor/css/post-{source_page["data-elementor-id"]}.css']
            converter = ListingConverter(main, listing_layout, listing_style['text'])
        elif ident in COMPANY_LAYOUTS:
            source_page = main.select_one('[data-elementor-type="wp-page"]')
            if source_page:
                company_style = stylesheets[f'uploads/elementor/css/post-{source_page["data-elementor-id"]}.css']
            converter = CompanyConverter(main, ident, company_style['text'] if company_style else '')
        elif is_service(route):
            source_page = one(main, '[data-elementor-type="wp-page"]')
            service_style = stylesheets[f'uploads/elementor/css/post-{source_page["data-elementor-id"]}.css']
            rendered_file = ROOT/'nalk-public-archive'/record['profiles']['desktop']['rendered_html']
            converter = ServiceConverter(main, service_style['text'], source_main(BeautifulSoup(rendered_file.read_bytes(), 'html.parser')))
        else:
            converter = Converter()
        converter.motion_enabled = ident in active_ids
        nodes = converter.children(main)
        text = text_content(nodes)
        if (service_style or listing_style or ident in COMPANY_LAYOUTS or ident in SECONDARY_LAYOUTS) and text != text_content(Converter().children(main)):
            raise ValueError(f'Family layout changed captured content: {ident}')
        if not text.strip():
            raise ValueError(f'Empty content: {ident}')
        headings = [node for node in walk(nodes) if node['type'] == 'element' and node['tag'] == 'h1']
        # Preserve existing missing/duplicate h1 defects for a later editorial decision.
        heading = text_content(headings[0]['children']) if headings else metadata['title']
        from urllib.parse import unquote
        path = unquote(route['observed']['path'])
        family = route['plan']['candidate_template_family']
        families[family] += 1
        kind = ('article' if family == 'article' else 'profile' if family == 'profile-detail'
                else 'archive' if any(word in family for word in ('listing', 'taxonomy')) else 'marketing')
        schemas = [json.loads(raw) for raw in metadata['json_ld']]
        seo = {'title': metadata['title'], 'description': metadata['description'] or None,
               'canonical': metadata['canonical'] or None, 'robots': metadata['robots'] or None,
               'googlebot': metadata['googlebot'] or None, 'social': metadata['social'], 'jsonLd': schemas}
        provenance = {'sourceHtml': source_path.relative_to(ROOT).as_posix(), 'sourceSha256': sha(source),
                      'pageRecord': record_path.relative_to(ROOT).as_posix(), 'pageRecordSha256': sha(record_path.read_bytes()),
                      'excerpt': False, 'headingFallback': not bool(headings)}
        page = {'id': ident, 'sourceRouteId': ident, 'path': path, 'kind': kind,
                'locale': route['plan']['locale_hint'], 'status': 'published', 'seo': seo,
                'content': {'heading': heading, 'paragraphs': [heading], 'documentId': ident}, 'provenance': provenance}
        document = {'id': ident, 'path': path, 'locale': page['locale'], 'family': family, 'nodes': nodes}
        if service_style:
            document['serviceLayout'] = 'service-v1'
        if ident in COMPANY_LAYOUTS:
            document['companyLayout'] = COMPANY_LAYOUTS[ident]
        if listing_layout:
            document['listingLayout'] = listing_layout
        if ident in SECONDARY_LAYOUTS:
            document['secondaryLayout'] = SECONDARY_LAYOUTS[ident]
        if ident == BLOG_ID:
            document['listingViews'] = blog_views
        if family == 'article':
            body = one(soup, '[data-id="1b907200"] .entry-content')
            body_converter = ArticleDocumentConverter()
            body_nodes = body_converter.children(body)
            body_text = text_content(body_nodes)
            if body_text != body.get_text().replace('\r\n', '\n').replace('\r', '\n'):
                raise ValueError(f'Article body text reconciliation failed: {ident}')
            document.update(nodes=body_nodes, article=extract_presentation(soup))
            text = body_text
        output(TARGET / 'documents' / f'{ident}.json', document, args.check)
        pages.append(page)
        media.update(converter.media)
        reports.append({'id': ident, 'path': path, 'family': family, 'locale': page['locale'],
                        'sourceSha256': sha(source), 'sourceMainTextSha256': sha(main.get_text().encode('utf8')),
                        'renderTextSha256': sha(text.encode('utf8')), 'renderTextCharacters': len(text),
                        'renderTextScope': 'article-body' if family == 'article' else 'captured-main',
                        **({'serviceStylesheet': {key: value for key, value in service_style.items() if key != 'text'}} if service_style else {}),
                        **({'serviceRenderedHtml': rendered_file.relative_to(ROOT).as_posix(),
                            'serviceRenderedSha256': sha(rendered_file.read_bytes())} if service_style else {}),
                        **({'companyStylesheet': {key: value for key, value in company_style.items() if key != 'text'}} if company_style else {}),
                        **({'companyBackgrounds': converter.backgrounds} if ident in COMPANY_LAYOUTS else {}),
                        **({'secondaryStylesheet': {key: value for key, value in secondary_style.items() if key != 'text'},
                            'secondaryRenderedHtml': rendered_file.relative_to(ROOT).as_posix(),
                            'secondaryRenderedSha256': sha(rendered_file.read_bytes()),
                            'secondaryBackgrounds': converter.backgrounds} if secondary_style else {}),
                        **({'listingStylesheet': {key: value for key, value in listing_style.items() if key != 'text'},
                            'listingCards': converter.card_counts,
                            'listingTargets': [safe_link(card.select_one('[data-widget_type="cmsmasters-post-title.default"] a')['href'])
                                               for card in main.select('article')]} if listing_style else {}),
                        'headings': [{'tag': node['tag'], 'text': text_content(node['children'])} for node in walk(nodes)
                                     if node['type'] == 'element' and node['tag'] in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')],
                        'headingsScope': 'captured-main',
                        'images': list(converter.media), 'omittedNonContent': dict(converter.omitted),
                        'transformations': dict(converter.changes), 'forms': converter.forms,
                        **({'articleBodyTransformations': dict(body_converter.changes)} if family == 'article' else {}),
                        'nodeCounts': dict(Counter(node['type'] for node in walk(document['nodes'])))})
    if len(pages) != 118 or len(reports) != 116:
        raise ValueError('Retained route coverage differs from frozen baseline')
    assets = []
    with contextlib.ExitStack() as stack:
        archives = [(file, stack.enter_context(zipfile.ZipFile(file))) for file in sorted(
            (ROOT / 'nalksolutions.com_wordpress_backup').glob('*uploads*.zip'))]
        members = {}
        for file, archive in archives:
            for name in archive.namelist():
                members.setdefault(name, []).append((file, archive))
        for public_path, count in sorted(media.items()):
            if public_path == AVATAR_PATH:
                external = json.loads((ROOT / 'tooling/sources/site-external-media.json').read_text(encoding='utf8'))
                data = (ROOT / 'public' / public_path.lstrip('/')).read_bytes()
                if external['path'] != public_path or sha(data) != external['sha256'] or len(data) != external['bytes']:
                    raise ValueError('Recovered external avatar bytes changed')
                assets.append({**external, 'references': count})
                continue
            if Path(public_path).suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'):
                raise ValueError(f'Unreviewed asset format: {public_path}')
            member = 'uploads/' + public_path.removeprefix(MEDIA_PREFIX)
            matches = members.get(member, [])
            if len(matches) != 1:
                raise ValueError(f'Expected exactly one backup member: {public_path}, found {len(matches)}')
            file, archive = matches[0]
            data = archive.read(member)
            if public_path.endswith('.svg'):
                if b'<!DOCTYPE' in data.upper():
                    raise ValueError(f'Unreviewed SVG document type: {public_path}')
                svg = ET.fromstring(data)
                if any(tag.tag.split('}')[-1] in ('script', 'foreignObject') or any(
                    key.lower().startswith('on') for key in tag.attrib) for tag in svg.iter()):
                    raise ValueError(f'Active SVG requires separate review: {public_path}')
                dimensions = {}
            else:
                with Image.open(io.BytesIO(data)) as image:
                    dimensions = {'width': image.width, 'height': image.height}
                    image.verify()
            target = ROOT / 'public' / public_path.lstrip('/')
            if not target.resolve().is_relative_to((ROOT / 'public/wp-content/uploads').resolve()):
                raise ValueError('Asset publication escaped allowlist root')
            if args.check:
                if target.read_bytes() != data:
                    raise ValueError(f'Published asset drift: {public_path}')
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
            assets.append({'path': public_path, 'sha256': sha(data), 'bytes': len(data), 'references': count, **dimensions,
                           'sourceArchive': file.name, 'sourceMember': member})
    output(TARGET / 'pages.generated.json', {**fixtures, 'pages': pages}, args.check)
    output(TARGET / 'assets.generated.json', assets, args.check)
    output(ROOT / 'src/content/company/assets.generated.json', {
        'roles': {role: path for role, (_, _, path) in BACKGROUND_ROLES.items()},
    }, args.check)
    output(ROOT / 'tooling/sources/company-presentation.generated.json', company_expectations, args.check)
    output(ROOT / 'src/content/listings/assets.generated.json', {'backgrounds': LISTING_BACKGROUNDS}, args.check)
    output(ROOT / 'src/content/secondary/assets.generated.json', secondary_assets, args.check)
    if not secondary_presentation:
        raise ValueError('Missing active team presentation evidence')
    output(ROOT / 'tooling/sources/secondary-presentation.generated.json', secondary_presentation, args.check)
    output(ROOT / 'tooling/sources/article-body-presentation.generated.json',
           article_body_expectations(ROOT / 'nalksolutions.com_wordpress_backup', stylesheets['uploads/elementor/css/post-7.css']), args.check)
    output(ROOT / 'tooling/sources/blog-query-recovery.generated.json', {'pages': blog_reports}, args.check)
    output(ROOT / 'tooling/sources/listing-presentation.generated.json', listing_expectations(stylesheets), args.check)
    output(ROOT / 'tooling/sources/site-recovery.generated.json', {
        'baselineId': register['baseline_id'], 'retainedPages': len(pages), 'recoveredDocuments': len(reports),
        'existingReconstructedPages': sorted(SPECIAL), 'families': dict(families), 'pages': reports,
        'limitations': ['Complete captured content; all 107 active pages use reconstructed presentation; eleven archive-only pages retain baseline styling; no pixel acceptance',
                        'Unreviewed decorative glyphs and background/layout details require remaining family work and per-page visual review',
                        'Map is a link; enquiry form fields retained without a transport; no false submission success',
                        'Source tab panels and carousel items are all visible; interaction refinement remains open',
                        'Real Sanity, integrations and release remain separate gates'],
    }, args.check)
    print(json.dumps({'passed': True, 'mode': 'check' if args.check else 'generate', 'retainedPages': len(pages),
                      'recoveredDocuments': len(reports), 'images': len(assets), 'imageBytes': sum(item['bytes'] for item in assets),
                      'families': dict(families)}))


if __name__ == '__main__':
    main()
