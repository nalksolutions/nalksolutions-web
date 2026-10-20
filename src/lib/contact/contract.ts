export const contactLimits = { name: 100, email: 254, phone: 40, message: 5000 } as const;
export type ContactField = keyof typeof contactLimits;
export type ContactFailure =
  'invalid' | 'verification' | 'rate_limited' | 'unavailable' | 'delivery_failed';
export type ContactResult =
  { ok: true; reference: string } | { ok: false; code: ContactFailure; fields?: ContactField[] };
