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
});
