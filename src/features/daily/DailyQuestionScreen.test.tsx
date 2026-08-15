import * as Notifications from 'expo-notifications';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import { track } from '@/services/analytics/runtime';
import { DEFAULT_SETTINGS } from '@/storage/migrations';
import { useSettingsStore } from '@/state/settingsStore';

import { DailyQuestionScreen } from './DailyQuestionScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@/services/analytics/runtime', () => ({ track: jest.fn() }));

describe('DailyQuestionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
      status: Notifications.PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({
      status: Notifications.PermissionStatus.GRANTED,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
  });

  it('shows one deterministic safe card without an answer field', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <DailyQuestionScreen now={new Date(2026, 7, 15, 12)} />
      </ThemeProvider>,
    );
    expect(screen.getByText('One free card. No streak, score, or answer saved.')).toBeOnTheScreen();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(track).toHaveBeenCalledWith(
      'daily_question_viewed',
      expect.objectContaining({ question_id: expect.any(String), date_key: '2026-08-15' }),
    );
  });

  it('asks only after scheduling and persists the selected time', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <DailyQuestionScreen now={new Date(2026, 7, 15)} />
      </ThemeProvider>,
    );
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: '21:30' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Schedule for 21:30' }));
    await waitFor(() =>
      expect(screen.getByText('Daily reminder set for 21:30.')).toBeOnTheScreen(),
    );
    expect(useSettingsStore.getState()).toMatchObject({
      notificationsEnabled: true,
      dailyReminderTime: '21:30',
    });
    expect(track).toHaveBeenCalledWith('daily_reminder_scheduled', { reminder_time: '21:30' });
    expect(
      jest.mocked(track).mock.calls.filter(([event]) => event === 'daily_question_viewed'),
    ).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Turn off daily reminder' }));
    await waitFor(() => expect(useSettingsStore.getState().notificationsEnabled).toBe(false));
    expect(useSettingsStore.getState().dailyReminderTime).toBeUndefined();
  });

  it('keeps the daily card usable when permission is denied', async () => {
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({
      status: Notifications.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <DailyQuestionScreen now={new Date(2026, 7, 15)} />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Schedule for 20:00' }));
    await waitFor(() =>
      expect(
        screen.getByText('Permission was not granted. Today’s question still works.'),
      ).toBeOnTheScreen(),
    );
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('offers system settings recovery when permission is blocked', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
      status: Notifications.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <DailyQuestionScreen now={new Date(2026, 7, 15)} />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Schedule for 20:00' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open system settings' })).toBeOnTheScreen(),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Open system settings' }));
    expect(openSettings).toHaveBeenCalled();
  });
});
