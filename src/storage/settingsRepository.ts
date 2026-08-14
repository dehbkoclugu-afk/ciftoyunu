import type { StorageAdapter } from './adapter';
import { getSettingsQuarantineKey, SETTINGS_KEY } from './keys';
import {
  createSettingsEnvelope,
  DEFAULT_SETTINGS,
  migrateSettings,
  type SettingsData,
} from './migrations';

export type SettingsRepository = {
  load: () => Promise<SettingsData>;
  save: (settings: SettingsData) => Promise<void>;
};

export function createSettingsRepository(
  storage: StorageAdapter,
  now: () => number = Date.now,
): SettingsRepository {
  return {
    async load() {
      let raw: string | null = null;

      try {
        raw = await storage.getItem(SETTINGS_KEY);
        return raw === null ? DEFAULT_SETTINGS : migrateSettings(JSON.parse(raw));
      } catch {
        if (raw !== null) {
          try {
            await storage.setItem(getSettingsQuarantineKey(now()), raw);
          } catch {
            // Quarantine is best effort; launch must still continue.
          }
        }

        try {
          await storage.removeItem(SETTINGS_KEY);
        } catch {
          // A broken storage provider must not block launch.
        }

        return DEFAULT_SETTINGS;
      }
    },

    async save(settings) {
      await storage.setItem(SETTINGS_KEY, JSON.stringify(createSettingsEnvelope(settings)));
    },
  };
}
