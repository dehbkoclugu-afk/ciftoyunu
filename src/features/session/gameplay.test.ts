import type { RuntimeQuestion } from '@/content/schema/schemas';
import { loadEmbeddedContent } from '@/content/loader';
import { resolvePlayers } from '@/features/player-setup/playerSetup';

import {
  classifyEngagement,
  getQuestionTextTier,
  getSessionMetrics,
  getSwipeAction,
  getViewedQuestions,
  insertSpecialCards,
  type ActiveSession,
  type QuestionSessionCard,
} from './gameplay';
import type { QuestionInstance } from './sessionEngine';

const baseQuestion = loadEmbeddedContent('en')!.questions[0]!;
const players = resolvePlayers([
  { id: 'player-1', name: 'Maya' },
  { id: 'player-2', name: 'Noah' },
]);

function questions(count: number): QuestionInstance[] {
  return Array.from({ length: count }, (_, index) => {
    const question: RuntimeQuestion = {
      ...baseQuestion,
      id: `qi_gameplay_test_${String(index + 1).padStart(4, '0')}`,
      intentKey: `gameplay.test_${index + 1}`,
      starter: 'single',
    };
    return {
      instanceId: `session:${index}:${question.id}`,
      index,
      question,
      starterPlayerIds: [players[index % players.length]!.id],
    };
  });
}

function activeSession(cards: QuestionSessionCard[]): ActiveSession {
  return {
    id: 'session-1',
    locale: 'en',
    contentVersion: '2026.08.1',
    mode: 'couple',
    packIds: ['warm_start'],
    packTitle: 'Warm Start',
    players,
    durationMinutes: 10,
    intensityPreset: 'mixed',
    allowMature: false,
    excludedTopics: [],
    seed: 'session-seed',
    cards,
    currentIndex: 2,
    currentViewedAt: 4_000,
    favoriteIdsAtStart: [cards[0]!.question.id],
    skippedIds: [],
    reportedIds: [],
    outcomes: [
      {
        cardId: cards[0]!.instanceId,
        viewedAt: 1_000,
        leftAt: 2_000,
        action: 'next',
        engagement: 'neutral',
      },
      {
        cardId: cards[1]!.instanceId,
        viewedAt: 2_000,
        leftAt: 4_000,
        action: 'skip',
        engagement: 'neutral',
      },
    ],
    startedAt: 1_000,
    lastActiveAt: 9_000,
  };
}

describe('special card insertion', () => {
  it.each([
    [10, 1],
    [18, 2],
    [26, 3],
  ])('adds %s standard questions with %s spaced specials', (standardCount, specialCount) => {
    const cards = insertSpecialCards(questions(standardCount), players, 'warm_start', 'stable');
    const specials = cards.filter((card) => card.kind === 'special');

    expect(specials).toHaveLength(specialCount);
    expect(cards[0]!.kind).toBe('question');
    expect(cards.at(-1)!.kind).toBe('question');
    expect(Math.max(...specials.map((card) => cards.indexOf(card)))).toBeLessThan(cards.length - 1);
  });

  it('is deterministic, immutable, and never repeats a type more than twice', () => {
    const source = questions(26);
    const before = structuredClone(source);
    const first = insertSpecialCards(source, players, 'laugh_together', 'stable');
    const second = insertSpecialCards(source, players, 'laugh_together', 'stable');
    const counts = new Map<string, number>();
    first.forEach((card) => {
      if (card.kind === 'special') counts.set(card.type, (counts.get(card.type) ?? 0) + 1);
    });

    expect(first).toEqual(second);
    expect(source).toEqual(before);
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(2);
  });

  it('makes switch starter change the next single question', () => {
    let switched: ReturnType<typeof insertSpecialCards> | undefined;
    for (let attempt = 0; attempt < 200 && !switched; attempt += 1) {
      const candidate = insertSpecialCards(
        questions(26),
        players,
        'warm_start',
        `switch-${attempt}`,
      );
      if (candidate.some((card) => card.kind === 'special' && card.type === 'switch_starter')) {
        switched = candidate;
      }
    }
    expect(switched).toBeDefined();

    const specialIndex = switched!.findIndex(
      (card) => card.kind === 'special' && card.type === 'switch_starter',
    );
    const nextQuestion = switched!.slice(specialIndex + 1).find((card) => card.kind === 'question');
    const originalIndex = (nextQuestion as QuestionSessionCard).index;
    const originalStarter = questions(26)[originalIndex]!.starterPlayerIds[0];

    expect((nextQuestion as QuestionSessionCard).starterPlayerIds[0]).not.toBe(originalStarter);
  });
});

describe('gameplay derivations', () => {
  it('uses exact swipe boundaries', () => {
    expect(getSwipeAction(-72, 0)).toBe('skip');
    expect(getSwipeAction(72, 0)).toBe('next');
    expect(getSwipeAction(0, -500)).toBe('skip');
    expect(getSwipeAction(0, 500)).toBe('next');
    expect(getSwipeAction(71, 499)).toBeNull();
  });

  it('uses strict dwell thresholds', () => {
    expect(classifyEngagement(999)).toBe('rapid_skip');
    expect(classifyEngagement(1_000)).toBe('neutral');
    expect(classifyEngagement(6_000)).toBe('neutral');
    expect(classifyEngagement(6_001)).toBe('engaged_card');
  });

  it('selects readable text tiers', () => {
    expect(getQuestionTextTier('Short question?')).toBe('large');
    expect(getQuestionTextTier('x'.repeat(101))).toBe('medium');
    expect(getQuestionTextTier('x'.repeat(181))).toBe('small');
  });

  it('derives viewed questions and privacy-safe recap metrics', () => {
    const cards = questions(4).map((question) => ({ ...question, kind: 'question' as const }));
    const session = activeSession(cards);

    expect(getViewedQuestions(session).map((question) => question.id)).toEqual([
      cards[0]!.question.id,
      cards[1]!.question.id,
      cards[2]!.question.id,
    ]);
    expect(getSessionMetrics(session, [cards[0]!.question.id, cards[2]!.question.id])).toEqual({
      viewedQuestions: 3,
      favoritesAdded: 1,
      elapsedMs: 8_000,
    });
  });
});
