import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';

import { Chip } from './Chip';

describe('Chip', () => {
  it('reports its selected state and remains pressable', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <Chip label="Deep" selected onPress={onPress} />
      </ThemeProvider>,
    );

    const chip = screen.getByRole('button', { name: 'Deep' });
    expect(chip).toBeSelected();

    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
