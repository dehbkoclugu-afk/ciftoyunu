import type { PurchaseRuntimeConfig } from '@/config/purchases';
import { PurchaseAdapterError, type PurchasesAdapter } from '@/services/purchases/types';

import { createPurchaseStore } from './purchaseStore';

jest.mock('@/services/purchases/revenueCatAdapter', () => ({
  createRevenueCatAdapter: jest.fn(),
}));

const config: PurchaseRuntimeConfig = { available: true, apiKey: 'test_key' };
const offering = {
  id: 'default',
  packages: [
    {
      id: 'annual',
      productId: 'duo_annual',
      title: 'Annual',
      description: 'Annual access',
      price: '$29.99',
      period: '1 year',
      packageType: 'annual',
      intro: '7 days free',
      recommended: true,
    },
    {
      id: 'monthly',
      productId: 'duo_monthly',
      title: 'Monthly',
      description: 'Monthly access',
      price: '$9.99',
      period: '1 month',
      packageType: 'monthly',
      intro: null,
      recommended: false,
    },
  ],
};

function adapter(patch: Partial<PurchasesAdapter> = {}): jest.Mocked<PurchasesAdapter> {
  return {
    configure: jest.fn(),
    getCustomer: jest.fn(async () => ({ entitlement: 'free' })),
    getOffering: jest.fn(async () => offering),
    purchase: jest.fn(async () => ({ entitlement: 'premium' })),
    restore: jest.fn(async () => ({ entitlement: 'free' })),
    subscribe: jest.fn(() => () => undefined),
    ...patch,
  } as jest.Mocked<PurchasesAdapter>;
}

describe('purchase store', () => {
  it('hydrates verified customer and offering with the recommended package', async () => {
    const client = adapter();
    const store = createPurchaseStore(client, config, { now: () => 42 });

    await store.getState().hydrate();

    expect(client.configure).toHaveBeenCalledWith('test_key');
    expect(store.getState()).toMatchObject({
      status: 'ready',
      entitlement: 'free',
      offering,
      selectedPackageId: 'annual',
      lastSyncedAt: 42,
    });
  });

  it('does not configure unavailable builds or block their free entitlement', async () => {
    const client = adapter();
    const store = createPurchaseStore(client, {
      available: false,
      reason: 'missing_api_key',
    });

    await store.getState().hydrate();

    expect(client.configure).not.toHaveBeenCalled();
    expect(store.getState()).toMatchObject({ status: 'configuration_error', entitlement: 'free' });
  });

  it.each([
    ['offline', 'offline'],
    ['configuration', 'configuration_error'],
  ] as const)('classifies %s hydration failure', async (code, status) => {
    const store = createPurchaseStore(
      adapter({
        getCustomer: jest.fn(async () => {
          throw new PurchaseAdapterError(code, code);
        }),
      }),
      config,
    );
    await store.getState().hydrate();
    expect(store.getState().status).toBe(status);
  });

  it('finishes the exact four-second timeout without waiting on the provider', async () => {
    jest.useFakeTimers();
    const never = new Promise<never>(() => undefined);
    const store = createPurchaseStore(
      adapter({ getCustomer: jest.fn(() => never), getOffering: jest.fn(() => never) }),
      config,
    );
    const hydration = store.getState().hydrate();

    await jest.advanceTimersByTimeAsync(3_999);
    expect(store.getState().status).toBe('loading');
    await jest.advanceTimersByTimeAsync(1);
    await hydration;
    expect(store.getState().status).toBe('offline');
    jest.useRealTimers();
  });

  it('updates entitlement from the subscribed provider listener', async () => {
    let listener: ((customer: { entitlement: 'free' | 'premium' }) => void) | undefined;
    const store = createPurchaseStore(
      adapter({
        subscribe: jest.fn((next) => {
          listener = next;
          return () => undefined;
        }),
      }),
      config,
      { now: () => 99 },
    );
    await store.getState().hydrate();
    listener?.({ entitlement: 'premium' });
    expect(store.getState()).toMatchObject({ entitlement: 'premium', lastSyncedAt: 99 });
  });

  it('guards duplicate purchases and requires verified premium after purchase', async () => {
    let finish: ((value: { entitlement: 'free' | 'premium' }) => void) | undefined;
    const pending = new Promise<{ entitlement: 'free' | 'premium' }>((resolve) => {
      finish = resolve;
    });
    const client = adapter({ purchase: jest.fn(() => pending) });
    const store = createPurchaseStore(client, config);
    await store.getState().hydrate();

    const first = store.getState().purchase();
    await expect(store.getState().purchase()).resolves.toBe(false);
    finish?.({ entitlement: 'premium' });
    await expect(first).resolves.toBe(true);
    expect(client.purchase).toHaveBeenCalledTimes(1);
    expect(store.getState()).toMatchObject({ status: 'success', entitlement: 'premium' });
  });

  it('rejects optimistic purchase success when refetch remains free', async () => {
    const store = createPurchaseStore(
      adapter({ purchase: jest.fn(async () => ({ entitlement: 'free' as const })) }),
      config,
    );
    await store.getState().hydrate();
    await expect(store.getState().purchase()).resolves.toBe(false);
    expect(store.getState()).toMatchObject({ status: 'purchase_error', entitlement: 'free' });
  });

  it.each([
    [new PurchaseAdapterError('cancelled', 'cancelled'), 'cancelled'],
    [new PurchaseAdapterError('offline', 'offline'), 'offline'],
    [new PurchaseAdapterError('purchase', 'failed'), 'purchase_error'],
  ] as const)('maps purchase outcomes without granting access', async (error, status) => {
    const store = createPurchaseStore(
      adapter({
        purchase: jest.fn(async () => {
          throw error;
        }),
      }),
      config,
    );
    await store.getState().hydrate();
    await store.getState().purchase();
    expect(store.getState()).toMatchObject({ status, entitlement: 'free' });
  });

  it('distinguishes restore success, empty restore, and restore failure', async () => {
    const client = adapter();
    const store = createPurchaseStore(client, config);
    await store.getState().hydrate();

    await store.getState().restore();
    expect(store.getState().status).toBe('nothing_to_restore');

    client.restore.mockResolvedValueOnce({ entitlement: 'premium' });
    await expect(store.getState().restore()).resolves.toBe(true);
    expect(store.getState()).toMatchObject({ status: 'success', entitlement: 'premium' });

    client.restore.mockRejectedValueOnce(new PurchaseAdapterError('restore', 'failed'));
    await store.getState().restore();
    expect(store.getState().status).toBe('restore_error');
  });
});
