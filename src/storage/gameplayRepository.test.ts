import { loadEmbeddedContent } from '@/content/loader';
import type { ActiveSession, QuestionSessionCard } from '@/features/session/gameplay';
import { resolvePlayers } from '@/features/player-setup/playerSetup';

import type { StorageAdapter } from './adapter';
import { FAVORITES_KEY, LAST_SESSION_KEY } from './keys';
import { createGameplayRepository } from './gameplayRepository';

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

const now = Date.UTC(2026, 7, 14);
const question = loadEmbeddedContent('en')!.questions[0]!;
const card: QuestionSessionCard = {
  kind: 'question',
  instanceId: `session:0:${question.id}`,
  index: 0,
  question,
  starterPlayerIds: ['player-1'],
};

function createSession(patch: Partial<ActiveSession> = {}): ActiveSession {
  return {
    id: 'session-1',
    locale: 'en',
    contentVersion: '2026.08.1',
    mode: 'couple',
    packIds: ['warm_start'],
    packTitle: 'Warm Start',
    players: resolvePlayers([
      { id: 'player-1', name: 'Maya' },
      { id: 'player-2', name: 'Noah' },
    ]),
    durationMinutes: 10,
    intensityPreset: 'mixed',
    allowMature: false,
    excludedTopics: [],
    seed: 'seed',
    cards: [card],
    currentIndex: 0,
    currentViewedAt: now - 1_000,
    favoriteIdsAtStart: [],
    skippedIds: [],
    reportedIds: [],
    outcomes: [],
    startedAt: now - 5_000,
    lastActiveAt: now,
    ...patch,
  };
}

describe('gameplay repository', () => {
  it('loads safe empty values', async () => {
    const repository = createGameplayRepository(createMemoryStorage(), () => now);
    await expect(repository.loadActive()).resolves.toBeNull();
    await expect(repository.loadFavorites()).resolves.toEqual([]);
  });

  it('round-trips active session snapshots and favorites', async () => {
    const storage = createMemoryStorage();
    const repository = createGameplayRepository(storage, () => now);
    const session = createSession();

    await repository.saveActive(session);
    await repository.saveFavorites([question.id, question.id, 'qi_other_question_0001']);

    await expect(repository.loadActive()).resolves.toEqual(session);
    await expect(repository.loadFavorites()).resolves.toEqual([
      question.id,
      'qi_other_question_0001',
    ]);
    expect(JSON.parse(storage.values.get(LAST_SESSION_KEY)!)).toMatchObject({ version: 1 });
    expect(JSON.parse(storage.values.get(FAVORITES_KEY)!)).toMatchObject({ version: 1 });
  });

  it('keeps the exact 24-hour boundary and removes older unfinished sessions', async () => {
    const storage = createMemoryStorage();
    const repository = createGameplayRepository(storage, () => now);

    await repository.saveActive(createSession({ lastActiveAt: now - 24 * 60 * 60 * 1_000 }));
    await expect(repository.loadActive()).resolves.not.toBeNull();

    await repository.saveActive(createSession({ lastActiveAt: now - 24 * 60 * 60 * 1_000 - 1 }));
    await expect(repository.loadActive()).resolves.toBeNull();
    expect(storage.values.has(LAST_SESSION_KEY)).toBe(false);
  });

  it('quarantines active and favorite corruption independently', async () => {
    const storage = createMemoryStorage({
      [LAST_SESSION_KEY]: '{broken',
      [FAVORITES_KEY]: JSON.stringify({ version: 1, questionIds: [question.id] }),
    });
    const repository = createGameplayRepository(storage, () => 55);

    await expect(repository.loadActive()).resolves.toBeNull();
    await expect(repository.loadFavorites()).resolves.toEqual([question.id]);
    expect(storage.values.get('duo:quarantine:55:last-session')).toBe('{broken');

    storage.values.set(FAVORITES_KEY, '{also-broken');
    await expect(repository.loadFavorites()).resolves.toEqual([]);
    expect(storage.values.get('duo:quarantine:55:favorites')).toBe('{also-broken');
  });

  it('clears only the active session', async () => {
    const storage = createMemoryStorage();
    const repository = createGameplayRepository(storage, () => now);
    await repository.saveActive(createSession());
    await repository.saveFavorites([question.id]);

    await repository.clearActive();

    expect(storage.values.has(LAST_SESSION_KEY)).toBe(false);
    expect(storage.values.has(FAVORITES_KEY)).toBe(true);
  });

  it('does not let a failing provider block loads', async () => {
    const repository = createGameplayRepository({
      getItem: async () => Promise.reject(new Error('disk')),
      setItem: async () => Promise.reject(new Error('disk')),
      removeItem: async () => Promise.reject(new Error('disk')),
    });

    await expect(repository.loadActive()).resolves.toBeNull();
    await expect(repository.loadFavorites()).resolves.toEqual([]);
  });
});
