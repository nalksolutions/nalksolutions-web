import 'server-only';
import type { ContactSubmission } from './validation';
import type { contactConfig } from './config';

type Config = NonNullable<ReturnType<typeof contactConfig>>;
export async function verifyContactChallenge(
  submission: ContactSubmission,
  config: Config,
  origin: string,
): Promise<boolean> {
  if (!config.secret) return true;
  if (!submission.turnstileToken) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: config.secret, response: submission.turnstileToken }),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
    redirect: 'error',
  });
  if (!response.ok) return false;
  const result: unknown = await response.json();
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === true &&
    'hostname' in result &&
    result.hostname === new URL(origin).hostname &&
    'action' in result &&
    result.action === 'contact'
  );
}

export async function deliverContact(
  submission: ContactSubmission,
  config: Config,
): Promise<string> {
  if (config.mode === 'test') return `test-${submission.submissionId}`;
  const text = [
    'New Nalk Solutions website enquiry',
    `Language: ${submission.locale === 'ar' ? 'Arabic' : 'English'}`,
    `Page: ${submission.pagePath}`,
    `Reference: ${submission.submissionId}`,
    '',
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone || '(not provided)'}`,
    '',
    'Message:',
    submission.message,
  ].join('\n');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `contact/${submission.submissionId}`,
    },
    body: JSON.stringify({
      from: `Nalk Website <${config.from}>`,
      to: [config.to],
      reply_to: submission.email,
      subject: `New website enquiry (${submission.locale === 'ar' ? 'Arabic' : 'English'})`,
      text,
    }),
    signal: AbortSignal.timeout(12_000),
    cache: 'no-store',
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Email transport rejected the enquiry');
  const result: unknown = await response.json();
  if (
    typeof result !== 'object' ||
    result === null ||
    !('id' in result) ||
    typeof result.id !== 'string' ||
    !result.id
  )
    throw new Error('Email acceptance was not confirmed');
  return result.id;
}
