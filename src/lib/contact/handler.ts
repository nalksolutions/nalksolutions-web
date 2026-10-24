import 'server-only';
import { randomUUID } from 'node:crypto';
import { allowedContactOrigin, contactConfig } from './config';
import { contactSubmission, ContactBodyError, readContactBody } from './validation';
import { allowContactAttempt } from './rate-limit';
import { deliverContact, verifyContactChallenge } from './delivery';
import { contactLimits, type ContactField, type ContactResult } from './contract';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
function reply(result: ContactResult, status: number) {
  return Response.json(result, {
    status,
    headers: { ...headers, ...(status === 429 ? { 'Retry-After': '600' } : {}) },
  });
}
function rejected(reason: 'origin' | 'honeypot' | 'verification', reference: string) {
  // No submitted values, origin URLs, IPs or credentials enter these diagnostics.
  console.warn(JSON.stringify({ event: 'contact_rejected', reason, reference }));
  return reply({ ok: false, code: reason === 'verification' ? 'verification' : 'invalid' }, 403);
}
export function contactMethodNotAllowed(request: Request) {
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ ok: false }), {
    status: 405,
    headers: { ...headers, Allow: 'POST', 'Content-Type': 'application/json; charset=utf-8' },
  });
}
export async function handleContact(request: Request): Promise<Response> {
  const reference = randomUUID();
  const origin = request.headers.get('origin');
  if (!allowedContactOrigin(origin, process.env)) return rejected('origin', reference);
  if (!allowContactAttempt(request)) return reply({ ok: false, code: 'rate_limited' }, 429);
  let input: unknown;
  try {
    input = await readContactBody(request);
  } catch (error) {
    return reply(
      { ok: false, code: 'invalid' },
      error instanceof ContactBodyError ? error.status : 400,
    );
  }
  const parsed = contactSubmission.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))].filter(
      (field): field is ContactField => typeof field === 'string' && field in contactLimits,
    );
    return reply({ ok: false, code: 'invalid', fields }, 422);
  }
  if (parsed.data.website) return rejected('honeypot', reference);
  const config = contactConfig();
  if (!config) {
    console.error(JSON.stringify({ event: 'contact_unavailable', reference }));
    return reply({ ok: false, code: 'unavailable' }, 503);
  }
  try {
    if (!(await verifyContactChallenge(parsed.data, config, origin!)))
      return rejected('verification', reference);
  } catch {
    return reply({ ok: false, code: 'unavailable' }, 503);
  }
  try {
    await deliverContact(parsed.data, config);
    console.info(
      JSON.stringify({
        event: config.mode === 'test' ? 'contact_test_accepted' : 'contact_accepted',
        reference,
      }),
    );
    return reply({ ok: true, reference }, 200);
  } catch {
    console.error(JSON.stringify({ event: 'contact_delivery_failed', reference }));
    return reply({ ok: false, code: 'delivery_failed' }, 502);
  }
}
