/**
 * THESIS: One card a day is an invitation, never a streak obligation.
 * OWN-WORLD: Warm canvas, one cream card, coral registration mark, quiet plum reminder controls.
 * STORY: Read today's safe question, choose whether and when to receive tomorrow's invitation.
 * FIRST VIEWPORT: Back action, date, and the full question before any permission action.
 * FORM: Operate-mode single-card ritual with contextual permission disclosure.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { loadEmbeddedContent } from '@/content/loader';
import { useAppTheme } from '@/design';
import { track } from '@/services/analytics/runtime';
import { createExpoNotificationAdapter } from '@/services/notifications/expoAdapter';
import {
  cancelDailyReminder,
  scheduleDailyReminder,
  type ReminderResult,
} from '@/services/notifications/runtime';
import { useSettingsStore } from '@/state/settingsStore';

import { localDateKey, selectDailyQuestion } from './dailyQuestion';

const reminderTimes = ['18:00', '20:00', '21:30'] as const;
const notificationAdapter = createExpoNotificationAdapter();

export function DailyQuestionScreen({ now = new Date() }: { now?: Date }) {
  const theme = useAppTheme();
  const [today] = useState(now);
  const locale = useSettingsStore((state) => state.locale);
  const savedTime = useSettingsStore((state) => state.dailyReminderTime);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const setDailyReminder = useSettingsStore((state) => state.setDailyReminder);
  const [time, setTime] = useState(savedTime ?? '20:00');
  const [result, setResult] = useState<ReminderResult | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const trackedQuestionKey = useRef<string | null>(null);
  const bundle = loadEmbeddedContent(locale);
  const question = useMemo(
    () => (bundle ? selectDailyQuestion(bundle, today) : null),
    [bundle, today],
  );

  useEffect(() => {
    const key = question ? `${localDateKey(today)}:${question.id}` : null;
    if (question && trackedQuestionKey.current !== key) {
      trackedQuestionKey.current = key;
      track('daily_question_viewed', { question_id: question.id, date_key: localDateKey(today) });
    }
  }, [question, today]);

  const schedule = async () => {
    setScheduling(true);
    const next = await scheduleDailyReminder(notificationAdapter, time);
    setScheduling(false);
    setResult(next);
    if (next.status === 'scheduled') {
      setDailyReminder(time);
      track('daily_reminder_scheduled', { reminder_time: time });
    }
  };

  const cancel = async () => {
    if (await cancelDailyReminder(notificationAdapter)) {
      setDailyReminder(undefined);
      setResult(null);
    }
  };

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
      <View style={styles.intro}>
        <AppText variant="caption" tone="primary">
          {localDateKey(today)}
        </AppText>
        <AppText variant="display">Today’s question.</AppText>
        <AppText tone="muted">One free card. No streak, score, or answer saved.</AppText>
      </View>

      <View
        accessible
        accessibilityLabel={
          question ? `Today's question. ${question.text}` : 'Today’s question is unavailable'
        }
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderRadius: theme.radius.card,
            shadowColor: theme.colors.ink,
          },
        ]}
      >
        <View style={[styles.mark, { backgroundColor: theme.colors.coral }]} />
        {question ? (
          <AppText variant="questionMedium">{question.text}</AppText>
        ) : (
          <AppText variant="h2">Today’s card is not available in this language yet.</AppText>
        )}
        <AppText variant="bodySmall" tone="muted">
          Talk face to face. Nothing you say is recorded.
        </AppText>
      </View>

      <View style={styles.reminder}>
        <AppText variant="h2">Remind me tonight</AppText>
        <AppText tone="muted">
          We ask for notification permission only after you choose Schedule. The preview never
          contains the question.
        </AppText>
        <View style={styles.times}>
          {reminderTimes.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={time === option}
              onPress={() => {
                setTime(option);
                setResult(null);
              }}
            />
          ))}
        </View>
        <AppButton
          label={`Schedule for ${time}`}
          loading={scheduling}
          onPress={() => void schedule()}
        />
        {notificationsEnabled ? (
          <AppButton
            label="Turn off daily reminder"
            variant="ghost"
            onPress={() => void cancel()}
          />
        ) : null}
        {result?.status === 'scheduled' ? (
          <AppText accessibilityLiveRegion="polite" tone="primary">
            Daily reminder set for {time}.
          </AppText>
        ) : null}
        {result?.status === 'denied' ? (
          <AppText accessibilityRole="alert" tone="danger">
            Permission was not granted. Today’s question still works.
          </AppText>
        ) : null}
        {result?.status === 'blocked' ? (
          <View style={styles.recovery}>
            <AppText accessibilityRole="alert" tone="danger">
              Notifications are blocked in system settings.
            </AppText>
            <AppButton
              label="Open system settings"
              variant="secondary"
              onPress={() => void Linking.openSettings()}
            />
          </View>
        ) : null}
        {result?.status === 'unavailable' || result?.status === 'error' ? (
          <AppText accessibilityRole="alert" tone="danger">
            A reminder cannot be scheduled on this device right now. You can still use today’s card.
          </AppText>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: 20 },
  intro: { gap: 10, maxWidth: 580 },
  card: {
    minHeight: 300,
    marginTop: 28,
    padding: 26,
    borderWidth: 1,
    justifyContent: 'space-between',
    gap: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 5,
  },
  mark: { width: 42, height: 6, borderRadius: 3 },
  reminder: { marginTop: 32, gap: 14, maxWidth: 580 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recovery: { gap: 12 },
});
