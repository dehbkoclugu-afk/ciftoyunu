export const SETTINGS_KEY = 'duo:v1:settings';
export const SETTINGS_VERSION = 1;

export function getSettingsQuarantineKey(timestamp: number): string {
  return 'duo:quarantine:' + timestamp + ':settings';
}
