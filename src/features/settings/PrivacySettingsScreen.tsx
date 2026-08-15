/**
 * THESIS: Privacy is a calm, legible promise rather than a legal maze.
 * OWN-WORLD: Warm canvas, plum consent controls, and a coral privacy ledger.
 * STORY: See what is off, choose optional diagnostics, then verify what never leaves the phone.
 * FIRST VIEWPORT: Back action, plain-language promise, and both consent switches.
 * FORM: Operate-mode settings list with one supporting privacy ledger.
 */
import { router } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { palette, useAppTheme } from '@/design';
import { useSettingsStore } from '@/state/settingsStore';

type ConsentRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ConsentRow({ title, description, value, onValueChange }: ConsentRowProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.row, { borderColor: theme.colors.outline }]}>
      <View style={styles.rowCopy}>
        <AppText variant="button">{title}</AppText>
        <AppText variant="bodySmall" tone="muted">
          {description}
        </AppText>
      </View>
      <Switch
        accessibilityLabel={title}
        accessibilityHint={description}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}

export function PrivacySettingsScreen() {
  const theme = useAppTheme();
  const analyticsEnabled = useSettingsStore((state) => state.analyticsEnabled);
  const crashReportingEnabled = useSettingsStore((state) => state.crashReportingEnabled);
  const setAnalyticsEnabled = useSettingsStore((state) => state.setAnalyticsEnabled);
  const setCrashReportingEnabled = useSettingsStore((state) => state.setCrashReportingEnabled);

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
      <View style={styles.intro}>
        <AppText variant="display">Your conversation stays yours.</AppText>
        <AppText tone="muted">
          Optional, anonymous signals can help improve the game. Both choices start off.
        </AppText>
      </View>

      <View
        style={[
          styles.controls,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderRadius: theme.radius.card,
          },
        ]}
      >
        <ConsentRow
          title="Anonymous analytics"
          description="Share screen and action counts without names, answers, or question copy."
          value={analyticsEnabled}
          onValueChange={setAnalyticsEnabled}
        />
        <ConsentRow
          title="Crash reports"
          description="Share technical failure details without conversation content or screenshots."
          value={crashReportingEnabled}
          onValueChange={setCrashReportingEnabled}
        />
      </View>

      <View
        style={[
          styles.ledger,
          { backgroundColor: theme.colors.coral, borderRadius: theme.radius.card },
        ]}
      >
        <AppText variant="h2" style={{ color: palette.light.ink }}>
          Never collected
        </AppText>
        <AppText style={{ color: palette.light.ink }}>
          Player names · answers · question wording · recordings · contacts · precise location
        </AppText>
      </View>

      <AppText variant="caption" tone="muted" style={styles.note}>
        Your anonymous device ID remains on this device when sharing is off. You can change either
        choice here at any time.
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: 24 },
  intro: { maxWidth: 580, gap: 12, marginBottom: 32 },
  controls: { borderWidth: 1, paddingHorizontal: 20 },
  row: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
  },
  rowCopy: { flex: 1, gap: 4 },
  ledger: { marginTop: 24, padding: 24, gap: 10 },
  note: { marginTop: 20, maxWidth: 580 },
});
