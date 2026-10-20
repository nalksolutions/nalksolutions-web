"""Recover the three reviewed listing layouts without WordPress classes or runtime CSS."""
import hashlib
import json

from bs4 import BeautifulSoup, Tag

from site_content import Converter, MEDIA_PREFIX, source_main, text_content

LISTING_FAMILIES = {'blog-listing': 'blog', 'category-listing': 'category', 'author-listing': 'author'}
BLOG_ID = 'R-8523d897404fbce9'
BLOG_QUERY = 'cmsmasters-page-c1619d2'
BACKGROUNDS = {'blog': MEDIA_PREFIX + '2025/08/71-background-2.webp',
               'category': MEDIA_PREFIX + '2025/10/71-background-2.webp',
               'author': MEDIA_PREFIX + '2025/10/71-background-2.webp'}
SECTION_IDS = {
    'blog': ('328a74f', '7b6ebf6'),
    'category': ('605f92a5', '3cdf6090'),
    'author': ('776ab1a5', '2f6a2910'),
}
ROLES = {
    '14edd1d6': 'primary', 'baa5f9a': 'primary',
    '1a0331f7': 'sidebar', '1490791e': 'sidebar',
    '50ad1d99': 'featured', '76ef8f7a': 'featured',
    '36fe1dd4': 'blog-copy', '7bff1a1e': 'blog-meta', '38c150fe': 'blog-image',
    '23b2ad42': 'taxonomy', '4d9503b8': 'date', '515d7845': 'card-title', '811e573': 'action',
    '49d11df4': 'divider',
    '377ef817': 'row', '67240464': 'row-image', '4e61c13f': 'row-copy',
    '39b7421b': 'taxonomy', '42b7229d': 'card-title', '5260ca68': 'excerpt', '516d58': 'byline',
    '7a10d284': 'featured-image', '73817ccb': 'featured-title', '6d7a8037': 'date',
}
WIDGETS = {'cmsmasters-page-title', 'cmsmasters-woo-archive-title', 'cmsmasters-breadcrumbs',
           'cmsmasters-blog-grid', 'cmsmasters-author-box', 'cmsmasters-search', 'heading',
           'cmsmasters-post-featured-image', 'cmsmasters-meta-data', 'cmsmasters-post-title',
           'cmsmasters-post-excerpt', 'cmsmasters-button', 'divider'}


class ListingConverter(Converter):
    def __init__(self, main, layout, stylesheet, empty=False):
        super().__init__()
        if layout not in SECTION_IDS:
            raise ValueError('Unreviewed listing layout')
        self.layout = layout
        sections = [element for element in main.select('.e-parent') if not element.find_parent('article')]
        expected = SECTION_IDS[layout]
        observed = tuple(element.get('data-id') for element in sections)
        if observed != expected and not (empty and observed == expected[:1]):
            raise ValueError(f'Unreviewed listing sections: {observed}')
        self.sections = dict(zip(expected, ('hero', 'body'), strict=True))
        self.background = BACKGROUNDS[layout]
        if f'url("https://nalksolutions.com{self.background}")' not in stylesheet:
            raise ValueError('Unreviewed listing background')
        self.media[self.background] += 1
        templates = {element.get('data-elementor-id') for element in main.select('[data-elementor-type="cmsmasters_entry"]')}
        allowed = {'110'} if layout == 'blog' else {'152', '149'}
        if not templates <= allowed or (not empty and not templates):
            raise ValueError(f'Unreviewed listing entry templates: {templates}')
        for element in main.select('[data-widget_type]'):
            widget = element['data-widget_type'].split('.')[0]
            if widget not in WIDGETS:
                raise ValueError(f'Unreviewed listing widget: {widget}')
        self.card_counts = {template: len(main.select(f'article [data-elementor-id="{template}"]'))
                            for template in sorted(allowed)}

    def node(self, element):
        if isinstance(element, Tag) and element.name == 'i' and 'cmsms-demo-icon-arrow-right' in element.get('class', []):
            return [{'type': 'element', 'tag': 'span', 'attributes': {},
                     'variant': 'listing-arrow', 'children': []}]
        result = super().node(element)
        if getattr(element, 'name', None) == 'span' and element.has_attr('aria-current'):
            if element['aria-current'] != 'page' or len(result) != 1 or result[0]['type'] != 'element':
                raise ValueError('Unreviewed pagination current state')
            result[0]['attributes']['aria-current'] = 'page'
        return result

    def variant(self, element):
        classes = element.get('class', [])
        widget = element.get('data-widget_type', '').split('.')[0]
        ident = element.get('data-id')
        if ident in self.sections:
            return 'listing-' + self.sections[ident]
        if ident in ROLES:
            return 'listing-' + ROLES[ident]
        if element.name == 'article':
            template = element.select_one('[data-elementor-type="cmsmasters_entry"]')
            if template is None:
                raise ValueError('Missing listing card template')
            return 'listing-' + {'110': 'blog-card', '152': 'row-card', '149': 'featured-card'}[template['data-elementor-id']]
        if 'cmsmasters-blog__posts' in classes:
            parent = element.find_parent(attrs={'data-widget_type': 'cmsmasters-blog-grid.default'})
            template = json.loads(parent['data-settings'])['blog_template_id']
            return 'listing-' + {'110': 'blog-grid', '152': 'rows', '149': 'featured-list'}[template]
        if widget == 'cmsmasters-blog-grid':
            return 'listing-grid-widget'
        if element.name == 'ul' and 'page-numbers' in classes:
            return 'listing-pagination'
        if element.name == 'span' and element.has_attr('aria-current'):
            return 'listing-current'
        if widget in ('cmsmasters-page-title', 'cmsmasters-woo-archive-title'):
            return 'listing-title'
        if widget == 'cmsmasters-breadcrumbs':
            return 'listing-breadcrumbs'
        if 'cmsmasters-widget-breadcrumbs__sep' in classes:
            return 'listing-breadcrumb-separator'
        if widget == 'cmsmasters-author-box':
            return 'listing-author'
        if widget == 'heading':
            return 'listing-featured-heading'
        if 'elementor-widget-cmsmasters-author-box__wrapper' in classes:
            return 'listing-author-inner'
        if element.name == 'a' and any('button' in value for value in classes):
            return 'listing-read-more'
        return None


def query_seo(soup):
    def meta(name):
        element = soup.find('meta', attrs={'name': name})
        return element.get('content') if element else None
    canonical = soup.select_one('link[rel="canonical"]')
    return {'title': soup.title.get_text(' ', strip=True), 'description': meta('description'),
            'canonical': canonical.get('href') if canonical else None,
            'robots': meta('robots'), 'googlebot': meta('googlebot'),
            'social': [{'property': element.get('property') or element.get('name'), 'content': element.get('content', '')}
                       for element in soup.find_all('meta')
                       if str(element.get('property') or element.get('name', '')).startswith(('og:', 'twitter:'))],
            'jsonLd': [json.loads(element.get_text()) for element in soup.find_all('script', type='application/ld+json')]}


def query_views(root, stylesheets, archived_articles):
    """Supplementary public responses are hashed inputs, never fetched during generation."""
    evidence = json.loads((root / 'tooling/sources/blog-query-evidence.json').read_text(encoding='utf8'))
    if [item['page'] for item in evidence['pages']] != [2, 3, 4, 5, 6]:
        raise ValueError('Incomplete Blog query-view evidence')
    views, reports, media, posts = [], [], {}, []
    routes = json.loads((root / 'docs/registers/routes.json').read_text(encoding='utf8'))['routes']
    baseline = next(route for route in routes if route['id'] == BLOG_ID)
    baseline_soup = BeautifulSoup((root / 'docs/registers' / baseline['baseline']['source_html']).read_bytes(), 'html.parser')
    baseline_seo = query_seo(baseline_soup)
    for item in evidence['pages']:
        file = (root / item['sourceHtml']).resolve()
        if not file.is_relative_to((root / 'migration-review/blog-query-pages').resolve()):
            raise ValueError('Query source escaped evidence directory')
        data = file.read_bytes()
        if hashlib.sha256(data).hexdigest() != item['sha256']:
            raise ValueError('Blog query-view source changed')
        soup = BeautifulSoup(data, 'html.parser')
        if soup.title.get_text() != 'Blog - Nalk Solutions' or soup.select_one('link[rel="canonical"]')['href'] != 'https://nalksolutions.com/blog/':
            raise ValueError('Unreviewed query-view SEO identity')
        seo = query_seo(soup)
        if seo != baseline_seo:
            raise ValueError(f'Query-view SEO differs from the frozen Blog identity: {item["page"]}')
        main = source_main(soup)
        converter = ListingConverter(main, 'blog', stylesheets['uploads/elementor/css/post-26492.css']['text'], empty=item['page'] == 6)
        converter.motion_enabled = True
        nodes = converter.children(main)
        if text_content(nodes) != text_content(Converter().children(main)):
            raise ValueError('Query conversion changed source text')
        cards = main.select('article')
        if len(cards) != (7 if item['page'] == 5 else 0 if item['page'] == 6 else 9):
            raise ValueError('Unreviewed query-view card count')
        for card in cards:
            heading = card.select_one('[data-widget_type="cmsmasters-post-title.default"]')
            title = heading.get_text(' ', strip=True)
            href = heading.select_one('a')['href']
            if archived_articles.get(card['id']) != (title, href):
                raise ValueError(f'Query card differs from archived article: {card["id"]}')
            posts.append(card['id'])
        views.append({'page': item['page'], 'nodes': nodes})
        for path, count in converter.media.items():
            media[path] = media.get(path, 0) + count
        reports.append({**item, 'seo': seo, 'renderTextSha256': hashlib.sha256(text_content(nodes).encode('utf8')).hexdigest(),
                        'cards': [card['id'] for card in cards]})
    if len(posts) != 34 or len(set(posts)) != 34:
        raise ValueError('Blog query cards overlap or are incomplete')
    initial_posts = [card['id'] for card in source_main(baseline_soup).select('article')]
    if len(initial_posts) != 9 or len(set(initial_posts + posts)) != 43 or set(initial_posts + posts) != set(archived_articles):
        raise ValueError('Blog pagination does not account for all archived articles')
    return views, reports, media
