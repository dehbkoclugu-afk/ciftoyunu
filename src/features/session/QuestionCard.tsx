import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { categoryColors, useAppTheme } from '@/design';
import type { Player } from '@/features/player-setup/playerSetup';

import { getQuestionTextTier, type SessionCard } from './gameplay';

type QuestionCardProps = {
  card: SessionCard;
  players: readonly Player[];
  rtl?: boolean;
};

const intensityColors = {
  1: categoryColors.warmUp,
  2: categoryColors.fun,
  3: categoryColors.appreciation,
  4: categoryColors.deep,
  5: categoryColors.conflict,
} as const;

function humanize(value: string): string {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function starterCopy(card: SessionCard, players: readonly Player[]): string {
  const names = card.starterPlayerIds.flatMap((id) => {
    const player = players.find((candidate) => candidate.id === id);
    return player ? [player.displayName] : [];
  });
  if (names.length !== 1) return 'Answer together. Take your time.';
  return `${names[0]}, you answer first.`;
}

export function QuestionCard({ card, players, rtl = false }: QuestionCardProps) {
  const theme = useAppTheme();
  const textAlign = rtl ? 'right' : 'left';

  if (card.kind === 'special') {
    return (
      <View
        accessible
        accessibilityLabel={`${card.title}. ${card.instruction}`}
        style={[
          styles.card,
          styles.special,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.card,
            shadowColor: theme.colors.ink,
          },
        ]}
      >
        <View style={[styles.seam, { backgroundColor: theme.colors.coral }]} />
        <AppText variant="caption" style={{ color: theme.colors.onPrimary, textAlign }}>
          SPECIAL CARD
        </AppText>
        <View style={styles.specialCopy}>
          <AppText variant="h1" style={{ color: theme.colors.onPrimary, textAlign }}>
            {card.title}
          </AppText>
          <AppText variant="questionSmall" style={{ color: theme.colors.onPrimary, textAlign }}>
            {card.instruction}
          </AppText>
        </View>
        <AppText variant="bodySmall" style={{ color: theme.colors.onPrimary, textAlign }}>
          {starterCopy(card, players)}
        </AppText>
      </View>
    );
  }

  const tier = getQuestionTextTier(card.question.text);
  const variant = {
    large: 'questionLarge',
    medium: 'questionMedium',
    small: 'questionSmall',
  }[tier] as 'questionLarge' | 'questionMedium' | 'questionSmall';
  const category = humanize(card.question.topicTags[0] ?? 'conversation');

  return (
    <View
      accessible
      accessibilityLabel={`${category}. ${starterCopy(card, players)} ${card.question.text}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          shadowColor: theme.colors.ink,
        },
      ]}
    >
      <View style={[styles.seam, { backgroundColor: intensityColors[card.question.intensity] }]} />
      <View style={styles.meta}>
        <AppText variant="caption" tone="muted" style={{ textAlign }}>
          {category}
        </AppText>
        <AppText variant="bodySmall" tone="primary" style={{ textAlign }}>
          {starterCopy(card, players)}
        </AppText>
      </View>
      <ScrollView
        contentContainerStyle={styles.questionScroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={tier === 'small'}
      >
        <AppText variant={variant} style={{ textAlign, writingDirection: rtl ? 'rtl' : 'ltr' }}>
          {card.question.text}
        </AppText>
        {card.question.followUp ? (
          <AppText tone="muted" style={{ marginTop: 18, textAlign }}>
            {card.question.followUp}
          </AppText>
        ) : null}
      </ScrollView>
      <AppText variant="caption" tone="muted" style={{ textAlign }}>
        Take your time. Passing is always fine.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 360,
    padding: 26,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 7,
  },
  special: { justifyContent: 'space-between' },
  seam: { position: 'absolute', left: 0, top: 28, bottom: 28, width: 1 },
  meta: { gap: 8 },
  questionScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 22 },
  specialCopy: { gap: 18 },
});
