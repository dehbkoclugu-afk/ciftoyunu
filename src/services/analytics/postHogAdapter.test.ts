import PostHog from 'posthog-react-native';

import { createPostHogAdapter } from './postHogAdapter';

jest.mock('posthog-react-native', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    capture: jest.fn(),
    flush: jest.fn(),
    identify: jest.fn(),
    shutdown: jest.fn(),
  })),
}));

describe('PostHog analytics adapter', () => {
  it('disables automatic collection and person profiles', () => {
    createPostHogAdapter('ph_test', 'https://eu.i.posthog.com');
    expect(PostHog).toHaveBeenCalledWith(
      'ph_test',
      expect.objectContaining({
        captureAppLifecycleEvents: false,
        capturePushNotificationOpened: false,
        capturePushNotificationSubscriptions: false,
        enableSessionReplay: false,
        errorTracking: { autocapture: false },
        personProfiles: 'never',
        setDefaultPersonProperties: false,
      }),
    );
  });
});
