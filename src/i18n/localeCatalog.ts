export const localeCatalog = [
  { code: 'en', nativeName: 'English', englishName: 'English', rtl: false },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', rtl: true },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', rtl: false },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', rtl: false },
  {
    code: 'zh-Hant',
    nativeName: '繁體中文',
    englishName: 'Traditional Chinese',
    rtl: false,
  },
] as const;

export type SupportedLocale = (typeof localeCatalog)[number]['code'];

export function normalizeLocale(input?: string | null): SupportedLocale {
  const locale = input?.toLowerCase().replaceAll('_', '-');

  if (!locale) return 'en';
  if (locale === 'zh-tw' || locale === 'zh-hk' || locale === 'zh-mo') return 'zh-Hant';
  if (locale.startsWith('zh-hant')) return 'zh-Hant';
  if (locale.startsWith('ar')) return 'ar';
  if (locale.startsWith('ja')) return 'ja';
  if (locale.startsWith('ko')) return 'ko';
  if (locale.startsWith('en')) return 'en';
  return 'en';
}

export function getLocaleOption(locale: SupportedLocale) {
  return localeCatalog.find((option) => option.code === locale) ?? localeCatalog[0];
}
