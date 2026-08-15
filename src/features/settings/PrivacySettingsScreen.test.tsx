import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import { DEFAULT_SETTINGS } from '@/storage/migrations';
import { useSettingsStore } from '@/state/settingsStore';

import { PrivacySettingsScreen } from './PrivacySettingsScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('PrivacySettingsScreen', () => {
  beforeEach(() => {
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, persistenceFailed: false });
  });

  it('starts both optional sharing controls off and explains exclusions', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <PrivacySettingsScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole('switch', { name: 'Anonymous analytics' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Crash reports' })).not.toBeChecked();
    expect(screen.getByText(/Player names · answers · question wording/)).toBeOnTheScreen();
  });

  it('persists each consent independently', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <PrivacySettingsScreen />
      </ThemeProvider>,
    );
    await fireEvent(
      screen.getByRole('switch', { name: 'Anonymous analytics' }),
      'valueChange',
      true,
    );
    expect(useSettingsStore.getState().analyticsEnabled).toBe(true);
    expect(useSettingsStore.getState().crashReportingEnabled).toBe(false);
  });
});
