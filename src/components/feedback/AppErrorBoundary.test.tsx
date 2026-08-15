import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider } from '@/design/ThemeProvider';

import { AppErrorBoundary } from './AppErrorBoundary';

jest.mock('@/services/crash/runtime', () => ({ captureException: jest.fn() }));
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

function Broken(): never {
  throw new Error('render failed');
}

describe('AppErrorBoundary', () => {
  it('shows a private, recoverable fallback', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const rendered = await render(
      <ThemeProvider forcedScheme="light">
        <AppErrorBoundary>
          <Text>Safe</Text>
          <Broken />
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    expect(rendered.getByRole('alert')).toBeOnTheScreen();
    expect(
      rendered.getByText(
        'Your answers were never recorded. Try returning to the game when you are ready.',
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(rendered.getByRole('button', { name: 'Return home' }));
    expect(mockReplace).toHaveBeenCalledWith('/home');
    spy.mockRestore();
  });
});
