import type { AnalyticsEventName } from './events';

export type AnalyticsValue = string | number | boolean | null | string[];
export type AnalyticsProperties = Readonly<Record<string, AnalyticsValue>>;

export type AnalyticsContext = {
  anonymous_id: string;
  app_version: string;
  build_number: string;
  platform: string;
  os_version: string;
  device_class: string;
  locale: string;
  country_storefront: string;
  theme: string;
  entitlement: string;
  experiment_assignments: string[];
};

export type AnalyticsAdapter = {
  identify: (anonymousId: string) => Promise<void> | void;
  capture: (
    event: AnalyticsEventName,
    properties: AnalyticsContext & AnalyticsProperties,
  ) => Promise<void> | void;
  flush?: () => Promise<void> | void;
  shutdown?: () => Promise<void> | void;
};
