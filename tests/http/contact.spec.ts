import { randomUUID } from 'node:crypto';
import { expect, test } from '../local-test';

test('Contact API: real production handler, local test transport, languages and guarded boundaries', async ({
  request,
  baseURL,
}) => {
  const headers = { origin: baseURL!, 'x-forwarded-for': `http-${randomUUID()}` };
  const data = {
    name: 'Contact test',
    email: 'visitor@example.com',
    phone: '',
    message: 'Please discuss our website project.',
    locale: 'en',
    pagePath: '/contacts/',
    website: '',
    turnstileToken: '',
    submissionId: randomUUID(),
  };
  for (const locale of ['en', 'ar']) {
    const response = await request.post('/api/contact/', {
      headers,
      data: {
        ...data,
        locale,
        pagePath: locale === 'ar' ? '/ar/contacts/' : '/contacts/',
        submissionId: randomUUID(),
      },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(await response.json()).toMatchObject({ ok: true, reference: expect.any(String) });
  }
  const invalid = await request.post('/api/contact/', {
    headers,
    data: { ...data, email: 'invalid' },
  });
  expect(invalid.status()).toBe(422);
  expect(await invalid.json()).toMatchObject({ code: 'invalid', fields: ['email'] });
  expect(
    (
      await request.post('/api/contact/', { headers: { origin: 'https://attacker.example' }, data })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post('/api/contact/', { headers, data: { ...data, website: 'bot.example' } })
    ).status(),
  ).toBe(403);
  for (const method of ['get', 'head'] as const) {
    const response = await request[method]('/api/contact/');
    expect(response.status()).toBe(405);
    expect(response.headers().allow).toBe('POST');
    if (method === 'head') expect(await response.body()).toHaveLength(0);
  }
  expect((await request.get('/api/not-public/')).status()).toBe(404);
  expect(
    (
      await request.post('/api/contact/', {
        headers,
        data: { ...data, message: 'x'.repeat(17000) },
      })
    ).status(),
  ).toBe(413);
  const limited = await request.post('/api/contact/', { headers, data });
  expect(limited.status()).toBe(429);
  expect(limited.headers()['retry-after']).toBe('600');
});
