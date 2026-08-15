import '@testing-library/react-native/dist/matchers/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    PURCHASES_ERROR_CODE: {
      PurchaseCancelledError: '1',
      NetworkError: '10',
      ConfigurationError: '23',
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

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  close: jest.fn(async () => true),
  init: jest.fn(),
  withScope: jest.fn((callback) => callback({ setExtra: jest.fn() })),
}));
