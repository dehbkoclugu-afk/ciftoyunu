import { useEffect } from 'react';

import { track } from '@/services/analytics/runtime';

import { configureNotificationPresentation, createExpoNotificationAdapter } from './expoAdapter';
import { destinationForNotification } from './runtime';

const adapter = createExpoNotificationAdapter();

export function useNotificationRouting(navigate: (destination: '/daily') => void): void {
  useEffect(() => {
    try {
      configureNotificationPresentation();
    } catch {
      return undefined;
    }
    const redirect = (data: Readonly<Record<string, unknown>>, source: string) => {
      const destination = destinationForNotification(data);
      if (!destination) return;
      track('notification_opened', { destination: 'daily', source });
      navigate(destination);
    };

    try {
      const initial = adapter.getLastResponseData();
      if (initial) redirect(initial, 'initial');
      return adapter.subscribeToResponses((data) => redirect(data, 'response'));
    } catch {
      return undefined;
    }
  }, [navigate]);
}
