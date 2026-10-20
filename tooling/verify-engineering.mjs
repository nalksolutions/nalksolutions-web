import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromiumCaptureArgs } from './visual-environment.mjs';

const scope = process.argv[2] ?? 'chunk1';
if (
  ![
    'chunk1',
    'home',
    'article',
    'article-rendering',
    'article-presentation',
    'article-fidelity',
    'article-regions',
    'article-reference',
    'site-coverage',
    'article-family',
    'service-family',
    'company-pages',
    'listing-pages',
    'visual-engineering',
  ].includes(scope)
)
  throw new Error(`Unsupported engineering scope: ${scope}`);
const group = {
  chunk1: 'chunk1',
  home: 'chunk2',
  article: 'chunk3',
  'article-rendering': 'chunk4',
  'article-presentation': 'chunk5',
  'article-fidelity': 'chunk6',
  'article-regions': 'chunk7',
  'article-reference': 'chunk8',
  'site-coverage': 'chunk9',
  'article-family': 'chunk10',
  'service-family': 'chunk11',
  'company-pages': 'chunk13',
  'listing-pages': 'chunk14',
  'visual-engineering': 'chunk15',
}[scope];
const directory = path.resolve(`tmp/${group}/${new Date().toISOString().replace(/[:.]/gu, '-')}`);
await mkdir(directory, { recursive: true });
const python =
  process.env.PYTHON ??
  (existsSync('.venv/Scripts/python.exe')
    ? path.resolve('.venv/Scripts/python.exe')
    : process.platform === 'win32'
      ? 'python'
      : 'python3');
const node = process.execPath;
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run through an npm verification script.');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const textCalibration = ['article-regions', 'article-reference'].includes(scope)
  ? 'grayscale'
  : 'default';
const requestedBrowserWorkers =
  process.env.BROWSER_TEST_WORKERS === undefined
    ? undefined
    : Number(process.env.BROWSER_TEST_WORKERS);
if (requestedBrowserWorkers !== undefined && ![1, 2, 4].includes(requestedBrowserWorkers))
  throw new Error('BROWSER_TEST_WORKERS must be 1, 2 or 4');
const manifest = {
  schemaVersion: 1,
  scope,
  baselineId: 'nalk-wordpress-2026-10-15',
  status: 'running',
  startedAt: new Date().toISOString(),
  node: process.version,
  browserWorkers:
    requestedBrowserWorkers ??
    ([
      'site-coverage',
      'article-family',
      'service-family',
      'company-pages',
      'listing-pages',
      'visual-engineering',
    ].includes(scope)
      ? 2
      : 1),
  chromiumCapture: { textCalibration, launchArgs: chromiumCaptureArgs(textCalibration) },
  dependencies: packageJson.dependencies,
  devDependencies: packageJson.devDependencies,
  checks: [],
  sourceFiles: {},
  limitations: [
    'site-coverage',
    'article-family',
    'service-family',
    'company-pages',
    'listing-pages',
    'visual-engineering',
  ].includes(scope)
    ? [
        'Captured content available; exact visual acceptance stays open independently of first-pass layout coverage',
        'Form transport, embedded map, remaining source interaction/carousel fidelity, Sanity and deployment remain open',
        'No route is accepted by this engineering gate',
      ]
    : ['article-fidelity', 'article-regions', 'article-reference'].includes(scope)
      ? [
          'Article capture stability and focused interactions verified; strict visual acceptance is separate',
          'No whole-site, Sanity or deployment acceptance',
        ]
      : scope === 'article-presentation'
        ? [
            'API article presentation reconstructed from source; strict visual acceptance is separate',
            'No whole-site, Sanity or deployment acceptance',
          ]
        : scope === 'article-rendering'
          ? [
              'Complete API article body rendered; article template visual review remains open',
              'Related-post cards and article shell variants are incomplete',
              'No real Sanity, full-site or deployment acceptance',
            ]
          : scope === 'article'
            ? [
                'Offline recovery of one complete captured article body; runtime rendering tracked separately in Chunk 4',
                'No article template, Sanity import, full-site conversion or visual acceptance',
                'Homepage visual differences remain open under Chunk 2',
              ]
            : scope === 'home'
              ? [
                  'English homepage initial reconstruction and six excerpt proofs',
                  'Engineering verification only; strict visual comparison is a separate gate',
                  'No full-site content, Sanity, form delivery or deployment acceptance',
                ]
              : [
                  'Local fixture proof only',
                  'No visual, complete-content, Sanity or deployment acceptance',
                ],
};
const hash = (data) => createHash('sha256').update(data).digest('hex');
async function fingerprint(file, result = manifest.sourceFiles) {
  const stat = await readdir(file, { withFileTypes: true });
  for (const item of stat.sort((a, b) => a.name.localeCompare(b.name))) {
    const next = path.join(file, item.name);
    if (item.name === '__pycache__') continue;
    if (item.isDirectory()) await fingerprint(next, result);
    else result[next.replaceAll('\\', '/')] = hash(await readFile(next));
  }
}
for (const folder of ['src', 'public', 'tests', 'tooling', 'docs']) await fingerprint(folder);
for (const file of [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'playwright.config.ts',
  'vitest.config.ts',
  'eslint.config.mjs',
  'postcss.config.mjs',
  '.npmrc',
  '.node-version',
  '.prettierrc.json',
  '.prettierignore',
  '.env.example',
  '.gitignore',
  'README.md',
  'scripts/audit_backup.py',
]) {
  manifest.sourceFiles[file] = hash(await readFile(file));
}
if (['listing-pages', 'visual-engineering'].includes(scope)) {
  const evidence = JSON.parse(await readFile('tooling/sources/blog-query-evidence.json', 'utf8'));
  manifest.supplementalEvidence = {
    register: 'tooling/sources/blog-query-evidence.json',
    capturedAt: evidence.capturedAt,
    pages: evidence.pages,
  };
  for (const source of evidence.pages) {
    if (
      !/^migration-review\/blog-query-pages\/(?:page-[2-5]|probe-6)\.html$/u.test(source.sourceHtml)
    )
      throw new Error('Unreviewed supplemental source path');
    const checksum = hash(await readFile(source.sourceHtml));
    if (checksum !== source.sha256) throw new Error('Supplemental source checksum differs');
    manifest.sourceFiles[source.sourceHtml] = checksum;
  }
}
manifest.sourceDigest = hash(JSON.stringify(manifest.sourceFiles));
const checks = [
  ...(scope === 'visual-engineering' ? [[python, ['tooling/prepare-motion.py', '--check']]] : []),
  [python, ['docs/tools/check_docs.py', '--with-evidence']],
  [python, ['tooling/extract-reference.py', '--check']],
  [python, ['tooling/prepare-article.py', '--check']],
  ...([
    'site-coverage',
    'article-family',
    'service-family',
    'company-pages',
    'listing-pages',
    'visual-engineering',
  ].includes(scope)
    ? [
        [python, ['tooling/prepare-site.py', '--check']],
        [python, ['-m', 'unittest', 'discover', '-s', 'tooling/tests', '-v']],
      ]
    : []),
  ...(scope !== 'chunk1'
    ? [
        [python, ['tooling/extract-home.py', '--check']],
        [python, ['tooling/prepare-home-assets.py', '--check']],
      ]
    : []),
  ...([
    'article',
    'article-rendering',
    'article-presentation',
    'article-fidelity',
    'article-regions',
    'article-reference',
  ].includes(scope)
    ? [
        [python, ['tooling/extract-article.py', '--check']],
        [
          python,
          [
            '-m',
            'unittest',
            'discover',
            '-s',
            'tooling/tests',
            '-p',
            'test_article_content.py',
            '-v',
          ],
        ],
      ]
    : []),
  ...(scope === 'article-reference'
    ? [
        [
          python,
          [
            '-m',
            'unittest',
            'discover',
            '-s',
            'tooling/tests',
            '-p',
            'test_capture_integrity.py',
            '-v',
          ],
        ],
        [python, ['tooling/recover-article-reference.py']],
        [node, ['tooling/measure-article.mjs']],
        [python, ['tooling/check-article-reference.py', path.join(directory, 'reference')]],
      ]
    : []),
  [node, [npm, 'run', 'verify:routing-data']],
  ...['format:check', 'lint', 'typecheck', 'test:unit', 'build'].map((script) => [
    node,
    [npm, 'run', script],
  ]),
  [node, [npm, 'run', 'verify:build']],
  [node, ['tooling/run-browser-tests.mjs', 'all']],
  ...([
    'article-rendering',
    'article-presentation',
    'article-fidelity',
    'article-regions',
    'article-reference',
  ].includes(scope)
    ? [[python, ['tooling/check-article-captures.py', directory]]]
    : []),
];
try {
  for (const [command, args] of checks) {
    const started = Date.now();
    const name = args.join(' ');
    console.log(`\nChecking ${name}`);
    let log = '';
    const code = await new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        env: {
          ...process.env,
          APP_ENV: 'test',
          BROWSER_TEST_WORKERS: String(manifest.browserWorkers),
          CHROMIUM_TEXT_CALIBRATION: textCalibration,
          ...(scope === 'article-reference'
            ? {
                REFERENCE_CODE_FONT: 'Consolas',
                REFERENCE_OUTPUT_DIR: path.join(directory, 'reference'),
              }
            : {}),
          CHUNK_RUN_DIR: directory,
          NEXT_TELEMETRY_DISABLED: '1',
        },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const receive = (data) => {
        const text = data.toString();
        log += text;
        process.stdout.write(text);
      };
      child.stdout.on('data', receive);
      child.stderr.on('data', receive);
      child.once('error', reject);
      child.once('exit', resolve);
    });
    const logFile = `${String(manifest.checks.length + 1).padStart(2, '0')}.log`;
    await writeFile(path.join(directory, logFile), log);
    manifest.checks.push({
      command: name,
      passed: code === 0,
      exitCode: code,
      durationMs: Date.now() - started,
      logFile,
      logSha256: hash(log),
    });
    await writeFile(
      path.join(directory, 'manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n',
    );
    if (code !== 0) throw new Error(`Failed check: ${name}`);
  }
  const finalSourceFiles = {};
  for (const folder of ['src', 'public', 'tests', 'tooling', 'docs'])
    await fingerprint(folder, finalSourceFiles);
  for (const [file, checksum] of Object.entries(manifest.sourceFiles)) {
    if (!(file in finalSourceFiles)) finalSourceFiles[file] = hash(await readFile(file));
    if (finalSourceFiles[file] !== checksum)
      throw new Error(`Source changed during verification: ${file}`);
  }
  if (Object.keys(finalSourceFiles).length !== Object.keys(manifest.sourceFiles).length)
    throw new Error('Source files were added during verification');
  manifest.sourceIdentityRechecked = true;
  manifest.status = 'passed';
  manifest.buildId = (await readFile('.next/BUILD_ID', 'utf8')).trim();
  for (const [name, file] of [
    ['http', 'http/results.json'],
    ['browser', 'browser/results.json'],
  ]) {
    const results = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
    manifest[name] = results.stats;
  }
} catch (error) {
  manifest.status = 'failed';
  manifest.failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  manifest.finishedAt = new Date().toISOString();
  await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(
    `tmp/${group}/latest.json`,
    JSON.stringify(
      {
        manifest: path.relative(process.cwd(), path.join(directory, 'manifest.json')),
        status: manifest.status,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `\nEngineering (${scope}) ${manifest.status}: ${path.relative(process.cwd(), directory)}/manifest.json`,
  );
}
