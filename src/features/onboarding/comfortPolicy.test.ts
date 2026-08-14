import { resolveComfortSelection } from './comfortPolicy';

describe('resolveComfortSelection', () => {
  it('keeps mature content off unless age is confirmed', () => {
    expect(resolveComfortSelection('spicy', false)).toEqual({
      comfortLevel: 'spicy',
      matureContentEnabled: false,
    });
  });

  it('enables mature content only for confirmed spicy selection', () => {
    expect(resolveComfortSelection('spicy', true)).toEqual({
      comfortLevel: 'spicy',
      matureContentEnabled: true,
    });
    expect(resolveComfortSelection('open', true).matureContentEnabled).toBe(false);
  });
});
