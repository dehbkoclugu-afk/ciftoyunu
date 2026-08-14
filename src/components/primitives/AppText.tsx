import { Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme, type TypographyVariant } from '@/design';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: 'default' | 'muted' | 'primary' | 'danger';
};

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  const theme = useAppTheme();
  const color: Record<NonNullable<AppTextProps['tone']>, string> = {
    default: theme.colors.ink,
    muted: theme.colors.inkMuted,
    primary: theme.colors.primary,
    danger: theme.colors.danger,
  };

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={2}
      style={[theme.typography[variant] as TextStyle, { color: color[tone] }, style]}
      {...props}
    />
  );
}
