import { createDefaultPlayers } from '@/features/player-setup/playerSetup';

import type { StorageAdapter } from './adapter';
import { PLAYER_SETUP_KEY } from './keys';
import { createPlayerSetupRepository } from './playerSetupRepository';

function createMemoryStorage(initial: Record<string, string> = {}): StorageAdapter & {
  values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => void values.set(key, value),
    removeItem: async (key) => void values.delete(key),
  };
}

describe('player setup repository', () => {
  it('round-trips the last mode and remembered players', async () => {
    const storage = createMemoryStorage();
    const repository = createPlayerSetupRepository(storage);
    const players = [
      { id: 'player-1', name: 'Maya', emoji: '🌙' },
      { id: 'player-2', name: 'Noah' },
    ];

    await repository.save({ mode: 'friends', players, setupCompleted: true }, true);

    await expect(repository.load(true)).resolves.toEqual({
      mode: 'friends',
      players,
      setupCompleted: true,
    });
  });

  it('stores the mode but omits private roster data when remembering is disabled', async () => {
    const storage = createMemoryStorage();
    const repository = createPlayerSetupRepository(storage);

    await repository.save(
      {
        mode: 'friends',
        players: [{ id: 'player-1', name: 'Private name' }],
        setupCompleted: true,
      },
      false,
    );

    expect(storage.values.get(PLAYER_SETUP_KEY)).not.toContain('Private name');
    await expect(repository.load(false)).resolves.toEqual({
      mode: 'friends',
      players: createDefaultPlayers('friends'),
      setupCompleted: false,
    });
  });

  it('quarantines corrupt data and restores safe defaults', async () => {
    const storage = createMemoryStorage({ [PLAYER_SETUP_KEY]: '{broken' });
    const repository = createPlayerSetupRepository(storage, () => 55);

    await expect(repository.load(true)).resolves.toEqual({
      mode: 'couple',
      players: createDefaultPlayers('couple'),
      setupCompleted: false,
    });
    expect(storage.values.get('duo:quarantine:55:player-setup')).toBe('{broken');
    expect(storage.values.has(PLAYER_SETUP_KEY)).toBe(false);
  });
});
