"""Capture or reconcile public navigation evidence without changing application routes.

Live requests are explicit (--capture), limited to the approved host and public HTML
paths, and never follow redirects automatically. Reconciliation is offline.
"""
import argparse
from collections import Counter, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://nalksolutions.com'
REGISTERS = ROOT / 'docs/registers'
HIDDEN = {'elementor-hidden-desktop', 'elementor-hidden-tablet', 'elementor-hidden-mobile'}
BLOCKED = ('/wp-admin', '/wp-json', '/wp-content', '/wp-includes', '/feed', '/xmlrpc.php')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_output(path, text, check=False):
    if check:
        if not path.is_file() or path.read_text(encoding='utf8') != text:
            raise ValueError(f'Generated navigation scope drift: {path.relative_to(ROOT)}')
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf8')


def save(path, value, check=False):
    write_output(path, json.dumps(value, ensure_ascii=False, indent=2) + '\n', check)


def public_path(value, base):
    """Identity decoding is for this inventory only; request routing is untouched."""
    if not value or value.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
        return None
    parsed = urlsplit(urljoin(base, value))
    if (parsed.scheme not in ('http', 'https') or parsed.hostname not in
            ('nalksolutions.com', 'www.nalksolutions.com') or parsed.username
            or parsed.password or parsed.port not in (None, 80, 443) or parsed.query):
        return None
    path = unquote(parsed.path or '/', errors='strict')
    if ('\\' in path or '%' in path or any(ord(char) < 32 for char in path)
            or path.startswith(BLOCKED) or path.endswith('/feed/')
            or re.search(r'\.[a-zA-Z0-9]{1,6}$', path)):
        return None
    return path


def hidden_everywhere(tag):
    hidden = set()
    for ancestor in (tag, *tag.parents):
        hidden.update(set(ancestor.get('class', [])) & HIDDEN)
        if (ancestor.has_attr('hidden') or ancestor.name in ('template', 'noscript')
                or re.search(r'display\s*:\s*none', ancestor.get('style', ''), re.I)):
            return True
    return hidden == HIDDEN


def links_from(data, path):
    soup = BeautifulSoup(data, 'html.parser')
    links, seen = [], set()
    for link in soup.select('a[href]'):
        target = public_path(link['href'], ORIGIN + path)
        if target is None or target == path:
            continue
        ancestors = [link, *link.parents]
        region = next((item.name for item in ancestors if item.name in ('header', 'footer')), None)
        if region is None:
            if not any(item.name == 'main' or item.get('data-elementor-type') in
                       ('cmsmasters_singular', 'cmsmasters_archive') for item in ancestors):
                continue
            region = 'html-sitemap' if path == '/nalk-solutions-sitemap/' else 'content'
        excluded = hidden_everywhere(link)
        label = ' '.join(link.get_text(' ', strip=True).split()) or link.get('aria-label', '')
        row = {'source': path, 'target': target, 'region': region, 'label': label,
               'hidden_at_all_breakpoints': excluded}
        identity = (target, region, label, excluded)
        if identity not in seen:
            links.append(row)
            seen.add(identity)
    return links


def response_links(data, record):
    if record.get('status') == 200 and 'text/html' in record.get('content_type', ''):
        return links_from(data, record['path'])
    return []


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(path):
    encoded = quote(path, safe='/~!$&\'()*+,;=:@-._')
    request = Request(ORIGIN + encoded, headers={
        'User-Agent': 'NalkMigrationScopeAudit/1.0 (read-only public navigation review)',
        'Accept': 'text/html',
    })
    record = {'path': path, 'url': request.full_url,
              'captured_at': datetime.now(timezone.utc).isoformat()}
    try:
        try:
            response = build_opener(NoRedirect).open(request, timeout=40)
        except HTTPError as error:
            response = error
        with response:
            data = response.read(8_000_001)
            if len(data) > 8_000_000:
                raise ValueError('Public document exceeds audit size limit')
            record.update(status=response.code, location=response.headers.get('Location'),
                          content_type=response.headers.get('Content-Type', ''), sha256=digest(data))
            record['links'] = response_links(data, record)
        return record, data
    except (URLError, TimeoutError, OSError, ValueError) as error:
        record.update(error=str(error), links=[])
        return record, None


def capture(directory, routes):
    directory.mkdir(parents=True, exist_ok=False)
    pending = {unquote(row['observed']['path']) for row in routes
               if row['observed']['initial_status'] == 200}
    records = {}
    while pending:
        if len(records) + len(pending) > 250:
            raise ValueError('Discovery exceeded 250 paths; inspect before broadening crawl')
        batch = sorted(pending)
        pending = set()
        with ThreadPoolExecutor(max_workers=4) as pool:
            for record, data in pool.map(fetch, batch):
                path = record['path']
                if data is not None:
                    name = digest(path.encode())[:20] + '.html'
                    (directory / name).write_bytes(data)
                    record['html'] = name
                records[path] = record
                for link in record['links']:
                    if not link['hidden_at_all_breakpoints']:
                        pending.add(link['target'])
                if record.get('location'):
                    target = public_path(record['location'], record['url'])
                    if target:
                        pending.add(target)
        pending -= records.keys()
        save(directory / 'capture.json', {'origin': ORIGIN, 'records': list(records.values())})
        print(json.dumps({'captured': len(records), 'next_batch': len(pending),
                          'errors': sum('error' in row for row in records.values())}), flush=True)


def reachable(records, use_sitemap=True):
    """Follow actionable public links, with redirects represented as separate hops."""
    journeys = {'/': []}
    queue = deque(['/'])
    while queue:
        path = queue.popleft()
        record = records.get(path, {})
        edges = []
        if record.get('status') == 200:
            edges = [link for link in record['links'] if not link['hidden_at_all_breakpoints']
                     and (use_sitemap or link['region'] != 'html-sitemap')]
        elif record.get('location'):
            target = public_path(record['location'], ORIGIN + path)
            if target:
                edges = [{'source': path, 'target': target, 'region': 'redirect',
                          'label': str(record['status'])}]
        for edge in edges:
            target = edge['target']
            if target not in journeys:
                journeys[target] = [*journeys[path], edge]
                queue.append(target)
    return journeys


def reconcile(directory, routes, check=False):
    capture_path = directory / 'capture.json'
    capture_data = json.loads(capture_path.read_text(encoding='utf8'))
    if capture_data['origin'] != ORIGIN:
        raise ValueError('Unexpected captured origin')
    records = {row['path']: row for row in capture_data['records']}
    for path, row in records.items():
        if row.get('html'):
            data = (directory / row['html']).read_bytes()
            if digest(data) != row['sha256'] or response_links(data, row) != row['links']:
                raise ValueError(f'Captured source/link drift: {path}')
    journeys = reachable(records)
    ordinary = reachable(records, use_sitemap=False)
    incoming = {}
    for source in journeys:
        for edge in records.get(source, {}).get('links', []):
            if not edge['hidden_at_all_breakpoints']:
                incoming.setdefault(edge['target'], []).append(edge)
    rows = []
    for route in routes:
        path = unquote(route['observed']['path'])
        live = records.get(path, {})
        if route['observed']['initial_status'] != 200:
            disposition = 'legacy-compatibility'
        elif path in journeys and live.get('status') == 200:
            disposition = 'in-scope'
        elif 'error' in live or path in journeys:
            disposition = 'review'
        else:
            disposition = 'archive-only'
        incoming_examples = sorted(incoming.get(path, []), key=lambda edge: (
            len(journeys.get(edge['source'], [])), edge['source'], edge['region'], edge['label']))
        rows.append({'route_id': route['id'], 'path': path,
                     'family': route['plan']['candidate_template_family'],
                     'archived_status': route['observed']['initial_status'],
                     'archived_noindex': 'noindex' in route['observed']['robots'],
                     'live_status': live.get('status'), 'disposition': disposition,
                     'reachability': ('ordinary-navigation' if path in ordinary else
                                      'html-sitemap-only' if path in journeys else 'not-reached'),
                     'journey': journeys.get(path),
                     'incoming_link_count': len(incoming_examples),
                     'incoming_link_examples': incoming_examples[:3],
                     'live_source_sha256': live.get('sha256')})
    known = {row['path'] for row in rows}
    extra = [{'path': path, 'status': records.get(path, {}).get('status'),
              'journey': journey, 'error': records.get(path, {}).get('error')}
             for path, journey in journeys.items() if path not in known]
    report = {'schema_version': 1, 'decision': 'D-16', 'origin': ORIGIN,
              'evidence_directory': directory.relative_to(ROOT).as_posix(),
              'capture_sha256': digest(capture_path.read_bytes()),
              'route_register_sha256': digest((REGISTERS / 'routes.json').read_bytes()),
              'method': 'Active header/footer plus linked public content; exclude explicitly hidden-at-all-breakpoints links. HTML sitemap reachability is reported separately.',
              'counts': dict(Counter(row['disposition'] for row in rows)),
              'in_scope_families': dict(Counter(row['family'] for row in rows
                                              if row['disposition'] == 'in-scope')),
              'reachable_outside_archive': extra, 'routes': rows}
    save(REGISTERS / 'navigation-scope.json', report, check)
    render_report(report, records, check)
    print(json.dumps({key: report[key] for key in
                      ('counts', 'in_scope_families', 'reachable_outside_archive')}, ensure_ascii=False))


def render_report(report, records, check=False):
    rows = report['routes']
    active = [row for row in rows if row['disposition'] == 'in-scope']
    ordinary = sum(row['reachability'] == 'ordinary-navigation' for row in active)
    times = sorted(row['captured_at'] for row in records.values())
    lines = [
        '# Active navigation scope', '',
        'Generated by `tooling/audit-navigation-scope.py`; do not edit this report manually.', '',
        'Decision: [D-16](decisions.md). Method, limitations and next work: '
        '[scope reconciliation](../chunks/12-active-navigation-scope.md).', '',
        f'Live request timestamps (UTC): {times[0]} to {times[-1]}.', '',
        f"Evidence: `{report['evidence_directory']}/capture.json` (ignored local evidence). "
        'The [machine register](navigation-scope.json) retains capture/source hashes, shortest '
        'link journeys and up to three incoming-link examples per route. The capture retains all links.', '',
        '| Classification | Count |', '| --- | ---: |',
        f'| Active content pages | {len(active)} |',
        f'| Ordinary navigation/content journeys | {ordinary} |',
        f'| HTML-sitemap-only journeys | {len(active) - ordinary} |',
        f"| Archive-only content pages | {report['counts'].get('archive-only', 0)} |",
        f"| Legacy compatibility rows (separate from page reconstruction) | {report['counts'].get('legacy-compatibility', 0)} |",
        f"| Unresolved archived route classifications | {report['counts'].get('review', 0)} |", '',
        'These are scope findings, not visual acceptance or authorization to remove existing local routes.', '',
        '## Header and footer entry points', '',
        'Home is the root. The remaining public path targets below are deduplicated from '
        'the live homepage header/footer, including dropdown/mobile markup. Redirects are shown as hops.', '',
        '| Path | Source region | Live initial response |', '| --- | --- | --- |',
    ]
    targets = {}
    for edge in records['/']['links']:
        if edge['region'] in ('header', 'footer') and not edge['hidden_at_all_breakpoints']:
            targets.setdefault(edge['target'], set()).add(edge['region'])
    for path, regions in sorted(targets.items()):
        live = records.get(path, {})
        status = str(live.get('status', 'not captured'))
        if live.get('location'):
            status += ' → `' + live['location'] + '`'
        lines.append(f"| `{path}` | {', '.join(sorted(regions))} | {status} |")
    for title, disposition in (
            ('Active content pages', 'in-scope'), ('Archive-only pages', 'archive-only'),
            ('Legacy compatibility', 'legacy-compatibility'), ('Needs review', 'review')):
        selected = [row for row in rows if row['disposition'] == disposition]
        if not selected:
            continue
        lines.extend(['', '## ' + title, '', '| Route ID | Path | Link reachability | Family |',
                      '| --- | --- | --- | --- |'])
        for row in sorted(selected, key=lambda row: row['path']):
            lines.append(f"| {row['route_id']} | `{row['path']}` | {row['reachability']} | {row['family']} |")
    write_output(REGISTERS / 'navigation-scope.md', '\n'.join(lines) + '\n', check)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--capture', action='store_true', help='Read the live public site')
    parser.add_argument('--check', action='store_true', help='Validate generated registers without writing')
    parser.add_argument('--evidence', required=True, type=Path, help='Workspace tmp audit directory')
    args = parser.parse_args()
    if args.capture and args.check:
        parser.error('--capture and --check are mutually exclusive')
    directory = (ROOT / args.evidence).resolve()
    if not directory.is_relative_to(ROOT / 'tmp'):
        raise ValueError('Audit evidence must stay under workspace tmp/')
    routes = json.loads((REGISTERS / 'routes.json').read_text(encoding='utf8'))['routes']
    if args.capture:
        capture(directory, routes)
    reconcile(directory, routes, args.check)


if __name__ == '__main__':
    main()
