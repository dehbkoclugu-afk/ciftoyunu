import { loadEmbeddedContent } from '@/content/loader';
import { resolvePlayers } from '@/features/player-setup/playerSetup';
import type { GameplayRepository } from '@/storage/gameplayRepository';
import type { SeenHistoryRepository } from '@/storage/seenHistoryRepository';

import { createSessionStore, type SessionStartRequest } from './sessionStore';

function repository(overrides: Partial<GameplayRepository> = {}): GameplayRepository {
  return {
    loadActive: jest.fn(async () => null),
    saveActive: jest.fn(async () => undefined),
    clearActive: jest.fn(async () => undefined),
    loadFavorites: jest.fn(async () => []),
    saveFavorites: jest.fn(async () => undefined),
    ...overrides,
  };
}

function seenRepository(overrides: Partial<SeenHistoryRepository> = {}): SeenHistoryRepository {
  return {
    load: jest.fn(async () => []),
    save: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
    ...overrides,
  };
}

const players = resolvePlayers([
  { id: 'player-1', name: 'Maya' },
  { id: 'player-2', name: 'Noah' },
]);

function request(): SessionStartRequest {
  return {
    bundle: loadEmbeddedContent('en')!,
    mode: 'couple',
    packIds: ['warm_start'],
    entitledPackIds: [],
    players,
    durationMinutes: 10,
    intensityPreset: 'mixed',
    ageConfirmed18: false,
    matureContentEnabled: false,
    excludedTopics: [],
    seed: 'store-seed',
    packTitle: 'Warm Start',
  };
}

describe('session store', () => {
  it('hydrates active state and favorites', async () => {
    const saved = repository({ loadFavorites: jest.fn(async () => ['qi_saved_0001']) });
    const store = createSessionStore(saved, seenRepository(), () => 1_000);

    await store.getState().hydrate();

    expect(store.getState()).toMatchObject({ favoriteIds: ['qi_saved_0001'], hydrated: true });
  });

  it('builds, persists, and marks the first displayed question as seen', async () => {
    const gameplay = repository();
    const seen = seenRepository();
    const store = createSessionStore(gameplay, seen, () => 10_000);

    const session = await store.getState().start(request());

    expect(session).not.toBeNull();
    expect(session!.cards).toHaveLength(11);
    expect(session!.cards[0]!.kind).toBe('question');
    expect(gameplay.saveActive).toHaveBeenCalledWith(session);
    expect(seen.save).toHaveBeenCalledWith([
      expect.objectContaining({ questionId: expect.stringMatching(/^qi_/), seenAt: 10_000 }),
    ]);
  });

  it('records skip/report outcomes and dwell classes while advancing', async () => {
    let clock = 1_000;
    const store = createSessionStore(repository(), seenRepository(), () => clock);
    await store.getState().start(request());
    const first = store.getState().activeSession!.cards[0]!;

    clock = 1_999;
    await store.getState().advance('skip');
    expect(store.getState().activeSession).toMatchObject({
      currentIndex: 1,
      skippedIds: [first.kind === 'question' ? first.question.id : first.instanceId],
      outcomes: [expect.objectContaining({ action: 'skip', engagement: 'rapid_skip' })],
    });

    clock = 9_000;
    const second = store.getState().activeSession!.cards[1]!;
    await store.getState().advance('reported');
    expect(store.getState().activeSession).toMatchObject({
      currentIndex: 2,
      reportedIds: [second.kind === 'question' ? second.question.id : second.instanceId],
      outcomes: expect.arrayContaining([
        expect.objectContaining({ action: 'reported', engagement: 'engaged_card' }),
      ]),
    });
  });

  it('toggles favorites without advancing and clear retains them', async () => {
    const gameplay = repository();
    const store = createSessionStore(gameplay, seenRepository(), () => 1_000);
    await store.getState().start(request());
    const active = store.getState().activeSession!;
    const questionId = active.cards[0]!.kind === 'question' ? active.cards[0]!.question.id : '';

    await store.getState().toggleFavorite(questionId);
    expect(store.getState().activeSession!.currentIndex).toBe(0);
    expect(store.getState().favoriteIds).toEqual([questionId]);

    await store.getState().clear();
    expect(store.getState().activeSession).toBeNull();
    expect(store.getState().favoriteIds).toEqual([questionId]);
    expect(gameplay.clearActive).toHaveBeenCalled();
  });

  it('completes automatically at the final card and accepts only viewed keepers', async () => {
    let clock = 1_000;
    const store = createSessionStore(repository(), seenRepository(), () => clock);
    await store.getState().start(request());
    const session = store.getState().activeSession!;
    const unviewed = session.cards.findLast((card) => card.kind === 'question')!;

    await store
      .getState()
      .chooseKeeper(unviewed.kind === 'question' ? unviewed.question.id : 'missing');
    expect(store.getState().activeSession!.keeperQuestionId).toBeUndefined();

    while (!store.getState().activeSession!.completedAt) {
      clock += 2_000;
      await store.getState().advance('next');
    }
    const completed = store.getState().activeSession!;
    const viewed = completed.cards.find((card) => card.kind === 'question')!;
    await store
      .getState()
      .chooseKeeper(viewed.kind === 'question' ? viewed.question.id : 'missing');
    expect(store.getState().activeSession!.keeperQuestionId).toBe(
      viewed.kind === 'question' ? viewed.question.id : undefined,
    );
  });

  it('keeps play usable when persistence rejects', async () => {
    const gameplay = repository({
      saveActive: jest.fn(async () => Promise.reject(new Error('disk'))),
    });
    const seen = seenRepository({ save: jest.fn(async () => Promise.reject(new Error('disk'))) });
    const store = createSessionStore(gameplay, seen, () => 1_000);

    await expect(store.getState().start(request())).resolves.not.toBeNull();
    expect(store.getState().persistenceFailed).toBe(true);
  });
});
