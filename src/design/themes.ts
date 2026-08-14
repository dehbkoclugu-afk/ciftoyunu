import type { ColorSchemeName } from 'react-native';

import { palette } from './colors';
import { motion } from './motion';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: (typeof palette)[keyof typeof palette];
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  typography: typeof typography;
};

export const themes: Record<'light' | 'dark', AppTheme> = {
  light: { mode: 'light', colors: palette.light, spacing, radius, motion, typography },
  dark: { mode: 'dark', colors: palette.dark, spacing, radius, motion, typography },
};

export function resolveTheme(scheme: ColorSchemeName | null): AppTheme {
  return scheme === 'dark' ? themes.dark : themes.light;
}
