import { createMemoryAnalyticsAdapter } from './memoryAdapter';
import { configureAnalytics, track } from './runtime';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.2.3',
  nativeBuildVersion: '42',
}));
jest.mock('expo-device', () => ({ DeviceType: { TABLET: 2, DESKTOP: 3 }, deviceType: 1 }));
jest.mock('expo-localization', () => ({ getLocales: () => [{ regionCode: 'TR' }] }));

describe('analytics runtime', () => {
  afterEach(async () => configureAnalytics('', false));

  it('captures a controlled event with common metadata', async () => {
    const adapter = createMemoryAnalyticsAdapter();
    await configureAnalytics('anonymous-1', true, adapter);
    track('mode_selected', { mode: 'couple' });

    expect(adapter.identifiedIds).toEqual(['anonymous-1']);
    expect(adapter.events[0]).toMatchObject({
      event: 'mode_selected',
      properties: {
        anonymous_id: 'anonymous-1',
        app_version: '1.2.3',
        country_storefront: 'TR',
        mode: 'couple',
      },
    });
  });

  it('does not capture when consent is off', async () => {
    const adapter = createMemoryAnalyticsAdapter();
    await configureAnalytics('anonymous-1', true, adapter);
    await configureAnalytics('anonymous-1', false);
    track('app_opened');
    expect(adapter.events).toHaveLength(0);
  });

  it('rejects properties that could contain private conversation data', async () => {
    await configureAnalytics('anonymous-1', true, createMemoryAnalyticsAdapter());
    expect(() => track('question_viewed', { question_text: 'private' })).toThrow(
      'not privacy-safe',
    );
  });

  it('isolates provider failures from product code', async () => {
    const failing = {
      identify: jest.fn(async () => Promise.reject(new Error('offline'))),
      capture: jest.fn(async () => Promise.reject(new Error('offline'))),
      shutdown: jest.fn(async () => Promise.reject(new Error('offline'))),
    };
    await expect(configureAnalytics('anonymous-1', true, failing)).resolves.toBeUndefined();
    expect(() => track('app_opened')).not.toThrow();
    await expect(configureAnalytics('anonymous-1', false)).resolves.toBeUndefined();
  });
});
