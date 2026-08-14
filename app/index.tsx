/**
 * THESIS: One shared phone becomes a doorway back to each other, never a dashboard.
 * OWN-WORLD: Warm canvas, plum fields, coral energy, overlapping physical cards, soft geometry.
 * STORY: See a real question immediately, choose a mood, then deal another without setup friction.
 * FIRST VIEWPORT: Brand at top, statement left, a tilted live question card owning the lower half.
 * FORM: Operate-mode editorial card table; asymmetric, tactile, and intentionally free of tab chrome.
 */
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { categoryColors, useAppTheme } from '@/design';

const questions = [
  {
    category: 'Warm start',
    text: 'What small thing makes an ordinary day together feel special?',
    color: categoryColors.warmUp,
  },
  {
    category: 'Laugh together',
    text: 'If one object in your home could gossip about you, which would know the most?',
    color: categoryColors.fun,
  },
  {
    category: 'Deep night',
    text: 'What part of you took the longest to learn how to protect?',
    color: categoryColors.deep,
  },
] as const;

export default function HomeScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [mode, setMode] = useState<'couple' | 'friends'>('couple');
  const question = questions[questionIndex] ?? questions[0];
  const compact = width < 380;

  const dealNext = () => setQuestionIndex((current) => (current + 1) % questions.length);

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <View style={styles.topBar}>
        <View style={styles.identity}>
          <BrandMark size={compact ? 40 : 46} />
          <AppText variant="h3">Project Duo</AppText>
        </View>
        <AppText variant="caption" tone="muted">
          One phone · Real talk
        </AppText>
      </View>

      <View style={[styles.hero, { marginTop: compact ? theme.spacing[6] : theme.spacing[10] }]}>
        <AppText variant={compact ? 'h1' : 'display'}>Put the phone between you.</AppText>
        <AppText tone="muted" style={styles.heroCopy}>
          Pick a mood, deal a card, and discover something you did not know to ask.
        </AppText>
        <View style={styles.chips}>
          <Chip label="Couple" selected={mode === 'couple'} onPress={() => setMode('couple')} />
          <Chip label="Friends" selected={mode === 'friends'} onPress={() => setMode('friends')} />
        </View>
      </View>

      <View style={[styles.cardStage, { marginTop: theme.spacing[8] }]}>
        <View
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
          accessibilityLabel={`${question.category}. ${question.text}`}
          style={[
            styles.questionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.card,
            },
          ]}
        >
          <View style={[styles.categoryDot, { backgroundColor: question.color }]} />
          <AppText variant="caption" tone="muted" style={styles.categoryLabel}>
            {question.category}
          </AppText>
          <AppText variant={compact ? 'questionSmall' : 'questionMedium'} style={styles.question}>
            {question.text}
          </AppText>
          <AppText variant="bodySmall" tone="muted">
            Both answer · Take your time
          </AppText>
        </View>
      </View>

      <View style={[styles.actions, { marginTop: theme.spacing[8] }]}>
        <AppButton label="Deal another card" onPress={dealNext} />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          No account. No answers saved. Skip any card.
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
    gap: 16,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hero: { maxWidth: 560 },
  heroCopy: { marginTop: 12, maxWidth: 480 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  cardStage: { minHeight: 330, width: '100%', maxWidth: 560, alignSelf: 'center' },
  backCard: { position: 'absolute', inset: 12 },
  questionCard: {
    minHeight: 320,
    padding: 28,
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#2A1529',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 6,
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  categoryLabel: { textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 10 },
  question: { marginVertical: 24, maxWidth: 480 },
  actions: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
  centered: { textAlign: 'center' },
});
