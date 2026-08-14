import type { ComfortLevel } from '@/storage/migrations';

export function resolveComfortSelection(comfortLevel: ComfortLevel, ageConfirmed18: boolean) {
  return {
    comfortLevel,
    matureContentEnabled: comfortLevel === 'spicy' && ageConfirmed18,
  };
}
