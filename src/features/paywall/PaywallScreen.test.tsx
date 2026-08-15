import { Linking } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import type { PurchaseOffering } from '@/services/purchases/types';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSettingsStore } from '@/state/settingsStore';
import { DEFAULT_SETTINGS } from '@/storage/migrations';

import { PaywallScreen } from './PaywallScreen';

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

const offering: PurchaseOffering = {
  id: 'default',
  packages: [
    {
      id: 'annual',
      productId: 'premium_annual',
      title: 'Annual',
      description: 'Annual premium access',
      price: '₺999,99',
      period: 'year',
      packageType: 'annual',
      intro: '7 days free',
      recommended: true,
    },
    {
      id: 'monthly',
      productId: 'premium_monthly',
      title: 'Monthly',
      description: 'Monthly premium access',
      price: '₺129,99',
      period: 'month',
      packageType: 'monthly',
      intro: null,
      recommended: false,
    },
  ],
};

function renderScreen(props: { packId?: string; termsUrl?: string; privacyUrl?: string } = {}) {
  return render(
    <ThemeProvider forcedScheme="light">
      <PaywallScreen {...props} />
    </ThemeProvider>,
  );
}

describe('paywall screen', () => {
  const original = usePurchaseStore.getState();
  const hydrate = jest.fn(async () => undefined);
  const refresh = jest.fn(async () => undefined);
  const purchase = jest.fn(async () => true);
  const restore = jest.fn(async () => true);

  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    usePurchaseStore.setState({
      status: 'ready',
      entitlement: 'free',
      offering,
      selectedPackageId: 'annual',
      hydrate,
      refresh,
      purchase,
      restore,
    });
  });

  afterAll(() => usePurchaseStore.setState(original));

  it('shows contextual benefits and store-sourced terms with annual selected', async () => {
    const screen = await renderScreen({ packId: 'deep_night' });

    expect(screen.getByText('Unlock Deep Night and every current premium deck.')).toBeTruthy();
    expect(screen.getByText('₺999,99')).toBeTruthy();
    expect(
      screen.getByText('7 days free. Then ₺999,99 every year. Auto-renews until cancelled.'),
    ).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Annual/ }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it('selects a plan and locks purchase actions while purchasing', async () => {
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('radio', { name: /Monthly/ }));
    await waitFor(() => expect(usePurchaseStore.getState().selectedPackageId).toBe('monthly'));

    await act(() => usePurchaseStore.setState({ status: 'purchasing' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Continue with Monthly/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Restore purchases' })).toBeDisabled();
    });
  });

  it('supports close, restore, and configured legal links', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const screen = await renderScreen({
      termsUrl: 'https://example.com/terms',
      privacyUrl: 'https://example.com/privacy',
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Close premium' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Restore purchases' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Terms' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Privacy' }));

    expect(mockBack).toHaveBeenCalled();
    expect(restore).toHaveBeenCalled();
    await waitFor(() => expect(open).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['offline', 'The store is offline.'],
    ['empty_offering', 'Plans are temporarily unavailable.'],
    ['configuration_error', 'Purchases are unavailable in this test build.'],
    ['cancelled', 'Purchase cancelled.'],
    ['purchase_error', 'The purchase was not verified.'],
    ['nothing_to_restore', 'No purchase was found to restore.'],
    ['restore_error', 'Restore could not finish.'],
  ] as const)('explains the %s state', async (status, copy) => {
    usePurchaseStore.setState({ status, offering: null, selectedPackageId: null });
    const screen = await renderScreen();
    expect(screen.getByText(copy)).toBeTruthy();
  });

  it('hydrates an unconfigured store and labels loading progress', async () => {
    usePurchaseStore.setState({ status: 'unconfigured', offering: null });
    const screen = await renderScreen();
    await waitFor(() => expect(hydrate).toHaveBeenCalled());

    await act(() => usePurchaseStore.setState({ status: 'loading' }));
    expect(screen.getByLabelText('Loading store plans')).toBeTruthy();
  });

  it('continues to the selected pack after verified success', async () => {
    usePurchaseStore.setState({ status: 'success', entitlement: 'premium' });
    const screen = await renderScreen({ packId: 'deep_night' });
    await fireEvent.press(screen.getByRole('button', { name: 'Play Deep Night' }));
    expect(mockReplace).toHaveBeenCalledWith('/session-setup');
  });

  it('does not render dead legal controls when URLs are missing', async () => {
    const screen = await renderScreen({ termsUrl: '', privacyUrl: '' });
    expect(
      screen.getByText('Terms and privacy links are unavailable in this test build.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Terms' })).toBeNull();
  });
});
