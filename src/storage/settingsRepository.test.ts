import { DEFAULT_SETTINGS } from './migrations';
import { createSettingsRepository } from './settingsRepository';
import type { StorageAdapter } from './adapter';
import { SETTINGS_KEY } from './keys';

function createMemoryStorage(initial: Record<string, string> = {}): StorageAdapter & {
  values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));

  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
}

describe('settings repository', () => {
  it('migrates legacy settings and enforces the mature-content gate', async () => {
    const storage = createMemoryStorage({
      [SETTINGS_KEY]: JSON.stringify({
        locale: 'ar-SA',
        ageConfirmed18: false,
        comfortLevel: 'spicy',
        matureContentEnabled: true,
      }),
    });

    const settings = await createSettingsRepository(storage).load();

    expect(settings.locale).toBe('ar');
    expect(settings.comfortLevel).toBe('spicy');
    expect(settings.matureContentEnabled).toBe(false);
    expect(settings.analyticsEnabled).toBe(false);
    expect(settings.crashReportingEnabled).toBe(false);
  });

  it('quarantines corrupt settings and returns safe defaults', async () => {
    const storage = createMemoryStorage({ [SETTINGS_KEY]: '{broken' });
    const repository = createSettingsRepository(storage, () => 1234);

    await expect(repository.load()).resolves.toEqual(DEFAULT_SETTINGS);
    expect(storage.values.get('duo:quarantine:1234:settings')).toBe('{broken');
    expect(storage.values.has(SETTINGS_KEY)).toBe(false);
  });

  it('saves a versioned envelope that can be rehydrated', async () => {
    const storage = createMemoryStorage();
    const repository = createSettingsRepository(storage);
    const next = { ...DEFAULT_SETTINGS, locale: 'ja' as const, onboardingCompleted: true };

    await repository.save(next);

    await expect(repository.load()).resolves.toEqual(next);
  });
});
