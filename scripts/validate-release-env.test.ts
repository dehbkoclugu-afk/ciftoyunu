import { validateReleaseEnv } from './validate-release-env';

describe('release environment validation', () => {
  it('allows non-production builds without purchase configuration', () => {
    expect(() => validateReleaseEnv({ EAS_BUILD_PROFILE: 'preview' })).not.toThrow();
  });

  it('lists every missing production value without exposing configured values', () => {
    expect(() =>
      validateReleaseEnv({
        EAS_BUILD_PROFILE: 'production',
        REVENUECAT_IOS_API_KEY: 'appl_private-in-log',
      }),
    ).toThrow(
      'Production environment is missing: REVENUECAT_ANDROID_API_KEY, APP_TERMS_URL, APP_PRIVACY_URL',
    );
  });

  it('accepts a complete production environment', () => {
    expect(() =>
      validateReleaseEnv({
        EAS_BUILD_PROFILE: 'production',
        REVENUECAT_IOS_API_KEY: 'appl_x',
        REVENUECAT_ANDROID_API_KEY: 'goog_x',
        APP_TERMS_URL: 'https://example.com/terms',
        APP_PRIVACY_URL: 'https://example.com/privacy',
      }),
    ).not.toThrow();
  });
});
