import { create } from 'zustand';

import { configureAnalytics, track } from '@/services/analytics/runtime';
import { configureCrashReporting } from '@/services/crash/runtime';
import { asyncStorageAdapter } from '@/storage/adapter';
import { createAnonymousIdRepository } from '@/storage/anonymousIdRepository';

import { loadPersistedSettings, useSettingsStore } from './settingsStore';
import { useGameSetupStore } from './gameSetupStore';
import type { BootStatus } from './routeDecision';
import { usePurchaseStore } from './purchaseStore';
import { useSessionStore } from './sessionStore';

type AppStore = {
  bootStatus: BootStatus;
  hydrate: () => Promise<void>;
};

const anonymousIdRepository = createAnonymousIdRepository(asyncStorageAdapter);
let observabilitySubscriptionInstalled = false;

async function hydrateObservability(): Promise<void> {
  const anonymousId = await anonymousIdRepository.getOrCreate();
  const settings = useSettingsStore.getState();
  await Promise.all([
    configureAnalytics(anonymousId, settings.analyticsEnabled),
    configureCrashReporting(settings.crashReportingEnabled),
  ]);
  track('app_opened');

  if (!observabilitySubscriptionInstalled) {
    observabilitySubscriptionInstalled = true;
    useSettingsStore.subscribe((next, previous) => {
      if (next.analyticsEnabled !== previous.analyticsEnabled) {
        void configureAnalytics(anonymousId, next.analyticsEnabled).then(() =>
          track('privacy_preference_changed', {
            preference: 'analytics',
            enabled: next.analyticsEnabled,
          }),
        );
      }
      if (next.crashReportingEnabled !== previous.crashReportingEnabled) {
        void configureCrashReporting(next.crashReportingEnabled);
        track('privacy_preference_changed', {
          preference: 'crash_reporting',
          enabled: next.crashReportingEnabled,
        });
      }
    });
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  bootStatus: 'idle',
  hydrate: async () => {
    if (get().bootStatus !== 'idle') return;
    set({ bootStatus: 'loading' });

    const settings = await loadPersistedSettings();
    useSettingsStore.getState().replaceSettings(settings);
    await Promise.all([
      useGameSetupStore.getState().hydrate(settings.rememberPlayers),
      useSessionStore.getState().hydrate(),
      usePurchaseStore.getState().hydrate(),
      hydrateObservability().catch(() => undefined),
    ]);
    set({ bootStatus: 'ready' });
  },
}));
