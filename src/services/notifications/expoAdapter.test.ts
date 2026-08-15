import * as Notifications from 'expo-notifications';

import { createExpoNotificationAdapter, DAILY_NOTIFICATION_ID } from './expoAdapter';

describe('Expo notification adapter', () => {
  it('uses generic private-safe copy and a controlled destination', async () => {
    await createExpoNotificationAdapter().scheduleDaily(20, 0);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: DAILY_NOTIFICATION_ID,
        content: expect.objectContaining({
          title: 'A question is ready for your table.',
          data: { destination: 'daily' },
        }),
        trigger: expect.objectContaining({ hour: 20, minute: 0, channelId: 'daily-reminders' }),
      }),
    );
  });
});
