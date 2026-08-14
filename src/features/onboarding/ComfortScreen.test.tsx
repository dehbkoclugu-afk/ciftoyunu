import { fireEvent, render } from '@testing-library/react-native';

import ComfortScreen from '../../../app/onboarding/comfort';
import { ThemeProvider } from '@/design/ThemeProvider';
import { DEFAULT_SETTINGS } from '@/storage/migrations';
import { useSettingsStore } from '@/state/settingsStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

describe('ComfortScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, persistenceFailed: false });
  });

  it('keeps Spicy disabled until explicit age confirmation', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <ComfortScreen />
      </ThemeProvider>,
    );

    const spicy = screen.getByRole('radio', { name: 'Spicy 18+' });
    expect(spicy).toBeDisabled();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'I am 18 or older' }));

    expect(screen.getByRole('radio', { name: 'Spicy 18+' })).not.toBeDisabled();
  });

  it('completes onboarding and routes to home', async () => {
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <ComfortScreen />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Start exploring' }));

    expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });
});
