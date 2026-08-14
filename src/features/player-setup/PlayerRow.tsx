import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import type { PlayerDraft } from '@/features/player-setup/playerSetup';

const avatars = [undefined, '🌙', '✨', '🍒', '🌿', '🎲'] as const;

type PlayerRowProps = {
  player: PlayerDraft;
  index: number;
  removable: boolean;
  onChange: (id: string, patch: { name: string; emoji?: string }) => void;
  onRemove: (id: string) => void;
};

export function PlayerRow({ player, index, removable, onChange, onRemove }: PlayerRowProps) {
  const theme = useAppTheme();
  const avatarIndex = avatars.indexOf(player.emoji as (typeof avatars)[number]);
  const nextAvatar = avatars[(avatarIndex + 1) % avatars.length];
  const label = `Player ${index + 1}`;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderRadius: theme.radius.button,
        },
      ]}
    >
      <View style={styles.topLine}>
        <AppText variant="button">{label}</AppText>
        {removable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label}`}
            hitSlop={8}
            onPress={() => onRemove(player.id)}
            style={({ pressed }) => [styles.remove, { opacity: pressed ? 0.55 : 1 }]}
          >
            <AppText variant="bodySmall" tone="danger">
              Remove
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.inputLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Choose avatar for ${label}`}
          accessibilityHint="Cycles through optional emoji avatars"
          onPress={() => onChange(player.id, { name: player.name, emoji: nextAvatar })}
          style={({ pressed }) => [
            styles.avatar,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.input,
              opacity: pressed ? 0.66 : 1,
            },
          ]}
        >
          <AppText variant="h3">{player.emoji ?? '+'}</AppText>
        </Pressable>
        <TextInput
          accessibilityLabel={`${label} name`}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={28}
          onChangeText={(name) => onChange(player.id, { name, emoji: player.emoji })}
          placeholder={label}
          placeholderTextColor={theme.colors.inkMuted}
          returnKeyType="next"
          style={[
            styles.input,
            theme.typography.body,
            {
              color: theme.colors.ink,
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.input,
            },
          ]}
          value={player.name}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1, padding: 16, gap: 12 },
  topLine: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remove: { minWidth: 48, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  inputLine: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { flex: 1, minHeight: 52, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
});
