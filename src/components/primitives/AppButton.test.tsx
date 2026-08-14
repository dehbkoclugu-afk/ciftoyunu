import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';

import { AppButton } from './AppButton';

async function renderButton(props: React.ComponentProps<typeof AppButton>) {
  return render(
    <ThemeProvider forcedScheme="light">
      <AppButton {...props} />
    </ThemeProvider>,
  );
}

describe('AppButton', () => {
  it('announces and runs its action', async () => {
    const onPress = jest.fn();
    const screen = await renderButton({ label: 'Start playing', onPress });

    await fireEvent.press(screen.getByRole('button', { name: 'Start playing' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('suppresses presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderButton({ label: 'Continue', disabled: true, onPress });

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('exposes a busy state without changing the accessible name', async () => {
    const screen = await renderButton({
      label: 'Unlock all packs',
      loading: true,
      onPress: jest.fn(),
    });

    const button = screen.getByRole('button', { name: 'Unlock all packs' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
  });
});
