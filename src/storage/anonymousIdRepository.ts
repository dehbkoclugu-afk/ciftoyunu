import * as Crypto from 'expo-crypto';

import type { StorageAdapter } from './adapter';
import { ANONYMOUS_ID_KEY } from './keys';

export function createAnonymousIdRepository(storage: StorageAdapter) {
  return {
    async getOrCreate(): Promise<string> {
      try {
        const stored = await storage.getItem(ANONYMOUS_ID_KEY);
        if (
          stored &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)
        ) {
          return stored;
        }
      } catch {
        // An ephemeral ID still permits deterministic behavior for this launch.
      }

      const id = Crypto.randomUUID();
      try {
        await storage.setItem(ANONYMOUS_ID_KEY, id);
      } catch {
        // Persistence failure must not block launch.
      }
      return id;
    },
  };
}
