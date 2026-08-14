import type { EditorialSource } from './schema/schemas';
import { validateEditorialSource } from './validation';

function createSource(): EditorialSource {
  return {
    schemaVersion: 1,
    contentVersion: '2026.08.1',
    minimumAppVersion: '0.1.0',
    approvedAt: '2026-08-14T00:00:00.000Z',
    locale: 'en',
    packs: [
      {
        id: 'warm_start',
        mode: 'couple',
        category: 'warm-up',
        premium: false,
        seasonal: false,
        requiredAge: 13,
        minimumQuestions: 1,
        intensityRange: [1, 2],
        allowedLocales: ['en'],
        artworkId: 'art_warm_start',
        sortOrder: 1,
        status: 'active',
      },
    ],
    localizedPacks: [
      {
        packId: 'warm_start',
        locale: 'en',
        title: 'Warm Start',
        promise: 'Ease into a better conversation.',
        description: 'Gentle questions for settling in together.',
        audience: 'Couples who want a relaxed start.',
        contentWarnings: [],
        sampleQuestionIds: ['qi_warm_start_0001', 'qi_warm_start_0001'],
      },
    ],
    intents: [
      {
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
      },
    ],
    localizations: [
      {
        questionId: 'qi_warm_start_0001',
        locale: 'en',
        text: 'What small ritual makes an ordinary day feel special?',
        translatorId: 'original_en',
        nativeReviewerId: 'editorial_en_v1',
        safetyReviewerId: 'safety_en_v1',
        status: 'approved',
        updatedAt: '2026-08-14T00:00:00.000Z',
      },
    ],
  };
}

describe('validateEditorialSource', () => {
  it('accepts a complete approved source', () => {
    expect(validateEditorialSource(createSource())).toEqual([]);
  });

  it('reports missing pack and localization references', () => {
    const source = createSource();
    source.intents[0]!.packIds = ['missing_pack'];
    source.localizations[0]!.questionId = 'qi_missing_9999';

    expect(validateEditorialSource(source).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['missing_pack', 'missing_intent', 'missing_approved_localization']),
    );
  });

  it('rejects placeholders and normalized duplicates', () => {
    const source = createSource();
    source.intents.push({ ...source.intents[0]!, id: 'qi_warm_start_0002' });
    source.localizations[0]!.text = 'What makes {{name}} feel special?';
    source.localizations.push({
      ...source.localizations[0]!,
      questionId: 'qi_warm_start_0002',
      text: 'What makes name feel truly special?',
    });

    const codes = validateEditorialSource(source).map((issue) => issue.code);
    expect(codes).toContain('forbidden_placeholder');
    expect(codes).toContain('near_duplicate');
  });

  it('enforces explicit-content age and review requirements', () => {
    const source = createSource();
    source.intents[0] = {
      ...source.intents[0]!,
      maturity: 'explicit',
      safetyTags: [],
    };
    delete source.localizations[0]!.safetyReviewerId;

    const codes = validateEditorialSource(source).map((issue) => issue.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'mature_pack_age',
        'missing_adult_safety_tags',
        'missing_safety_review',
      ]),
    );
  });

  it('requires one localized presentation with valid pack samples', () => {
    const missing = createSource();
    missing.localizedPacks = [];
    expect(validateEditorialSource(missing).map((issue) => issue.code)).toContain(
      'missing_pack_copy',
    );

    const duplicate = createSource();
    duplicate.localizedPacks.push({ ...duplicate.localizedPacks[0]! });
    expect(validateEditorialSource(duplicate).map((issue) => issue.code)).toContain(
      'duplicate_pack_copy',
    );

    const invalid = createSource();
    invalid.localizedPacks[0]!.sampleQuestionIds = ['qi_warm_start_0001', 'qi_missing_9999'];
    expect(validateEditorialSource(invalid).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['missing_pack_sample', 'invalid_pack_sample']),
    );
  });

  it('rejects draft markers in localized pack presentation', () => {
    const source = createSource();
    source.localizedPacks[0]!.title = 'TODO pack';

    expect(validateEditorialSource(source).map((issue) => issue.code)).toContain(
      'forbidden_pack_copy',
    );
  });
});
