import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/design';

type IconButtonProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function IconButton({ icon, label, onPress, disabled = false }: IconButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.button,
          opacity: disabled ? 0.48 : pressed ? 0.72 : 1,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
