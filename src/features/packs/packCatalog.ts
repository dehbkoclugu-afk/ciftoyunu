import type {
  ContentBundle,
  LocalizedPack,
  QuestionPack,
  RuntimeQuestion,
} from '@/content/schema/schemas';
import type { GameMode } from '@/features/player-setup/playerSetup';

export const packFilters = [
  'all',
  'free',
  'fun',
  'deep',
  'relationship',
  'spicy',
  'friends',
] as const;

export type PackFilter = (typeof packFilters)[number];

export type PackCatalogInput = {
  mode: GameMode;
  ageConfirmed18: boolean;
  comfortLevel: 'light' | 'open' | 'spicy';
  filter: PackFilter;
};

export type PackCatalogItem = QuestionPack &
  Omit<LocalizedPack, 'packId' | 'locale' | 'sampleQuestionIds'> & {
    questionCount: number;
    durationMinutes: number;
    sampleQuestions: RuntimeQuestion[];
  };

const relationshipCategories = new Set<QuestionPack['category']>([
  'warm-up',
  'know-me',
  'deep',
  'appreciation',
  'future',
  'practical',
  'trust',
  'what-if',
  'stories',
]);

function matchesFilter(pack: QuestionPack, filter: PackFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'free') return !pack.premium;
  if (filter === 'fun') return pack.category === 'fun';
  if (filter === 'deep') return pack.category === 'deep';
  if (filter === 'relationship') return relationshipCategories.has(pack.category);
  if (filter === 'spicy') return pack.category === 'mature';
  return pack.category === 'friends';
}

export function getAvailablePackFilters(): readonly PackFilter[] {
  return packFilters;
}

export function buildPackCatalog(
  bundle: ContentBundle,
  input: PackCatalogInput,
): PackCatalogItem[] {
  const copyByPack = new Map(bundle.packCopy.map((copy) => [copy.packId, copy]));
  const questionsById = new Map(bundle.questions.map((question) => [question.id, question]));

  return bundle.packs
    .filter((pack) => pack.mode === 'both' || pack.mode === input.mode)
    .filter(
      (pack) => pack.requiredAge < 18 || (input.ageConfirmed18 && input.comfortLevel === 'spicy'),
    )
    .filter((pack) => matchesFilter(pack, input.filter))
    .flatMap((pack) => {
      const copy = copyByPack.get(pack.id);
      if (!copy) return [];
      const questionCount = bundle.questions.filter((question) =>
        question.packIds.includes(pack.id),
      ).length;
      const sampleQuestions = copy.sampleQuestionIds.flatMap((id) => {
        const question = questionsById.get(id);
        return question ? [question] : [];
      });
      const {
        packId: _packId,
        locale: _locale,
        sampleQuestionIds: _samples,
        ...presentation
      } = copy;

      return [
        {
          ...pack,
          ...presentation,
          questionCount,
          durationMinutes: Math.max(10, Math.ceil(questionCount)),
          sampleQuestions,
        },
      ];
    })
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id));
}
