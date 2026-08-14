import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/design';

type OnboardingProgressProps = {
  current: 1 | 2 | 3;
};

export function OnboardingProgress({ current }: OnboardingProgressProps) {
  const theme = useAppTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={'Onboarding step ' + current + ' of 3'}
      accessibilityValue={{ min: 1, max: 3, now: current }}
      style={styles.row}
    >
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.card,
            {
              backgroundColor:
                step === current
                  ? theme.colors.coral
                  : step < current
                    ? theme.colors.primary
                    : theme.colors.outline,
              borderRadius: theme.radius.input,
              transform: [{ rotate: step === current ? '-2deg' : step === 3 ? '2deg' : '0deg' }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, width: 112, alignItems: 'center' },
  card: { height: 9, flex: 1 },
});
