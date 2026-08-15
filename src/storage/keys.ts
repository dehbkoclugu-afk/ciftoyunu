export const SETTINGS_KEY = 'duo:v1:settings';
export const SETTINGS_VERSION = 1;
export const PLAYER_SETUP_KEY = 'duo:v1:player-setup';
export const PLAYER_SETUP_VERSION = 1;
export const SEEN_HISTORY_KEY = 'duo:v1:seen-history';
export const SEEN_HISTORY_VERSION = 1;
export const LAST_SESSION_KEY = 'duo:v1:last-session';
export const LAST_SESSION_VERSION = 1;
export const FAVORITES_KEY = 'duo:v1:favorites';
export const FAVORITES_VERSION = 1;
export const ANONYMOUS_ID_KEY = 'duo:v1:anonymous-id';

export function getSettingsQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':settings';
}

export function getPlayerSetupQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':player-setup';
}

export function getSeenHistoryQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':seen-history';
}

export function getLastSessionQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':last-session';
}

export function getFavoritesQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':favorites';
}
