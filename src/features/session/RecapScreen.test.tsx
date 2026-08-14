import { Share } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import { insertSpecialCards, type ActiveSession } from '@/features/session/gameplay';
import { buildSession } from '@/features/session/sessionEngine';
import { resolvePlayers } from '@/features/player-setup/playerSetup';
import { loadEmbeddedContent } from '@/content/loader';
import { useSessionStore } from '@/state/sessionStore';

import { RecapScreen } from './RecapScreen';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

const bundle = loadEmbeddedContent('en')!;
const players = resolvePlayers([
  { id: 'player-1', name: 'Maya' },
  { id: 'player-2', name: 'Noah' },
]);

function completedSession(): ActiveSession {
  const plan = buildSession({
    bundle,
    mode: 'couple',
    packIds: ['warm_start'],
    entitledPackIds: [],
    players,
    durationMinutes: 10,
    intensityPreset: 'mixed',
    ageConfirmed18: false,
    matureContentEnabled: false,
    excludedTopics: [],
    seenHistory: [],
    seed: 'recap-seed',
    now: 1_000,
  });
  const cards = insertSpecialCards(plan.questions, players, 'warm_start', 'recap-seed');
  return {
    id: 'session-recap',
    locale: 'en',
    contentVersion: bundle.contentVersion,
    mode: 'couple',
    packIds: ['warm_start'],
    packTitle: 'Warm Start',
    players,
    durationMinutes: 10,
    intensityPreset: 'mixed',
    allowMature: false,
    excludedTopics: [],
    seed: 'recap-seed',
    cards,
    currentIndex: 4,
    currentViewedAt: 50_000,
    favoriteIdsAtStart: [],
    skippedIds: [],
    reportedIds: [],
    outcomes: cards.slice(0, 4).map((card, index) => ({
      cardId: card.instanceId,
      viewedAt: 1_000 + index * 10_000,
      leftAt: 10_000 + index * 10_000,
      action: 'next' as const,
      engagement: 'engaged_card' as const,
    })),
    startedAt: 1_000,
    lastActiveAt: 61_000,
    completedAt: 61_000,
  };
}

function renderScreen() {
  return render(
    <ThemeProvider forcedScheme="light">
      <RecapScreen />
    </ThemeProvider>,
  );
}

describe('recap screen', () => {
  const original = useSessionStore.getState();

  beforeEach(() => {
    jest.clearAllMocks();
    const session = completedSession();
    const firstQuestion = session.cards.find((card) => card.kind === 'question')!;
    useSessionStore.setState({
      activeSession: session,
      favoriteIds: [firstQuestion.kind === 'question' ? firstQuestion.question.id : ''],
      chooseKeeper: jest.fn(async () => undefined),
      clear: jest.fn(async () => undefined),
    });
  });

  afterAll(() => useSessionStore.setState(original));

  it('shows honest viewed, favorite, and duration metrics', async () => {
    const screen = await renderScreen();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('Cards seen')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Saved tonight')).toBeTruthy();
    expect(screen.getByText('1 min')).toBeTruthy();
  });

  it('stores a viewed keeper question', async () => {
    const screen = await renderScreen();
    const keeper = screen.getAllByRole('button', { name: /^Keep:/ })[0]!;
    await fireEvent.press(keeper);
    expect(useSessionStore.getState().chooseKeeper).toHaveBeenCalled();
  });

  it('shares counts and question copy without player names', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Share recap' }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    const message = share.mock.calls[0]![0].message!;
    expect(message).toContain('Warm Start');
    expect(message).not.toContain('Maya');
    expect(message).not.toContain('Noah');
  });

  it('shows share failures but treats dismissal as normal', async () => {
    const share = jest.spyOn(Share, 'share');
    share.mockRejectedValueOnce(new Error('share unavailable'));
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Share recap' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Sharing is unavailable right now/);

    share.mockResolvedValueOnce({ action: Share.dismissedAction });
    await fireEvent.press(screen.getByRole('button', { name: 'Share recap' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('offers replay, another pack, favorites, and done actions', async () => {
    const screen = await renderScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Play Warm Start again' }));
    expect(mockReplace).toHaveBeenCalledWith('/session-setup');
    await fireEvent.press(screen.getByRole('button', { name: 'Choose another pack' }));
    expect(mockReplace).toHaveBeenCalledWith('/packs');
    await fireEvent.press(screen.getByRole('button', { name: 'Open saved questions' }));
    expect(mockPush).toHaveBeenCalledWith('/favorites');
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/home'));
  });
});
