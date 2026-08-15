/**
 * THESIS: Recap remembers the conversation without scoring the relationship.
 * OWN-WORLD: Quiet warm canvas, three plain measures, one preserved question card.
 * STORY: Notice time together, keep one question, save or share a private-safe summary.
 * FIRST VIEWPORT: Human closing line followed by counts that describe, never judge.
 * FORM: Operate-mode closing ledger extending the physical card-table world.
 */
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { getSessionMetrics, getViewedQuestions } from '@/features/session/gameplay';
import { useSessionStore } from '@/state/sessionStore';
import { usePurchaseStore } from '@/state/purchaseStore';
import { track } from '@/services/analytics/runtime';

function minutesLabel(elapsedMs: number): string {
  const minutes = Math.max(1, Math.round(elapsedMs / 60_000));
  return `${minutes} min`;
}

export function RecapScreen() {
  const theme = useAppTheme();
  const [shareFailed, setShareFailed] = useState(false);
  const activeSession = useSessionStore((state) => state.activeSession);
  const favoriteIds = useSessionStore((state) => state.favoriteIds);
  const chooseKeeper = useSessionStore((state) => state.chooseKeeper);
  const clear = useSessionStore((state) => state.clear);
  const premium = usePurchaseStore((state) => state.entitlement === 'premium');
  const trackedSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!activeSession) router.replace('/home');
    else if (!activeSession.completedAt) router.replace('/play');
    else if (trackedSessionId.current !== activeSession.id) {
      trackedSessionId.current = activeSession.id;
      track('recap_viewed', {
        session_id: activeSession.id,
        pack_id: activeSession.packIds[0] ?? 'unknown',
      });
    }
  }, [activeSession]);

  if (!activeSession?.completedAt) return null;
  const viewed = getViewedQuestions(activeSession);
  const metrics = getSessionMetrics(activeSession, favoriteIds);
  const keeper = viewed.find((question) => question.id === activeSession.keeperQuestionId);

  const share = async () => {
    setShareFailed(false);
    const keeperCopy = keeper?.shortShareText ?? keeper?.text;
    const message = [
      activeSession.packTitle,
      `${metrics.viewedQuestions} cards · ${minutesLabel(metrics.elapsedMs)}`,
      keeperCopy ? `Question to keep: ${keeperCopy}` : 'One phone. Real conversation.',
    ].join('\n');
    try {
      await Share.share({ message, title: `${activeSession.packTitle} recap` });
    } catch {
      setShareFailed(true);
    }
  };

  const leave = async (route: '/home' | '/packs') => {
    await clear();
    router.replace(route);
  };

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.intro}>
        <AppText variant="caption" tone="primary">
          {activeSession.packTitle}
        </AppText>
        <AppText variant="display">That was time well spent.</AppText>
        <AppText tone="muted">No score. Just a few things worth carrying off the table.</AppText>
      </View>

      <View style={styles.metrics}>
        {[
          [String(metrics.viewedQuestions), 'Cards seen'],
          [String(metrics.favoritesAdded), 'Saved tonight'],
          [minutesLabel(metrics.elapsedMs), 'Together'],
        ].map(([value, label]) => (
          <View key={label} style={styles.metric}>
            <AppText variant="h1">{value}</AppText>
            <AppText variant="caption" tone="muted">
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <AppText variant="h2">Keep one question from tonight.</AppText>
        <AppText tone="muted">It stays with your saved recap, not with an answer.</AppText>
        <ScrollView
          horizontal
          contentContainerStyle={styles.keepers}
          showsHorizontalScrollIndicator={false}
        >
          {viewed.map((question) => {
            const selected = question.id === activeSession.keeperQuestionId;
            return (
              <Pressable
                key={question.id}
                accessibilityRole="button"
                accessibilityLabel={`Keep: ${question.text}`}
                accessibilityState={{ selected }}
                onPress={() => void chooseKeeper(question.id)}
                style={({ pressed }) => [
                  styles.keeper,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    borderRadius: theme.radius.button,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <AppText
                  variant="bodySmall"
                  numberOfLines={5}
                  style={{ color: selected ? theme.colors.onPrimary : theme.colors.ink }}
                >
                  {question.text}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View
        style={[
          styles.shareCard,
          { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.card },
        ]}
      >
        <View style={[styles.shareMark, { backgroundColor: theme.colors.coral }]} />
        <AppText variant="h3">{activeSession.packTitle}</AppText>
        <AppText tone="muted">
          {metrics.viewedQuestions} cards · {minutesLabel(metrics.elapsedMs)}
        </AppText>
        {keeper ? (
          <AppText variant="questionSmall">{keeper.shortShareText ?? keeper.text}</AppText>
        ) : null}
      </View>

      {shareFailed ? (
        <AppText accessibilityRole="alert" variant="bodySmall" tone="danger" style={styles.alert}>
          Sharing is unavailable right now. You can try again.
        </AppText>
      ) : null}

      {!premium ? (
        <View
          style={[
            styles.upsell,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.card },
          ]}
        >
          <AppText variant="caption" style={{ color: theme.colors.onPrimary }}>
            KEEP THE TABLE OPEN
          </AppText>
          <AppText variant="h2" style={{ color: theme.colors.onPrimary }}>
            Open every conversation.
          </AppText>
          <AppButton label="See premium plans" onPress={() => router.push('/premium')} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          label={`Play ${activeSession.packTitle} again`}
          onPress={() => router.replace('/session-setup')}
        />
        <AppButton
          label="Choose another pack"
          variant="secondary"
          onPress={() => void leave('/packs')}
        />
        <AppButton label="Share recap" variant="secondary" onPress={() => void share()} />
        <AppButton
          label="Open saved questions"
          variant="ghost"
          onPress={() => router.push('/favorites')}
        />
        <AppButton label="Done" variant="ghost" onPress={() => void leave('/home')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 34, gap: 10, maxWidth: 570 },
  metrics: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  metric: { flex: 1, gap: 3 },
  section: { marginTop: 36, gap: 8 },
  keepers: { gap: 10, paddingTop: 8, paddingRight: 20 },
  keeper: { width: 220, minHeight: 150, padding: 18, borderWidth: 1, justifyContent: 'center' },
  shareCard: {
    marginTop: 34,
    padding: 26,
    minHeight: 210,
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  shareMark: { position: 'absolute', left: 0, top: 26, bottom: 26, width: 1 },
  alert: { marginTop: 12 },
  upsell: { marginTop: 28, padding: 24, gap: 12 },
  actions: { marginTop: 28, gap: 10 },
});
