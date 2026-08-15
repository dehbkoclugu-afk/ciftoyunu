import {
  getDeterministicVariant,
  getExperimentAssignment,
  getExperimentAssignments,
} from './assignments';
import { experimentKeys } from './registry';

describe('experiment assignments', () => {
  it('returns every registered experiment in a stable order', () => {
    const first = getExperimentAssignments('device-1');
    expect(first).toHaveLength(experimentKeys.length);
    expect(getExperimentAssignments('device-1')).toEqual(first);
  });

  it('falls back to control while production definitions are disabled', () => {
    expect(getExperimentAssignment('paywall.freeCards60vs120', 'device-1')).toBe('60');
    expect(getExperimentAssignment('onboarding.showSampleCard', 'device-2')).toBe('hidden');
  });

  it('buckets enabled definitions deterministically across both variants', () => {
    const assignments = Array.from({ length: 100 }, (_, index) =>
      getDeterministicVariant('test.key', `device-${index}`, 'control', 'variant'),
    );
    expect(new Set(assignments)).toEqual(new Set(['control', 'variant']));
    expect(getDeterministicVariant('test.key', 'device-42', 'control', 'variant')).toBe(
      getDeterministicVariant('test.key', 'device-42', 'control', 'variant'),
    );
  });
});
