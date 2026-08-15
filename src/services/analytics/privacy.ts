import type { AnalyticsProperties } from './types';

const forbiddenKeys = [
  'answer',
  'email',
  'name',
  'phone',
  'question_text',
  'screen_content',
] as const;

export function assertPrivacySafe(properties: AnalyticsProperties): void {
  const unsafe = Object.keys(properties).find((key) =>
    forbiddenKeys.some((forbidden) => key.toLowerCase().includes(forbidden)),
  );
  if (unsafe) throw new Error(`Analytics property is not privacy-safe: ${unsafe}`);
}
