import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ModeScreen from '../../../app/mode';
import PlayersScreen from '../../../app/players';
import { ThemeProvider } from '@/design/ThemeProvider';
import { createDefaultPlayers } from '@/features/player-setup/playerSetup';
import { DEFAULT_SETTINGS } from '@/storage/migrations';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { useSettingsStore } from '@/state/settingsStore';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

function renderWithTheme(element: React.ReactElement) {
  return render(<ThemeProvider forcedScheme="light">{element}</ThemeProvider>);
}

describe('mode and player setup screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGameSetupStore.setState({
      mode: 'couple',
      players: createDefaultPlayers('couple'),
      setupCompleted: false,
      persistenceFailed: false,
      selectedPackId: null,
    });
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, persistenceFailed: false });
  });

  it('selects Friends explicitly before continuing', async () => {
    const screen = await renderWithTheme(<ModeScreen />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Friends' }));
    expect(useGameSetupStore.getState().mode).toBe('friends');

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/players');
  });

  it('keeps Couple at exactly two rows', async () => {
    const couple = await renderWithTheme(<PlayersScreen />);
    expect(couple.getAllByLabelText(/Player [0-9]+ name/)).toHaveLength(2);
    expect(couple.queryByRole('button', { name: 'Add another player' })).toBeNull();
  });

  it('lets Friends add or remove within bounds', async () => {
    useGameSetupStore.getState().selectMode('friends');
    const friends = await renderWithTheme(<PlayersScreen />);
    await fireEvent.press(friends.getByRole('button', { name: 'Add another player' }));
    expect(friends.getAllByLabelText(/Player [0-9]+ name/)).toHaveLength(3);

    await fireEvent.press(friends.getByRole('button', { name: 'Remove Player 3' }));
    expect(friends.getAllByLabelText(/Player [0-9]+ name/)).toHaveLength(2);
  });

  it('shows duplicate names as a non-blocking notice', async () => {
    const screen = await renderWithTheme(<PlayersScreen />);
    const inputs = screen.getAllByLabelText(/Player [0-9]+ name/);

    await fireEvent.changeText(inputs[0]!, 'Maya');
    await fireEvent.changeText(inputs[1]!, ' maya ');

    expect(
      screen.getByText('Two players are both named Maya. You can still continue.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save players' })).not.toBeDisabled();
  });

  it('completes setup and opens the pack library even without saved names', async () => {
    const screen = await renderWithTheme(<PlayersScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save players' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/packs'));
    expect(useGameSetupStore.getState().setupCompleted).toBe(true);
  });
});
