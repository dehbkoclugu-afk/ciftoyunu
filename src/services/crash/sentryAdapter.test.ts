import * as Sentry from '@sentry/react-native';

import { createSentryAdapter } from './sentryAdapter';

describe('Sentry crash adapter', () => {
  it('initializes without PII, tracing, replay, breadcrumbs, or raw error messages', () => {
    createSentryAdapter('https://key@sentry.example/1');
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        sendDefaultPii: false,
        tracesSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        replaysSessionSampleRate: 0,
        maxBreadcrumbs: 0,
      }),
    );

    const options = (Sentry.init as jest.Mock).mock.calls.at(-1)?.[0];
    const event = {
      message: 'private value',
      user: { id: 'private' },
      request: { cookies: 'private', data: 'private', headers: { authorization: 'private' } },
      exception: { values: [{ type: 'Error', value: 'private value' }] },
    };
    expect(options.beforeBreadcrumb({ message: 'private value' })).toBeNull();
    expect(options.beforeSend(event)).toEqual({
      request: {},
      exception: { values: [{ type: 'Error', value: 'Application error' }] },
    });
  });
});
