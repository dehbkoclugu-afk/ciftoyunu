import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import { getObservabilityRuntimeConfig } from '@/config/observability';
import { getExperimentAssignments } from '@/experiments/assignments';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSettingsStore } from '@/state/settingsStore';

import type { AnalyticsEventName } from './events';
import { createPostHogAdapter } from './postHogAdapter';
import { assertPrivacySafe } from './privacy';
import type { AnalyticsAdapter, AnalyticsContext, AnalyticsProperties } from './types';

let adapter: AnalyticsAdapter | null = null;
let anonymousId = '';

function deviceClass(): string {
  if (Device.deviceType === Device.DeviceType.TABLET) return 'tablet';
  if (Device.deviceType === Device.DeviceType.DESKTOP) return 'desktop';
  return 'phone';
}

function commonContext(): AnalyticsContext {
  const settings = useSettingsStore.getState();
  return {
    anonymous_id: anonymousId,
    app_version: Application.nativeApplicationVersion ?? 'development',
    build_number: Application.nativeBuildVersion ?? 'development',
    platform: Platform.OS,
    os_version: String(Platform.Version),
    device_class: deviceClass(),
    locale: settings.locale,
    country_storefront: getLocales()[0]?.regionCode ?? 'unknown',
    theme: settings.theme,
    entitlement: usePurchaseStore.getState().entitlement,
    experiment_assignments: getExperimentAssignments(anonymousId),
  };
}

export async function configureAnalytics(
  id: string,
  enabled: boolean,
  adapterOverride?: AnalyticsAdapter,
): Promise<void> {
  anonymousId = id;
  if (!enabled) {
    await Promise.resolve(adapter?.shutdown?.()).catch(() => undefined);
    adapter = null;
    return;
  }

  const config = getObservabilityRuntimeConfig();
  const next =
    adapterOverride ??
    (config.postHog ? createPostHogAdapter(config.postHog.apiKey, config.postHog.host) : null);
  adapter = next;
  if (adapter) await Promise.resolve(adapter.identify(id)).catch(() => undefined);
}

export function track(event: AnalyticsEventName, properties: AnalyticsProperties = {}): void {
  try {
    assertPrivacySafe(properties);
  } catch (error) {
    if (__DEV__) throw error;
    return;
  }
  if (!adapter) return;
  void Promise.resolve(adapter.capture(event, { ...commonContext(), ...properties })).catch(
    () => undefined,
  );
}

export function flushAnalytics(): Promise<void> {
  return Promise.resolve(adapter?.flush?.()).catch(() => undefined);
}
