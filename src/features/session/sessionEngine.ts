import type { ContentBundle, RuntimeQuestion } from '@/content/schema/schemas';
import type { SupportedLocale } from '@/content/schema/vocabulary';
import type { GameMode, Player } from '@/features/player-setup/playerSetup';
import type { SettingsData } from '@/storage/migrations';

export type SessionDuration = 10 | 20 | 30;
export type IntensityPreset = 'light' | 'mixed' | 'deep';
export type TopicTag = SettingsData['excludedTopics'][number];

export type SeenQuestion = {
  questionId: string;
  intentKey: string;
  seenAt: number;
};

export type SessionInput = {
  bundle: ContentBundle;
  mode: GameMode;
  packIds: string[];
  entitledPackIds: string[];
  players: Player[];
  durationMinutes: SessionDuration;
  intensityPreset: IntensityPreset;
  ageConfirmed18: boolean;
  matureContentEnabled: boolean;
  excludedTopics: TopicTag[];
  country?: string;
  seenHistory: SeenQuestion[];
  seed: string;
  now: number;
};

export type SessionWarning =
  'insufficient_unique_questions' | 'safe_arc_unavailable' | 'no_eligible_questions';

export type QuestionInstance = {
  instanceId: string;
  index: number;
  question: RuntimeQuestion;
  starterPlayerIds: string[];
};

export type SessionPlan = {
  seed: string;
  locale: SupportedLocale;
  contentVersion: string;
  packIds: string[];
  targetQuestionCount: number;
  questions: QuestionInstance[];
  warnings: SessionWarning[];
};

export type AssignedQuestion = {
  question: RuntimeQuestion;
  starterPlayerIds: string[];
};

export type IntensityAllocation = {
  questions: RuntimeQuestion[];
  warnings: SessionWarning[];
};

const DAY_MS = 86_400_000;
const EXACT_QUESTION_WINDOW_MS = 180 * DAY_MS;
const INTENT_WINDOW_MS = 30 * DAY_MS;

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: string): () => number {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(values: readonly T[], seed: string): T[] {
  const result = [...values];
  const random = createRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

const durationTargets: Record<SessionDuration, number> = { 10: 10, 20: 18, 30: 26 };

function assertSelectedPacks(input: SessionInput): Set<string> {
  if (input.packIds.length === 0) throw new Error('At least one pack is required.');

  const packs = new Map(input.bundle.packs.map((pack) => [pack.id, pack]));
  for (const packId of input.packIds) {
    const pack = packs.get(packId);
    if (!pack) throw new Error(`Selected pack ${packId} is unavailable.`);
    if (pack.mode !== 'both' && pack.mode !== input.mode) {
      throw new Error(`Selected pack ${packId} does not support ${input.mode} mode.`);
    }
    if (!pack.allowedLocales.includes(input.bundle.locale)) {
      throw new Error(`Selected pack ${packId} does not support ${input.bundle.locale}.`);
    }
    if (pack.premium && !input.entitledPackIds.includes(packId)) {
      throw new Error(`Premium pack ${packId} is not entitled.`);
    }
  }

  return new Set(input.packIds);
}

export function filterEligibleQuestions(input: SessionInput): RuntimeQuestion[] {
  const selectedPacks = assertSelectedPacks(input);
  const excludedTopics = new Set(input.excludedTopics);
  const seenIds = new Set<string>();

  return input.bundle.questions.filter((question) => {
    if (seenIds.has(question.id)) return false;
    if (!question.mode.includes(input.mode)) return false;
    if (!question.packIds.some((packId) => selectedPacks.has(packId))) return false;
    if (
      question.maturity === 'explicit' &&
      (!input.ageConfirmed18 || !input.matureContentEnabled)
    ) {
      return false;
    }
    if (question.topicTags.some((topic) => excludedTopics.has(topic))) return false;
    if (question.regionAllow && (!input.country || !question.regionAllow.includes(input.country))) {
      return false;
    }
    if (question.regionBlock?.includes(input.country ?? '')) return false;

    seenIds.add(question.id);
    return true;
  });
}

export function partitionSeenQuestions(
  questions: readonly RuntimeQuestion[],
  history: readonly SeenQuestion[],
  now: number,
): { fresh: RuntimeQuestion[]; recovery: RuntimeQuestion[] } {
  const fresh: RuntimeQuestion[] = [];
  const recovery: { question: RuntimeQuestion; seenAt: number }[] = [];

  for (const question of questions) {
    let mostRecent = -Infinity;
    for (const record of history) {
      const exactRecent =
        record.questionId === question.id && record.seenAt >= now - EXACT_QUESTION_WINDOW_MS;
      const intentRecent =
        record.intentKey === question.intentKey && record.seenAt >= now - INTENT_WINDOW_MS;
      if (exactRecent || intentRecent) mostRecent = Math.max(mostRecent, record.seenAt);
    }

    if (mostRecent === -Infinity) fresh.push(question);
    else recovery.push({ question, seenAt: mostRecent });
  }

  recovery.sort(
    (left, right) =>
      left.seenAt - right.seenAt || left.question.id.localeCompare(right.question.id),
  );
  return { fresh, recovery: recovery.map(({ question }) => question) };
}

const intensityWeights: Record<IntensityPreset, readonly [number, number, number]> = {
  light: [0.7, 0.3, 0],
  mixed: [0.35, 0.45, 0.2],
  deep: [0.15, 0.4, 0.45],
};

function intensityBucket(question: RuntimeQuestion): number {
  if (question.intensity <= 2) return 0;
  if (question.intensity === 3) return 1;
  return 2;
}

function largestRemainder(total: number, weights: readonly number[]): number[] {
  const exact = weights.map((weight) => weight * total);
  const result = exact.map(Math.floor);
  const remaining = total - result.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);
  for (let index = 0; index < remaining; index += 1) {
    const bucket = order[index]!.index;
    result[bucket] = (result[bucket] ?? 0) + 1;
  }
  return result;
}

function arrangeSafeArc(questions: RuntimeQuestion[]): {
  questions: RuntimeQuestion[];
  safe: boolean;
} {
  const remaining = [...questions];
  const arranged: RuntimeQuestion[] = [];
  const openingCount = Math.min(2, remaining.length);

  for (let index = 0; index < openingCount; index += 1) {
    const safeIndex = remaining.findIndex((question) => question.intensity <= 2);
    if (safeIndex < 0) return { questions: [...arranged, ...remaining], safe: false };
    arranged.push(remaining.splice(safeIndex, 1)[0]!);
  }

  if (remaining.length === 0) return { questions: arranged, safe: true };
  const closeIndex = remaining.findIndex((question) => question.intensity <= 3);
  if (closeIndex < 0) return { questions: [...arranged, ...remaining], safe: false };
  const closing = remaining.splice(closeIndex, 1)[0]!;
  return { questions: [...arranged, ...remaining, closing], safe: true };
}

export function allocateByIntensity(
  pool: readonly RuntimeQuestion[],
  target: number,
  preset: IntensityPreset,
  seed: string,
): IntensityAllocation {
  const unique = [...new Map(pool.map((question) => [question.id, question])).values()];
  const count = Math.min(Math.max(0, target), unique.length);
  const quotas = largestRemainder(count, intensityWeights[preset]);
  const buckets = [0, 1, 2].map((bucket) =>
    seededShuffle(
      unique.filter((question) => intensityBucket(question) === bucket),
      `${seed}:bucket:${bucket}`,
    ),
  );
  const cursors = buckets.map((bucket, index) => Math.min(bucket.length, quotas[index] ?? 0));
  const selected = buckets.flatMap((bucket, index) => bucket.slice(0, cursors[index]));
  for (let desiredBucket = 0; desiredBucket < buckets.length; desiredBucket += 1) {
    let deficit = (quotas[desiredBucket] ?? 0) - (cursors[desiredBucket] ?? 0);
    while (deficit > 0) {
      const sourceBucket = buckets
        .map((bucket, index) => ({ index, available: bucket.length - (cursors[index] ?? 0) }))
        .filter(({ available }) => available > 0)
        .sort(
          (left, right) =>
            Math.abs(left.index - desiredBucket) - Math.abs(right.index - desiredBucket) ||
            left.index - right.index,
        )[0]?.index;
      if (sourceBucket === undefined) break;
      selected.push(buckets[sourceBucket]![cursors[sourceBucket]!]!);
      cursors[sourceBucket] = (cursors[sourceBucket] ?? 0) + 1;
      deficit -= 1;
    }
  }

  const shuffled = seededShuffle(selected, `${seed}:order`);
  const arc = arrangeSafeArc(shuffled);
  const warnings: SessionWarning[] = [];
  if (unique.length < target) warnings.push('insufficient_unique_questions');
  if (!arc.safe && count > 0) warnings.push('safe_arc_unavailable');
  return { questions: arc.questions, warnings };
}

export function assignPlayers(
  questions: readonly RuntimeQuestion[],
  players: readonly Player[],
  mode: GameMode,
  seed: string,
): AssignedQuestion[] {
  if (players.length < 2) throw new Error('At least two players are required.');
  const activePlayers = mode === 'couple' ? players.slice(0, 2) : players;
  const order = seededShuffle(activePlayers, `${seed}:${mode}`);
  let cursor = 0;

  return questions.map((question) => {
    if (question.starter === 'both') {
      return { question, starterPlayerIds: activePlayers.map((player) => player.id) };
    }
    const starter = order[cursor % order.length]!;
    cursor += 1;
    return { question, starterPlayerIds: [starter.id] };
  });
}

function snapshotQuestion(question: RuntimeQuestion): RuntimeQuestion {
  return {
    ...question,
    mode: [...question.mode],
    packIds: [...question.packIds],
    topicTags: [...question.topicTags],
    relationshipStages: [...question.relationshipStages],
    safetyTags: [...question.safetyTags],
    ...(question.regionAllow ? { regionAllow: [...question.regionAllow] } : {}),
    ...(question.regionBlock ? { regionBlock: [...question.regionBlock] } : {}),
  };
}

export function buildSession(input: SessionInput): SessionPlan {
  if (!input.seed.trim()) throw new Error('Session seed is required.');

  const targetQuestionCount = durationTargets[input.durationMinutes];
  const eligible = filterEligibleQuestions(input);
  const { fresh, recovery } = partitionSeenQuestions(eligible, input.seenHistory, input.now);
  const neededFromRecovery = Math.max(0, targetQuestionCount - fresh.length);
  const candidates = [...fresh, ...recovery.slice(0, neededFromRecovery)];
  const allocation = allocateByIntensity(
    candidates,
    targetQuestionCount,
    input.intensityPreset,
    `${input.seed}:intensity`,
  );
  const assigned = assignPlayers(
    allocation.questions,
    input.players,
    input.mode,
    `${input.seed}:players`,
  );
  const warnings = [...allocation.warnings];
  if (eligible.length === 0) warnings.unshift('no_eligible_questions');

  return {
    seed: input.seed,
    locale: input.bundle.locale,
    contentVersion: input.bundle.contentVersion,
    packIds: [...input.packIds],
    targetQuestionCount,
    questions: assigned.map(({ question, starterPlayerIds }, index) => ({
      instanceId: `${input.seed}:${index}:${question.id}`,
      index,
      question: snapshotQuestion(question),
      starterPlayerIds: [...starterPlayerIds],
    })),
    warnings: [...new Set(warnings)],
  };
}
