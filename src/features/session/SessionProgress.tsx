import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/design';

type SessionProgressProps = {
  current: number;
  total: number;
};

export function SessionProgress({ current, total }: SessionProgressProps) {
  const theme = useAppTheme();
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(safeTotal, Math.max(1, current));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Card ${safeCurrent} of ${safeTotal}`}
      accessibilityValue={{ min: 1, max: safeTotal, now: safeCurrent }}
      style={[styles.track, { backgroundColor: theme.colors.outline }]}
    >
      <View
        style={[
          styles.fill,
          { backgroundColor: theme.colors.primary, width: `${(safeCurrent / safeTotal) * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 5, flex: 1, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
