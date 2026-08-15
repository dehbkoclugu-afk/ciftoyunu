import { PurchaseAdapterError, type PurchaseFailureCode, type PurchasesAdapter } from './types';

export function createUnavailablePurchasesAdapter(
  code: Extract<PurchaseFailureCode, 'configuration' | 'offline'> = 'configuration',
): PurchasesAdapter {
  const unavailable = async (): Promise<never> => {
    throw new PurchaseAdapterError(code, 'Purchases are unavailable in this build.');
  };

  return {
    configure: () => undefined,
    getCustomer: unavailable,
    getOffering: unavailable,
    purchase: unavailable,
    restore: unavailable,
    subscribe: () => () => undefined,
  };
}
