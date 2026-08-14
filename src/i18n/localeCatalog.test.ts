import { normalizeLocale } from './localeCatalog';

describe('normalizeLocale', () => {
  it.each([
    ['en-US', 'en'],
    ['ar-SA', 'ar'],
    ['ja-JP', 'ja'],
    ['ko-KR', 'ko'],
    ['zh-TW', 'zh-Hant'],
    ['zh-Hant-HK', 'zh-Hant'],
  ] as const)('maps %s to %s', (input, expected) => {
    expect(normalizeLocale(input)).toBe(expected);
  });

  it('falls back to English for unsupported or missing locales', () => {
    expect(normalizeLocale('fr-FR')).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
  });
});
