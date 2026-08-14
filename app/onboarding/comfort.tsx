import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { ComfortOption } from '@/features/onboarding/ComfortOption';
import { OnboardingHeader } from '@/features/onboarding/OnboardingHeader';
import type { ComfortLevel } from '@/storage/migrations';
import { useSettingsStore } from '@/state/settingsStore';

const options: { value: ComfortLevel; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Easy, playful questions with low pressure.' },
  { value: 'open', label: 'Open', description: 'More honest, reflective, and personal.' },
  { value: 'spicy', label: 'Spicy 18+', description: 'Suggestive and intimate adult questions.' },
];

export default function ComfortScreen() {
  const theme = useAppTheme();
  const ageConfirmed18 = useSettingsStore((state) => state.ageConfirmed18);
  const comfortLevel = useSettingsStore((state) => state.comfortLevel);
  const persistenceFailed = useSettingsStore((state) => state.persistenceFailed);
  const setAgeConfirmed = useSettingsStore((state) => state.setAgeConfirmed);
  const setComfort = useSettingsStore((state) => state.setComfort);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const toggleAge = () => {
    const next = !ageConfirmed18;
    setAgeConfirmed(next);
    if (!next && comfortLevel === 'spicy') setComfort('light');
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/home');
  };

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <OnboardingHeader current={3} onBack={() => router.back()} />

      <View style={styles.intro}>
        <AppText variant="display">Set your comfort level.</AppText>
        <AppText tone="muted">
          Start wherever feels right. Passing a card is always allowed.
        </AppText>
      </View>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {options.map((option) => (
          <ComfortOption
            {...option}
            disabled={option.value === 'spicy' && !ageConfirmed18}
            key={option.value}
            onSelect={setComfort}
            selected={comfortLevel === option.value}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="I am 18 or older"
        accessibilityHint="Required only for Spicy adult questions"
        accessibilityState={{ checked: ageConfirmed18 }}
        onPress={toggleAge}
        style={({ pressed }) => [
          styles.ageRow,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: ageConfirmed18 ? theme.colors.primary : theme.colors.outline,
            borderRadius: theme.radius.button,
            opacity: pressed ? 0.76 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: ageConfirmed18 ? theme.colors.primary : 'transparent',
              borderColor: ageConfirmed18 ? theme.colors.primary : theme.colors.outline,
            },
          ]}
        >
          {ageConfirmed18 ? (
            <AppText variant="button" style={{ color: theme.colors.onPrimary }}>
              ✓
            </AppText>
          ) : null}
        </View>
        <View style={styles.ageCopy}>
          <AppText variant="button">I am 18 or older</AppText>
          <AppText variant="bodySmall" tone="muted">
            We do not ask for or store your birth date.
          </AppText>
        </View>
      </Pressable>

      <View style={styles.footer}>
        {persistenceFailed ? (
          <AppText variant="bodySmall" tone="danger">
            Your choices could not be saved on this device. You can still continue.
          </AppText>
        ) : null}
        <AppButton label="Start exploring" onPress={finish} />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          Change comfort and mature content anytime in Settings.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 24, gap: 12, maxWidth: 580 },
  options: { gap: 12, marginTop: 28 },
  ageRow: {
    minHeight: 88,
    marginTop: 20,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageCopy: { flex: 1, gap: 3 },
  footer: { gap: 12, marginTop: 28 },
  centered: { textAlign: 'center' },
});
