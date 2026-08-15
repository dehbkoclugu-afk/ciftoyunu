import { create } from 'zustand';

import type { SupportedLocale } from '@/i18n';
import { asyncStorageAdapter } from '@/storage/adapter';
import { DEFAULT_SETTINGS, migrateSettings, type SettingsData } from '@/storage/migrations';
import { createSettingsRepository } from '@/storage/settingsRepository';

const repository = createSettingsRepository(asyncStorageAdapter);

type SettingsActions = {
  persistenceFailed: boolean;
  replaceSettings: (settings: SettingsData) => void;
  setLocale: (locale: SupportedLocale) => void;
  setAgeConfirmed: (confirmed: boolean) => void;
  setComfort: (comfortLevel: SettingsData['comfortLevel']) => void;
  setRememberPlayers: (rememberPlayers: boolean) => void;
  completeOnboarding: () => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  setCrashReportingEnabled: (enabled: boolean) => void;
  setDailyReminder: (time?: string) => void;
};

export type SettingsStore = SettingsData & SettingsActions;

function settingsOnly(state: SettingsStore): SettingsData {
  return {
    locale: state.locale,
    theme: state.theme,
    hapticsEnabled: state.hapticsEnabled,
    soundEnabled: state.soundEnabled,
    comfortLevel: state.comfortLevel,
    matureContentEnabled: state.matureContentEnabled,
    ageConfirmed18: state.ageConfirmed18,
    excludedTopics: state.excludedTopics,
    notificationsEnabled: state.notificationsEnabled,
    dailyReminderTime: state.dailyReminderTime,
    rememberPlayers: state.rememberPlayers,
    onboardingCompleted: state.onboardingCompleted,
    analyticsEnabled: state.analyticsEnabled,
    crashReportingEnabled: state.crashReportingEnabled,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
  const persist = (patch: Partial<SettingsData>) => {
    const next = migrateSettings({ ...settingsOnly(get()), ...patch });
    set({ ...next, persistenceFailed: false });
    void repository.save(next).catch(() => set({ persistenceFailed: true }));
  };

  return {
    ...DEFAULT_SETTINGS,
    persistenceFailed: false,
    replaceSettings: (settings) => set({ ...migrateSettings(settings), persistenceFailed: false }),
    setLocale: (locale) => persist({ locale }),
    setAgeConfirmed: (ageConfirmed18) =>
      persist({
        ageConfirmed18,
        matureContentEnabled: ageConfirmed18 && get().comfortLevel === 'spicy',
      }),
    setComfort: (comfortLevel) =>
      persist({
        comfortLevel,
        matureContentEnabled: comfortLevel === 'spicy' && get().ageConfirmed18,
      }),
    setRememberPlayers: (rememberPlayers) => persist({ rememberPlayers }),
    completeOnboarding: () => persist({ onboardingCompleted: true }),
    setAnalyticsEnabled: (analyticsEnabled) => persist({ analyticsEnabled }),
    setCrashReportingEnabled: (crashReportingEnabled) => persist({ crashReportingEnabled }),
    setDailyReminder: (dailyReminderTime) =>
      persist({ notificationsEnabled: Boolean(dailyReminderTime), dailyReminderTime }),
  };
});

export async function loadPersistedSettings(): Promise<SettingsData> {
  return repository.load();
}
