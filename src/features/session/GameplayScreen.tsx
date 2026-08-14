/**
 * THESIS: The phone is one card on the table; gameplay refuses dashboard chrome.
 * OWN-WORLD: Full-height cream/plum card, one intensity seam, compact starter ribbon.
 * STORY: See who starts, talk, then pass, save, or move forward without punishment.
 * FIRST VIEWPORT: Pause and progress above one oversized card; three plain actions below.
 * FORM: Operate-mode tactile card stage, first-ranked for face-to-face attention.
 */
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { getLocaleOption } from '@/i18n';
import { useSessionStore } from '@/state/sessionStore';

import { getSwipeAction, getViewedQuestions, type CardAction } from './gameplay';
import { PauseSheet } from './PauseSheet';
import { QuestionCard } from './QuestionCard';
import { SessionProgress } from './SessionProgress';

type GameActionProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function GameAction({ label, selected = false, disabled = false, onPress }: GameActionProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceRaised,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderRadius: theme.radius.button,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <AppText
        variant="button"
        style={{ color: selected ? theme.colors.onPrimary : theme.colors.ink }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function GameplayScreen() {
  const theme = useAppTheme();
  const [paused, setPaused] = useState(false);
  const activeSession = useSessionStore((state) => state.activeSession);
  const favoriteIds = useSessionStore((state) => state.favoriteIds);
  const persistenceFailed = useSessionStore((state) => state.persistenceFailed);
  const resume = useSessionStore((state) => state.resume);
  const advance = useSessionStore((state) => state.advance);
  const toggleFavorite = useSessionStore((state) => state.toggleFavorite);
  const complete = useSessionStore((state) => state.complete);
  const clear = useSessionStore((state) => state.clear);

  useEffect(() => {
    if (!activeSession) router.replace('/home');
    else if (!activeSession.completedAt) void resume();
    else router.replace('/recap');
    // Resume only when entering this route, not on each persisted card update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCard = activeSession?.cards[activeSession.currentIndex];
  const currentQuestionId = currentCard?.kind === 'question' ? currentCard.question.id : null;
  const favorite = currentQuestionId ? favoriteIds.includes(currentQuestionId) : false;
  const rtl = activeSession ? getLocaleOption(activeSession.locale).rtl : false;

  const move = async (action: CardAction) => {
    const next = await advance(action);
    if (next?.completedAt) router.replace('/recap');
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          const action = getSwipeAction(gesture.dx, gesture.vx);
          if (action) void move(action);
        },
      }),
    // Store actions are stable for the lifetime of the bound store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [advance],
  );

  if (!activeSession || !currentCard) return null;

  const end = async () => {
    setPaused(false);
    const completed = await complete();
    if (completed && getViewedQuestions(completed).length >= 5) router.replace('/recap');
    else {
      await clear();
      router.replace('/home');
    }
  };

  return (
    <AppScreen contentStyle={{ paddingBottom: theme.spacing[5] }}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause session"
          hitSlop={8}
          onPress={() => setPaused(true)}
          style={({ pressed }) => [styles.pause, { opacity: pressed ? 0.6 : 1 }]}
        >
          <AppText variant="button" tone="primary">
            Pause
          </AppText>
        </Pressable>
        <SessionProgress
          current={activeSession.currentIndex + 1}
          total={activeSession.cards.length}
        />
        <AppText variant="caption" tone="muted" numberOfLines={1} style={styles.packTitle}>
          {activeSession.packTitle}
        </AppText>
      </View>

      {persistenceFailed ? (
        <AppText accessibilityRole="alert" variant="caption" tone="danger" style={styles.warning}>
          Progress may not resume after closing the app. You can keep playing.
        </AppText>
      ) : null}

      <View style={styles.stage}>
        <View style={styles.flex} {...panResponder.panHandlers}>
          <QuestionCard card={currentCard} players={activeSession.players} rtl={rtl} />
        </View>
      </View>

      <View style={styles.actions}>
        <GameAction label="Pass" onPress={() => void move('skip')} />
        <GameAction
          label={
            currentQuestionId
              ? favorite
                ? 'Remove favorite'
                : 'Save favorite'
              : 'Favorite unavailable'
          }
          selected={favorite}
          disabled={!currentQuestionId}
          onPress={() => currentQuestionId && void toggleFavorite(currentQuestionId)}
        />
        <GameAction label="Next" onPress={() => void move('next')} />
      </View>

      <PauseSheet
        visible={paused}
        canReport={currentCard.kind === 'question'}
        onContinue={() => setPaused(false)}
        onAnother={() => {
          setPaused(false);
          void move('skip');
        }}
        onReport={() => {
          setPaused(false);
          void move('reported');
        }}
        onChangeFilters={() => {
          setPaused(false);
          void complete().then(() => router.replace('/session-setup'));
        }}
        onEnd={() => void end()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pause: { minWidth: 54, minHeight: 44, justifyContent: 'center' },
  packTitle: { width: 78, textAlign: 'right' },
  warning: { textAlign: 'center', marginBottom: 8 },
  stage: { flex: 1, width: '100%', maxWidth: 590, alignSelf: 'center', paddingVertical: 8 },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  action: {
    minHeight: 54,
    minWidth: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
});
