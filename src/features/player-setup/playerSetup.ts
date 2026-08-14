export type GameMode = 'couple' | 'friends';

export type PlayerDraft = {
  id: string;
  name: string;
  emoji?: string;
};

export type Player = {
  id: string;
  displayName: string;
  emoji?: string;
};

export const MIN_PLAYERS = 2;
export const MAX_FRIEND_PLAYERS = 8;

function emptyPlayer(index: number): PlayerDraft {
  return { id: `player-${index + 1}`, name: '' };
}

export function createDefaultPlayers(_mode: GameMode): PlayerDraft[] {
  return [emptyPlayer(0), emptyPlayer(1)];
}

export function reshapePlayersForMode(mode: GameMode, players: PlayerDraft[]): PlayerDraft[] {
  const maximum = mode === 'couple' ? 2 : MAX_FRIEND_PLAYERS;
  const next = players.slice(0, maximum);
  while (next.length < MIN_PLAYERS) next.push(emptyPlayer(next.length));
  return next;
}

export function appendPlayer(players: PlayerDraft[]): PlayerDraft[] {
  if (players.length >= MAX_FRIEND_PLAYERS) return players;
  const used = new Set(players.map((player) => player.id));
  let number = 1;
  while (used.has(`player-${number}`)) number += 1;
  return [...players, { id: `player-${number}`, name: '' }];
}

export function resolvePlayers(players: PlayerDraft[]): Player[] {
  return players.map((player, index) => {
    const displayName = player.name.trim() || `Player ${index + 1}`;
    return {
      id: player.id,
      displayName,
      ...(player.emoji ? { emoji: player.emoji } : {}),
    };
  });
}

export function findDuplicatePlayerNames(players: PlayerDraft[]): string[] {
  const firstSpelling = new Map<string, string>();
  const duplicates = new Set<string>();

  for (const player of players) {
    const name = player.name.trim();
    if (!name) continue;
    const normalized = name.toLocaleLowerCase('en');
    const first = firstSpelling.get(normalized);
    if (first) duplicates.add(first);
    else firstSpelling.set(normalized, name);
  }

  return [...duplicates];
}
