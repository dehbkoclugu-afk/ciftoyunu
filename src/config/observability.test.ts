import { resolveObservabilityRuntimeConfig } from './observability';

describe('resolveObservabilityRuntimeConfig', () => {
  it('accepts complete HTTPS provider configuration', () => {
    expect(
      resolveObservabilityRuntimeConfig({
        postHogApiKey: 'ph_test',
        postHogHost: 'https://eu.i.posthog.com',
        sentryDsn: 'https://key@sentry.example/1',
      }),
    ).toEqual({
      postHog: { apiKey: 'ph_test', host: 'https://eu.i.posthog.com' },
      sentryDsn: 'https://key@sentry.example/1',
    });
  });

  it('disables incomplete or insecure analytics configuration', () => {
    expect(resolveObservabilityRuntimeConfig({ postHogApiKey: 'ph_test' }).postHog).toBeUndefined();
    expect(
      resolveObservabilityRuntimeConfig({ postHogApiKey: 'ph_test', postHogHost: 'http://host' })
        .postHog,
    ).toBeUndefined();
  });
});
