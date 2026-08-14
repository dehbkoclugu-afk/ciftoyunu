import { fireEvent, render } from '@testing-library/react-native';

import { loadEmbeddedContent } from '@/content/loader';
import { ThemeProvider } from '@/design/ThemeProvider';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';
import { DEFAULT_SETTINGS } from '@/storage/migrations';

import { FavoritesScreen } from './FavoritesScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const bundle = loadEmbeddedContent('en')!;
const warm = bundle.questions.find((question) => question.packIds.includes('warm_start'))!;
const laugh = bundle.questions.find((question) => question.packIds.includes('laugh_together'))!;

function renderScreen() {
  return render(
    <ThemeProvider forcedScheme="dark">
      <FavoritesScreen />
    </ThemeProvider>,
  );
}

describe('favorites screen', () => {
  const original = useSessionStore.getState();

  beforeEach(() => {
    useSettingsStore.setState({ ...DEFAULT_SETTINGS, locale: 'en', persistenceFailed: false });
    useSessionStore.setState({
      favoriteIds: [warm.id, laugh.id, 'qi_missing_9999'],
      toggleFavorite: jest.fn(async () => undefined),
    });
  });

  afterAll(() => useSessionStore.setState(original));

  it('hides unavailable IDs and shows one saved question at a time', async () => {
    const screen = await renderScreen();
    const first = screen.queryByText(warm.text) ? warm : laugh;
    const second = first.id === warm.id ? laugh : warm;
    expect(screen.getByText(first.text)).toBeTruthy();
    expect(screen.queryByText(second.text)).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Next saved question' }));
    expect(screen.getByText(second.text)).toBeTruthy();
  });

  it('filters by pack and topic and can remove the current favorite', async () => {
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Laugh Together' }));
    expect(screen.getByText(laugh.text)).toBeTruthy();

    const topic = laugh.topicTags[0]!.replaceAll('-', ' ').replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
    await fireEvent.press(screen.getByRole('button', { name: topic }));
    expect(screen.getByText(laugh.text)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Remove favorite' }));
    expect(useSessionStore.getState().toggleFavorite).toHaveBeenCalledWith(laugh.id);
  });

  it('provides a useful empty state', async () => {
    useSessionStore.setState({ favoriteIds: [] });
    const screen = await renderScreen();
    expect(screen.getByText('Saved questions will wait here.')).toBeTruthy();
  });
});
