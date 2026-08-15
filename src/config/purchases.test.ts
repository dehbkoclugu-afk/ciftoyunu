import { resolvePurchaseRuntimeConfig } from './purchases';

describe('purchase runtime configuration', () => {
  it('selects the platform key and trims optional legal links', () => {
    expect(
      resolvePurchaseRuntimeConfig('ios', {
        revenueCatIosApiKey: ' appl_x ',
        revenueCatAndroidApiKey: 'goog_x',
        termsUrl: ' https://example.com/terms ',
      }),
    ).toEqual({
      available: true,
      apiKey: 'appl_x',
      termsUrl: 'https://example.com/terms',
    });
  });

  it('reports a missing platform key without inventing a preview key', () => {
    expect(resolvePurchaseRuntimeConfig('android', { revenueCatIosApiKey: 'appl_x' })).toEqual({
      available: false,
      reason: 'missing_api_key',
    });
  });

  it('keeps unsupported platforms out of native purchase operations', () => {
    expect(resolvePurchaseRuntimeConfig('web', {})).toEqual({
      available: false,
      reason: 'unsupported_platform',
    });
  });
});
