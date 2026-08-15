import * as Crypto from 'expo-crypto';

import type { StorageAdapter } from './adapter';
import { ANONYMOUS_ID_KEY } from './keys';

export function createAnonymousIdRepository(storage: StorageAdapter) {
  return {
    async getOrCreate(): Promise<string> {
      const stored = await storage.getItem(ANONYMOUS_ID_KEY);
      if (stored?.trim()) return stored;

      const id = Crypto.randomUUID();
      await storage.setItem(ANONYMOUS_ID_KEY, id);
      return id;
    },
  };
}
