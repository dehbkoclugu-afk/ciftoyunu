import { create } from 'zustand';

import {
  appendPlayer,
  createDefaultPlayers,
  reshapePlayersForMode,
  resolvePlayers,
  type GameMode,
  type Player,
  type PlayerDraft,
} from '@/features/player-setup/playerSetup';
import { asyncStorageAdapter } from '@/storage/adapter';
import {
  createPlayerSetupRepository,
  type PlayerSetupRepository,
  type PlayerSetupSnapshot,
} from '@/storage/playerSetupRepository';

type GameSetupActions = {
  hydrate: (rememberPlayers: boolean) => Promise<void>;
  selectMode: (mode: GameMode) => void;
  updatePlayer: (id: string, patch: Pick<PlayerDraft, 'name'> & { emoji?: string }) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  complete: (rememberPlayers: boolean) => Promise<Player[]>;
  forgetPlayers: () => Promise<void>;
};

export type GameSetupStore = PlayerSetupSnapshot &
  GameSetupActions & {
    persistenceFailed: boolean;
  };

const defaultRepository = createPlayerSetupRepository(asyncStorageAdapter);

export function createGameSetupStore(repository: PlayerSetupRepository = defaultRepository) {
  return create<GameSetupStore>((set, get) => ({
    mode: 'couple',
    players: createDefaultPlayers('couple'),
    setupCompleted: false,
    persistenceFailed: false,

    hydrate: async (rememberPlayers) => {
      try {
        const snapshot = await repository.load(rememberPlayers);
        set({ ...snapshot, persistenceFailed: false });
      } catch {
        set({ persistenceFailed: true });
      }
    },

    selectMode: (mode) =>
      set((state) => ({
        mode,
        players: reshapePlayersForMode(mode, state.players),
        setupCompleted: false,
      })),

    updatePlayer: (id, patch) =>
      set((state) => ({
        players: state.players.map((player) =>
          player.id === id ? { ...player, ...patch, name: patch.name.slice(0, 28) } : player,
        ),
        setupCompleted: false,
      })),

    addPlayer: () =>
      set((state) => ({
        players: state.mode === 'friends' ? appendPlayer(state.players) : state.players,
        setupCompleted: false,
      })),

    removePlayer: (id) =>
      set((state) => ({
        players:
          state.mode === 'friends' && state.players.length > 2
            ? state.players.filter((player) => player.id !== id)
            : state.players,
        setupCompleted: false,
      })),

    complete: async (rememberPlayers) => {
      const resolved = resolvePlayers(get().players);
      const players = resolved.map((player) => ({
        id: player.id,
        name: player.displayName,
        ...(player.emoji ? { emoji: player.emoji } : {}),
      }));
      const snapshot = { mode: get().mode, players, setupCompleted: true };
      set({ ...snapshot, persistenceFailed: false });
      try {
        await repository.save(snapshot, rememberPlayers);
      } catch {
        set({ persistenceFailed: true });
      }
      return resolved;
    },

    forgetPlayers: async () => {
      try {
        await repository.save(
          { mode: get().mode, players: get().players, setupCompleted: false },
          false,
        );
        set({ persistenceFailed: false });
      } catch {
        set({ persistenceFailed: true });
      }
    },
  }));
}

export const useGameSetupStore = createGameSetupStore();
