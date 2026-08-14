export const SETTINGS_KEY = 'duo:v1:settings';
export const SETTINGS_VERSION = 1;
export const PLAYER_SETUP_KEY = 'duo:v1:player-setup';
export const PLAYER_SETUP_VERSION = 1;
export const SEEN_HISTORY_KEY = 'duo:v1:seen-history';
export const SEEN_HISTORY_VERSION = 1;

export function getSettingsQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':settings';
}

export function getPlayerSetupQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':player-setup';
}

export function getSeenHistoryQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':seen-history';
}
