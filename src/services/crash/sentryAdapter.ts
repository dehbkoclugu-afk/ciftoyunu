import * as Sentry from '@sentry/react-native';

import type { CrashAdapter } from './types';

export function createSentryAdapter(dsn: string): CrashAdapter {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeBreadcrumb: () => null,
    beforeSend: (event) => {
      delete event.user;
      delete event.message;
      event.exception?.values?.forEach((value) => {
        if (value.value) value.value = 'Application error';
      });
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
      }
      return event;
    },
  });

  return {
    captureException: (error, context = {}) => {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
        Sentry.captureException(error);
      });
    },
    close: () => Sentry.close().then(() => undefined),
  };
}
