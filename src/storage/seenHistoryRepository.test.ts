import type { SeenQuestion } from '@/features/session/sessionEngine';

import type { StorageAdapter } from './adapter';
import { SEEN_HISTORY_KEY } from './keys';
import { createSeenHistoryRepository, mergeSeenQuestion } from './seenHistoryRepository';

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
const recent: SeenQuestion = { questionId: 'q-1', intentKey: 'intent.one', seenAt: now - 1_000 };

describe('seen history repository', () => {
  it('loads an empty history when nothing has been persisted', async () => {
    await expect(createSeenHistoryRepository(createMemoryStorage()).load()).resolves.toEqual([]);
  });

  it('round-trips a versioned history envelope', async () => {
    const storage = createMemoryStorage();
    const repository = createSeenHistoryRepository(storage, () => now);

    await repository.save([recent]);

    await expect(repository.load()).resolves.toEqual([recent]);
    expect(JSON.parse(storage.values.get(SEEN_HISTORY_KEY)!)).toEqual({
      version: 1,
      history: [recent],
    });
  });

  it('keeps only the newest record per question and prunes older than 180 days', () => {
    const result = mergeSeenQuestion(
      [
        { ...recent, seenAt: now - 2_000 },
        { questionId: 'q-old', intentKey: 'intent.old', seenAt: now - 181 * 86_400_000 },
      ],
      recent,
      now,
    );

    expect(result).toEqual([recent]);
  });

  it('treats the exact retention boundary as retained', () => {
    const boundary = {
      questionId: 'q-boundary',
      intentKey: 'intent.boundary',
      seenAt: now - 180 * 86_400_000,
    };
    expect(mergeSeenQuestion([], boundary, now)).toEqual([boundary]);
  });

  it('quarantines corrupt data and returns an empty history', async () => {
    const storage = createMemoryStorage({ [SEEN_HISTORY_KEY]: '{broken' });
    const repository = createSeenHistoryRepository(storage, () => 55);

    await expect(repository.load()).resolves.toEqual([]);
    expect(storage.values.get('duo:quarantine:55:seen-history')).toBe('{broken');
    expect(storage.values.has(SEEN_HISTORY_KEY)).toBe(false);
  });

  it('rejects invalid records and can clear persisted history', async () => {
    const storage = createMemoryStorage({
      [SEEN_HISTORY_KEY]: JSON.stringify({ version: 1, history: [{ questionId: 3 }] }),
    });
    const repository = createSeenHistoryRepository(storage, () => 66);

    await expect(repository.load()).resolves.toEqual([]);
    await repository.save([recent]);
    await repository.clear();
    expect(storage.values.has(SEEN_HISTORY_KEY)).toBe(false);
  });

  it('does not let a failing storage provider block load', async () => {
    const repository = createSeenHistoryRepository({
      getItem: async () => Promise.reject(new Error('disk')),
      setItem: async () => Promise.reject(new Error('disk')),
      removeItem: async () => Promise.reject(new Error('disk')),
    });

    await expect(repository.load()).resolves.toEqual([]);
  });
});
