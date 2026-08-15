import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { BrandMark } from '@/components/BrandMark';
import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { HowItWorksSheet } from '@/features/onboarding/HowItWorksSheet';
import { OnboardingHeader } from '@/features/onboarding/OnboardingHeader';
import { track } from '@/services/analytics/runtime';

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <OnboardingHeader current={2} onBack={() => router.back()} />

      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <BrandMark size={48} />
          <AppText variant="h3">Project Duo</AppText>
        </View>
        <AppText variant="display">Put the phone between you.</AppText>
        <AppText tone="muted">
          Pick a mood, deal a card, and discover something you did not know to ask.
        </AppText>
      </View>

      <View style={styles.cardStage}>
        <View
          style={[
            styles.backCard,
            {
              backgroundColor: theme.colors.coral,
              borderRadius: theme.radius.card,
              transform: [{ rotate: '5deg' }, { translateY: 7 }],
            },
          ]}
        />
        <View
          accessible
          accessibilityLabel="Sample question. What small thing makes an ordinary day together feel special?"
          style={[
            styles.questionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.card,
            },
          ]}
        >
          <AppText variant="caption" tone="muted">
            WARM START
          </AppText>
          <AppText variant="questionSmall">
            What small thing makes an ordinary day together feel special?
          </AppText>
          <AppText variant="bodySmall" tone="muted">
            Both answer · Take your time
          </AppText>
        </View>
      </View>

      <View style={styles.benefits}>
        <View style={styles.benefit}>
          <View style={[styles.bullet, { backgroundColor: theme.colors.mint }]} />
          <AppText>No account required</AppText>
        </View>
        <View style={styles.benefit}>
          <View style={[styles.bullet, { backgroundColor: theme.colors.gold }]} />
          <AppText>Play together on one phone</AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Let's begin"
          onPress={() => {
            track('onboarding_started');
            router.push('/onboarding/comfort');
          }}
        />
        <AppButton label="How it works" onPress={() => setShowHowItWorks(true)} variant="ghost" />
      </View>

      <HowItWorksSheet visible={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 24, gap: 12, maxWidth: 580 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardStage: { minHeight: 286, width: '100%', maxWidth: 560, alignSelf: 'center', marginTop: 34 },
  backCard: { position: 'absolute', inset: 12 },
  questionCard: {
    minHeight: 276,
    padding: 26,
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#2A1529',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 5,
  },
  benefits: { gap: 12, marginTop: 28 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bullet: { width: 12, height: 12, borderRadius: 6 },
  actions: { gap: 8, marginTop: 30 },
});
