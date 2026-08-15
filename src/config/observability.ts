import Constants from 'expo-constants';

export type ObservabilityRuntimeConfig = {
  postHog?: { apiKey: string; host: string };
  sentryDsn?: string;
};

type ObservabilityExtra = {
  postHogApiKey?: unknown;
  postHogHost?: unknown;
  sentryDsn?: unknown;
};

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function resolveObservabilityRuntimeConfig(
  extra: ObservabilityExtra = {},
): ObservabilityRuntimeConfig {
  const apiKey = nonEmpty(extra.postHogApiKey);
  const host = nonEmpty(extra.postHogHost);
  const sentryDsn = nonEmpty(extra.sentryDsn);
  const postHog = apiKey && host?.startsWith('https://') ? { apiKey, host } : undefined;

  return { ...(postHog ? { postHog } : {}), ...(sentryDsn ? { sentryDsn } : {}) };
}

export function getObservabilityRuntimeConfig(): ObservabilityRuntimeConfig {
  return resolveObservabilityRuntimeConfig(Constants.expoConfig?.extra ?? {});
}
