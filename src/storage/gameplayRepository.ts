import { runtimeQuestionSchema } from '@/content/schema/schemas';
import { supportedLocales } from '@/content/schema/vocabulary';
import type { ActiveSession } from '@/features/session/gameplay';

import type { StorageAdapter } from './adapter';
import {
  FAVORITES_KEY,
  FAVORITES_VERSION,
  getFavoritesQuarantineKey,
  getLastSessionQuarantineKey,
  LAST_SESSION_KEY,
  LAST_SESSION_VERSION,
} from './keys';

const RESUME_WINDOW_MS = 24 * 60 * 60 * 1_000;
const modes = new Set(['couple', 'friends']);
const durations = new Set([10, 20, 30]);
const intensities = new Set(['light', 'mixed', 'deep']);
const locales = new Set<string>(supportedLocales);
const specialTypes = new Set([
  'both_answer',
  'predict_partner',
  'rapid_fire',
  'rank_three',
  'gratitude',
  'tell_story',
  'switch_starter',
  'take_breath',
  'wildcard',
]);

export type GameplayRepository = {
  loadActive: () => Promise<ActiveSession | null>;
  saveActive: (session: ActiveSession) => Promise<void>;
  clearActive: () => Promise<void>;
  loadFavorites: () => Promise<string[]>;
  saveFavorites: (questionIds: readonly string[]) => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPlayer(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.displayName === 'string' &&
    (value.emoji === undefined || typeof value.emoji === 'string')
  );
}

function isCard(value: unknown): boolean {
  if (
    !isRecord(value) ||
    typeof value.instanceId !== 'string' ||
    !isStringArray(value.starterPlayerIds)
  ) {
    return false;
  }
  if (value.kind === 'question') {
    return (
      typeof value.index === 'number' &&
      Number.isInteger(value.index) &&
      runtimeQuestionSchema.safeParse(value.question).success
    );
  }
  return (
    value.kind === 'special' &&
    typeof value.type === 'string' &&
    specialTypes.has(value.type) &&
    typeof value.title === 'string' &&
    typeof value.instruction === 'string'
  );
}

function isOutcome(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.cardId === 'string' &&
    typeof value.viewedAt === 'number' &&
    Number.isFinite(value.viewedAt) &&
    typeof value.leftAt === 'number' &&
    Number.isFinite(value.leftAt) &&
    (value.action === 'next' || value.action === 'skip' || value.action === 'reported') &&
    (value.engagement === 'rapid_skip' ||
      value.engagement === 'neutral' ||
      value.engagement === 'engaged_card')
  );
}

function parseActive(raw: string): ActiveSession {
  const envelope: unknown = JSON.parse(raw);
  if (
    !isRecord(envelope) ||
    envelope.version !== LAST_SESSION_VERSION ||
    !isRecord(envelope.data)
  ) {
    throw new Error('Invalid active session envelope');
  }
  const data = envelope.data;
  if (
    typeof data.id !== 'string' ||
    typeof data.locale !== 'string' ||
    !locales.has(data.locale) ||
    typeof data.contentVersion !== 'string' ||
    typeof data.mode !== 'string' ||
    !modes.has(data.mode) ||
    !isStringArray(data.packIds) ||
    typeof data.packTitle !== 'string' ||
    !Array.isArray(data.players) ||
    data.players.length < 2 ||
    !data.players.every(isPlayer) ||
    typeof data.durationMinutes !== 'number' ||
    !durations.has(data.durationMinutes) ||
    typeof data.intensityPreset !== 'string' ||
    !intensities.has(data.intensityPreset) ||
    typeof data.allowMature !== 'boolean' ||
    !isStringArray(data.excludedTopics) ||
    typeof data.seed !== 'string' ||
    !Array.isArray(data.cards) ||
    data.cards.length === 0 ||
    !data.cards.every(isCard) ||
    typeof data.currentIndex !== 'number' ||
    !Number.isInteger(data.currentIndex) ||
    data.currentIndex < 0 ||
    data.currentIndex >= data.cards.length ||
    typeof data.currentViewedAt !== 'number' ||
    !isStringArray(data.favoriteIdsAtStart) ||
    !isStringArray(data.skippedIds) ||
    !isStringArray(data.reportedIds) ||
    !Array.isArray(data.outcomes) ||
    !data.outcomes.every(isOutcome) ||
    typeof data.startedAt !== 'number' ||
    typeof data.lastActiveAt !== 'number' ||
    (data.completedAt !== undefined && typeof data.completedAt !== 'number') ||
    (data.keeperQuestionId !== undefined && typeof data.keeperQuestionId !== 'string')
  ) {
    throw new Error('Invalid active session');
  }
  return data as ActiveSession;
}

function parseFavorites(raw: string): string[] {
  const envelope: unknown = JSON.parse(raw);
  if (
    !isRecord(envelope) ||
    envelope.version !== FAVORITES_VERSION ||
    !isStringArray(envelope.questionIds)
  ) {
    throw new Error('Invalid favorites envelope');
  }
  return [...new Set(envelope.questionIds.filter((id) => id.startsWith('qi_')))];
}

async function recover(
  storage: StorageAdapter,
  key: string,
  quarantineKey: string,
  raw: string | null,
): Promise<void> {
  if (raw !== null) {
    try {
      await storage.setItem(quarantineKey, raw);
    } catch {
      // Quarantine is best effort; app launch must continue.
    }
  }
  try {
    await storage.removeItem(key);
  } catch {
    // A broken storage provider must not block launch.
  }
}

export function createGameplayRepository(
  storage: StorageAdapter,
  now: () => number = Date.now,
): GameplayRepository {
  return {
    async loadActive() {
      let raw: string | null = null;
      try {
        raw = await storage.getItem(LAST_SESSION_KEY);
        if (raw === null) return null;
        const session = parseActive(raw);
        if (session.lastActiveAt < now() - RESUME_WINDOW_MS) {
          await storage.removeItem(LAST_SESSION_KEY);
          return null;
        }
        return session;
      } catch {
        await recover(storage, LAST_SESSION_KEY, getLastSessionQuarantineKey(now()), raw);
        return null;
      }
    },

    async saveActive(session) {
      await storage.setItem(
        LAST_SESSION_KEY,
        JSON.stringify({ version: LAST_SESSION_VERSION, data: session }),
      );
    },

    async clearActive() {
      await storage.removeItem(LAST_SESSION_KEY);
    },

    async loadFavorites() {
      let raw: string | null = null;
      try {
        raw = await storage.getItem(FAVORITES_KEY);
        return raw === null ? [] : parseFavorites(raw);
      } catch {
        await recover(storage, FAVORITES_KEY, getFavoritesQuarantineKey(now()), raw);
        return [];
      }
    },

    async saveFavorites(questionIds) {
      await storage.setItem(
        FAVORITES_KEY,
        JSON.stringify({
          version: FAVORITES_VERSION,
          questionIds: [...new Set(questionIds.filter((id) => id.startsWith('qi_')))],
        }),
      );
    },
  };
}
