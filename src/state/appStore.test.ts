import AsyncStorage from '@react-native-async-storage/async-storage';

import { configureAnalytics, track } from '@/services/analytics/runtime';
import { configureCrashReporting } from '@/services/crash/runtime';
import { DEFAULT_SETTINGS } from '@/storage/migrations';

import { useAppStore } from './appStore';
import { useGameSetupStore } from './gameSetupStore';
import { usePurchaseStore } from './purchaseStore';
import { useSessionStore } from './sessionStore';
import { useSettingsStore } from './settingsStore';

jest.mock('expo-crypto', () => ({ randomUUID: () => '11111111-1111-4111-8111-111111111111' }));
jest.mock('@/services/analytics/runtime', () => ({
  configureAnalytics: jest.fn(async () => undefined),
  track: jest.fn(),
}));
jest.mock('@/services/crash/runtime', () => ({
  configureCrashReporting: jest.fn(async () => undefined),
}));

describe('app observability boot', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, persistenceFailed: false });
    useAppStore.setState({ bootStatus: 'idle' });
    useGameSetupStore.setState({ hydrate: jest.fn(async () => undefined) });
    useSessionStore.setState({ hydrate: jest.fn(async () => undefined) });
    usePurchaseStore.setState({ hydrate: jest.fn(async () => undefined) });
  });

  it('configures default-off providers only after settings are available', async () => {
    await useAppStore.getState().hydrate();

    expect(configureAnalytics).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', false);
    expect(configureCrashReporting).toHaveBeenCalledWith(false);
    expect(track).toHaveBeenCalledWith('app_opened');
    expect(useAppStore.getState().bootStatus).toBe('ready');
  });

  it('reaches ready when observability configuration fails', async () => {
    jest.mocked(configureAnalytics).mockRejectedValueOnce(new Error('provider failed'));
    await useAppStore.getState().hydrate();
    expect(useAppStore.getState().bootStatus).toBe('ready');
  });
});
