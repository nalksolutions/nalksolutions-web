"""Create allowlisted runtime article inputs from checked offline recovery."""
import argparse
import importlib.util
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
import zipfile

from bs4 import BeautifulSoup

from article_content import convert_node

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('extract_article', ROOT / 'tooling/extract-article.py')
recovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recovery)


def public_link(url):
    parsed = urlsplit(url)
    return parsed.path + ('?' + parsed.query if parsed.query else '') + ('#' + parsed.fragment if parsed.fragment else '') if parsed.netloc == 'nalksolutions.com' else url


def runtime_node(node):
    ignored = {'sourceClasses', 'sourceLoading', 'target', 'rel'}
    result = {key: value for key, value in node.items() if key not in ignored}
    if 'children' in node:
        result['children'] = [runtime_node(child) for child in node['children']]
    for key in ('src', 'href'):
        if key in result:
            result[key] = public_link(result[key])
    if 'variants' in result:
        result['variants'] = [{'src': public_link(item['src']), 'width': item['width']} for item in result['variants']]
    return result


def footer_backgrounds():
    member = 'uploads/elementor/css/post-117.css'
    matches = []
    for file in sorted((ROOT / 'nalksolutions.com_wordpress_backup').glob('*uploads*.zip')):
        with zipfile.ZipFile(file) as archive:
            if member in archive.namelist():
                matches.append((file.name, archive.read(member)))
    if len(matches) != 1:
        raise ValueError('Expected one source stylesheet for footer 117')
    archive_name, data = matches[0]
    css = data.decode('utf8')
    urls = list(dict.fromkeys(re.findall(r'url\("(https://nalksolutions.com/wp-content/uploads/[^"()]*footer-background[^"()]*\.webp)"\)', css)))
    if len(urls) != 2 or '-mobile.' not in urls[1]:
        raise ValueError('Unexpected footer background variants')
    mobile_rules = re.findall(r'@media\s*\(max-width:\s*(\d+)px\)', css[:css.index(urls[1])])
    if not mobile_rules:
        raise ValueError('Missing source mobile footer breakpoint')
    return {'desktop': public_link(urls[0]), 'mobile': public_link(urls[1]), 'mobileMaxWidth': int(mobile_rules[-1]),
            'sourceArchive': archive_name, 'sourceMember': member, 'sourceSha256': recovery.sha(data)}, urls


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    article = recovery.extract()
    soup = BeautifulSoup(recovery.SOURCE.read_bytes(), 'html.parser')
    featured = convert_node(soup.select_one('[data-id="2114cf22"] img'))
    category = soup.select_one('[data-id="46571a65"] a')
    related = []
    presentation_images = []
    for card in soup.select('[data-id="1fcd562b"] article'):
        link = card.select_one('[data-id="515d7845"] a')
        if link:
            image = convert_node(card.select_one('[data-id="38c150fe"] img'))
            category_link = card.select_one('[data-id="23b2ad42"] a')
            button = card.select_one('[data-id="811e573"] a')
            related.append({'title': link.get_text(strip=True), 'href': public_link(link['href']),
                            'image': runtime_node(image),
                            'category': {'label': category_link.get_text(strip=True), 'href': public_link(category_link['href'])},
                            'dateLabel': card.select_one('[data-id="4d9503b8"]').get_text(' ', strip=True),
                            'actionLabel': button.get_text(' ', strip=True)})
            presentation_images.append(image)
    adjacent = []
    for link in soup.select('[data-id="66af6fea"] a'):
        label = link.select_one('[class$="-label"]')
        title = link.select_one('[class$="-title"]')
        image = convert_node(link.find('img'))
        adjacent.append({'label': label.get_text(strip=True), 'title': title.get_text(strip=True), 'href': public_link(link['href']), 'image': runtime_node(image)})
        presentation_images.append(image)
    record = json.loads(recovery.RECORD.read_text(encoding='utf8'))['source']['metadata']
    result = {key: article[key] for key in ('id', 'sourceRouteId', 'path', 'locale', 'title')}
    result['body'] = [runtime_node(node) for node in article['body']]
    result['presentation'] = {
        'excerpt': soup.select_one('[data-id="4bdeabfb"] p').get_text(),
        'dateLabel': soup.select_one('[data-id="5733abb0"]').get_text(' ', strip=True),
        'category': {'label': category.get_text(strip=True), 'href': public_link(category['href'])},
        'featured': runtime_node(featured), 'adjacent': adjacent, 'related': related,
        'footer': {
            'owner': soup.select_one('[data-elementor-id="117"] [data-id="c5364f4"] p').get_text(),
            'notice': soup.select_one('[data-elementor-id="117"] [data-id="dffc682"] p').get_text(),
        },
    }
    result['seo'] = {'title': record['title'], 'description': record['description'] or None,
                     'canonical': record['canonical'] or None, 'robots': record['robots'] or None,
                     'googlebot': record['googlebot'] or None, 'social': record['social'],
                     'jsonLd': article['seo']['jsonLd']}
    footer, backgrounds = footer_backgrounds()
    background_references = [{'type': 'image', 'src': url, 'variants': []} for url in backgrounds]
    media = recovery.media_inventory(article['body'] + [featured] + presentation_images + background_references)
    assets = {'footer': footer, 'images': [{**item, 'path': item['publicPath']} for item in media]}
    networks = {'Facebook': 'facebook', 'X Twitter': 'x', 'LinkedIn': 'linkedin', 'Email': 'email'}
    share_icons = []
    for link in soup.select('[data-id="7c209573"] a'):
        svg = link.find('svg')
        share_icons.append({'network': networks[link['aria-label']], 'viewBox': svg['viewbox'],
                            'paths': [element['d'] for element in svg.find_all('path')]})
    if len(share_icons) != 4:
        raise ValueError('Unexpected article share controls')
    menu_svg = soup.select_one('[data-elementor-id="71"] [data-id="2771dcb1"] a svg')
    menu_icon = {'viewBox': menu_svg['viewbox'], 'paths': [path['d'] for path in menu_svg.find_all('path')]}
    chevron = soup.select_one('[data-id="728f6108"] .elementor-widget-cmsmasters-nav-menu__arrow svg')
    category_icon = {'viewBox': chevron['viewbox'], 'paths': [path['d'] for path in chevron.find_all('path')]}
    for name, data in [('api.generated.json', result), ('assets.generated.json', assets), ('share.generated.json', share_icons), ('header.generated.json', {'menuIcon': menu_icon, 'categoryIcon': category_icon})]:
        target = ROOT / 'src/content/articles' / name
        output = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
        if args.check:
            if target.read_text(encoding='utf8') != output:
                raise ValueError(f'Runtime article drift: {name}')
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(output, encoding='utf8', newline='\n')
    for item in media:
        target = ROOT / 'public' / item['publicPath'].lstrip('/')
        if args.check:
            if recovery.sha(target.read_bytes()) != item['sha256']:
                raise ValueError(f'Published article image drift: {item["publicPath"]}')
        else:
            with zipfile.ZipFile(ROOT / 'nalksolutions.com_wordpress_backup' / item['sourceArchive']) as archive:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(item['sourceMember']))
    print(json.dumps({'passed': True, 'mode': 'check' if args.check else 'generate', 'images': len(media)}))


if __name__ == '__main__':
    main()
