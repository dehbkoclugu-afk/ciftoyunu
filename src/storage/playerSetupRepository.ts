import {
  createDefaultPlayers,
  reshapePlayersForMode,
  type GameMode,
  type PlayerDraft,
} from '@/features/player-setup/playerSetup';

import type { StorageAdapter } from './adapter';
import { getPlayerSetupQuarantineKey, PLAYER_SETUP_KEY, PLAYER_SETUP_VERSION } from './keys';

export type PlayerSetupSnapshot = {
  mode: GameMode;
  players: PlayerDraft[];
  setupCompleted: boolean;
};

export type PlayerSetupRepository = {
  load: (rememberPlayers: boolean) => Promise<PlayerSetupSnapshot>;
  save: (snapshot: PlayerSetupSnapshot, rememberPlayers: boolean) => Promise<void>;
};

function defaults(mode: GameMode = 'couple'): PlayerSetupSnapshot {
  return { mode, players: createDefaultPlayers(mode), setupCompleted: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseSnapshot(raw: string, rememberPlayers: boolean): PlayerSetupSnapshot {
  const envelope: unknown = JSON.parse(raw);
  if (
    !isRecord(envelope) ||
    envelope.version !== PLAYER_SETUP_VERSION ||
    !isRecord(envelope.data)
  ) {
    throw new Error('Invalid player setup envelope');
  }

  const mode = envelope.data.mode === 'friends' ? 'friends' : 'couple';
  if (!Array.isArray(envelope.data.players)) throw new Error('Invalid player roster');
  const players = envelope.data.players.map((value): PlayerDraft => {
    if (
      !isRecord(value) ||
      typeof value.id !== 'string' ||
      !/^player-[0-9]+$/.test(value.id) ||
      typeof value.name !== 'string' ||
      (value.emoji !== undefined && typeof value.emoji !== 'string')
    ) {
      throw new Error('Invalid player');
    }
    return {
      id: value.id,
      name: value.name.slice(0, 28),
      ...(value.emoji ? { emoji: value.emoji.slice(0, 8) } : {}),
    };
  });

  if (!rememberPlayers || players.length === 0) return defaults(mode);
  return {
    mode,
    players: reshapePlayersForMode(mode, players),
    setupCompleted: envelope.data.setupCompleted === true,
  };
}

export function createPlayerSetupRepository(
  storage: StorageAdapter,
  now: () => number = Date.now,
): PlayerSetupRepository {
  return {
    async load(rememberPlayers) {
      let raw: string | null = null;
      try {
        raw = await storage.getItem(PLAYER_SETUP_KEY);
        return raw === null ? defaults() : parseSnapshot(raw, rememberPlayers);
      } catch {
        if (raw !== null) {
          try {
            await storage.setItem(getPlayerSetupQuarantineKey(now()), raw);
          } catch {
            // Quarantine is best effort; launch must still continue.
          }
        }
        try {
          await storage.removeItem(PLAYER_SETUP_KEY);
        } catch {
          // A broken storage provider must not block launch.
        }
        return defaults();
      }
    },

    async save(snapshot, rememberPlayers) {
      await storage.setItem(
        PLAYER_SETUP_KEY,
        JSON.stringify({
          version: PLAYER_SETUP_VERSION,
          data: {
            mode: snapshot.mode,
            players: rememberPlayers ? snapshot.players : [],
            setupCompleted: rememberPlayers && snapshot.setupCompleted,
          },
        }),
      );
    },
  };
}
