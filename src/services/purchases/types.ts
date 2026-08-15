export const PREMIUM_ENTITLEMENT_ID = 'premium';

export type PurchaseEntitlement = 'unknown' | 'free' | 'premium';

export type PurchaseFailureCode =
  'cancelled' | 'offline' | 'configuration' | 'empty_offering' | 'purchase' | 'restore';

export class PurchaseAdapterError extends Error {
  constructor(
    readonly code: PurchaseFailureCode,
    message: string,
  ) {
    super(message);
    this.name = 'PurchaseAdapterError';
  }
}

export type PurchaseCustomer = {
  entitlement: Exclude<PurchaseEntitlement, 'unknown'>;
};

export type PurchasePackage = {
  id: string;
  productId: string;
  title: string;
  description: string;
  price: string;
  period: string | null;
  packageType: string;
  intro: string | null;
  recommended: boolean;
};

export type PurchaseOffering = {
  id: string;
  packages: PurchasePackage[];
};

export type PurchasesAdapter = {
  configure: (apiKey: string) => void;
  getCustomer: () => Promise<PurchaseCustomer>;
  getOffering: () => Promise<PurchaseOffering | null>;
  purchase: (packageId: string) => Promise<PurchaseCustomer>;
  restore: () => Promise<PurchaseCustomer>;
  subscribe: (listener: (customer: PurchaseCustomer) => void) => () => void;
};
