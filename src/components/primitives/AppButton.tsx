import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/design';

import { AppText } from './AppText';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  testID?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
  testID,
}: AppButtonProps) {
  const theme = useAppTheme();
  const unavailable = disabled || loading;
  const fills = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceRaised,
    ghost: 'transparent',
    destructive: theme.colors.danger,
  };
  const textColors = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.ink,
    ghost: theme.colors.primary,
    destructive: theme.mode === 'dark' ? '#1C1720' : '#FFFFFF',
  };
  const borderColor = variant === 'secondary' ? theme.colors.outline : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: fills[variant],
          borderColor,
          borderRadius: theme.radius.button,
          opacity: unavailable ? 0.48 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        } satisfies ViewStyle,
      ]}
    >
      {loading ? <ActivityIndicator color={textColors[variant]} /> : null}
      <AppText variant="button" style={{ color: textColors[variant] }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    minWidth: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
  },
});
