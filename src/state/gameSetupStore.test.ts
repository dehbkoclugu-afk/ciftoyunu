import type { PlayerSetupRepository } from '@/storage/playerSetupRepository';

import { createGameSetupStore } from './gameSetupStore';

function createRepository(overrides: Partial<PlayerSetupRepository> = {}): PlayerSetupRepository {
  return {
    load: async () => ({
      mode: 'couple',
      players: [
        { id: 'player-1', name: '' },
        { id: 'player-2', name: '' },
      ],
      setupCompleted: false,
    }),
    save: async () => undefined,
    ...overrides,
  };
}

describe('game setup store', () => {
  it('reshapes modes and enforces Friends add/remove bounds', () => {
    const store = createGameSetupStore(createRepository());

    store.getState().selectMode('friends');
    for (let index = 0; index < 10; index += 1) store.getState().addPlayer();
    expect(store.getState().players).toHaveLength(8);

    for (const player of [...store.getState().players]) store.getState().removePlayer(player.id);
    expect(store.getState().players).toHaveLength(2);

    store.getState().selectMode('couple');
    expect(store.getState().players).toHaveLength(2);
  });

  it('edits players, resolves fallbacks, and persists completion', async () => {
    const save = jest.fn(async () => undefined);
    const store = createGameSetupStore(createRepository({ save }));
    store.getState().updatePlayer('player-1', { name: ' Maya ', emoji: '🌙' });

    const players = await store.getState().complete(true);

    expect(players).toEqual([
      { id: 'player-1', displayName: 'Maya', emoji: '🌙' },
      { id: 'player-2', displayName: 'Player 2' },
    ]);
    expect(store.getState().setupCompleted).toBe(true);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        players: [
          { id: 'player-1', name: 'Maya', emoji: '🌙' },
          { id: 'player-2', name: 'Player 2' },
        ],
      }),
      true,
    );
  });

  it('keeps completion usable when persistence fails', async () => {
    const store = createGameSetupStore(
      createRepository({ save: async () => Promise.reject(new Error('disk full')) }),
    );

    await store.getState().complete(true);

    expect(store.getState().setupCompleted).toBe(true);
    expect(store.getState().persistenceFailed).toBe(true);
  });

  it('hydrates the remembered draft and can forget it', async () => {
    const save = jest.fn(async () => undefined);
    const store = createGameSetupStore(
      createRepository({
        load: async () => ({
          mode: 'friends',
          players: [
            { id: 'player-1', name: 'Maya' },
            { id: 'player-2', name: 'Noah' },
          ],
          setupCompleted: true,
        }),
        save,
      }),
    );

    await store.getState().hydrate(true);
    expect(store.getState().mode).toBe('friends');
    expect(store.getState().setupCompleted).toBe(true);

    await store.getState().forgetPlayers();
    expect(save).toHaveBeenLastCalledWith(expect.any(Object), false);
  });
});
