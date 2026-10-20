import 'server-only';
import { createHash } from 'node:crypto';

const windowMs = 10 * 60 * 1000;
const buckets = new Map<string, { count: number; expires: number }>();

/** Bounded, per-instance abuse control. Hosted global limits belong in Vercel Firewall. */
export function allowContactAttempt(request: Request, now = Date.now()): boolean {
  const address = (
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for') ??
    'unknown'
  )
    .split(',')[0]!
    .trim();
  const key = createHash('sha256').update(address).digest('hex');
  const existing = buckets.get(key);
  if (existing && existing.expires > now) {
    existing.count++;
    return existing.count <= 5;
  }
  for (const [candidate, bucket] of buckets) if (bucket.expires <= now) buckets.delete(candidate);
  if (buckets.size >= 1000) return false;
  buckets.set(key, { count: 1, expires: now + windowMs });
  return true;
}
