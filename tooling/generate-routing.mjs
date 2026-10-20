import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const registerPath = 'docs/registers/legacy-rules.json';
const settingsPath = 'tooling/sources/legacy-match-settings.json';
const [registerText, settingsText, routesText] = await Promise.all([
  readFile(registerPath, 'utf8'),
  readFile(settingsPath, 'utf8'),
  readFile('docs/registers/routes.json', 'utf8'),
]);
const register = JSON.parse(registerText);
const settings = JSON.parse(settingsText);
const routes = JSON.parse(routesText);
const rules = register.rules.map(({ id, observed: rule }) => {
  if (rule.match_type !== 'exact') throw new Error(`Unsupported match type: ${id}`);
  const flags = settings.plugins[rule.rule_table];
  if (!flags) throw new Error(`Missing plugin settings: ${id}`);
  if (![301, 410].includes(rule.expected_status)) throw new Error(`Unsupported status: ${id}`);
  return {
    id,
    source: rule.source_pattern.startsWith('/') ? rule.source_pattern : `/${rule.source_pattern}`,
    status: rule.expected_status,
    location: rule.target_url || null,
    ...flags,
  };
});
if (rules.length !== 67)
  throw new Error('Legacy rule coverage changed; reconcile the baseline first.');
const matchingKey = (source, rule) => {
  let key = decodeURIComponent(source.replace(/\+/gu, ' '));
  if (rule.plugin === 'rank-math') key = key.replace(/^\/+|\/+$/gu, '');
  else if (rule.ignoreTrailingSlash && key !== '/') key = key.replace(/\/$/u, '');
  return rule.ignoreCase ? key.toLowerCase() : key;
};
// Some public responses were produced outside the two configured plugins.
// Preserve only their observed exact paths; do not invent matching flags.
const observedRules = routes.routes
  .filter(
    ({ observed }) =>
      [301, 410].includes(observed.initial_status) &&
      !rules.some((rule) => matchingKey(observed.path, rule) === matchingKey(rule.source, rule)),
  )
  .map(({ id, observed }) => ({
    id,
    plugin: 'observed',
    source: observed.path,
    status: observed.initial_status,
    location: observed.initial_status === 301 ? observed.redirect_chain[0]?.location : null,
    ignoreCase: false,
    ignoreTrailingSlash: false,
    query: 'exact',
  }));
if (observedRules.some((rule) => rule.status === 301 && !rule.location))
  throw new Error('Missing observed redirect target');
const hash = (text) => createHash('sha256').update(text).digest('hex');
const output =
  JSON.stringify(
    {
      generated: 'tooling/generate-routing.mjs; do not edit',
      baselineId: register.baseline_id,
      provenance: {
        registerSha256: hash(registerText),
        settingsSha256: hash(settingsText),
        routesSha256: hash(routesText),
      },
      rules,
      observedRules,
    },
    null,
    2,
  ) + '\n';
const target = 'src/lib/routing/legacy-rules.generated.json';
if (process.argv.includes('--check')) {
  if ((await readFile(target, 'utf8')) !== output)
    throw new Error('Generated legacy rules are stale. Run npm run generate:routing.');
} else {
  await writeFile(target, output);
}
console.log(
  JSON.stringify({
    passed: true,
    rules: rules.length,
    additionalObservedRules: observedRules.length,
    mode: process.argv.includes('--check') ? 'check' : 'generate',
  }),
);
