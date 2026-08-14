import type { RuntimeQuestion } from '@/content/schema/schemas';
import type { GameMode, Player } from '@/features/player-setup/playerSetup';
import type { SupportedLocale } from '@/i18n';

import {
  seededShuffle,
  type IntensityPreset,
  type QuestionInstance,
  type SessionDuration,
  type TopicTag,
} from './sessionEngine';

export type SpecialCardType =
  | 'both_answer'
  | 'predict_partner'
  | 'rapid_fire'
  | 'rank_three'
  | 'gratitude'
  | 'tell_story'
  | 'switch_starter'
  | 'take_breath'
  | 'wildcard';

export type QuestionSessionCard = QuestionInstance & { kind: 'question' };

export type SpecialSessionCard = {
  kind: 'special';
  instanceId: string;
  type: SpecialCardType;
  title: string;
  instruction: string;
  starterPlayerIds: string[];
};

export type SessionCard = QuestionSessionCard | SpecialSessionCard;
export type CardAction = 'next' | 'skip' | 'reported';
export type Engagement = 'rapid_skip' | 'neutral' | 'engaged_card';

export type CardOutcome = {
  cardId: string;
  viewedAt: number;
  leftAt: number;
  action: CardAction;
  engagement: Engagement;
};

export type ActiveSession = {
  id: string;
  locale: SupportedLocale;
  contentVersion: string;
  mode: GameMode;
  packIds: string[];
  packTitle: string;
  players: Player[];
  durationMinutes: SessionDuration;
  intensityPreset: IntensityPreset;
  allowMature: boolean;
  excludedTopics: TopicTag[];
  seed: string;
  cards: SessionCard[];
  currentIndex: number;
  currentViewedAt: number;
  favoriteIdsAtStart: string[];
  skippedIds: string[];
  reportedIds: string[];
  outcomes: CardOutcome[];
  startedAt: number;
  lastActiveAt: number;
  completedAt?: number;
  keeperQuestionId?: string;
};

type SpecialDefinition = {
  type: SpecialCardType;
  title: string;
  instruction: string;
  everyone: boolean;
};

const definitions: Record<SpecialCardType, SpecialDefinition> = {
  both_answer: {
    type: 'both_answer',
    title: 'Both answer',
    instruction: 'Answer at the same time: one word for how this conversation feels right now.',
    everyone: true,
  },
  predict_partner: {
    type: 'predict_partner',
    title: 'Make a prediction',
    instruction: 'Before they answer, guess which part of this deck they have enjoyed most.',
    everyone: false,
  },
  rapid_fire: {
    type: 'rapid_fire',
    title: 'Rapid fire',
    instruction: 'Take turns naming three small things that made this week better.',
    everyone: true,
  },
  rank_three: {
    type: 'rank_three',
    title: 'Rank three',
    instruction: 'Together, rank these: more laughter, more quiet, more adventure.',
    everyone: true,
  },
  gratitude: {
    type: 'gratitude',
    title: 'A little gratitude',
    instruction: 'Name one thing someone at this table did recently that you appreciated.',
    everyone: true,
  },
  tell_story: {
    type: 'tell_story',
    title: 'Tell the story',
    instruction: 'Tell the story behind a moment from this year you still replay.',
    everyone: false,
  },
  switch_starter: {
    type: 'switch_starter',
    title: 'Switch starter',
    instruction: 'Pass the first answer on the next card to someone new.',
    everyone: true,
  },
  take_breath: {
    type: 'take_breath',
    title: 'Take a breath',
    instruction: 'Put the phone down. Take one slow breath together, then continue.',
    everyone: true,
  },
  wildcard: {
    type: 'wildcard',
    title: 'Wildcard',
    instruction: 'Choose: answer the last question again, or ask one honest follow-up.',
    everyone: true,
  },
};

const playfulTypes: SpecialCardType[] = [
  'rapid_fire',
  'rank_three',
  'predict_partner',
  'wildcard',
  'both_answer',
  'tell_story',
  'switch_starter',
  'gratitude',
  'take_breath',
];

const reflectiveTypes: SpecialCardType[] = [
  'gratitude',
  'tell_story',
  'take_breath',
  'both_answer',
  'predict_partner',
  'switch_starter',
  'rank_three',
  'wildcard',
  'rapid_fire',
];

function preferredTypes(packId: string): SpecialCardType[] {
  return (
    packId === 'laugh_together' || packId === 'friends_easy' ? playfulTypes : reflectiveTypes
  ).slice(0, 6);
}

function specialCount(questionCount: number): number {
  if (questionCount < 3) return 0;
  return Math.min(3, Math.max(1, Math.round(questionCount * 0.12)));
}

function nextPlayerId(currentId: string | undefined, players: readonly Player[]): string {
  const currentIndex = players.findIndex((player) => player.id === currentId);
  return players[(currentIndex + 1 + players.length) % players.length]!.id;
}

function applyStarterSwitch(cards: SessionCard[], players: readonly Player[]): SessionCard[] {
  const result = cards.map((card) =>
    card.kind === 'question' ? { ...card, starterPlayerIds: [...card.starterPlayerIds] } : card,
  );
  for (let index = 0; index < result.length; index += 1) {
    const special = result[index];
    if (special?.kind !== 'special' || special.type !== 'switch_starter') continue;
    for (let next = index + 1; next < result.length; next += 1) {
      const card = result[next];
      if (card?.kind !== 'question' || card.starterPlayerIds.length !== 1) continue;
      result[next] = {
        ...card,
        starterPlayerIds: [nextPlayerId(card.starterPlayerIds[0], players)],
      };
      break;
    }
  }
  return result;
}

export function insertSpecialCards(
  questions: readonly QuestionInstance[],
  players: readonly Player[],
  packId: string,
  seed: string,
): SessionCard[] {
  const count = specialCount(questions.length);
  if (count === 0) {
    return questions.map((question) => ({
      ...question,
      kind: 'question',
      starterPlayerIds: [...question.starterPlayerIds],
    }));
  }

  const types = seededShuffle(preferredTypes(packId), `${seed}:special-types`).slice(0, count);
  const positions = new Map<number, SpecialCardType>();
  for (let index = 0; index < count; index += 1) {
    const afterQuestion = Math.round(((index + 1) * questions.length) / (count + 1));
    positions.set(Math.min(questions.length - 1, Math.max(1, afterQuestion)), types[index]!);
  }

  const starterOrder = seededShuffle(players, `${seed}:special-starters`);
  const cards: SessionCard[] = [];
  questions.forEach((question, index) => {
    cards.push({
      ...question,
      kind: 'question',
      starterPlayerIds: [...question.starterPlayerIds],
    });
    const type = positions.get(index + 1);
    if (!type) return;
    const definition = definitions[type];
    cards.push({
      kind: 'special',
      instanceId: `${seed}:special:${cards.length}:${type}`,
      type,
      title: definition.title,
      instruction: definition.instruction,
      starterPlayerIds: definition.everyone
        ? players.map((player) => player.id)
        : [starterOrder[index % starterOrder.length]!.id],
    });
  });

  return applyStarterSwitch(cards, players);
}

export function getSwipeAction(translationX: number, velocityX: number): 'skip' | 'next' | null {
  if (translationX <= -72 || velocityX <= -500) return 'skip';
  if (translationX >= 72 || velocityX >= 500) return 'next';
  return null;
}

export function classifyEngagement(dwellMs: number): Engagement {
  if (dwellMs < 1_000) return 'rapid_skip';
  if (dwellMs > 6_000) return 'engaged_card';
  return 'neutral';
}

export function getQuestionTextTier(text: string): 'large' | 'medium' | 'small' {
  if (text.length <= 100) return 'large';
  if (text.length <= 180) return 'medium';
  return 'small';
}

export function getViewedQuestions(session: ActiveSession): RuntimeQuestion[] {
  const viewedCardIds = new Set(session.outcomes.map((outcome) => outcome.cardId));
  const current = session.cards[session.currentIndex];
  if (current) viewedCardIds.add(current.instanceId);
  return session.cards.flatMap((card) =>
    card.kind === 'question' && viewedCardIds.has(card.instanceId) ? [card.question] : [],
  );
}

export function getSessionMetrics(
  session: ActiveSession,
  favoriteIds: readonly string[],
): { viewedQuestions: number; favoritesAdded: number; elapsedMs: number } {
  const initialFavorites = new Set(session.favoriteIdsAtStart);
  return {
    viewedQuestions: getViewedQuestions(session).length,
    favoritesAdded: favoriteIds.filter((id) => !initialFavorites.has(id)).length,
    elapsedMs: Math.max(0, (session.completedAt ?? session.lastActiveAt) - session.startedAt),
  };
}
