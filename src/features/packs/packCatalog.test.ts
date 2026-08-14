import { loadEmbeddedContent } from '@/content/loader';

import { buildPackCatalog, getAvailablePackFilters } from './packCatalog';

const bundle = loadEmbeddedContent('en')!;
const coupleInput = {
  mode: 'couple' as const,
  ageConfirmed18: false,
  comfortLevel: 'open' as const,
  filter: 'all' as const,
};

describe('pack catalog', () => {
  it('filters by mode while including packs for both modes', () => {
    expect(buildPackCatalog(bundle, coupleInput).map((item) => item.id)).toEqual([
      'warm_start',
      'laugh_together',
      'deep_night',
      'appreciation',
    ]);
    expect(
      buildPackCatalog(bundle, { ...coupleInput, mode: 'friends' }).map((item) => item.id),
    ).toEqual(['laugh_together', 'friends_easy']);
  });

  it('keeps premium state visible and derives real counts, duration, and samples', () => {
    const deep = buildPackCatalog(bundle, coupleInput).find((item) => item.id === 'deep_night');

    expect(deep).toMatchObject({
      premium: true,
      questionCount: 10,
      durationMinutes: 10,
      intensityRange: [3, 4],
    });
    expect(deep?.sampleQuestions).toHaveLength(2);
  });

  it('requires confirmed spicy comfort for age-18 or mature packs', () => {
    const matureBundle = {
      ...bundle,
      packs: bundle.packs.map((pack) =>
        pack.id === 'deep_night'
          ? { ...pack, requiredAge: 18 as const, category: 'mature' as const }
          : pack,
      ),
    };

    expect(buildPackCatalog(matureBundle, coupleInput).map((item) => item.id)).not.toContain(
      'deep_night',
    );
    expect(
      buildPackCatalog(matureBundle, {
        ...coupleInput,
        ageConfirmed18: true,
        comfortLevel: 'spicy',
      }).map((item) => item.id),
    ).toContain('deep_night');
  });

  it.each([
    ['free', ['warm_start', 'laugh_together', 'appreciation']],
    ['fun', ['laugh_together']],
    ['deep', ['deep_night']],
    ['relationship', ['warm_start', 'deep_night', 'appreciation']],
    ['spicy', []],
    ['friends', []],
  ] as const)('applies the %s filter', (filter, expected) => {
    expect(buildPackCatalog(bundle, { ...coupleInput, filter }).map((item) => item.id)).toEqual(
      expected,
    );
  });

  it('exposes the fixed product filter order', () => {
    expect(getAvailablePackFilters()).toEqual([
      'all',
      'free',
      'fun',
      'deep',
      'relationship',
      'spicy',
      'friends',
    ]);
  });
});
