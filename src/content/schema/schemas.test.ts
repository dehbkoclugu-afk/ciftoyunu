import { localizedQuestionSchema, questionIntentSchema, questionPackSchema } from './schemas';

const validIntent = {
  id: 'qi_warm_start_0001',
  intentKey: 'daily.small_ritual',
  mode: ['couple'],
  packIds: ['warm_start'],
  topicTags: ['daily-life'],
  relationshipStages: ['any'],
  intensity: 1,
  maturity: 'general',
  interactionType: 'open',
  starter: 'both',
  safetyTags: [],
  sourceClass: 'original',
  status: 'approved',
  version: 1,
};

describe('content schemas', () => {
  it('accepts a valid canonical intent', () => {
    expect(questionIntentSchema.parse(validIntent)).toEqual(validIntent);
  });

  it('rejects malformed stable IDs and uncontrolled topic tags', () => {
    expect(
      questionIntentSchema.safeParse({
        ...validIntent,
        id: 'question-1',
        topicTags: ['made-up-topic'],
      }).success,
    ).toBe(false);
  });

  it('requires a valid pack age and ordered intensity range', () => {
    const basePack = {
      id: 'warm_start',
      mode: 'couple',
      category: 'warm-up',
      premium: false,
      seasonal: false,
      requiredAge: 13,
      minimumQuestions: 10,
      intensityRange: [1, 2],
      allowedLocales: ['en'],
      artworkId: 'art_warm_start',
      sortOrder: 1,
      status: 'active',
    };

    expect(questionPackSchema.safeParse(basePack).success).toBe(true);
    expect(questionPackSchema.safeParse({ ...basePack, intensityRange: [4, 2] }).success).toBe(
      false,
    );
  });

  it('validates approved localization metadata', () => {
    const localization = {
      questionId: 'qi_warm_start_0001',
      locale: 'en',
      text: 'What small ritual makes an ordinary day feel special?',
      translatorId: 'original_en',
      nativeReviewerId: 'editorial_en_v1',
      safetyReviewerId: 'safety_en_v1',
      status: 'approved',
      updatedAt: '2026-08-14T00:00:00.000Z',
    };

    expect(localizedQuestionSchema.safeParse(localization).success).toBe(true);
    expect(
      localizedQuestionSchema.safeParse({ ...localization, updatedAt: 'yesterday' }).success,
    ).toBe(false);
  });
});
