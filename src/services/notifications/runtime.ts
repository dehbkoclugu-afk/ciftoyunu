import { Platform } from 'react-native';

import { DAILY_NOTIFICATION_ID } from './expoAdapter';
import type {
  NotificationAdapter,
  NotificationPermission,
  NotificationResponseData,
} from './types';

export type ReminderResult =
  { status: 'scheduled'; identifier: string } | { status: NotificationPermission | 'error' };

export function parseReminderTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null;
}

function permissionState(value: {
  granted: boolean;
  canAskAgain: boolean;
}): NotificationPermission {
  if (value.granted) return 'granted';
  return value.canAskAgain ? 'denied' : 'blocked';
}

export async function scheduleDailyReminder(
  adapter: NotificationAdapter,
  time: string,
): Promise<ReminderResult> {
  const parsed = parseReminderTime(time);
  if (!parsed || Platform.OS === 'web') return { status: 'unavailable' };
  try {
    await adapter.prepareChannel();
    let permission = await adapter.getPermission();
    if (!permission.granted && permission.canAskAgain)
      permission = await adapter.requestPermission();
    const state = permissionState(permission);
    if (state !== 'granted') return { status: state };
    await adapter.cancel(DAILY_NOTIFICATION_ID);
    const identifier = await adapter.scheduleDaily(parsed.hour, parsed.minute);
    return { status: 'scheduled', identifier };
  } catch {
    return { status: 'error' };
  }
}

export async function cancelDailyReminder(adapter: NotificationAdapter): Promise<boolean> {
  try {
    await adapter.cancel(DAILY_NOTIFICATION_ID);
    return true;
  } catch {
    return false;
  }
}

export function destinationForNotification(data: NotificationResponseData | null): '/daily' | null {
  return data?.destination === 'daily' ? '/daily' : null;
}
