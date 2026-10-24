import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { contactSubmission, readContactBody } from '../../src/lib/contact/validation';
import { allowedContactOrigin, contactConfig, contactSiteKey } from '../../src/lib/contact/config';
import { deliverContact, verifyContactChallenge } from '../../src/lib/contact/delivery';
import { handleContact } from '../../src/lib/contact/handler';
import { allowContactAttempt } from '../../src/lib/contact/rate-limit';

const payload = {
  name: 'عبدالله العتيبي',
  email: 'visitor@example.com',
  phone: '+966 50 123 4567',
  message: 'نحتاج إلى موقع عربي وإنجليزي لأعمالنا في جدة.',
  locale: 'ar' as const,
  pagePath: '/ar/contacts/' as const,
  submissionId: 'f012c844-5881-4f4e-9068-5dfb261d5dab',
  website: '',
  turnstileToken: '',
};
const settings = {
  APP_ENV: 'local',
  RESEND_API_KEY: 're_unit_test_key',
  CONTACT_EMAIL_FROM: 'forms@notify.nalksolutions.com',
  CONTACT_EMAIL_TO: 'info@nalksolutions.com',
};
let client = 0;
function request(data: unknown = payload, extra: Record<string, string> = {}) {
  return new Request('http://127.0.0.1:3000/api/contact/', {
    method: 'POST',
    headers: {
      origin: 'http://127.0.0.1:3000',
      'content-type': 'application/json',
      'x-forwarded-for': `unit-client-${++client}`,
      ...extra,
    },
    body: JSON.stringify(data),
  });
}
beforeEach(() => {
  for (const [name, value] of Object.entries(settings)) vi.stubEnv(name, value);
  for (const name of [
    'CONTACT_EMAIL_MODE',
    'TURNSTILE_SECRET_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'VERCEL',
    'VERCEL_URL',
    'VERCEL_BRANCH_URL',
    'VERCEL_PROJECT_PRODUCTION_URL',
    'CONTACT_ALLOWED_ORIGINS',
    'CONTACT_TURNSTILE_ENABLED',
  ])
    vi.stubEnv(name, '');
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('contact validation and trust boundary', () => {
  it('cancels a stalled upload at the body deadline', async () => {
    vi.useFakeTimers();
    try {
      const cancel = vi.fn();
      const body = new ReadableStream({ cancel });
      const req = new Request('http://localhost/api/contact/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        duplex: 'half',
      } as RequestInit & { duplex: 'half' });
      const result = expect(readContactBody(req)).rejects.toMatchObject({ status: 408 });
      await vi.advanceTimersByTimeAsync(5000);
      await result;
      expect(cancel).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
  it('preserves Arabic, meaningful punctuation and phone numbers without requiring a phone', () => {
    expect(contactSubmission.parse(payload).message).toBe(payload.message);
    expect(contactSubmission.parse({ ...payload, phone: '' }).phone).toBe('');
    for (const change of [
      { email: 'invalid' },
      { name: 'A' },
      { name: 'Name\r\nBcc: spam' },
      { message: 'short' },
      { message: 'x'.repeat(5001) },
      { phone: 'http://spam.example' },
      { pagePath: '/contacts/' },
      { to: 'attacker@example.com' },
      { locale: 'xx' },
      { submissionId: 'unsafe' },
    ])
      expect(contactSubmission.safeParse({ ...payload, ...change }).success).toBe(false);
  });
  it('accepts only authored origins and the exact owned deployment, independent of Host', () => {
    const hosted = { VERCEL: '1', VERCEL_URL: 'owned-preview.vercel.app' };
    for (const origin of [
      'https://nalksolutions.com',
      'https://www.nalksolutions.com',
      'https://owned-preview.vercel.app',
    ])
      expect(allowedContactOrigin(origin, hosted)).toBe(true);
    for (const origin of [
      null,
      'null',
      'https://attacker.vercel.app',
      'http://127.0.0.1:3000',
      'https://nalksolutions.com.attacker.example',
      'https://nalksolutions.com/',
    ])
      expect(allowedContactOrigin(origin, hosted)).toBe(false);
    expect(allowedContactOrigin('http://127.0.0.1:3000', {})).toBe(true);
  });
  it('accepts exact project and branch aliases without trusting unrelated Vercel sites', () => {
    const hosted = {
      VERCEL: '1',
      VERCEL_URL: 'owned-deployment-123.vercel.app',
      VERCEL_BRANCH_URL: 'owned-git-main.vercel.app',
      VERCEL_PROJECT_PRODUCTION_URL: 'owned-project.vercel.app',
    };
    for (const hostname of [
      'nalksolutions-web.vercel.app',
      hosted.VERCEL_URL,
      hosted.VERCEL_BRANCH_URL,
      hosted.VERCEL_PROJECT_PRODUCTION_URL,
    ])
      expect(allowedContactOrigin(`https://${hostname}`, hosted)).toBe(true);
    for (const origin of [
      'https://unrelated.vercel.app',
      'https://nalksolutions-web.vercel.app.attacker.example',
      'http://nalksolutions-web.vercel.app',
      'https://nalksolutions-web.vercel.app/',
    ])
      expect(allowedContactOrigin(origin, hosted)).toBe(false);
    expect(
      allowedContactOrigin('https://attacker.example', {
        ...hosted,
        VERCEL_BRANCH_URL: 'user@attacker.example',
      }),
    ).toBe(false);
  });
  it('defaults Turnstile off even when hosted keys remain configured', () => {
    const env = {
      ...settings,
      VERCEL: '1',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '0x_real_key',
      TURNSTILE_SECRET_KEY: 'secret',
    };
    expect(contactConfig(env)).toMatchObject({ mode: 'resend', secret: null });
    expect(contactSiteKey(env)).toBeNull();
    expect(contactSiteKey({ ...env, CONTACT_TURNSTILE_ENABLED: 'false' })).toBeNull();
    expect(contactConfig({ ...settings, VERCEL: '1' })).toMatchObject({
      mode: 'resend',
      secret: null,
    });
    expect(contactConfig({ ...env, CONTACT_TURNSTILE_ENABLED: 'true' })).toMatchObject({
      secret: 'secret',
    });
    expect(contactSiteKey({ ...env, CONTACT_TURNSTILE_ENABLED: 'true' })).toBe('0x_real_key');
  });
  it('fails closed for missing email credentials or incomplete captcha opt-in and forbids hosted fake delivery', () => {
    expect(contactConfig({})).toBeNull();
    expect(
      contactConfig({
        ...settings,
        CONTACT_TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'secret',
      }),
    ).toBeNull();
    expect(
      contactConfig({ ...settings, CONTACT_TURNSTILE_ENABLED: 'true', VERCEL: '1' }),
    ).toBeNull();
    expect(contactConfig({ ...settings, CONTACT_EMAIL_MODE: 'test', APP_ENV: 'local' })).toBeNull();
    expect(contactConfig({ ...settings, CONTACT_EMAIL_MODE: 'test', APP_ENV: 'test' })?.mode).toBe(
      'test',
    );
    expect(
      contactConfig({ ...settings, CONTACT_EMAIL_MODE: 'test', APP_ENV: 'test', VERCEL: '1' }),
    ).toBeNull();
    expect(
      contactConfig({
        ...settings,
        VERCEL: '1',
        CONTACT_TURNSTILE_ENABLED: 'true',
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
        TURNSTILE_SECRET_KEY: 'secret',
      }),
    ).toBeNull();
    expect(
      contactConfig({ ...settings, CONTACT_EMAIL_FROM: 'a@example.com\r\nBcc: x@example.com' }),
    ).toBeNull();
  });
  it('bounds streamed bodies, rejects malformed data and requires the declared content type', async () => {
    await expect(readContactBody(request())).resolves.toEqual(payload);
    await expect(
      readContactBody(request({}, { 'content-type': 'text/plain' })),
    ).rejects.toMatchObject({ status: 415 });
    await expect(readContactBody(request({}, { 'content-length': '17000' }))).rejects.toMatchObject(
      { status: 413 },
    );
    const streamed = new Request('http://localhost/api/contact/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'x'.repeat(17000),
    });
    await expect(readContactBody(streamed)).rejects.toMatchObject({ status: 413 });
    const malformed = new Request('http://localhost/api/contact/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    await expect(readContactBody(malformed)).rejects.toMatchObject({ status: 400 });
  });
  it('limits repeated attempts and opens a new window after expiry', () => {
    const req = request({}, { 'x-forwarded-for': 'rate-window-test' });
    for (let index = 0; index < 5; index++) expect(allowContactAttempt(req, 100)).toBe(true);
    expect(allowContactAttempt(req, 200)).toBe(false);
    expect(allowContactAttempt(req, 600101)).toBe(true);
  });
});

describe('contact transport and response outcomes', () => {
  it('uses only server recipients, visitor Reply-To, plaintext and a stable retry key', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: 'provider-id' }));
    vi.stubGlobal('fetch', fetcher);
    await expect(deliverContact(payload, contactConfig(settings)!)).resolves.toBe('provider-id');
    const [url, options] = fetcher.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.redirect).toBe('error');
    const email = JSON.parse(options.body);
    expect(email.to).toEqual(['info@nalksolutions.com']);
    expect(email.reply_to).toBe(payload.email);
    expect(email.from).toBe('Nalk Website <forms@notify.nalksolutions.com>');
    expect(email.text).toContain(payload.message);
    expect(email.html).toBeUndefined();
    expect(options.headers['Idempotency-Key']).toBe(`contact/${payload.submissionId}`);
  });
  it('requires provider acceptance, never equating a rejection or malformed response with success', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ error: 'rejected' }, { status: 403 }))
      .mockResolvedValueOnce(Response.json({}))
      .mockRejectedValueOnce(new Error('timeout'));
    vi.stubGlobal('fetch', fetcher);
    for (let index = 0; index < 3; index++)
      await expect(deliverContact(payload, contactConfig(settings)!)).rejects.toThrow();
  });
  it('requires a successful, exact-host and contact-action Turnstile result', async () => {
    const config = contactConfig({
      ...settings,
      CONTACT_TURNSTILE_ENABLED: 'true',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '0x_real_key',
      TURNSTILE_SECRET_KEY: 'secret',
    })!;
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect(await verifyContactChallenge(payload, config, 'https://nalksolutions.com')).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
    for (const result of [
      { success: true, hostname: 'nalksolutions.com', action: 'contact' },
      { success: true, hostname: 'other.example', action: 'contact' },
      { success: true, hostname: 'nalksolutions.com', action: 'other' },
      { success: false, hostname: 'nalksolutions.com', action: 'contact' },
    ]) {
      fetcher.mockResolvedValueOnce(Response.json(result));
      expect(
        await verifyContactChallenge(
          { ...payload, turnstileToken: 'token' },
          config,
          'https://nalksolutions.com',
        ),
      ).toBe(
        result.success && result.hostname === 'nalksolutions.com' && result.action === 'contact',
      );
    }
  });
  it('rejects bypassed client validation, forged origins and honeypot input before sending', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const invalid = await handleContact(request({ ...payload, email: 'invalid' }));
    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toMatchObject({ ok: false, fields: ['email'] });
    expect(
      (
        await handleContact(
          request(payload, { origin: 'https://attacker.example', host: 'nalksolutions.com' }),
        )
      ).status,
    ).toBe(403);
    expect((await handleContact(request({ ...payload, website: 'spam' }))).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('reports acceptance only after sending and keeps personal data out of logs and responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ id: 'accepted' })));
    const response = await handleContact(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const result = await response.text();
    expect(result).toContain('"ok":true');
    for (const value of [payload.name, payload.email, payload.message]) {
      expect(result).not.toContain(value);
      expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain(value);
    }
  });
  it('sends hosted enquiries without a challenge or Cloudflare call when Turnstile is off', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '0x_leftover_key');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'leftover_secret');
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: 'accepted' }));
    vi.stubGlobal('fetch', fetcher);
    const response = await handleContact(request(payload, { origin: 'https://nalksolutions.com' }));
    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]![0]).toBe('https://api.resend.com/emails');
  });
  it('processes enquiries from the stable Vercel project origin with a distinct deployment URL', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VERCEL_URL', 'nalksolutions-web-unique-build.vercel.app');
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: 'accepted' }));
    vi.stubGlobal('fetch', fetcher);
    const response = await handleContact(
      request(payload, { origin: 'https://nalksolutions-web.vercel.app' }),
    );
    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]![0]).toBe('https://api.resend.com/emails');
  });
  it('returns controlled unavailable and delivery-failed outcomes without leaking provider secrets', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    expect((await handleContact(request())).status).toBe(503);
    vi.stubEnv('RESEND_API_KEY', settings.RESEND_API_KEY);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error(`provider rejected ${payload.email}`)),
    );
    const failed = await handleContact(request());
    expect(failed.status).toBe(502);
    expect(await failed.json()).toEqual({ ok: false, code: 'delivery_failed' });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(payload.email);
  });
});
