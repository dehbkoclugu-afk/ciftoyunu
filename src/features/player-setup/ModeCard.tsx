import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import type { GameMode } from '@/features/player-setup/playerSetup';

type ModeCardProps = {
  mode: GameMode;
  title: string;
  description: string;
  playerCount: string;
  selected: boolean;
  onSelect: (mode: GameMode) => void;
};

export function ModeCard({
  mode,
  title,
  description,
  playerCount,
  selected,
  onSelect,
}: ModeCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={`${playerCount}. ${description}`}
      accessibilityState={{ checked: selected }}
      onPress={() => onSelect(mode)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.colors.surfaceRaised : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderRadius: theme.radius.card,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.symbol}
      >
        <View
          style={[
            styles.person,
            { backgroundColor: mode === 'couple' ? theme.colors.coral : theme.colors.primary },
          ]}
        />
        <View
          style={[
            styles.person,
            styles.personOffset,
            { backgroundColor: mode === 'couple' ? theme.colors.primary : theme.colors.coral },
          ]}
        />
        {mode === 'friends' ? (
          <View
            style={[styles.person, styles.personThird, { backgroundColor: theme.colors.gold }]}
          />
        ) : null}
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="h2">{title}</AppText>
          <View
            style={[
              styles.count,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceRaised,
                borderColor: selected ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: selected ? theme.colors.onPrimary : theme.colors.ink }}
            >
              {playerCount}
            </AppText>
          </View>
        </View>
        <AppText tone="muted">{description}</AppText>
      </View>

      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? theme.colors.primary : theme.colors.outline,
            backgroundColor: selected ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {selected ? (
          <View style={[styles.radioCore, { backgroundColor: theme.colors.onPrimary }]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 190,
    borderWidth: 2,
    padding: 22,
    overflow: 'hidden',
  },
  symbol: { width: 100, height: 52, marginBottom: 22 },
  person: { position: 'absolute', width: 48, height: 48, borderRadius: 24, opacity: 0.9 },
  personOffset: { left: 34, top: 4 },
  personThird: { left: 65, top: 0 },
  copy: { gap: 8, paddingRight: 38 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  count: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  radio: {
    position: 'absolute',
    top: 22,
    right: 22,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCore: { width: 8, height: 8, borderRadius: 4 },
});
