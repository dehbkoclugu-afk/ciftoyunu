import { fireEvent, render } from '@testing-library/react-native';

import PacksScreen from '../../../app/packs';
import { ThemeProvider } from '@/design/ThemeProvider';
import { createDefaultPlayers } from '@/features/player-setup/playerSetup';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSettingsStore } from '@/state/settingsStore';
import { DEFAULT_SETTINGS } from '@/storage/migrations';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

function renderScreen() {
  return render(
    <ThemeProvider forcedScheme="light">
      <PacksScreen />
    </ThemeProvider>,
  );
}

describe('pack library screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    useGameSetupStore.setState({
      mode: 'couple',
      players: createDefaultPlayers('couple'),
      setupCompleted: true,
      selectedPackId: null,
      persistenceFailed: false,
    });
    usePurchaseStore.setState({ entitlement: 'free' });
  });

  it('shows mode-eligible packs and applies filters', async () => {
    const screen = await renderScreen();

    expect(screen.getByText('Warm Start')).toBeTruthy();
    expect(screen.getByText('Laugh Together')).toBeTruthy();
    expect(screen.getByText('Deep Night')).toBeTruthy();
    expect(screen.queryByText('Easy Company')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Free' }));
    expect(screen.queryByText('Deep Night')).toBeNull();
    expect(screen.getByText('Warm Start')).toBeTruthy();
  });

  it('opens details before selecting and shows two real samples', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Open Warm Start details' }));
    expect(screen.getByText('A look inside')).toBeTruthy();
    expect(
      screen.getByText(
        'If we found an extra unplanned hour tonight, how would you want to spend it together?',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('What ordinary sound or smell feels most like our time together?'),
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Choose Warm Start' }));
    expect(useGameSetupStore.getState().selectedPackId).toBe('warm_start');
    expect(mockPush).toHaveBeenCalledWith('/session-setup');
  });

  it('preserves a premium selection and opens the paywall for free users', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Open Deep Night details' }));
    expect(screen.getByText('Premium access is required for this pack.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Unlock all packs' }));

    expect(useGameSetupStore.getState().selectedPackId).toBe('deep_night');
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/premium',
      params: { packId: 'deep_night' },
    });
  });

  it('lets verified premium users choose a premium pack directly', async () => {
    usePurchaseStore.setState({ entitlement: 'premium' });
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Open Deep Night details' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Choose Deep Night' }));

    expect(useGameSetupStore.getState().selectedPackId).toBe('deep_night');
    expect(mockPush).toHaveBeenCalledWith('/session-setup');
  });

  it('never falls back to English when the locale bundle is missing', async () => {
    useSettingsStore.setState({ locale: 'ar' });
    const screen = await renderScreen();

    expect(screen.getByText('Packs are not ready in العربية yet.')).toBeTruthy();
    expect(screen.queryByText('Warm Start')).toBeNull();
  });
});
