import Purchases from 'react-native-purchases';

import { createRevenueCatAdapter } from './revenueCatAdapter';
import { PurchaseAdapterError } from './types';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: '1',
      NETWORK_ERROR: '10',
      INVALID_CREDENTIALS_ERROR: '11',
      CONFIGURATION_ERROR: '23',
      UNSUPPORTED_ERROR: '24',
      PRODUCT_REQUEST_TIMED_OUT_ERROR: '32',
      OFFLINE_CONNECTION_ERROR: '35',
    },
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  },
}));

const native = Purchases as jest.Mocked<typeof Purchases>;

function customer(premium = false) {
  return { entitlements: { active: premium ? { premium: { isActive: true } } : {} } } as never;
}

function nativePackage(type: 'ANNUAL' | 'MONTHLY', intro = false) {
  return {
    identifier: `$rc_${type.toLowerCase()}`,
    packageType: type,
    product: {
      identifier: `duo_${type.toLowerCase()}`,
      title: type === 'ANNUAL' ? 'Annual' : 'Monthly',
      description: `${type} access`,
      priceString: type === 'ANNUAL' ? '$29.99' : '$9.99',
      subscriptionPeriod: type === 'ANNUAL' ? 'P1Y' : 'P1M',
      introPrice: intro
        ? { price: 0, priceString: '$0.00', periodNumberOfUnits: 7, periodUnit: 'DAY' }
        : null,
    },
  } as never;
}

describe('RevenueCat purchase adapter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps current offering prices, periods, intro terms, and annual recommendation', async () => {
    const annual = nativePackage('ANNUAL', true);
    const monthly = nativePackage('MONTHLY');
    native.getOfferings.mockResolvedValue({
      current: { identifier: 'default', annual, availablePackages: [monthly, annual] },
    } as never);

    const offering = await createRevenueCatAdapter().getOffering();

    expect(offering).toEqual({
      id: 'default',
      packages: [
        expect.objectContaining({
          id: '$rc_annual',
          price: '$29.99',
          period: '1 year',
          intro: '7 days free',
          recommended: true,
        }),
        expect.objectContaining({
          id: '$rc_monthly',
          price: '$9.99',
          period: '1 month',
          recommended: false,
        }),
      ],
    });
  });

  it('grants only the active premium entitlement', async () => {
    native.getCustomerInfo
      .mockResolvedValueOnce(customer(false))
      .mockResolvedValueOnce(customer(true));
    const adapter = createRevenueCatAdapter();
    await expect(adapter.getCustomer()).resolves.toEqual({ entitlement: 'free' });
    await expect(adapter.getCustomer()).resolves.toEqual({ entitlement: 'premium' });
  });

  it.each([
    ['1', 'cancelled'],
    ['10', 'offline'],
    ['23', 'configuration'],
    ['0', 'purchase'],
  ])('classifies purchase error %s as %s', async (code, expected) => {
    const selected = nativePackage('ANNUAL');
    native.getOfferings.mockResolvedValue({
      current: { identifier: 'default', annual: selected, availablePackages: [selected] },
    } as never);
    native.purchasePackage.mockRejectedValue({ code });
    const adapter = createRevenueCatAdapter();
    await adapter.getOffering();

    await expect(adapter.purchase('$rc_annual')).rejects.toMatchObject({ code: expected });
  });

  it('returns verified purchase and restore customer state', async () => {
    const selected = nativePackage('ANNUAL');
    native.getOfferings.mockResolvedValue({
      current: { identifier: 'default', annual: selected, availablePackages: [selected] },
    } as never);
    native.purchasePackage.mockResolvedValue({ customerInfo: customer(true) } as never);
    native.restorePurchases.mockResolvedValue(customer(true));
    const adapter = createRevenueCatAdapter();
    await adapter.getOffering();

    await expect(adapter.purchase('$rc_annual')).resolves.toEqual({ entitlement: 'premium' });
    await expect(adapter.restore()).resolves.toEqual({ entitlement: 'premium' });
  });

  it('removes the exact customer listener it registered', () => {
    const listener = jest.fn();
    const remove = createRevenueCatAdapter().subscribe(listener);
    const registered = native.addCustomerInfoUpdateListener.mock.calls[0]![0];

    registered(customer(true));
    expect(listener).toHaveBeenCalledWith({ entitlement: 'premium' });
    remove();
    expect(native.removeCustomerInfoUpdateListener).toHaveBeenCalledWith(registered);
  });

  it('uses a typed empty-offering failure for missing packages', async () => {
    native.getOfferings.mockResolvedValue({ current: null } as never);
    await expect(createRevenueCatAdapter().purchase('missing')).rejects.toEqual(
      new PurchaseAdapterError('empty_offering', 'Plan is unavailable.'),
    );
  });
});
