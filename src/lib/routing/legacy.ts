import manifest from './legacy-rules.generated.json' with { type: 'json' };
import { z } from 'zod';
import { PUBLIC_ORIGIN } from '../env/config';

const ruleSchema = z.object({
  id: z.string().min(1),
  plugin: z.enum(['rank-math', 'redirection', 'observed']),
  source: z.string().min(1),
  status: z.union([z.literal(301), z.literal(410)]),
  location: z.string().nullable(),
  ignoreCase: z.boolean(),
  ignoreTrailingSlash: z.boolean(),
  query: z.literal('exact'),
});
export type LegacyRule = z.infer<typeof ruleSchema>;

export const legacyRules: readonly LegacyRule[] = z.array(ruleSchema).parse(manifest.rules);
export const statusRules: readonly LegacyRule[] = [
  ...legacyRules,
  ...z.array(ruleSchema).parse(manifest.observedRules),
];

function normalizedSource(value: string, rule: LegacyRule): string {
  // Both plugins use PHP urldecode (+ becomes space).
  let result = decodeURIComponent(rule.plugin === 'observed' ? value : value.replace(/\+/gu, ' '));
  if (rule.plugin === 'rank-math') result = result.replace(/^\/+|\/+$/gu, '');
  else if (rule.ignoreTrailingSlash && result !== '/') result = result.replace(/\/$/u, '');
  return rule.ignoreCase ? result.toLowerCase() : result;
}

export function findLegacyRule(pathname: string, search = ''): LegacyRule | undefined {
  return statusRules.find((rule) => {
    // No active source has a query. The saved flags require an exact query match.
    if (search) return false;
    return normalizedSource(pathname, rule) === normalizedSource(rule.source, rule);
  });
}

export function validateLegacyRules(rules: readonly LegacyRule[]): void {
  for (const [index, rule] of rules.entries()) {
    const overlaps = rules
      .slice(0, index)
      .some(
        (previous) =>
          normalizedSource(previous.source, rule) === normalizedSource(rule.source, rule) ||
          normalizedSource(rule.source, previous) === normalizedSource(previous.source, previous),
      );
    if (overlaps) throw new Error(`Conflicting legacy source: ${rule.id}`);
    if (rule.status === 410 && rule.location !== null) throw new Error(`Gone target: ${rule.id}`);
    if (rule.status === 301) {
      if (!rule.location) throw new Error(`Missing redirect target: ${rule.id}`);
      const target = new URL(rule.location);
      if (target.origin !== PUBLIC_ORIGIN || target.username || target.password) {
        throw new Error(`Unsafe redirect target: ${rule.id}`);
      }
      const seen = new Set([rule.id]);
      let current: LegacyRule | undefined = rule;
      while (current?.location) {
        const url: URL = new URL(current.location);
        current = rules.find(
          (candidate) =>
            normalizedSource(url.pathname, candidate) ===
            normalizedSource(candidate.source, candidate),
        );
        if (current && seen.has(current.id)) throw new Error(`Redirect cycle: ${rule.id}`);
        if (current) seen.add(current.id);
      }
    }
  }
}
