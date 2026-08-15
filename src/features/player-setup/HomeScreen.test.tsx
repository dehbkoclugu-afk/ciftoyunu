import { fireEvent, render } from '@testing-library/react-native';

import HomeScreen from '../../../app/home';
import { ThemeProvider } from '@/design/ThemeProvider';
import { createDefaultPlayers } from '@/features/player-setup/playerSetup';
import { DEFAULT_SETTINGS } from '@/storage/migrations';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    useGameSetupStore.setState({
      mode: 'couple',
      players: createDefaultPlayers('couple'),
      setupCompleted: false,
      persistenceFailed: false,
    });
    useSessionStore.setState({ activeSession: null, favoriteIds: [] });
  });

  it('uses real embedded content and keeps one primary Play action', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <HomeScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText('What small thing I do makes you feel cared for?')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Play together' })).toHaveLength(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Play together' }));
    expect(mockPush).toHaveBeenCalledWith('/mode');
  });

  it('shows an honest summary after player setup is complete', async () => {
    useGameSetupStore.setState({
      mode: 'friends',
      players: [
        { id: 'player-1', name: 'Maya', emoji: '🌙' },
        { id: 'player-2', name: 'Noah' },
      ],
      setupCompleted: true,
    });

    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <HomeScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText('Friends ready')).toBeTruthy();
    expect(screen.getByText('Maya & Noah')).toBeTruthy();
  });

  it('resumes unfinished sessions', async () => {
    useSessionStore.setState({
      activeSession: {
        id: 'session-home',
        packTitle: 'Warm Start',
        completedAt: undefined,
      } as never,
    });
    const unfinished = await render(
      <ThemeProvider forcedScheme="light">
        <HomeScreen />
      </ThemeProvider>,
    );
    await fireEvent.press(unfinished.getByRole('button', { name: 'Continue Warm Start' }));
    expect(mockPush).toHaveBeenCalledWith('/play');
  });

  it('opens completed recaps', async () => {
    useSessionStore.setState({
      activeSession: { id: 'session-home', packTitle: 'Warm Start', completedAt: 5_000 } as never,
    });
    const completed = await render(
      <ThemeProvider forcedScheme="light">
        <HomeScreen />
      </ThemeProvider>,
    );
    await fireEvent.press(completed.getByRole('button', { name: 'View Warm Start recap' }));
    expect(mockPush).toHaveBeenCalledWith('/recap');
  });

  it('keeps saved questions reachable', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <HomeScreen />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Saved questions' }));
    expect(mockPush).toHaveBeenCalledWith('/favorites');
  });

  it('keeps privacy controls reachable from the first screen', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <HomeScreen />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Privacy' }));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });
});
