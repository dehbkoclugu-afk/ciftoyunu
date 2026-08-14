import { StyleSheet, View } from 'react-native';

import { AppText, IconButton } from '@/components/primitives';

import { OnboardingProgress } from './OnboardingProgress';

type OnboardingHeaderProps = {
  current: 1 | 2 | 3;
  onBack?: () => void;
};

export function OnboardingHeader({ current, onBack }: OnboardingHeaderProps) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <IconButton
          icon={
            <AppText accessible={false} variant="h3">
              ‹
            </AppText>
          }
          label="Go back"
          onPress={onBack}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <OnboardingProgress current={current} />
      <AppText variant="caption" tone="muted">
        {current}/3
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  placeholder: { width: 48, height: 48 },
});
