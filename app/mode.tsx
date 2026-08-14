/**
 * THESIS: Choosing who is playing should feel like dealing the first card, not filling a form.
 * OWN-WORLD: Warm canvas, plum/coral player discs, large tactile cards, quiet supporting copy.
 * STORY: Compare two honest modes, make one explicit choice, continue without auto-advance.
 * FIRST VIEWPORT: Back action, short title, then two oversized mode cards and one fixed-intent CTA.
 * FORM: Operate-mode selection surface, restrained motion, accessible radio semantics.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { ModeCard } from '@/features/player-setup/ModeCard';
import { useGameSetupStore } from '@/state/gameSetupStore';

export default function ModeScreen() {
  const theme = useAppTheme();
  const mode = useGameSetupStore((state) => state.mode);
  const selectMode = useGameSetupStore((state) => state.selectMode);

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View style={styles.intro}>
        <AppText variant="display">Who is playing?</AppText>
        <AppText tone="muted">Choose a mode now. Nothing starts until everyone is ready.</AppText>
      </View>

      <View accessibilityRole="radiogroup" style={styles.options}>
        <ModeCard
          mode="couple"
          title="Couple"
          description="Romantic, playful, and deeper questions for two."
          playerCount="2 players"
          selected={mode === 'couple'}
          onSelect={selectMode}
        />
        <ModeCard
          mode="friends"
          title="Friends"
          description="Fast stories, hot takes, and wildcards for the group."
          playerCount="2-8 players"
          selected={mode === 'friends'}
          onSelect={selectMode}
        />
      </View>

      <View style={styles.footer}>
        <AppButton label="Continue" onPress={() => router.push('/players')} />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          Your last choice is highlighted next time. We never skip this screen for you.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { width: 92, marginLeft: -20 },
  intro: { marginTop: 16, gap: 10, maxWidth: 560 },
  options: { marginTop: 28, gap: 14 },
  footer: { marginTop: 28, gap: 10 },
  centered: { textAlign: 'center' },
});
