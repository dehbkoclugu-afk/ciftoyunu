import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import type { ComfortLevel } from '@/storage/migrations';

type ComfortOptionProps = {
  value: ComfortLevel;
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (value: ComfortLevel) => void;
};

export function ComfortOption({
  value,
  label,
  description,
  selected,
  disabled = false,
  onSelect,
}: ComfortOptionProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityHint={
        disabled ? 'Confirm that you are 18 or older to choose this level' : description
      }
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onSelect(value)}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? theme.colors.surfaceRaised : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderRadius: theme.radius.card,
          opacity: disabled ? 0.45 : pressed ? 0.76 : 1,
        },
      ]}
    >
      <View style={styles.copy}>
        <AppText variant="h3">{label}</AppText>
        <AppText variant="bodySmall" tone="muted">
          {description}
        </AppText>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? theme.colors.primary : theme.colors.outline,
            backgroundColor: selected ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {selected ? (
          <View style={[styles.dot, { backgroundColor: theme.colors.onPrimary }]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 104,
    padding: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  copy: { flex: 1, gap: 5 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
