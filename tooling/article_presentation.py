"""Extract template 107 presentation without copying WordPress runtime markup."""
from site_content import media_path, safe_link


def one(root, selector):
    matches = root.select(selector)
    if len(matches) != 1:
        raise ValueError(f'Expected one article element: {selector}, found {len(matches)}')
    return matches[0]


def image(element):
    variants = []
    for candidate in element.get('srcset', '').split(','):
        if not candidate.strip():
            continue
        url, width = candidate.strip().rsplit(' ', 1)
        if not width.endswith('w') or not width[:-1].isdigit() or int(width[:-1]) < 1:
            raise ValueError('Unreviewed article image candidate')
        variants.append({'src': media_path(url), 'width': int(width[:-1])})
    result = {'type': 'image', 'src': media_path(element['src']), 'alt': element['alt'],
              'width': int(element['width']), 'height': int(element['height']),
              'variants': variants, 'sizes': element.get('sizes')}
    if min(result['width'], result['height']) < 1:
        raise ValueError('Invalid article image dimensions')
    return result


def category(link):
    return {'label': link.get_text(strip=True), 'href': safe_link(link['href'])}


def extract_presentation(soup):
    singular = one(soup, '[data-elementor-type="cmsmasters_singular"]')
    if singular.get('data-elementor-id') != '107':
        raise ValueError('Unreviewed article template')
    categories = [category(link) for link in singular.select('[data-id="46571a65"] a')]
    if not 1 <= len(categories) <= 2:
        raise ValueError('Unreviewed article categories')
    adjacent = []
    for link in singular.select('[data-id="66af6fea"] a'):
        adjacent.append({'label': one(link, '[class$="-label"]').get_text(strip=True),
                         'title': one(link, '[class$="-title"]').get_text(strip=True),
                         'href': safe_link(link['href']), 'image': image(one(link, 'img'))})
    related = []
    for card in singular.select('[data-id="1fcd562b"] article'):
        link = one(card, '[data-id="515d7845"] a')
        related.append({'title': link.get_text(strip=True), 'href': safe_link(link['href']),
                        'image': image(one(card, '[data-id="38c150fe"] img')),
                        'category': category(one(card, '[data-id="23b2ad42"] a')),
                        'dateLabel': one(card, '[data-id="4d9503b8"]').get_text(' ', strip=True),
                        'actionLabel': one(card, '[data-id="811e573"] a').get_text(' ', strip=True)})
    if len(adjacent) != 2 or len(related) != 3:
        raise ValueError('Unreviewed adjacent/related article count')
    return {
        'excerpt': one(singular, '[data-id="4bdeabfb"] p').get_text(),
        'dateLabel': one(singular, '[data-id="5733abb0"]').get_text(' ', strip=True),
        'category': categories[0], 'additionalCategories': categories[1:],
        'featured': image(one(singular, '[data-id="2114cf22"] img')),
        'adjacent': adjacent, 'related': related,
        'footer': {
            'owner': one(soup, '[data-elementor-id="117"] [data-id="c5364f4"] p').get_text(),
            'notice': one(soup, '[data-elementor-id="117"] [data-id="dffc682"] p').get_text(),
        },
    }
