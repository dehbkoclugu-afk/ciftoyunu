/**
 * THESIS: Session setup sets one shared pace; it refuses settings-dashboard complexity.
 * OWN-WORLD: Warm canvas, compact tempo chips, plum selection, one coral count marker.
 * STORY: Confirm the deck, choose time and depth, remove sensitive topics, then begin.
 * FIRST VIEWPORT: Back action, pack title, honest card estimate, then two short selectors.
 * FORM: Operate-mode native setup surface extending the established editorial card table.
 */
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { loadEmbeddedContent } from '@/content/loader';
import { useAppTheme } from '@/design';
import { resolvePlayers } from '@/features/player-setup/playerSetup';
import {
  type IntensityPreset,
  type SessionDuration,
  type TopicTag,
} from '@/features/session/sessionEngine';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSessionStore } from '@/state/sessionStore';
import { useSettingsStore } from '@/state/settingsStore';

const durations: { value: SessionDuration; label: string; questions: number; specials: number }[] =
  [
    { value: 10, label: 'Quick 10', questions: 10, specials: 1 },
    { value: 20, label: 'Standard 20', questions: 18, specials: 2 },
    { value: 30, label: 'Long 30', questions: 26, specials: 3 },
  ];

const intensities: { value: IntensityPreset; label: string; detail: string }[] = [
  { value: 'light', label: 'Light', detail: 'Easy and warm' },
  { value: 'mixed', label: 'Mixed', detail: 'A natural curve' },
  { value: 'deep', label: 'Deep', detail: 'More reflective' },
];

const topicOptions: { value: TopicTag; label: string }[] = [
  { value: 'money', label: 'Money' },
  { value: 'family', label: 'Family' },
  { value: 'ex-partners', label: 'Past relationships' },
  { value: 'sexuality', label: 'Sexuality' },
  { value: 'children', label: 'Children' },
  { value: 'religion', label: 'Religion' },
  { value: 'politics', label: 'Politics' },
];

export function SessionSetupScreen() {
  const theme = useAppTheme();
  const [durationMinutes, setDuration] = useState<SessionDuration>(20);
  const [intensityPreset, setIntensity] = useState<IntensityPreset>('mixed');
  const settingsExcluded = useSettingsStore((state) => state.excludedTopics);
  const [excludedTopics, setExcludedTopics] = useState<TopicTag[]>(
    topicOptions.map(({ value }) => value).filter((value) => settingsExcluded.includes(value)),
  );
  const [includeMature, setIncludeMature] = useState(
    useSettingsStore.getState().matureContentEnabled,
  );
  const [starting, setStarting] = useState(false);
  const [startFailed, setStartFailed] = useState(false);
  const locale = useSettingsStore((state) => state.locale);
  const ageConfirmed18 = useSettingsStore((state) => state.ageConfirmed18);
  const comfortLevel = useSettingsStore((state) => state.comfortLevel);
  const mode = useGameSetupStore((state) => state.mode);
  const playerDrafts = useGameSetupStore((state) => state.players);
  const selectedPackId = useGameSetupStore((state) => state.selectedPackId);
  const entitlement = usePurchaseStore((state) => state.entitlement);
  const start = useSessionStore((state) => state.start);
  const bundle = loadEmbeddedContent(locale);
  const pack = bundle?.packs.find((item) => item.id === selectedPackId);
  const packCopy = bundle?.packCopy.find((item) => item.packId === selectedPackId);
  const duration = durations.find((item) => item.value === durationMinutes)!;
  const matureAllowed = ageConfirmed18 && comfortLevel === 'spicy';
  const players = useMemo(() => resolvePlayers(playerDrafts), [playerDrafts]);

  const toggleTopic = (topic: TopicTag) => {
    setExcludedTopics((current) =>
      current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic],
    );
  };

  const begin = async () => {
    if (!bundle || !pack || !packCopy) return;
    if (pack.premium && entitlement !== 'premium') {
      router.replace({ pathname: '/premium', params: { packId: pack.id } });
      return;
    }
    setStarting(true);
    setStartFailed(false);
    const session = await start({
      bundle,
      mode,
      packIds: [pack.id],
      entitledPackIds: entitlement === 'premium' ? [pack.id] : [],
      players,
      durationMinutes,
      intensityPreset,
      ageConfirmed18,
      matureContentEnabled: matureAllowed && includeMature,
      excludedTopics,
      seed: `${Date.now()}-${mode}-${pack.id}`,
      packTitle: packCopy.title,
    });
    setStarting(false);
    if (session) router.replace('/play');
    else setStartFailed(true);
  };

  if (!bundle || !pack || !packCopy) {
    return (
      <AppScreen contentStyle={styles.empty}>
        <AppText variant="display">Choose a pack before setting the pace.</AppText>
        <AppText tone="muted">Return to the deck table and choose one free pack to play.</AppText>
        <AppButton label="Choose a pack" onPress={() => router.replace('/packs')} />
      </AppScreen>
    );
  }

  if (pack.premium && entitlement !== 'premium') {
    return (
      <AppScreen contentStyle={styles.empty}>
        <AppText variant="display">Premium access is needed for this pack.</AppText>
        <AppText tone="muted">Unlock this deck and every current premium conversation.</AppText>
        <AppButton
          label="Unlock all packs"
          onPress={() => router.replace({ pathname: '/premium', params: { packId: pack.id } })}
        />
        <AppButton
          label="Choose a free pack"
          variant="secondary"
          onPress={() => router.replace('/packs')}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View style={styles.intro}>
        <AppText variant="caption" tone="primary">
          {packCopy.title}
        </AppText>
        <AppText variant="display">Set the pace.</AppText>
        <AppText tone="muted">A few choices now make the conversation feel natural later.</AppText>
      </View>

      <View
        style={[
          styles.estimate,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderRadius: theme.radius.button,
          },
        ]}
      >
        <View style={[styles.estimateMark, { backgroundColor: theme.colors.coral }]} />
        <View style={styles.flex}>
          <AppText variant="button">
            Up to {duration.questions} questions + {duration.specials} special cards
          </AppText>
          <AppText variant="bodySmall" tone="muted">
            The deck may finish earlier when fresh questions run out.
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="h3">How long?</AppText>
          <AppText variant="bodySmall" tone="muted">
            You can end anytime.
          </AppText>
        </View>
        <View style={styles.chips}>
          {durations.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={durationMinutes === option.value}
              onPress={() => setDuration(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="h3">How deep?</AppText>
        <View style={styles.intensityGrid}>
          {intensities.map((option) => {
            const selected = intensityPreset === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => setIntensity(option.value)}
                style={({ pressed }) => [
                  styles.intensity,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    borderRadius: theme.radius.input,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <AppText
                  variant="button"
                  style={{ color: selected ? theme.colors.onPrimary : theme.colors.ink }}
                >
                  {option.label}
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: selected ? theme.colors.onPrimary : theme.colors.inkMuted }}
                >
                  {option.detail}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="h3">Leave anything out?</AppText>
          <AppText variant="bodySmall" tone="muted">
            Only this session changes.
          </AppText>
        </View>
        <View style={styles.chips}>
          {topicOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={excludedTopics.includes(option.value)}
              onPress={() => toggleTopic(option.value)}
            />
          ))}
        </View>
      </View>

      {matureAllowed ? (
        <View style={styles.section}>
          <Chip
            label="Include mature questions"
            selected={includeMature}
            onPress={() => setIncludeMature((value) => !value)}
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        {startFailed ? (
          <AppText accessibilityRole="alert" variant="bodySmall" tone="danger">
            No questions match these choices. Remove a topic filter or lower the intensity.
          </AppText>
        ) : null}
        <AppButton
          label={`Start ${packCopy.title}`}
          loading={starting}
          onPress={() => void begin()}
        />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          No answers are recorded. Passing is always allowed.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { width: 92, marginLeft: -20 },
  intro: { marginTop: 14, gap: 9, maxWidth: 560 },
  estimate: { marginTop: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  estimateMark: { width: 9, height: 44, borderRadius: 5 },
  section: { marginTop: 30, gap: 14 },
  sectionHeading: { gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  intensityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intensity: { minHeight: 72, minWidth: 148, flex: 1, padding: 14, borderWidth: 1, gap: 3 },
  footer: { marginTop: 34, gap: 12 },
  centered: { textAlign: 'center' },
  empty: { justifyContent: 'center', gap: 16, maxWidth: 560 },
});
