import type { StorageAdapter } from './adapter';
import { createAnonymousIdRepository } from './anonymousIdRepository';

const generatedId = '11111111-1111-4111-8111-111111111111';

jest.mock('expo-crypto', () => ({ randomUUID: () => generatedId }));

function memoryStorage(initial: string | null = null): StorageAdapter {
  let value = initial;
  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key, next) => {
      value = next;
    }),
    removeItem: jest.fn(async () => {
      value = null;
    }),
  };
}

describe('anonymousIdRepository', () => {
  it('reuses the device identifier', async () => {
    const existingId = '22222222-2222-4222-8222-222222222222';
    const repository = createAnonymousIdRepository(memoryStorage(existingId));
    expect(await repository.getOrCreate()).toBe(existingId);
  });

  it('creates and persists an identifier once', async () => {
    const storage = memoryStorage();
    const repository = createAnonymousIdRepository(storage);
    expect(await repository.getOrCreate()).toBe(generatedId);
    expect(await repository.getOrCreate()).toBe(generatedId);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('replaces corrupt values and survives unavailable storage', async () => {
    const corrupt = memoryStorage('not-a-uuid');
    expect(await createAnonymousIdRepository(corrupt).getOrCreate()).toBe(generatedId);

    const unavailable: StorageAdapter = {
      getItem: jest.fn(async () => Promise.reject(new Error('unavailable'))),
      setItem: jest.fn(async () => Promise.reject(new Error('unavailable'))),
      removeItem: jest.fn(async () => undefined),
    };
    await expect(createAnonymousIdRepository(unavailable).getOrCreate()).resolves.toBe(generatedId);
  });
});
