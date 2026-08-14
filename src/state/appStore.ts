import { create } from 'zustand';

import { loadPersistedSettings, useSettingsStore } from './settingsStore';
import type { BootStatus } from './routeDecision';

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
    set({ bootStatus: 'ready' });
  },
}));
