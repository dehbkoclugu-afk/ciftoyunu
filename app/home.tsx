/**
 * THESIS: The phone becomes the deck on the table, with one clear invitation to begin.
 * OWN-WORLD: Warm canvas, overlapping plum/coral cards, real question copy, restrained depth.
 * STORY: Understand the ritual, glimpse the quality, then choose who is playing.
 * FIRST VIEWPORT: Compact brand row, left-led promise, one real card, one dominant Play action.
 * FORM: Operate-mode editorial card table with no dashboard chrome or dead downstream actions.
 */
import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { loadEmbeddedContent } from '@/content/loader';
import { categoryColors, useAppTheme } from '@/design';
import { resolvePlayers } from '@/features/player-setup/playerSetup';
import { getLocaleOption } from '@/i18n';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';

const packPresentation: Record<string, { label: string; color: string }> = {
  appreciation: { label: 'Appreciation', color: categoryColors.appreciation },
  deep_night: { label: 'Deep night', color: categoryColors.deep },
  friends_easy: { label: 'Friends', color: categoryColors.friends },
  laugh_together: { label: 'Laugh together', color: categoryColors.fun },
  warm_start: { label: 'Warm start', color: categoryColors.warmUp },
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const locale = useSettingsStore((state) => state.locale);
  const mode = useGameSetupStore((state) => state.mode);
  const players = useGameSetupStore((state) => state.players);
  const setupCompleted = useGameSetupStore((state) => state.setupCompleted);
  const activeSession = useSessionStore((state) => state.activeSession);
  const compact = width < 380;
  const bundle = loadEmbeddedContent(locale);
  const question = bundle?.questions[0];
  const packId = question?.packIds[0] ?? '';
  const presentation = packPresentation[packId] ?? {
    label: 'Conversation',
    color: theme.colors.primary,
  };
  const displayNames = resolvePlayers(players)
    .map((player) => player.displayName)
    .join(' & ');

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <View style={styles.topBar}>
        <View style={styles.brandGroup}>
          <BrandMark size={compact ? 42 : 48} />
          <View style={styles.brandCopy}>
            <AppText variant="h3">Project Duo</AppText>
            <AppText variant="caption" tone="muted">
              One phone. Real conversation.
            </AppText>
          </View>
        </View>
        <AppButton label="Privacy" variant="ghost" onPress={() => router.push('/settings')} />
      </View>

      <View style={[styles.hero, { marginTop: compact ? theme.spacing[7] : theme.spacing[10] }]}>
        <AppText variant={compact ? 'h1' : 'display'}>Put a better question on the table.</AppText>
        <AppText tone="muted" style={styles.heroCopy}>
          Choose who is playing, pass the phone, and take the conversation from there.
        </AppText>
      </View>

      {setupCompleted ? (
        <View
          style={[
            styles.ready,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.button,
            },
          ]}
        >
          <View style={[styles.readyMark, { backgroundColor: theme.colors.mint }]} />
          <View style={styles.readyCopy}>
            <AppText variant="button">
              {mode === 'friends' ? 'Friends ready' : 'Couple ready'}
            </AppText>
            <AppText variant="bodySmall" tone="muted" numberOfLines={2}>
              {displayNames}
            </AppText>
          </View>
        </View>
      ) : null}

      {activeSession ? (
        <View
          style={[
            styles.resume,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.button,
            },
          ]}
        >
          <View style={styles.resumeCopy}>
            <AppText variant="button" style={{ color: theme.colors.onPrimary }}>
              {activeSession.completedAt
                ? 'Your recap is ready'
                : 'Your card is still on the table'}
            </AppText>
            <AppText variant="bodySmall" style={{ color: theme.colors.onPrimary }}>
              {activeSession.packTitle}
            </AppText>
          </View>
          <AppButton
            label={
              activeSession.completedAt
                ? `View ${activeSession.packTitle} recap`
                : `Continue ${activeSession.packTitle}`
            }
            variant="secondary"
            onPress={() => router.push(activeSession.completedAt ? '/recap' : '/play')}
          />
        </View>
      ) : null}

      <View
        style={[styles.cardStage, { marginTop: theme.spacing[7], minHeight: compact ? 270 : 320 }]}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.backCard,
            {
              backgroundColor: theme.colors.coral,
              borderRadius: theme.radius.card,
              transform: [{ rotate: '5deg' }, { translateY: 8 }],
            },
          ]}
        />
        <View
          accessible
          accessibilityLabel={
            question
              ? `${presentation.label}. ${question.text}`
              : 'Questions unavailable in this language'
          }
          style={[
            styles.questionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.card,
              minHeight: compact ? 256 : 306,
              padding: compact ? 22 : 26,
              shadowColor: theme.colors.ink,
            },
          ]}
        >
          {question ? (
            <>
              <View style={[styles.categoryBar, { backgroundColor: presentation.color }]} />
              <AppText variant="caption" tone="muted" style={styles.categoryLabel}>
                {presentation.label}
              </AppText>
              <AppText
                variant={compact ? 'questionSmall' : 'questionMedium'}
                style={styles.question}
              >
                {question.text}
              </AppText>
              <AppText variant="bodySmall" tone="muted">
                Both answer. Take your time.
              </AppText>
            </>
          ) : (
            <View style={styles.emptyCopy}>
              <AppText variant="h2">
                Questions are not ready in {getLocaleOption(locale).nativeName} yet.
              </AppText>
              <AppText tone="muted">
                We will never mix English questions into a different language pack.
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={activeSession ? 'Start a new table' : 'Play together'}
          variant={activeSession ? 'secondary' : 'primary'}
          accessibilityHint="Choose Couple or Friends mode"
          onPress={() => router.push('/mode')}
        />
        <AppButton
          label="Saved questions"
          variant="ghost"
          onPress={() => router.push('/favorites')}
        />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          No account. No answers saved. Passing is always allowed.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandCopy: { gap: 1 },
  hero: { maxWidth: 580 },
  heroCopy: { marginTop: 12, maxWidth: 500 },
  ready: {
    minHeight: 72,
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readyMark: { width: 12, height: 36, borderRadius: 6 },
  readyCopy: { flex: 1, gap: 2 },
  resume: { marginTop: 18, padding: 14, gap: 12 },
  resumeCopy: { gap: 2 },
  cardStage: { minHeight: 320, width: '100%', maxWidth: 560, alignSelf: 'center' },
  backCard: { position: 'absolute', inset: 12 },
  questionCard: {
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 6,
  },
  categoryBar: { width: 38, height: 6, borderRadius: 3 },
  categoryLabel: { marginTop: 12 },
  question: { marginVertical: 22, maxWidth: 480 },
  emptyCopy: { flex: 1, justifyContent: 'center', gap: 12 },
  actions: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12, marginTop: 28 },
  centered: { textAlign: 'center' },
});
