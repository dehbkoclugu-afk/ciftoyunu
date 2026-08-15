# Daily Question and Local Notifications Design

## Goal

Ship one free, deterministic daily question and an explicitly requested local reminder without streak pressure, remote push, or private conversation content in notification previews.

## Decisions

- Select from general-maturity questions that belong to at least one free pack.
- Sort eligible questions by stable ID, hash `locale:local-date`, and use the bucket as the index. The same locale and local calendar date always produce the same card.
- Never persist an answer. The Daily screen is a single read-only card with a face-to-face prompt.
- Ask notification permission only after the user presses “Remind me tonight” and accepts the on-screen rationale.
- Offer three restrained local times: 18:00, 20:00, and 21:30. Persist the selected time and schedule one repeating local notification.
- Notification copy stays generic: no question text, player name, mature copy, streak, relationship claim, or guilt.
- Use a stable notification identifier and Android channel so rescheduling replaces the prior reminder.
- Route only the controlled payload `{ destination: 'daily' }` to `/daily`; ignore arbitrary URLs or route strings.
- Treat denied, blocked, unavailable, and scheduling-error states as recoverable product states. Free play and Daily remain available.
- Track only `daily_question_viewed`, `daily_reminder_scheduled`, and `notification_opened` through the existing consent-gated analytics runtime.

## UI

The Daily screen extends the established warm card-table world: visible back action, compact date line, one oversized cream card with a coral registration mark, and a quiet reminder section beneath it. Native controls and existing buttons retain touch and Dynamic Type behavior. Home receives one secondary “Today’s question” action.

## Boundaries

- `dailyQuestion.ts` owns pure date keying, eligibility, hashing, and selection.
- A provider-neutral notification adapter isolates `expo-notifications` from feature code.
- A notification runtime owns permission interpretation, Android channel setup, scheduling/cancellation, and controlled response parsing.
- Root layout installs one response observer after boot; no permission request occurs there.

## Out of Scope

Remote push, Expo push tokens, background tasks, session reminders, seasonal announcements, streaks, badges, custom sounds, exact-alarm permission, and notification artwork.
