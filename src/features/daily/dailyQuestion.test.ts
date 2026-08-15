import { loadEmbeddedContent } from '@/content/loader';

import { eligibleDailyQuestions, localDateKey, selectDailyQuestion } from './dailyQuestion';

const bundle = loadEmbeddedContent('en')!;

describe('daily question selection', () => {
  it('is stable for a locale and local calendar day', () => {
    const morning = new Date(2026, 7, 15, 8);
    const evening = new Date(2026, 7, 15, 22);
    expect(localDateKey(morning)).toBe('2026-08-15');
    expect(selectDailyQuestion(bundle, morning)?.id).toBe(selectDailyQuestion(bundle, evening)?.id);
  });

  it('moves across a sequence of days', () => {
    const ids = Array.from(
      { length: 7 },
      (_, day) => selectDailyQuestion(bundle, new Date(2026, 7, 15 + day))?.id,
    );
    expect(new Set(ids).size).toBeGreaterThan(1);
  });

  it('only uses general questions from free packs', () => {
    const freeIds = new Set(bundle.packs.filter((pack) => !pack.premium).map((pack) => pack.id));
    expect(eligibleDailyQuestions(bundle)).not.toHaveLength(0);
    for (const question of eligibleDailyQuestions(bundle)) {
      expect(question.maturity).toBe('general');
      expect(question.packIds.some((id) => freeIds.has(id))).toBe(true);
    }
  });

  it('returns null when no eligible content exists', () => {
    expect(selectDailyQuestion({ ...bundle, questions: [] }, new Date())).toBeNull();
  });
});
