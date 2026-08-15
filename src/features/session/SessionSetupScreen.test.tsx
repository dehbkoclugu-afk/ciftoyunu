import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import { createDefaultPlayers } from '@/features/player-setup/playerSetup';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';
import { DEFAULT_SETTINGS } from '@/storage/migrations';

import { SessionSetupScreen } from './SessionSetupScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: (...args: unknown[]) => mockReplace(...args) },
}));

function renderScreen() {
  return render(
    <ThemeProvider forcedScheme="light">
      <SessionSetupScreen />
    </ThemeProvider>,
  );
}

describe('session setup screen', () => {
  const originalStart = useSessionStore.getState().start;

  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    useGameSetupStore.setState({
      mode: 'couple',
      players: createDefaultPlayers('couple'),
      setupCompleted: true,
      selectedPackId: 'warm_start',
      persistenceFailed: false,
    });
    useSessionStore.setState({ start: originalStart, startError: null, persistenceFailed: false });
    usePurchaseStore.setState({ entitlement: 'free' });
  });

  it('defaults to Standard and Mixed with an honest estimate', async () => {
    const screen = await renderScreen();

    expect(screen.getByRole('button', { name: 'Standard 20' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Mixed' })).toBeSelected();
    expect(screen.getByText('Up to 18 questions + 2 special cards')).toBeTruthy();
  });

  it('passes duration, intensity, and local topic exclusions into start', async () => {
    const start = jest.fn(async () => ({ id: 'active' }));
    useSessionStore.setState({ start: start as never });
    const screen = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Quick 10' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Light' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Money' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Start Warm Start' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/play'));
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMinutes: 10,
        intensityPreset: 'light',
        excludedTopics: ['money'],
        packIds: ['warm_start'],
      }),
    );
  });

  it('hides mature control when policy does not allow it', async () => {
    const hidden = await renderScreen();
    expect(hidden.queryByRole('button', { name: 'Include mature questions' })).toBeNull();
  });

  it('shows mature control when age and comfort policy allow it', async () => {
    useSettingsStore.setState({
      ageConfirmed18: true,
      comfortLevel: 'spicy',
      matureContentEnabled: true,
    });
    const visible = await renderScreen();
    expect(visible.getByRole('button', { name: 'Include mature questions' })).toBeTruthy();
  });

  it('explains missing selection instead of starting a blank game', async () => {
    useGameSetupStore.setState({ selectedPackId: null });
    const screen = await renderScreen();

    expect(screen.getByText('Choose a pack before setting the pace.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Start/ })).toBeNull();
  });

  it('shows an actionable empty-pool error', async () => {
    useSessionStore.setState({
      start: jest.fn(async () => null) as never,
      startError: 'no_questions',
    });
    const screen = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Start Warm Start' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No questions match these choices. Remove a topic filter or lower the intensity.',
    );
  });

  it('sends an unentitled premium selection to the paywall', async () => {
    useGameSetupStore.setState({ selectedPackId: 'deep_night' });
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Unlock all packs' }));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/premium',
      params: { packId: 'deep_night' },
    });
  });

  it('starts a premium pack only with verified entitlement', async () => {
    const start = jest.fn(async () => ({ id: 'premium-session' }));
    useGameSetupStore.setState({ selectedPackId: 'deep_night' });
    usePurchaseStore.setState({ entitlement: 'premium' });
    useSessionStore.setState({ start: start as never });
    const screen = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Start Deep Night' }));
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        packIds: ['deep_night'],
        entitledPackIds: ['deep_night'],
      }),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/play'));
  });
});
