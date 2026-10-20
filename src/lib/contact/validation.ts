import 'server-only';
import { z } from 'zod';
import { contactLimits } from './contract';

const line = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));
export const contactSubmission = z
  .strictObject({
    name: line(contactLimits.name).min(2),
    email: z.email().trim().max(contactLimits.email),
    phone: line(contactLimits.phone).regex(/^[\p{Nd}+().\-\s]*$/u),
    message: z
      .string()
      .trim()
      .min(10)
      .max(contactLimits.message)
      .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)),
    locale: z.enum(['en', 'ar']),
    pagePath: z.enum(['/contacts/', '/ar/contacts/']),
    submissionId: z.uuid(),
    website: z.string().max(200).default(''),
    turnstileToken: z.string().max(2048).default(''),
  })
  .refine((value) => value.pagePath === (value.locale === 'ar' ? '/ar/contacts/' : '/contacts/'), {
    path: ['pagePath'],
    message: 'Invalid language context',
  });
export type ContactSubmission = z.infer<typeof contactSubmission>;

export class ContactBodyError extends Error {
  constructor(public readonly status: number) {
    super('Invalid contact request');
  }
}

/** Count streamed bytes as well as Content-Length; clients cannot bypass the 16 KiB bound. */
export async function readContactBody(request: Request): Promise<unknown> {
  if (
    request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json'
  )
    throw new ContactBodyError(415);
  const maximum = 16 * 1024;
  const length = Number(request.headers.get('content-length'));
  if (!Number.isFinite(length) || length < 0 || length > maximum) throw new ContactBodyError(413);
  if (!request.body) throw new ContactBodyError(400);
  const reader = request.body.getReader();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    // A disconnected client can reject cancellation; the read loop still returns
    // the bounded request failure and must not leave an unhandled promise behind.
    void reader.cancel().catch(() => undefined);
  }, 5000);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (timedOut) throw new ContactBodyError(408);
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maximum) {
        await reader.cancel();
        throw new ContactBodyError(413);
      }
      chunks.push(chunk.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch (error) {
    if (error instanceof ContactBodyError) throw error;
    throw new ContactBodyError(400);
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}
