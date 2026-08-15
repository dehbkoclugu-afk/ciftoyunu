const requiredProductionValues = [
  'REVENUECAT_IOS_API_KEY',
  'REVENUECAT_ANDROID_API_KEY',
  'APP_TERMS_URL',
  'APP_PRIVACY_URL',
  'POSTHOG_API_KEY',
  'POSTHOG_HOST',
  'SENTRY_DSN',
] as const;

export function validateReleaseEnv(env: Readonly<Record<string, string | undefined>>): void {
  if (env.EAS_BUILD_PROFILE !== 'production') return;

  const missing = requiredProductionValues.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production environment is missing: ${missing.join(', ')}`);
  }

  if (!env.POSTHOG_HOST?.startsWith('https://')) {
    throw new Error('Production POSTHOG_HOST must use HTTPS.');
  }
}

if (process.env.NODE_ENV !== 'test') validateReleaseEnv(process.env);
