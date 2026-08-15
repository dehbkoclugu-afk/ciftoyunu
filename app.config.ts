import type { ConfigContext, ExpoConfig } from 'expo/config';

const requiredProductionValues = [
  'REVENUECAT_IOS_API_KEY',
  'REVENUECAT_ANDROID_API_KEY',
  'APP_TERMS_URL',
  'APP_PRIVACY_URL',
  'POSTHOG_API_KEY',
  'POSTHOG_HOST',
  'SENTRY_DSN',
] as const;

function validateProductionConfig(): void {
  if (process.env.EAS_BUILD_PROFILE !== 'production') return;
  const missing = requiredProductionValues.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production environment is missing: ${missing.join(', ')}`);
  }
  if (!process.env.POSTHOG_HOST?.startsWith('https://')) {
    throw new Error('Production POSTHOG_HOST must use HTTPS.');
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  validateProductionConfig();

  return {
    ...config,
    name: process.env.APP_NAME ?? 'Project Duo',
    slug: 'project-duo',
    scheme: 'projectduo',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.ceystudio.projectduo',
      supportsTablet: true,
    },
    android: {
      package: 'com.ceystudio.projectduo',
      predictiveBackGestureEnabled: true,
    },
    web: {
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      '@sentry/react-native/expo',
      ['expo-notifications', { color: '#7357E8', defaultChannel: 'daily-reminders' }],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      appName: process.env.APP_NAME ?? 'Project Duo',
      revenueCatIosApiKey: process.env.REVENUECAT_IOS_API_KEY,
      revenueCatAndroidApiKey: process.env.REVENUECAT_ANDROID_API_KEY,
      termsUrl: process.env.APP_TERMS_URL,
      privacyUrl: process.env.APP_PRIVACY_URL,
      postHogApiKey: process.env.POSTHOG_API_KEY,
      postHogHost: process.env.POSTHOG_HOST,
      sentryDsn: process.env.SENTRY_DSN,
    },
  };
};
