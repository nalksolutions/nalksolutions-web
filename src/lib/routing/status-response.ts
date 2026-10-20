const messages = {
  400: ['Invalid request', 'The requested URL is invalid.'],
  404: ['Page not found', 'This URL has no published page in the local routing proof.'],
  410: ['Page removed', 'This page has been permanently removed.'],
  503: ['Content unavailable', 'Please try again when the local content source is available.'],
} as const;

export function statusResponse(
  status: keyof typeof messages,
  method: string,
  locale: 'en' | 'ar' = 'en',
): Response {
  const arabic = {
    400: ['طلب غير صالح', 'عنوان الصفحة المطلوب غير صالح.'],
    404: ['الصفحة غير موجودة', 'لا توجد صفحة منشورة على هذا العنوان.'],
    410: ['أُزيلت الصفحة', 'أُزيلت هذه الصفحة نهائيًا.'],
    503: ['المحتوى غير متاح مؤقتًا', 'يرجى المحاولة مجددًا عند توفر مصدر المحتوى.'],
  };
  const [title, description] = locale === 'ar' ? arabic[status] : messages[status];
  const html = `<!doctype html><html lang="${locale === 'ar' ? 'ar' : 'en-US'}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Nalk Solutions</title><style>body{font:1rem/1.6 system-ui;margin:0;padding:2rem;color:#172033;background:#f8fafc}main{max-width:44rem;margin:auto}a{color:#174bbb}a:focus-visible{outline:3px solid #174bbb;outline-offset:4px}</style></head><body><main><h1>${title}</h1><p>${description}</p><p><a href="${locale === 'ar' ? '/ar/' : '/'}">${locale === 'ar' ? 'العودة إلى الرئيسية' : 'Return to the routing proof'}</a></p></main></body></html>`;
  return new Response(method === 'HEAD' ? null : html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...(status === 503 ? { 'Retry-After': '5' } : {}),
    },
  });
}
