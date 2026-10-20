import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const selection = process.argv[2] ?? 'all';
if (!['all', 'http', 'browser'].includes(selection))
  throw new Error('Expected all, http or browser.');
const filters = process.argv.slice(3);
const browserWorkers = Number(process.env.BROWSER_TEST_WORKERS ?? 1);
if (![1, 2, 4].includes(browserWorkers)) throw new Error('BROWSER_TEST_WORKERS must be 1, 2 or 4');
if (selection === 'all' && filters.length) throw new Error('The complete gate cannot be filtered');
if (filters.some((value) => !/^--(?:grep|project)=.+$/u.test(value))) {
  throw new Error('Focused runs accept only --grep=... and --project=...');
}
const root = path.resolve(
  process.env.CHUNK_RUN_DIR ?? `tmp/chunk1/${new Date().toISOString().replace(/[:.]/gu, '-')}`,
);
await mkdir(root, { recursive: true });
const fixture = path.join(root, 'fixtures.json');
await copyFile('src/content/site/pages.generated.json', fixture);
const documents = path.join(root, 'documents');
await cp('src/content/site/documents', documents, { recursive: true });
const port = Number(process.env.TEST_PORT ?? 3100);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid TEST_PORT');

await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', () =>
    reject(new Error(`Test port ${port} is occupied; no existing server will be reused.`)),
  );
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});

const serverLog = createWriteStream(path.join(root, 'server.log'));
const env = {
  ...process.env,
  APP_ENV: 'test',
  FIXTURE_CONTENT_PATH: fixture,
  FIXTURE_DOCUMENTS_PATH: documents,
  TEST_PORT: String(port),
  NEXT_TELEMETRY_DISABLED: '1',
};
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
  { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
server.stdout.pipe(serverLog);
server.stderr.pipe(serverLog);
let spawnError;
server.once('error', (error) => {
  spawnError = error;
});

async function ready() {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null)
      throw new Error('Owned Next.js server exited before readiness; inspect server.log.');
    try {
      const response = await fetch(`http://127.0.0.1:${port}/robots.txt`, {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) return;
    } catch (error) {
      if (attempt === 119) throw error;
    }
    await delay(250);
  }
  throw new Error('Next.js readiness timeout');
}

async function stop() {
  if (server.exitCode === null) {
    const exited = new Promise((resolve) => server.once('exit', resolve));
    server.kill();
    await exited;
  }
  serverLog.end();
}

try {
  await ready();
  const groups = selection === 'all' ? ['http', 'browser'] : [selection];
  for (const group of groups) {
    const directory = path.join(root, group);
    await mkdir(directory, { recursive: true });
    const args = [
      'node_modules/@playwright/test/cli.js',
      'test',
      '--max-failures=1',
      ...(group === 'browser' ? [`--workers=${browserWorkers}`] : []),
      ...(group === 'http'
        ? ['--project=http']
        : filters.some((value) => value.startsWith('--project='))
          ? []
          : ['--project=chromium-*', '--project=firefox-*', '--project=webkit-*']),
      ...filters,
    ];
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        env: { ...env, CHUNK_RUN_DIR: directory },
        windowsHide: true,
        stdio: 'inherit',
      });
      child.once('error', reject);
      child.once('exit', resolve);
    });
    if (code !== 0) throw new Error(`Playwright ${group} failed (${code})`);
  }
  await writeFile(
    path.join(root, 'runtime.json'),
    JSON.stringify(
      {
        passed: true,
        port,
        serverPid: server.pid,
        stoppedAfterRun: true,
        fixturePath: path.relative(process.cwd(), fixture),
        selection,
        filters,
        browserWorkers,
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await stop();
}
