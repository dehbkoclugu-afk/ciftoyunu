import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/design/ThemeProvider';
import { insertSpecialCards, type ActiveSession } from '@/features/session/gameplay';
import { buildSession } from '@/features/session/sessionEngine';
import { resolvePlayers } from '@/features/player-setup/playerSetup';
import { loadEmbeddedContent } from '@/content/loader';
import { useSessionStore } from '@/state/sessionStore';

import { GameplayScreen } from './GameplayScreen';
import { PauseSheet } from './PauseSheet';
import { QuestionCard } from './QuestionCard';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

const bundle = loadEmbeddedContent('en')!;
const players = resolvePlayers([
  { id: 'player-1', name: 'Maya' },
  { id: 'player-2', name: 'Noah' },
]);

function createActive(patch: Partial<ActiveSession> = {}): ActiveSession {
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
    seed: 'screen-seed',
    now: 1_000,
  });
  return {
    id: 'session-1',
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
    seed: 'screen-seed',
    cards: insertSpecialCards(plan.questions, players, 'warm_start', 'screen-seed'),
    currentIndex: 0,
    currentViewedAt: 1_000,
    favoriteIdsAtStart: [],
    skippedIds: [],
    reportedIds: [],
    outcomes: [],
    startedAt: 1_000,
    lastActiveAt: 1_000,
    ...patch,
  };
}

function renderGameplay() {
  return render(
    <ThemeProvider forcedScheme="light">
      <GameplayScreen />
    </ThemeProvider>,
  );
}

describe('gameplay screen', () => {
  const original = useSessionStore.getState();

  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({
      activeSession: createActive(),
      favoriteIds: [],
      persistenceFailed: false,
      resume: jest.fn(async () => undefined),
      advance: jest.fn(async () => createActive({ currentIndex: 1 })),
      toggleFavorite: jest.fn(async () => undefined),
      complete: jest.fn(async () => createActive({ completedAt: 5_000 })),
      clear: jest.fn(async () => undefined),
    });
  });

  afterAll(() => useSessionStore.setState(original));

  it('redirects missing sessions safely', async () => {
    useSessionStore.setState({ activeSession: null });
    await renderGameplay();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/home'));
  });

  it('announces progress and addresses the assigned starter', async () => {
    const screen = await renderGameplay();

    expect(screen.getByLabelText('Card 1 of 11')).toBeTruthy();
    expect(screen.getByText(/answer first/i)).toHaveTextContent(/Maya|Noah/);
  });

  it('keeps favorite separate from Pass and Next', async () => {
    const screen = await renderGameplay();
    const state = useSessionStore.getState();
    const question = state.activeSession!.cards[0]!;

    await fireEvent.press(screen.getByRole('button', { name: 'Save favorite' }));
    expect(state.toggleFavorite).toHaveBeenCalledWith(
      question.kind === 'question' ? question.question.id : '',
    );
    expect(state.advance).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Pass' }));
    expect(state.advance).toHaveBeenCalledWith('skip');
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(state.advance).toHaveBeenCalledWith('next');
  });

  it('navigates to recap when advancing completes the session', async () => {
    useSessionStore.setState({
      advance: jest.fn(async () => createActive({ completedAt: 5_000 })),
    });
    const screen = await renderGameplay();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/recap'));
  });

  it('renders long RTL question copy without clipping it', async () => {
    const active = createActive();
    const first = active.cards[0]!;
    if (first.kind !== 'question') throw new Error('Expected question');
    first.question = { ...first.question, text: 'س'.repeat(220), locale: 'ar' };
    const screen = await render(
      <ThemeProvider forcedScheme="dark">
        <QuestionCard card={first} players={players} rtl />
      </ThemeProvider>,
    );

    const text = screen.getByText('س'.repeat(220));
    expect(text.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ textAlign: 'right' })]),
    );
  });
});

describe('pause sheet', () => {
  it('requires explicit confirmation for report, filters, and end', async () => {
    const onContinue = jest.fn();
    const onAnother = jest.fn();
    const onReport = jest.fn();
    const onChangeFilters = jest.fn();
    const onEnd = jest.fn();
    const screen = await render(
      <ThemeProvider forcedScheme="light">
        <PauseSheet
          visible
          canReport
          onContinue={onContinue}
          onAnother={onAnother}
          onReport={onReport}
          onChangeFilters={onChangeFilters}
          onEnd={onEnd}
        />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Report this question' }));
    expect(onReport).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Report and pass' }));
    expect(onReport).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Change topic filters' }));
    await fireEvent.press(screen.getByRole('button', { name: 'End and change filters' }));
    expect(onChangeFilters).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'End session' }));
    await fireEvent.press(screen.getByRole('button', { name: 'End this session' }));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
