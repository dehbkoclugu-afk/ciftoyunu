/**
 * THESIS: Player setup is a small shared ritual, with privacy visible at the point of entry.
 * OWN-WORLD: Warm layered surfaces, compact roster cards, plum focus, optional personal avatars.
 * STORY: Name the table, notice ambiguity without punishment, choose whether the device remembers.
 * FIRST VIEWPORT: Back action, direct title, mode/count line, then labeled native name fields.
 * FORM: Operate-mode native form with bounded progressive disclosure and keyboard-safe scrolling.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { PlayerRow } from '@/features/player-setup/PlayerRow';
import { findDuplicatePlayerNames } from '@/features/player-setup/playerSetup';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { useSettingsStore } from '@/state/settingsStore';

export default function PlayersScreen() {
  const theme = useAppTheme();
  const [saving, setSaving] = useState(false);
  const mode = useGameSetupStore((state) => state.mode);
  const players = useGameSetupStore((state) => state.players);
  const persistenceFailed = useGameSetupStore((state) => state.persistenceFailed);
  const updatePlayer = useGameSetupStore((state) => state.updatePlayer);
  const addPlayer = useGameSetupStore((state) => state.addPlayer);
  const removePlayer = useGameSetupStore((state) => state.removePlayer);
  const complete = useGameSetupStore((state) => state.complete);
  const forgetPlayers = useGameSetupStore((state) => state.forgetPlayers);
  const rememberPlayers = useSettingsStore((state) => state.rememberPlayers);
  const setRememberPlayers = useSettingsStore((state) => state.setRememberPlayers);
  const duplicates = findDuplicatePlayerNames(players);

  const toggleRemember = () => {
    const next = !rememberPlayers;
    setRememberPlayers(next);
    if (!next) void forgetPlayers();
  };

  const finish = () => {
    setSaving(true);
    void complete(rememberPlayers).then(() => router.replace('/packs'));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
      style={styles.flex}
    >
      <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
        <View style={styles.back}>
          <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
        </View>

        <View style={styles.intro}>
          <AppText variant="display">Name the table.</AppText>
          <AppText tone="muted">
            {mode === 'couple'
              ? 'Two players. Blank names become Player 1 and Player 2.'
              : `${players.length} of 8 players. Start with two and add the rest.`}
          </AppText>
        </View>

        <View style={styles.roster}>
          {players.map((player, index) => (
            <PlayerRow
              key={player.id}
              player={player}
              index={index}
              removable={mode === 'friends' && players.length > 2}
              onChange={updatePlayer}
              onRemove={removePlayer}
            />
          ))}
        </View>

        {mode === 'friends' && players.length < 8 ? (
          <AppButton label="Add another player" variant="secondary" onPress={addPlayer} />
        ) : null}

        {duplicates.length > 0 ? (
          <View
            accessibilityRole="alert"
            style={[
              styles.notice,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.gold,
                borderRadius: theme.radius.input,
              },
            ]}
          >
            <AppText variant="bodySmall">
              Two players are both named {duplicates[0]}. You can still continue.
            </AppText>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Remember these names"
          accessibilityHint="Stores player names only on this device"
          accessibilityState={{ checked: rememberPlayers }}
          onPress={toggleRemember}
          style={({ pressed }) => [
            styles.remember,
            {
              backgroundColor: theme.colors.surface,
              borderColor: rememberPlayers ? theme.colors.primary : theme.colors.outline,
              borderRadius: theme.radius.button,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: rememberPlayers ? theme.colors.primary : 'transparent',
                borderColor: rememberPlayers ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          >
            {rememberPlayers ? (
              <AppText variant="button" style={{ color: theme.colors.onPrimary }}>
                ✓
              </AppText>
            ) : null}
          </View>
          <View style={styles.rememberCopy}>
            <AppText variant="button">Remember these names</AppText>
            <AppText variant="bodySmall" tone="muted">
              Saved only on this device. Turn this off to erase the remembered roster.
            </AppText>
          </View>
        </Pressable>

        <View style={styles.footer}>
          {persistenceFailed ? (
            <AppText variant="bodySmall" tone="danger">
              Names could not be saved on this device. You can still continue.
            </AppText>
          ) : null}
          <AppButton label="Save players" loading={saving} onPress={finish} />
          <AppText variant="caption" tone="muted" style={styles.centered}>
            Blank names get simple player numbers. No account is needed.
          </AppText>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { width: 92, marginLeft: -20 },
  intro: { marginTop: 16, gap: 10, maxWidth: 560 },
  roster: { marginTop: 28, gap: 12 },
  notice: { borderWidth: 1, padding: 14, marginTop: 14 },
  remember: {
    minHeight: 88,
    marginTop: 20,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberCopy: { flex: 1, gap: 3 },
  footer: { gap: 12, marginTop: 24 },
  centered: { textAlign: 'center' },
});
