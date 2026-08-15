import { experimentKeys, experimentRegistry, type ExperimentKey } from './registry';

function stableBucket(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function getDeterministicVariant(
  key: string,
  anonymousId: string,
  control: string,
  variant: string,
): string {
  return stableBucket(`${key}:${anonymousId}`) < 0.5 ? control : variant;
}

export function getExperimentAssignment(key: ExperimentKey, anonymousId: string): string {
  const definition = experimentRegistry[key];
  if (!definition.enabled) return definition.control;
  return getDeterministicVariant(key, anonymousId, definition.control, definition.variant);
}

export function getExperimentAssignments(anonymousId: string): string[] {
  return experimentKeys.map((key) => `${key}:${getExperimentAssignment(key, anonymousId)}`);
}
