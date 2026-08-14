import { create } from 'zustand';

import { loadPersistedSettings, useSettingsStore } from './settingsStore';
import { useGameSetupStore } from './gameSetupStore';
import type { BootStatus } from './routeDecision';
import { useSessionStore } from './sessionStore';

type AppStore = {
  bootStatus: BootStatus;
  hydrate: () => Promise<void>;
};

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
    ]);
    set({ bootStatus: 'ready' });
  },
}));
