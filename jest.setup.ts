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

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  PermissionStatus: { UNDETERMINED: 'undetermined', GRANTED: 'granted', DENIED: 'denied' },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getLastNotificationResponse: jest.fn(() => null),
  getPermissionsAsync: jest.fn(async () => ({
    status: 'undetermined',
    granted: false,
    canAskAgain: true,
  })),
  requestPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  })),
  scheduleNotificationAsync: jest.fn(async () => 'duo-daily-reminder'),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  setNotificationHandler: jest.fn(),
}));
