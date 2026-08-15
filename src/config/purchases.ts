import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type PurchaseUnavailableReason = 'missing_api_key' | 'unsupported_platform';

export type PurchaseRuntimeConfig =
  | {
      available: true;
      apiKey: string;
      termsUrl?: string;
      privacyUrl?: string;
    }
  | {
      available: false;
      reason: PurchaseUnavailableReason;
      termsUrl?: string;
      privacyUrl?: string;
    };

type PurchaseExtra = {
  revenueCatIosApiKey?: unknown;
  revenueCatAndroidApiKey?: unknown;
  termsUrl?: unknown;
  privacyUrl?: unknown;
};

function nonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function resolvePurchaseRuntimeConfig(
  platform: string,
  extra: PurchaseExtra = {},
): PurchaseRuntimeConfig {
  const termsUrl = nonEmpty(extra.termsUrl);
  const privacyUrl = nonEmpty(extra.privacyUrl);
  const legal = { ...(termsUrl ? { termsUrl } : {}), ...(privacyUrl ? { privacyUrl } : {}) };

  if (platform !== 'ios' && platform !== 'android') {
    return { available: false, reason: 'unsupported_platform', ...legal };
  }

  const apiKey = nonEmpty(
    platform === 'ios' ? extra.revenueCatIosApiKey : extra.revenueCatAndroidApiKey,
  );
  return apiKey
    ? { available: true, apiKey, ...legal }
    : { available: false, reason: 'missing_api_key', ...legal };
}

export function getPurchaseRuntimeConfig(): PurchaseRuntimeConfig {
  return resolvePurchaseRuntimeConfig(Platform.OS, Constants.expoConfig?.extra ?? {});
}
