/**
 * THESIS: Saved questions are a small personal deck, not a content-management library.
 * OWN-WORLD: One large question surface with two quiet filter rails and plain navigation.
 * STORY: Narrow the saved deck, read one card, keep it or remove it.
 * FIRST VIEWPORT: Back action, count, filters, then the current saved question at full scale.
 * FORM: Operate-mode single-card viewer inside the established warm editorial world.
 */
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { loadEmbeddedContent } from '@/content/loader';
import type { RuntimeQuestion } from '@/content/schema/schemas';
import { useAppTheme } from '@/design';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';

function humanize(value: string): string {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function FavoritesScreen() {
  const theme = useAppTheme();
  const locale = useSettingsStore((state) => state.locale);
  const favoriteIds = useSessionStore((state) => state.favoriteIds);
  const toggleFavorite = useSessionStore((state) => state.toggleFavorite);
  const [packFilter, setPackFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState<RuntimeQuestion['topicTags'][number] | 'all'>(
    'all',
  );
  const [index, setIndex] = useState(0);
  const bundle = loadEmbeddedContent(locale);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const resolved = useMemo(
    () => bundle?.questions.filter((question) => favoriteSet.has(question.id)) ?? [],
    [bundle, favoriteSet],
  );
  const packs = [...new Set(resolved.flatMap((question) => question.packIds))];
  const topics = [...new Set(resolved.flatMap((question) => question.topicTags))];
  const filtered = resolved.filter(
    (question) =>
      (packFilter === 'all' || question.packIds.includes(packFilter)) &&
      (topicFilter === 'all' || question.topicTags.includes(topicFilter)),
  );
  const currentIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const current = filtered[currentIndex];

  const packTitle = (packId: string) =>
    bundle?.packCopy.find((copy) => copy.packId === packId)?.title ?? humanize(packId);

  if (resolved.length === 0) {
    return (
      <AppScreen contentStyle={styles.empty}>
        <AppText variant="display">Saved questions will wait here.</AppText>
        <AppText tone="muted">
          Tap Save favorite during a game to build a small deck of your own.
        </AppText>
        <AppButton label="Back" onPress={() => router.back()} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
      <View style={styles.intro}>
        <AppText variant="display">Saved questions.</AppText>
        <AppText tone="muted">
          {resolved.length} available in this language. Other languages stay safely saved.
        </AppText>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          label="All packs"
          selected={packFilter === 'all'}
          onPress={() => {
            setPackFilter('all');
            setIndex(0);
          }}
        />
        {packs.map((packId) => (
          <Chip
            key={packId}
            label={packTitle(packId)}
            selected={packFilter === packId}
            onPress={() => {
              setPackFilter(packId);
              setIndex(0);
            }}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          label="All topics"
          selected={topicFilter === 'all'}
          onPress={() => {
            setTopicFilter('all');
            setIndex(0);
          }}
        />
        {topics.map((topic) => (
          <Chip
            key={topic}
            label={humanize(topic)}
            selected={topicFilter === topic}
            onPress={() => {
              setTopicFilter(topic);
              setIndex(0);
            }}
          />
        ))}
      </ScrollView>

      {current ? (
        <View
          accessible
          accessibilityLabel={`Saved question ${currentIndex + 1} of ${filtered.length}. ${current.text}`}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.card,
              shadowColor: theme.colors.ink,
            },
          ]}
        >
          <View style={[styles.seam, { backgroundColor: theme.colors.coral }]} />
          <AppText variant="caption" tone="muted">
            {humanize(current.topicTags[0] ?? 'conversation')} ·{' '}
            {packTitle(current.packIds[0] ?? '')}
          </AppText>
          <AppText variant="questionMedium">{current.text}</AppText>
          {current.followUp ? <AppText tone="muted">{current.followUp}</AppText> : null}
        </View>
      ) : (
        <View style={styles.noMatch}>
          <AppText variant="h2">No saved question matches both filters.</AppText>
          <AppButton
            label="Clear filters"
            variant="secondary"
            onPress={() => {
              setPackFilter('all');
              setTopicFilter('all');
              setIndex(0);
            }}
          />
        </View>
      )}

      {current ? (
        <View style={styles.actions}>
          <AppButton
            label="Previous saved question"
            variant="secondary"
            disabled={currentIndex === 0}
            onPress={() => setIndex((value) => Math.max(0, value - 1))}
          />
          <AppButton
            label="Next saved question"
            variant="secondary"
            disabled={currentIndex >= filtered.length - 1}
            onPress={() => setIndex((value) => Math.min(filtered.length - 1, value + 1))}
          />
          <AppButton
            label="Remove favorite"
            variant="ghost"
            onPress={() => void toggleFavorite(current.id)}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { width: 92, marginLeft: -20 },
  intro: { marginTop: 16, gap: 8 },
  filters: { paddingTop: 18, gap: 8, paddingRight: 20 },
  card: {
    minHeight: 330,
    marginTop: 24,
    padding: 26,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 6,
  },
  seam: { position: 'absolute', left: 0, top: 28, bottom: 28, width: 1 },
  actions: { marginTop: 20, gap: 10 },
  noMatch: { minHeight: 250, justifyContent: 'center', gap: 16 },
  empty: { justifyContent: 'center', gap: 16, maxWidth: 560 },
});
