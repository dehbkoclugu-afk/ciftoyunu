import { create, type StoreApi, type UseBoundStore } from 'zustand';

import { getPurchaseRuntimeConfig, type PurchaseRuntimeConfig } from '@/config/purchases';
import { createRevenueCatAdapter } from '@/services/purchases/revenueCatAdapter';
import {
  PurchaseAdapterError,
  type PurchaseEntitlement,
  type PurchaseOffering,
  type PurchasesAdapter,
} from '@/services/purchases/types';
import { createUnavailablePurchasesAdapter } from '@/services/purchases/unavailableAdapter';

export type PurchaseStatus =
  | 'unconfigured'
  | 'loading'
  | 'ready'
  | 'offline'
  | 'empty_offering'
  | 'configuration_error'
  | 'purchasing'
  | 'success'
  | 'cancelled'
  | 'purchase_error'
  | 'restoring'
  | 'nothing_to_restore'
  | 'restore_error';

type PurchaseActions = {
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  selectPackage: (packageId: string) => void;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  resetResult: () => void;
};

export type PurchaseStore = PurchaseActions & {
  status: PurchaseStatus;
  entitlement: PurchaseEntitlement;
  offering: PurchaseOffering | null;
  selectedPackageId: string | null;
  lastSyncedAt: number | null;
};

type PurchaseStoreDeps = {
  now?: () => number;
  timeoutMs?: number;
};

function statusForError(error: unknown, operation: 'hydrate' | 'purchase' | 'restore') {
  const code = error instanceof PurchaseAdapterError ? error.code : 'configuration';
  if (code === 'offline') return 'offline' as const;
  if (code === 'configuration') return 'configuration_error' as const;
  if (code === 'empty_offering') return 'empty_offering' as const;
  if (code === 'cancelled') return 'cancelled' as const;
  if (operation === 'restore') return 'restore_error' as const;
  if (operation === 'purchase') return 'purchase_error' as const;
  return 'configuration_error' as const;
}

function preferredPackage(offering: PurchaseOffering): string | null {
  return offering.packages.find((item) => item.recommended)?.id ?? offering.packages[0]?.id ?? null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new PurchaseAdapterError('offline', 'The store request timed out.')),
      timeoutMs,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export function createPurchaseStore(
  adapter: PurchasesAdapter,
  config: PurchaseRuntimeConfig,
  { now = Date.now, timeoutMs = 4_000 }: PurchaseStoreDeps = {},
): UseBoundStore<StoreApi<PurchaseStore>> {
  let unsubscribe: (() => void) | null = null;

  return create<PurchaseStore>((set, get) => {
    const load = async () => {
      const [customer, offering] = await withTimeout(
        Promise.all([adapter.getCustomer(), adapter.getOffering()]),
        timeoutMs,
      );
      set({
        entitlement: customer.entitlement,
        offering,
        selectedPackageId: offering ? preferredPackage(offering) : null,
        lastSyncedAt: now(),
        status: offering ? 'ready' : 'empty_offering',
      });
    };

    return {
      status: 'unconfigured',
      entitlement: 'unknown',
      offering: null,
      selectedPackageId: null,
      lastSyncedAt: null,

      hydrate: async () => {
        if (get().status !== 'unconfigured') return;
        set({ status: 'loading' });
        if (!config.available) {
          set({ entitlement: 'free', status: 'configuration_error' });
          return;
        }
        try {
          adapter.configure(config.apiKey);
          unsubscribe?.();
          unsubscribe = adapter.subscribe((customer) => {
            set({ entitlement: customer.entitlement, lastSyncedAt: now() });
          });
          await load();
        } catch (error) {
          set({ entitlement: 'free', status: statusForError(error, 'hydrate') });
        }
      },

      refresh: async () => {
        if (get().status === 'purchasing' || get().status === 'restoring') return;
        if (!config.available) {
          set({ entitlement: 'free', status: 'configuration_error' });
          return;
        }
        set({ status: 'loading' });
        try {
          await load();
        } catch (error) {
          set({ status: statusForError(error, 'hydrate') });
        }
      },

      selectPackage: (selectedPackageId) => {
        if (get().offering?.packages.some((item) => item.id === selectedPackageId)) {
          set({ selectedPackageId });
        }
      },

      purchase: async () => {
        if (get().status === 'purchasing' || get().status === 'restoring') return false;
        const packageId = get().selectedPackageId;
        if (!packageId) {
          set({ status: 'empty_offering' });
          return false;
        }
        set({ status: 'purchasing' });
        try {
          let customer = await adapter.purchase(packageId);
          if (customer.entitlement !== 'premium') customer = await adapter.getCustomer();
          if (customer.entitlement !== 'premium') {
            throw new PurchaseAdapterError('purchase', 'Premium access was not verified.');
          }
          set({ entitlement: 'premium', lastSyncedAt: now(), status: 'success' });
          return true;
        } catch (error) {
          set({ status: statusForError(error, 'purchase') });
          return false;
        }
      },

      restore: async () => {
        if (get().status === 'purchasing' || get().status === 'restoring') return false;
        set({ status: 'restoring' });
        try {
          const customer = await adapter.restore();
          if (customer.entitlement === 'premium') {
            set({ entitlement: 'premium', lastSyncedAt: now(), status: 'success' });
            return true;
          }
          set({ entitlement: 'free', lastSyncedAt: now(), status: 'nothing_to_restore' });
          return false;
        } catch (error) {
          set({ status: statusForError(error, 'restore') });
          return false;
        }
      },

      resetResult: () => set((state) => ({ status: state.offering ? 'ready' : 'empty_offering' })),
    };
  });
}

const runtimeConfig = getPurchaseRuntimeConfig();
const runtimeAdapter = runtimeConfig.available
  ? createRevenueCatAdapter()
  : createUnavailablePurchasesAdapter('configuration');

export const usePurchaseStore = createPurchaseStore(runtimeAdapter, runtimeConfig);
