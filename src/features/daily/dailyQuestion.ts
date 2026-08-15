import type { ContentBundle, RuntimeQuestion } from '@/content/schema/schemas';

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function eligibleDailyQuestions(bundle: ContentBundle): RuntimeQuestion[] {
  const freePackIds = new Set(bundle.packs.filter((pack) => !pack.premium).map((pack) => pack.id));
  return bundle.questions
    .filter(
      (question) =>
        question.maturity === 'general' && question.packIds.some((id) => freePackIds.has(id)),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function selectDailyQuestion(bundle: ContentBundle, date: Date): RuntimeQuestion | null {
  const eligible = eligibleDailyQuestions(bundle);
  if (eligible.length === 0) return null;
  return eligible[stableIndex(`${bundle.locale}:${localDateKey(date)}`, eligible.length)] ?? null;
}
