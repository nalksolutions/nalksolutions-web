import type { OfferId } from './offers';

export const arabicOfferAliases: Readonly<Record<OfferId, readonly string[]>> = {
  websites: [
    'تصميم موقع',
    'تصميم المواقع',
    'تطوير موقع',
    'متجر إلكتروني',
    'تجارة إلكترونية',
    'ووردبريس',
    'صيانة المواقع',
    'تجربة المستخدم',
    'واجهات',
  ],
  software: [
    'برمجة',
    'برمجة تطبيقات',
    'تطوير تطبيقات',
    'تطبيق جوال',
    'برنامج مخصص',
    'أنظمة الأعمال',
    'بوابة العملاء',
    'بوابة الموظفين',
    'بوابات الشركات',
    'برمجيات كخدمة',
  ],
  automation: [
    'أتمتة',
    'ذكاء اصطناعي',
    'ربط الأنظمة',
    'واجهات برمجة التطبيقات',
    'API',
    'عمليات الأعمال',
    'روبوت محادثة',
  ],
  marketing: [
    'سيو',
    'تحسين محركات البحث',
    'إعلانات جوجل',
    'إعلانات Google',
    'تواصل اجتماعي',
    'سناب شات',
    'تيك توك',
    'البريد الإلكتروني',
    'تسويق المحتوى',
    'أتمتة التسويق',
  ],
};

/** Authored commercial connections; these are not translation relationships. */
export const arabicOnlyServiceParents: Readonly<Record<string, OfferId>> = {
  'R-dbe0adc51c0b8222': 'software',
};
export const arabicOnlySpecialists = {
  software: [{ pageId: 'R-dbe0adc51c0b8222', label: 'تطوير تطبيقات الجوال' }],
} as const;
export const arabicOnlyArticleOffers: Readonly<Record<string, OfferId>> = {
  'R-ca7dc49dbe42712a': 'marketing',
  'R-5e053fd003b0e1cd': 'websites',
  'R-0228afc3da0b3fbc': 'websites',
  'R-a7d871258750bc2a': 'marketing',
  'R-28383f03a97f634a': 'marketing',
  'R-50eccd34cb224821': 'automation',
  'R-ce0d0de6c0b5a3c9': 'software',
  'R-36fc73d73032160c': 'marketing',
};
