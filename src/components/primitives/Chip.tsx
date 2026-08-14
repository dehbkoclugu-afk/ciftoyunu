import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/design';

import { AppText } from './AppText';

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected = false, disabled = false, onPress }: ChipProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderRadius: theme.radius.pill,
          opacity: disabled ? 0.48 : pressed ? 0.76 : 1,
        },
      ]}
    >
      <AppText
        variant="bodySmall"
        style={{ color: selected ? theme.colors.onPrimary : theme.colors.ink, fontWeight: '600' }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
