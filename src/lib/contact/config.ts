import 'server-only';
import { z } from 'zod';
import { PUBLIC_ORIGIN } from '../env/config';

type Environment = Readonly<Record<string, string | undefined>>;
export function isHosted(env: Environment) {
  return env.VERCEL === '1' || env.APP_ENV === 'production';
}
export function isContactTest(env: Environment) {
  return env.CONTACT_EMAIL_MODE === 'test' && env.APP_ENV === 'test' && !isHosted(env);
}

/** Return only the public widget key to the form; transport secrets stay on the server. */
export function contactSiteKey(env: Environment = process.env): string | null {
  return env.CONTACT_TURNSTILE_ENABLED !== 'true' || isContactTest(env)
    ? null
    : env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export function allowedContactOrigin(origin: string | null, env: Environment): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.origin !== origin || url.username || url.password) return false;
    if (
      !isHosted(env) &&
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(url.hostname)
    )
      return true;
    const origins = [
      PUBLIC_ORIGIN,
      'https://www.nalksolutions.com',
      'https://nalksolutions-web.vercel.app',
    ];
    // Deployment, branch and production aliases are distinct Vercel addresses.
    // Trust exact server configuration, never request Host/forwarded headers.
    for (const hostname of [
      env.VERCEL_URL,
      env.VERCEL_BRANCH_URL,
      env.VERCEL_PROJECT_PRODUCTION_URL,
    ]) {
      if (!hostname) continue;
      const deployment = new URL(`https://${hostname}`);
      if (deployment.host !== hostname || deployment.origin !== `https://${hostname}`) return false;
      origins.push(deployment.origin);
    }
    for (const value of (env.CONTACT_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)) {
      const extra = new URL(value.trim());
      if (extra.protocol !== 'https:' || extra.origin !== value.trim()) return false;
      origins.push(extra.origin);
    }
    return origins.includes(origin);
  } catch {
    return false;
  }
}

const mailbox = z
  .email()
  .max(254)
  .refine((value) => !/[\r\n]/u.test(value));
const configSchema = z.object({
  key: z
    .string()
    .regex(/^re_[A-Za-z0-9_]+$/u)
    .min(10),
  from: mailbox,
  to: mailbox,
});
export function contactConfig(env: Environment = process.env) {
  if (env.CONTACT_TURNSTILE_ENABLED && !['true', 'false'].includes(env.CONTACT_TURNSTILE_ENABLED))
    return null;
  if (env.CONTACT_EMAIL_MODE && !['resend', 'test'].includes(env.CONTACT_EMAIL_MODE)) return null;
  if (env.CONTACT_EMAIL_MODE === 'test')
    return isContactTest(env) ? { mode: 'test' as const, secret: null } : null;
  const parsed = configSchema.safeParse({
    key: env.RESEND_API_KEY,
    from: env.CONTACT_EMAIL_FROM,
    to: env.CONTACT_EMAIL_TO ?? 'info@nalksolutions.com',
  });
  if (!parsed.success) return null;
  const enabled = env.CONTACT_TURNSTILE_ENABLED === 'true';
  const secret = enabled ? env.TURNSTILE_SECRET_KEY?.trim() || null : null;
  const siteKey = contactSiteKey(env);
  // Disabled by owner direction. Explicit opt-in requires both keys in every environment.
  if (enabled && (!secret || !siteKey)) return null;
  if (
    isHosted(env) &&
    (siteKey?.startsWith('1x') || siteKey?.startsWith('2x') || siteKey?.startsWith('3x'))
  )
    return null;
  return { mode: 'resend' as const, ...parsed.data, secret };
}
