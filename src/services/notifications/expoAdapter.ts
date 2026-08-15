import * as Notifications from 'expo-notifications';

import type { NotificationAdapter, NotificationResponseData } from './types';

export const DAILY_NOTIFICATION_ID = 'duo-daily-reminder';

export function configureNotificationPresentation(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function createExpoNotificationAdapter(): NotificationAdapter {
  return {
    getPermission: async () => {
      const result = await Notifications.getPermissionsAsync();
      return { granted: result.granted, canAskAgain: result.canAskAgain };
    },
    requestPermission: async () => {
      const result = await Notifications.requestPermissionsAsync();
      return { granted: result.granted, canAskAgain: result.canAskAgain };
    },
    prepareChannel: () =>
      Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily question reminders',
        description: 'A quiet reminder for the question you chose to receive.',
        importance: Notifications.AndroidImportance.DEFAULT,
      }).then(() => undefined),
    cancel: (identifier) => Notifications.cancelScheduledNotificationAsync(identifier),
    scheduleDaily: (hour, minute) =>
      Notifications.scheduleNotificationAsync({
        identifier: DAILY_NOTIFICATION_ID,
        content: {
          title: 'A question is ready for your table.',
          body: 'Open Project Duo when you have a moment together.',
          data: { destination: 'daily' },
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'daily-reminders',
        },
      }),
    getLastResponseData: () =>
      (Notifications.getLastNotificationResponse()?.notification.request.content.data as
        NotificationResponseData | undefined) ?? null,
    subscribeToResponses: (listener) => {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) =>
        listener(response.notification.request.content.data ?? {}),
      );
      return () => subscription.remove();
    },
  };
}
