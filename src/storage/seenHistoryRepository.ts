import type { SeenQuestion } from '@/features/session/sessionEngine';

import type { StorageAdapter } from './adapter';
import { getSeenHistoryQuarantineKey, SEEN_HISTORY_KEY, SEEN_HISTORY_VERSION } from './keys';

const RETENTION_MS = 180 * 86_400_000;

export type SeenHistoryRepository = {
  load: () => Promise<SeenQuestion[]>;
  save: (history: readonly SeenQuestion[]) => Promise<void>;
  clear: () => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseHistory(raw: string): SeenQuestion[] {
  const envelope: unknown = JSON.parse(raw);
  if (
    !isRecord(envelope) ||
    envelope.version !== SEEN_HISTORY_VERSION ||
    !Array.isArray(envelope.history)
  ) {
    throw new Error('Invalid seen history envelope');
  }

  return envelope.history.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.questionId !== 'string' ||
      !value.questionId ||
      typeof value.intentKey !== 'string' ||
      !value.intentKey ||
      typeof value.seenAt !== 'number' ||
      !Number.isFinite(value.seenAt) ||
      value.seenAt < 0
    ) {
      throw new Error('Invalid seen history record');
    }
    return { questionId: value.questionId, intentKey: value.intentKey, seenAt: value.seenAt };
  });
}

function normalizeHistory(history: readonly SeenQuestion[], now: number): SeenQuestion[] {
  const newest = new Map<string, SeenQuestion>();
  for (const record of history) {
    if (record.seenAt < now - RETENTION_MS) continue;
    const previous = newest.get(record.questionId);
    if (!previous || record.seenAt > previous.seenAt) newest.set(record.questionId, { ...record });
  }
  return [...newest.values()].sort(
    (left, right) => right.seenAt - left.seenAt || left.questionId.localeCompare(right.questionId),
  );
}

export function mergeSeenQuestion(
  history: readonly SeenQuestion[],
  question: SeenQuestion,
  now: number = Date.now(),
): SeenQuestion[] {
  return normalizeHistory([...history, question], now);
}

export function createSeenHistoryRepository(
  storage: StorageAdapter,
  now: () => number = Date.now,
): SeenHistoryRepository {
  return {
    async load() {
      let raw: string | null = null;
      try {
        raw = await storage.getItem(SEEN_HISTORY_KEY);
        return raw === null ? [] : normalizeHistory(parseHistory(raw), now());
      } catch {
        if (raw !== null) {
          try {
            await storage.setItem(getSeenHistoryQuarantineKey(now()), raw);
          } catch {
            // Quarantine is best effort; session setup must still continue.
          }
        }
        try {
          await storage.removeItem(SEEN_HISTORY_KEY);
        } catch {
          // A broken storage provider must not block session setup.
        }
        return [];
      }
    },

    async save(history) {
      await storage.setItem(
        SEEN_HISTORY_KEY,
        JSON.stringify({
          version: SEEN_HISTORY_VERSION,
          history: normalizeHistory(history, now()),
        }),
      );
    },

    async clear() {
      await storage.removeItem(SEEN_HISTORY_KEY);
    },
  };
}
