import type { StorageAdapter } from './adapter';
import { createAnonymousIdRepository } from './anonymousIdRepository';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'generated-id' }));

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
    const repository = createAnonymousIdRepository(memoryStorage('existing-id'));
    expect(await repository.getOrCreate()).toBe('existing-id');
  });

  it('creates and persists an identifier once', async () => {
    const storage = memoryStorage();
    const repository = createAnonymousIdRepository(storage);
    expect(await repository.getOrCreate()).toBe('generated-id');
    expect(await repository.getOrCreate()).toBe('generated-id');
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
});
