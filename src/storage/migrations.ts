import { normalizeLocale, type SupportedLocale } from '@/i18n';

import { SETTINGS_VERSION } from './keys';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ComfortLevel = 'light' | 'open' | 'spicy';

export type SettingsData = {
  locale: SupportedLocale;
  theme: ThemePreference;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  comfortLevel: ComfortLevel;
  matureContentEnabled: boolean;
  ageConfirmed18: boolean;
  excludedTopics: string[];
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  rememberPlayers: boolean;
  onboardingCompleted: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
};

export type SettingsEnvelope = {
  version: typeof SETTINGS_VERSION;
  data: SettingsData;
};

export const DEFAULT_SETTINGS: SettingsData = {
  locale: 'en',
  theme: 'system',
  hapticsEnabled: true,
  soundEnabled: true,
  comfortLevel: 'light',
  matureContentEnabled: false,
  ageConfirmed18: false,
  excludedTopics: [],
  notificationsEnabled: false,
  rememberPlayers: false,
  onboardingCompleted: false,
  analyticsEnabled: false,
  crashReportingEnabled: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function asComfort(value: unknown): ComfortLevel {
  return value === 'open' || value === 'spicy' || value === 'light' ? value : 'light';
}

export function migrateSettings(value: unknown): SettingsData {
  const envelope = isRecord(value) && isRecord(value.data) ? value.data : value;
  const source = isRecord(envelope) ? envelope : {};
  const ageConfirmed18 = asBoolean(source.ageConfirmed18, false);
  const comfortLevel = asComfort(source.comfortLevel);
  const matureRequested = asBoolean(source.matureContentEnabled, false);
  const excludedTopics = Array.isArray(source.excludedTopics)
    ? source.excludedTopics.filter((item): item is string => typeof item === 'string')
    : [];
  const dailyReminderTime =
    typeof source.dailyReminderTime === 'string' ? source.dailyReminderTime : undefined;

  return {
    locale: normalizeLocale(typeof source.locale === 'string' ? source.locale : undefined),
    theme: asTheme(source.theme),
    hapticsEnabled: asBoolean(source.hapticsEnabled, true),
    soundEnabled: asBoolean(source.soundEnabled, true),
    comfortLevel,
    matureContentEnabled: ageConfirmed18 && comfortLevel === 'spicy' && matureRequested,
    ageConfirmed18,
    excludedTopics,
    notificationsEnabled: asBoolean(source.notificationsEnabled, false),
    ...(dailyReminderTime ? { dailyReminderTime } : {}),
    rememberPlayers: asBoolean(source.rememberPlayers, false),
    onboardingCompleted: asBoolean(source.onboardingCompleted, false),
    analyticsEnabled: asBoolean(source.analyticsEnabled, false),
    crashReportingEnabled: asBoolean(source.crashReportingEnabled, false),
  };
}

export function createSettingsEnvelope(settings: SettingsData): SettingsEnvelope {
  return { version: SETTINGS_VERSION, data: migrateSettings(settings) };
}
