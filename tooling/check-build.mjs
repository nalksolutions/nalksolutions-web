import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const prohibited = [
  'nalksolutions.com_wordpress_backup',
  'nalk-public-archive',
  'migration-review',
  'tmp',
  '.venv',
  'docs',
  'tests',
  'tooling',
];
const root = process.cwd();
let traces = 0;
let fixtureIncluded = false;
let articleIncluded = false;
let siteIncluded = false;
const documents = new Set();
async function inspect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await inspect(file);
    else if (item.name.endsWith('.nft.json')) {
      traces++;
      const manifest = JSON.parse(await readFile(file, 'utf8'));
      for (const entry of manifest.files) {
        const relative = path
          .relative(root, path.resolve(path.dirname(file), entry))
          .replaceAll('\\', '/');
        assert(
          !prohibited.some((prefix) => relative === prefix || relative.startsWith(`${prefix}/`)),
          `Private/reference file traced into build: ${relative}`,
        );
        if (relative === 'src/content/fixtures/pages.json') fixtureIncluded = true;
        if (relative === 'src/content/articles/api.generated.json') articleIncluded = true;
        if (relative === 'src/content/site/pages.generated.json') siteIncluded = true;
        if (relative.startsWith('src/content/site/documents/')) documents.add(relative);
      }
    }
  }
}
await inspect('.next');
assert(traces > 0, 'Expected Next.js output tracing manifests');
assert(siteIncluded, 'Complete content index must be available to the built server');
assert.equal(documents.size, 116, 'Every recovered document must be available to the built server');
assert(articleIncluded, 'Article content must be available to the built server');
console.log(
  JSON.stringify({
    passed: true,
    traces,
    privateReferenceFilesIncluded: false,
    fixtureIncluded,
    articleIncluded,
    siteIncluded,
    documents: documents.size,
  }),
);
