import { captureException, configureCrashReporting } from './runtime';
import type { CrashAdapter } from './types';

describe('crash reporting runtime', () => {
  afterEach(async () => configureCrashReporting(false));

  it('captures only while consent is enabled', async () => {
    const adapter: CrashAdapter = { captureException: jest.fn() };
    await configureCrashReporting(true, adapter);
    captureException(new Error('safe'), { boundary: 'root' });
    expect(adapter.captureException).toHaveBeenCalledTimes(1);

    await configureCrashReporting(false);
    captureException(new Error('ignored'));
    expect(adapter.captureException).toHaveBeenCalledTimes(1);
  });

  it('isolates provider capture and shutdown failures', async () => {
    const adapter: CrashAdapter = {
      captureException: () => {
        throw new Error('provider failed');
      },
      close: async () => Promise.reject(new Error('provider failed')),
    };
    await configureCrashReporting(true, adapter);
    expect(() => captureException(new Error('product failure'))).not.toThrow();
    await expect(configureCrashReporting(false)).resolves.toBeUndefined();
  });
});
