import {
  createDefaultPlayers,
  findDuplicatePlayerNames,
  reshapePlayersForMode,
  resolvePlayers,
} from './playerSetup';

describe('player setup rules', () => {
  it('creates exactly two stable player drafts for either mode', () => {
    expect(createDefaultPlayers('couple')).toEqual([
      { id: 'player-1', name: '' },
      { id: 'player-2', name: '' },
    ]);
    expect(createDefaultPlayers('friends')).toHaveLength(2);
  });

  it('reshapes Couple to two and Friends to a bounded roster', () => {
    const players = Array.from({ length: 10 }, (_, index) => ({
      id: `player-${index + 1}`,
      name: `Person ${index + 1}`,
    }));

    expect(reshapePlayersForMode('couple', players)).toHaveLength(2);
    expect(reshapePlayersForMode('friends', players)).toHaveLength(8);
    expect(reshapePlayersForMode('friends', [])).toHaveLength(2);
  });

  it('trims names and resolves blanks to deterministic fallbacks', () => {
    expect(
      resolvePlayers([
        { id: 'player-1', name: '  Maya ' },
        { id: 'player-2', name: ' ' },
      ]),
    ).toEqual([
      { id: 'player-1', displayName: 'Maya' },
      { id: 'player-2', displayName: 'Player 2' },
    ]);
  });

  it('finds trimmed case-insensitive duplicates without blocking blanks', () => {
    expect(
      findDuplicatePlayerNames([
        { id: 'player-1', name: 'Maya' },
        { id: 'player-2', name: ' maya ' },
        { id: 'player-3', name: '' },
      ]),
    ).toEqual(['Maya']);
  });
});
