import type { NotificationAdapter } from './types';
import {
  cancelDailyReminder,
  destinationForNotification,
  parseReminderTime,
  scheduleDailyReminder,
} from './runtime';

function adapter(permission = { granted: true, canAskAgain: true }): NotificationAdapter {
  return {
    getPermission: jest.fn(async () => permission),
    requestPermission: jest.fn(async () => permission),
    prepareChannel: jest.fn(async () => undefined),
    cancel: jest.fn(async () => undefined),
    scheduleDaily: jest.fn(async () => 'duo-daily-reminder'),
    getLastResponseData: jest.fn(() => null),
    subscribeToResponses: jest.fn(() => jest.fn()),
  };
}

describe('notification runtime', () => {
  it('parses only controlled reminder times', () => {
    expect(parseReminderTime('20:00')).toEqual({ hour: 20, minute: 0 });
    expect(parseReminderTime('25:00')).toBeNull();
    expect(parseReminderTime('private')).toBeNull();
  });

  it('schedules after granted permission and replaces the stable reminder', async () => {
    const provider = adapter();
    await expect(scheduleDailyReminder(provider, '21:30')).resolves.toEqual({
      status: 'scheduled',
      identifier: 'duo-daily-reminder',
    });
    expect(provider.cancel).toHaveBeenCalledWith('duo-daily-reminder');
    expect(provider.scheduleDaily).toHaveBeenCalledWith(21, 30);
  });

  it('requests contextually and returns denied or blocked states', async () => {
    const denied = adapter({ granted: false, canAskAgain: true });
    await expect(scheduleDailyReminder(denied, '20:00')).resolves.toEqual({ status: 'denied' });
    expect(denied.requestPermission).toHaveBeenCalled();

    const blocked = adapter({ granted: false, canAskAgain: false });
    await expect(scheduleDailyReminder(blocked, '20:00')).resolves.toEqual({ status: 'blocked' });
    expect(blocked.requestPermission).not.toHaveBeenCalled();
  });

  it('isolates provider failures and rejects arbitrary routes', async () => {
    const failing = adapter();
    failing.scheduleDaily = jest.fn(async () => Promise.reject(new Error('native failure')));
    await expect(scheduleDailyReminder(failing, '20:00')).resolves.toEqual({ status: 'error' });
    expect(destinationForNotification({ destination: 'daily' })).toBe('/daily');
    expect(destinationForNotification({ destination: '/premium' })).toBeNull();
    expect(destinationForNotification({ url: 'https://example.com' })).toBeNull();
  });

  it('cancels the stable reminder without leaking provider errors', async () => {
    const provider = adapter();
    await expect(cancelDailyReminder(provider)).resolves.toBe(true);
    expect(provider.cancel).toHaveBeenCalledWith('duo-daily-reminder');
    provider.cancel = jest.fn(async () => Promise.reject(new Error('native failure')));
    await expect(cancelDailyReminder(provider)).resolves.toBe(false);
  });
});
