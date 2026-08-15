import Purchases, {
  type CustomerInfo,
  type PurchasesError,
  type PurchasesIntroPrice,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  PREMIUM_ENTITLEMENT_ID,
  PurchaseAdapterError,
  type PurchaseCustomer,
  type PurchaseFailureCode,
  type PurchaseOffering,
  type PurchasesAdapter,
} from './types';

function mapCustomer(customerInfo: CustomerInfo): PurchaseCustomer {
  return {
    entitlement: customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] ? 'premium' : 'free',
  };
}

function periodLabel(period: string | null): string | null {
  if (!period) return null;
  const match = /^P(\d+)([DWMY])$/.exec(period);
  if (!match) return period;
  const count = Number(match[1]);
  const unit = { D: 'day', W: 'week', M: 'month', Y: 'year' }[match[2]!];
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

function introLabel(intro: PurchasesIntroPrice | null): string | null {
  if (!intro) return null;
  const duration = `${intro.periodNumberOfUnits} ${intro.periodUnit.toLowerCase()}${
    intro.periodNumberOfUnits === 1 ? '' : 's'
  }`;
  return intro.price === 0 ? `${duration} free` : `${intro.priceString} for ${duration}`;
}

function failureCode(error: unknown, operation: 'purchase' | 'restore'): PurchaseFailureCode {
  const code = (error as Partial<PurchasesError> | null)?.code;
  if (code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
  if (
    code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR ||
    code === Purchases.PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR ||
    code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_REQUEST_TIMED_OUT_ERROR
  ) {
    return 'offline';
  }
  if (
    code === Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR ||
    code === Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR ||
    code === Purchases.PURCHASES_ERROR_CODE.UNSUPPORTED_ERROR
  ) {
    return 'configuration';
  }
  return operation;
}

function asAdapterError(error: unknown, operation: 'purchase' | 'restore'): PurchaseAdapterError {
  if (error instanceof PurchaseAdapterError) return error;
  return new PurchaseAdapterError(
    failureCode(error, operation),
    'The store request did not finish.',
  );
}

function packageRank(aPackage: PurchasesPackage): number {
  if (aPackage.packageType === 'ANNUAL') return 0;
  if (aPackage.packageType === 'MONTHLY') return 1;
  if (aPackage.packageType === 'LIFETIME') return 2;
  return 3;
}

export function createRevenueCatAdapter(): PurchasesAdapter {
  const packages = new Map<string, PurchasesPackage>();

  const loadOffering = async (): Promise<PurchaseOffering | null> => {
    const current = (await Purchases.getOfferings()).current;
    packages.clear();
    if (!current || current.availablePackages.length === 0) return null;

    const available = [...current.availablePackages].sort(
      (left, right) => packageRank(left) - packageRank(right),
    );
    for (const item of available) packages.set(item.identifier, item);

    return {
      id: current.identifier,
      packages: available.map((item, index) => ({
        id: item.identifier,
        productId: item.product.identifier,
        title: item.product.title,
        description: item.product.description,
        price: item.product.priceString,
        period: periodLabel(item.product.subscriptionPeriod),
        packageType: item.packageType.toLowerCase(),
        intro: introLabel(item.product.introPrice),
        recommended: item === current.annual || (!current.annual && index === 0),
      })),
    };
  };

  return {
    configure: (apiKey) => Purchases.configure({ apiKey }),
    getCustomer: async () => mapCustomer(await Purchases.getCustomerInfo()),
    getOffering: async () => {
      try {
        return await loadOffering();
      } catch (error) {
        throw asAdapterError(error, 'purchase');
      }
    },
    purchase: async (packageId) => {
      try {
        if (!packages.has(packageId)) await loadOffering();
        const selected = packages.get(packageId);
        if (!selected) throw new PurchaseAdapterError('empty_offering', 'Plan is unavailable.');
        return mapCustomer((await Purchases.purchasePackage(selected)).customerInfo);
      } catch (error) {
        throw asAdapterError(error, 'purchase');
      }
    },
    restore: async () => {
      try {
        return mapCustomer(await Purchases.restorePurchases());
      } catch (error) {
        throw asAdapterError(error, 'restore');
      }
    },
    subscribe: (listener) => {
      const nativeListener = (customerInfo: CustomerInfo) => listener(mapCustomer(customerInfo));
      Purchases.addCustomerInfoUpdateListener(nativeListener);
      return () => {
        Purchases.removeCustomerInfoUpdateListener(nativeListener);
      };
    },
  };
}
