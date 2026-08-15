import PostHog from 'posthog-react-native';

import type { AnalyticsAdapter } from './types';

export function createPostHogAdapter(apiKey: string, host: string): AnalyticsAdapter {
  const client = new PostHog(apiKey, {
    host,
    captureAppLifecycleEvents: false,
    capturePushNotificationOpened: false,
    capturePushNotificationSubscriptions: false,
    enableSessionReplay: false,
    errorTracking: { autocapture: false },
    persistence: 'file',
    personProfiles: 'never',
    setDefaultPersonProperties: false,
  });

  return {
    identify: (id) => client.identify(id),
    capture: (event, properties) => client.capture(event, properties),
    flush: () => client.flush(),
    shutdown: () => client.shutdown(),
  };
}
