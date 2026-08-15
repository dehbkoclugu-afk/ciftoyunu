import { getObservabilityRuntimeConfig } from '@/config/observability';

import { createSentryAdapter } from './sentryAdapter';
import type { CrashAdapter, CrashContext } from './types';

let adapter: CrashAdapter | null = null;

export async function configureCrashReporting(
  enabled: boolean,
  adapterOverride?: CrashAdapter,
): Promise<void> {
  if (!enabled) {
    await Promise.resolve(adapter?.close?.()).catch(() => undefined);
    adapter = null;
    return;
  }

  const dsn = getObservabilityRuntimeConfig().sentryDsn;
  adapter = adapterOverride ?? (dsn ? createSentryAdapter(dsn) : null);
}

export function captureException(error: unknown, context?: CrashContext): void {
  try {
    adapter?.captureException(error, context);
  } catch {
    // Diagnostics must never make the product failure worse.
  }
}
