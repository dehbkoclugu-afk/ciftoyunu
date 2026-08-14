import { Platform, type TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'system-ui',
});

export const typography = {
  display: { fontFamily, fontSize: 36, lineHeight: 42, fontWeight: '700' },
  h1: { fontFamily, fontSize: 30, lineHeight: 36, fontWeight: '700' },
  h2: { fontFamily, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h3: { fontFamily, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  questionLarge: { fontFamily, fontSize: 28, lineHeight: 36, fontWeight: '600' },
  questionMedium: { fontFamily, fontSize: 24, lineHeight: 32, fontWeight: '600' },
  questionSmall: { fontFamily, fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  button: { fontFamily, fontSize: 16, lineHeight: 20, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
