import type { AnalyticsAdapter, AnalyticsContext, AnalyticsProperties } from './types';
import type { AnalyticsEventName } from './events';

export type CapturedAnalyticsEvent = {
  event: AnalyticsEventName;
  properties: AnalyticsContext & AnalyticsProperties;
};

export function createMemoryAnalyticsAdapter(): AnalyticsAdapter & {
  events: CapturedAnalyticsEvent[];
  identifiedIds: string[];
} {
  const events: CapturedAnalyticsEvent[] = [];
  const identifiedIds: string[] = [];
  return {
    events,
    identifiedIds,
    identify: (id) => {
      identifiedIds.push(id);
    },
    capture: (event, properties) => {
      events.push({ event, properties });
    },
  };
}
