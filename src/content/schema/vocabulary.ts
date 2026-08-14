export const supportedLocales = ['en', 'ar', 'ja', 'ko', 'zh-Hant'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const questionModes = ['couple', 'friends'] as const;
export const packModes = ['couple', 'friends', 'both'] as const;
export const relationshipStages = [
  'new',
  'established',
  'engaged',
  'married',
  'long-distance',
  'any',
] as const;
export const maturityLevels = ['general', 'suggestive', 'explicit'] as const;
export const interactionTypes = [
  'open',
  'choice',
  'rank',
  'predict',
  'memory',
  'scenario',
  'rapid',
  'both',
] as const;
export const starters = ['single', 'both', 'random'] as const;
export const safetyTags = [
  'sensitive',
  'consent',
  'adult',
  'conflict',
  'substance',
  'trauma',
] as const;
export const sourceClasses = ['original', 'common-concept', 'research-inspired'] as const;
export const intentStatuses = ['draft', 'review', 'approved', 'retired'] as const;
export const localizationStatuses = [
  'draft',
  'adapted',
  'native_review',
  'safety_review',
  'approved',
  'rejected',
  'retired',
] as const;
export const packCategories = [
  'warm-up',
  'fun',
  'know-me',
  'deep',
  'appreciation',
  'friends',
  'future',
  'practical',
  'trust',
  'what-if',
  'mature',
  'stories',
] as const;
export const packStatuses = ['draft', 'active', 'hidden', 'retired'] as const;
export const topicTags = [
  'daily-life',
  'humor',
  'habits',
  'personality',
  'memories',
  'childhood',
  'family',
  'friends',
  'money',
  'career',
  'home',
  'values',
  'trust',
  'jealousy',
  'privacy',
  'conflict',
  'repair',
  'future',
  'marriage',
  'children',
  'long-distance',
  'social-media',
  'ex-partners',
  'religion',
  'politics',
  'body',
  'affection',
  'sexuality',
  'fantasy',
  'consent',
  'alcohol',
] as const;
