import { create } from 'zustand';

import {
  classifyEngagement,
  getViewedQuestions,
  insertSpecialCards,
  type ActiveSession,
  type CardAction,
  type SessionCard,
} from '@/features/session/gameplay';
import { buildSession, type SessionInput } from '@/features/session/sessionEngine';
import { asyncStorageAdapter } from '@/storage/adapter';
import { createGameplayRepository, type GameplayRepository } from '@/storage/gameplayRepository';
import {
  createSeenHistoryRepository,
  mergeSeenQuestion,
  type SeenHistoryRepository,
} from '@/storage/seenHistoryRepository';

export type SessionStartRequest = Omit<SessionInput, 'seenHistory' | 'now'> & {
  packTitle: string;
};

type SessionActions = {
  hydrate: () => Promise<void>;
  start: (request: SessionStartRequest) => Promise<ActiveSession | null>;
  resume: () => Promise<void>;
  advance: (action: CardAction) => Promise<ActiveSession | null>;
  toggleFavorite: (questionId: string) => Promise<void>;
  complete: () => Promise<ActiveSession | null>;
  chooseKeeper: (questionId: string) => Promise<void>;
  clear: () => Promise<void>;
};

export type SessionStore = SessionActions & {
  activeSession: ActiveSession | null;
  favoriteIds: string[];
  hydrated: boolean;
  persistenceFailed: boolean;
  startError: 'no_questions' | null;
};

const defaultGameplayRepository = createGameplayRepository(asyncStorageAdapter);
const defaultSeenRepository = createSeenHistoryRepository(asyncStorageAdapter);

function questionId(card: SessionCard): string {
  return card.kind === 'question' ? card.question.id : card.instanceId;
}

export function createSessionStore(
  gameplayRepository: GameplayRepository = defaultGameplayRepository,
  seenRepository: SeenHistoryRepository = defaultSeenRepository,
  now: () => number = Date.now,
) {
  let seenHistory: Awaited<ReturnType<SeenHistoryRepository['load']>> = [];

  return create<SessionStore>((set, get) => {
    const failPersistence = () => set({ persistenceFailed: true });

    const saveActive = async (session: ActiveSession) => {
      try {
        await gameplayRepository.saveActive(session);
      } catch {
        failPersistence();
      }
    };

    const markSeen = async (card: SessionCard, seenAt: number) => {
      if (card.kind !== 'question') return;
      seenHistory = mergeSeenQuestion(
        seenHistory,
        { questionId: card.question.id, intentKey: card.question.intentKey, seenAt },
        seenAt,
      );
      try {
        await seenRepository.save(seenHistory);
      } catch {
        failPersistence();
      }
    };

    const leaveCurrent = (session: ActiveSession, action: CardAction, leftAt: number) => {
      const card = session.cards[session.currentIndex]!;
      const id = questionId(card);
      return {
        card,
        skippedIds: action === 'skip' ? [...session.skippedIds, id] : [...session.skippedIds],
        reportedIds:
          action === 'reported' ? [...session.reportedIds, id] : [...session.reportedIds],
        outcomes: [
          ...session.outcomes,
          {
            cardId: card.instanceId,
            viewedAt: session.currentViewedAt,
            leftAt,
            action,
            engagement: classifyEngagement(leftAt - session.currentViewedAt),
          },
        ],
      };
    };

    return {
      activeSession: null,
      favoriteIds: [],
      hydrated: false,
      persistenceFailed: false,
      startError: null,

      hydrate: async () => {
        let failed = false;
        const [activeSession, favoriteIds, history] = await Promise.all([
          gameplayRepository.loadActive().catch(() => {
            failed = true;
            return null;
          }),
          gameplayRepository.loadFavorites().catch(() => {
            failed = true;
            return [];
          }),
          seenRepository.load().catch(() => {
            failed = true;
            return [];
          }),
        ]);
        seenHistory = history;
        set({
          activeSession,
          favoriteIds,
          hydrated: true,
          persistenceFailed: failed,
          startError: null,
        });
      },

      start: async (request) => {
        const startedAt = now();
        set({ persistenceFailed: false, startError: null });
        try {
          seenHistory = await seenRepository.load();
        } catch {
          seenHistory = [];
          failPersistence();
        }
        let plan;
        try {
          plan = buildSession({ ...request, seenHistory, now: startedAt });
        } catch {
          set({ startError: 'no_questions' });
          return null;
        }
        if (plan.questions.length === 0) {
          set({ startError: 'no_questions' });
          return null;
        }
        const cards = insertSpecialCards(
          plan.questions,
          request.players,
          request.packIds[0]!,
          request.seed,
        );
        const session: ActiveSession = {
          id: `session:${request.seed}`,
          locale: plan.locale,
          contentVersion: plan.contentVersion,
          mode: request.mode,
          packIds: [...request.packIds],
          packTitle: request.packTitle,
          players: request.players.map((player) => ({ ...player })),
          durationMinutes: request.durationMinutes,
          intensityPreset: request.intensityPreset,
          allowMature: request.ageConfirmed18 && request.matureContentEnabled,
          excludedTopics: [...request.excludedTopics],
          seed: request.seed,
          cards,
          currentIndex: 0,
          currentViewedAt: startedAt,
          favoriteIdsAtStart: [...get().favoriteIds],
          skippedIds: [],
          reportedIds: [],
          outcomes: [],
          startedAt,
          lastActiveAt: startedAt,
        };
        set({ activeSession: session, startError: null });
        await markSeen(cards[0]!, startedAt);
        await saveActive(session);
        return session;
      },

      resume: async () => {
        const session = get().activeSession;
        if (!session || session.completedAt) return;
        const resumedAt = now();
        const next = { ...session, currentViewedAt: resumedAt, lastActiveAt: resumedAt };
        set({ activeSession: next });
        await saveActive(next);
      },

      advance: async (action) => {
        const session = get().activeSession;
        if (!session || session.completedAt) return session;
        const leftAt = now();
        const left = leaveCurrent(session, action, leftAt);
        const isLast = session.currentIndex >= session.cards.length - 1;
        const next: ActiveSession = {
          ...session,
          skippedIds: left.skippedIds,
          reportedIds: left.reportedIds,
          outcomes: left.outcomes,
          currentIndex: isLast ? session.currentIndex : session.currentIndex + 1,
          currentViewedAt: leftAt,
          lastActiveAt: leftAt,
          ...(isLast ? { completedAt: leftAt } : {}),
        };
        set({ activeSession: next });
        if (!isLast) await markSeen(next.cards[next.currentIndex]!, leftAt);
        await saveActive(next);
        return next;
      },

      toggleFavorite: async (id) => {
        if (!id.startsWith('qi_')) return;
        const current = get().favoriteIds;
        const next = current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id];
        set({ favoriteIds: next });
        try {
          await gameplayRepository.saveFavorites(next);
        } catch {
          failPersistence();
        }
      },

      complete: async () => {
        const session = get().activeSession;
        if (!session || session.completedAt) return session;
        const completedAt = now();
        const left = leaveCurrent(session, 'next', completedAt);
        const next: ActiveSession = {
          ...session,
          skippedIds: left.skippedIds,
          reportedIds: left.reportedIds,
          outcomes: left.outcomes,
          lastActiveAt: completedAt,
          completedAt,
        };
        set({ activeSession: next });
        await saveActive(next);
        return next;
      },

      chooseKeeper: async (id) => {
        const session = get().activeSession;
        if (!session || !getViewedQuestions(session).some((question) => question.id === id)) return;
        const next = { ...session, keeperQuestionId: id };
        set({ activeSession: next });
        await saveActive(next);
      },

      clear: async () => {
        set({ activeSession: null, startError: null });
        try {
          await gameplayRepository.clearActive();
        } catch {
          failPersistence();
        }
      },
    };
  });
}

export const useSessionStore = createSessionStore();
