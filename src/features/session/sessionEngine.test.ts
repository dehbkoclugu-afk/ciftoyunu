import { loadEmbeddedContent } from '@/content/loader';
import type { ContentBundle, QuestionPack, RuntimeQuestion } from '@/content/schema/schemas';
import { resolvePlayers } from '@/features/player-setup/playerSetup';

import {
  allocateByIntensity,
  assignPlayers,
  buildSession,
  filterEligibleQuestions,
  partitionSeenQuestions,
  seededShuffle,
  type SessionInput,
} from './sessionEngine';

const bundle = loadEmbeddedContent('en')!;

function createInput(overrides: Partial<SessionInput> = {}): SessionInput {
  return {
    bundle,
    mode: 'couple',
    packIds: ['warm_start'],
    entitledPackIds: [],
    players: resolvePlayers([
      { id: 'player-1', name: 'Maya' },
      { id: 'player-2', name: 'Noah' },
    ]),
    durationMinutes: 10,
    intensityPreset: 'mixed',
    ageConfirmed18: false,
    matureContentEnabled: false,
    excludedTopics: [],
    seenHistory: [],
    seed: 'night-one',
    now: Date.UTC(2026, 7, 14),
    ...overrides,
  };
}

const baseQuestion = bundle.questions[0]!;
const basePack = bundle.packs[0]!;

function createQuestion(
  number: number,
  intensity: RuntimeQuestion['intensity'],
  patch: Partial<RuntimeQuestion> = {},
): RuntimeQuestion {
  return {
    ...baseQuestion,
    id: `qi_session_test_${String(number).padStart(4, '0')}`,
    intentKey: `session.test_${number}`,
    packIds: ['session_test'],
    intensity,
    ...patch,
  };
}

function createBundle(
  questions: RuntimeQuestion[],
  packPatch: Partial<QuestionPack> = {},
): ContentBundle {
  const pack = { ...basePack, id: 'session_test', mode: 'both' as const, ...packPatch };
  return { ...bundle, packs: [pack], packCopy: [], questions };
}

describe('seeded session randomness', () => {
  it('returns the same immutable permutation for the same seed', () => {
    const source = [1, 2, 3, 4, 5, 6];

    expect(seededShuffle(source, 'stable')).toEqual(seededShuffle(source, 'stable'));
    expect(seededShuffle(source, 'stable')).not.toEqual(seededShuffle(source, 'different'));
    expect(source).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('rejects an empty session seed', () => {
    expect(() => buildSession(createInput({ seed: '   ' }))).toThrow('seed');
  });
});

describe('session eligibility and seen history', () => {
  it('applies mode, maturity, topic, and region policy without crossing packs', () => {
    const questions = [
      createQuestion(1, 1),
      createQuestion(2, 2, { maturity: 'explicit', safetyTags: ['adult', 'consent'] }),
      createQuestion(3, 2, { topicTags: ['money'] }),
      createQuestion(4, 2, { regionAllow: ['TR'] }),
      createQuestion(5, 2, { regionBlock: ['TR'] }),
      createQuestion(6, 2, { mode: ['friends'] }),
      createQuestion(7, 2, { packIds: ['another_pack'] }),
    ];
    const input = createInput({
      bundle: createBundle(questions),
      packIds: ['session_test'],
      excludedTopics: ['money'],
      country: 'TR',
    });

    expect(filterEligibleQuestions(input).map((question) => question.id)).toEqual([
      questions[0]!.id,
      questions[3]!.id,
    ]);
    expect(
      filterEligibleQuestions({
        ...input,
        ageConfirmed18: true,
        matureContentEnabled: true,
        excludedTopics: [],
      }).map((question) => question.id),
    ).toEqual([questions[0]!.id, questions[1]!.id, questions[2]!.id, questions[3]!.id]);
  });

  it('rejects incompatible, missing, and unentitled selected packs', () => {
    expect(() => filterEligibleQuestions(createInput({ packIds: [] }))).toThrow('pack');
    expect(() => filterEligibleQuestions(createInput({ packIds: ['missing'] }))).toThrow('missing');
    expect(() =>
      filterEligibleQuestions(
        createInput({ bundle: createBundle([], { mode: 'friends' }), packIds: ['session_test'] }),
      ),
    ).toThrow('mode');
    expect(() =>
      filterEligibleQuestions(
        createInput({ bundle: createBundle([], { premium: true }), packIds: ['session_test'] }),
      ),
    ).toThrow('Premium');
  });

  it('excludes recent question and intent families, then recovers oldest first', () => {
    const now = Date.UTC(2026, 7, 14);
    const questions = [createQuestion(1, 1), createQuestion(2, 2), createQuestion(3, 3)];
    const result = partitionSeenQuestions(
      questions,
      [
        {
          questionId: questions[0]!.id,
          intentKey: questions[0]!.intentKey,
          seenAt: now - 10 * 86_400_000,
        },
        {
          questionId: 'qi_other_seen_0001',
          intentKey: questions[1]!.intentKey,
          seenAt: now - 20 * 86_400_000,
        },
        {
          questionId: questions[2]!.id,
          intentKey: questions[2]!.intentKey,
          seenAt: now - 181 * 86_400_000,
        },
      ],
      now,
    );

    expect(result.fresh.map((question) => question.id)).toEqual([questions[2]!.id]);
    expect(result.recovery.map((question) => question.id)).toEqual([
      questions[1]!.id,
      questions[0]!.id,
    ]);
  });

  it('treats exact 180-day and 30-day cutoffs as recent', () => {
    const now = Date.UTC(2026, 7, 14);
    const questions = [createQuestion(1, 1), createQuestion(2, 1)];
    const result = partitionSeenQuestions(
      questions,
      [
        { questionId: questions[0]!.id, intentKey: 'other.intent', seenAt: now - 180 * 86_400_000 },
        {
          questionId: 'qi_other_seen_0002',
          intentKey: questions[1]!.intentKey,
          seenAt: now - 30 * 86_400_000,
        },
      ],
      now,
    );

    expect(result.fresh).toEqual([]);
  });
});

describe('session intensity and arc', () => {
  const balancedPool = [
    ...Array.from({ length: 20 }, (_, index) => createQuestion(index + 1, index % 2 === 0 ? 1 : 2)),
    ...Array.from({ length: 10 }, (_, index) => createQuestion(index + 21, 3)),
    ...Array.from({ length: 10 }, (_, index) =>
      createQuestion(index + 31, index % 2 === 0 ? 4 : 5),
    ),
  ];

  it.each([
    ['light', [14, 6, 0]],
    ['mixed', [7, 9, 4]],
    ['deep', [3, 8, 9]],
  ] as const)('allocates the %s largest-remainder quotas', (preset, expected) => {
    const result = allocateByIntensity(balancedPool, 20, preset, 'quota');
    const counts = [
      result.questions.filter((question) => question.intensity <= 2).length,
      result.questions.filter((question) => question.intensity === 3).length,
      result.questions.filter((question) => question.intensity >= 4).length,
    ];
    expect(counts).toEqual(expected);
  });

  it('caps to unique content, fills shortages deterministically, and keeps a safe arc', () => {
    const pool = [
      createQuestion(1, 1),
      createQuestion(2, 2),
      createQuestion(3, 3),
      createQuestion(4, 4),
      createQuestion(5, 5),
    ];
    const first = allocateByIntensity(pool, 10, 'deep', 'short');
    const second = allocateByIntensity(pool, 10, 'deep', 'short');

    expect(first).toEqual(second);
    expect(first.questions).toHaveLength(5);
    expect(new Set(first.questions.map((question) => question.id)).size).toBe(5);
    expect(first.questions.slice(0, 2).every((question) => question.intensity <= 2)).toBe(true);
    expect(first.questions.at(-1)!.intensity).toBeLessThanOrEqual(3);
    expect(first.warnings).toContain('insufficient_unique_questions');
  });

  it('fills an unavailable quota from the nearest intensity bucket', () => {
    const pool = [
      createQuestion(1, 1),
      createQuestion(2, 3),
      createQuestion(3, 3),
      createQuestion(4, 3),
      createQuestion(5, 5),
    ];
    const result = allocateByIntensity(pool, 4, 'light', 'nearest');

    expect(result.questions.filter((question) => question.intensity === 5)).toHaveLength(0);
  });

  it('warns when a safe opening and close do not exist', () => {
    const result = allocateByIntensity(
      [createQuestion(1, 4), createQuestion(2, 5), createQuestion(3, 4)],
      3,
      'deep',
      'unsafe',
    );

    expect(result.warnings).toContain('safe_arc_unavailable');
  });
});

describe('player assignment and full plans', () => {
  it('alternates Couple starters while both cards do not advance the cursor', () => {
    const questions = [
      createQuestion(1, 1, { starter: 'single' }),
      createQuestion(2, 1, { starter: 'random' }),
      createQuestion(3, 1, { starter: 'both' }),
      createQuestion(4, 1, { starter: 'single' }),
      createQuestion(5, 1, { starter: 'single' }),
    ];
    const players = createInput().players;
    const assigned = assignPlayers(questions, players, 'couple', 'players');

    expect(assigned[0]!.starterPlayerIds).not.toEqual(assigned[1]!.starterPlayerIds);
    expect(assigned[2]!.starterPlayerIds).toEqual(players.map((player) => player.id));
    expect(assigned[3]!.starterPlayerIds).toEqual(assigned[0]!.starterPlayerIds);
    expect(assigned[4]!.starterPlayerIds).toEqual(assigned[1]!.starterPlayerIds);
  });

  it('uses seeded Friends round-robin with one appearance per full round', () => {
    const players = resolvePlayers(
      Array.from({ length: 8 }, (_, index) => ({
        id: `player-${index + 1}`,
        name: `P${index + 1}`,
      })),
    );
    const questions = Array.from({ length: 16 }, (_, index) => createQuestion(index + 1, 1));
    const assigned = assignPlayers(questions, players, 'friends', 'group');
    const starters = assigned.map((question) => question.starterPlayerIds[0]!);

    expect(new Set(starters.slice(0, 8))).toEqual(new Set(players.map((player) => player.id)));
    expect(starters.slice(8)).toEqual(starters.slice(0, 8));
    expect(starters.every((starter, index) => index === 0 || starter !== starters[index - 1])).toBe(
      true,
    );
  });

  it('builds deterministic immutable plans with honest duration shortage', () => {
    const input = createInput({ durationMinutes: 20 });
    const first = buildSession(input);
    const second = buildSession(input);

    expect(first).toEqual(second);
    expect(first.targetQuestionCount).toBe(18);
    expect(first.questions).toHaveLength(10);
    expect(first.warnings).toContain('insufficient_unique_questions');
    expect(first.questions[0]).toMatchObject({
      instanceId: expect.stringContaining('night-one'),
      index: 0,
    });
    expect(first).toMatchObject({
      locale: 'en',
      contentVersion: bundle.contentVersion,
      packIds: ['warm_start'],
    });

    const originalText = bundle.questions.find(
      (question) => question.id === first.questions[0]!.question.id,
    )!.text;
    first.questions[0]!.question.text = 'Changed snapshot';
    expect(
      bundle.questions.find((question) => question.id === first.questions[0]!.question.id)!.text,
    ).toBe(originalText);
  });

  it('uses oldest recent questions only when fresh content cannot fill the target', () => {
    const now = Date.UTC(2026, 7, 14);
    const questions = Array.from({ length: 12 }, (_, index) => createQuestion(index + 1, 1));
    const customBundle = createBundle(questions);
    const seenHistory = questions.slice(0, 4).map((question, index) => ({
      questionId: question.id,
      intentKey: question.intentKey,
      seenAt: now - (index + 1) * 86_400_000,
    }));
    const plan = buildSession(
      createInput({ bundle: customBundle, packIds: ['session_test'], seenHistory, now }),
    );
    const selectedIds = new Set(plan.questions.map(({ question }) => question.id));

    expect(plan.questions).toHaveLength(10);
    expect(selectedIds.size).toBe(10);
    expect(selectedIds.has(questions[3]!.id)).toBe(true);
    expect(selectedIds.has(questions[2]!.id)).toBe(true);
    expect(selectedIds.has(questions[0]!.id)).toBe(false);
    expect(selectedIds.has(questions[1]!.id)).toBe(false);
  });

  it.each([10, 20, 30] as const)('uses the %s-minute target', (durationMinutes) => {
    const expected = { 10: 10, 20: 18, 30: 26 }[durationMinutes];
    expect(buildSession(createInput({ durationMinutes })).targetQuestionCount).toBe(expected);
  });
});
