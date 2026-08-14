import { z } from 'zod';

import {
  intentStatuses,
  interactionTypes,
  localizationStatuses,
  maturityLevels,
  packCategories,
  packModes,
  packStatuses,
  questionModes,
  relationshipStages,
  safetyTags,
  sourceClasses,
  starters,
  supportedLocales,
  topicTags,
} from './vocabulary';

const stableQuestionId = z.string().regex(/^qi_[a-z0-9]+(?:_[a-z0-9]+)*_[0-9]{4}$/);
const stablePackId = z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);
const machineId = z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);
const semanticKey = z.string().regex(/^[a-z0-9]+(?:[._][a-z0-9]+)+$/);
const isoCountry = z.string().regex(/^[A-Z]{2}$/);
const intensity = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const supportedLocaleSchema = z.enum(supportedLocales);

export const questionIntentSchema = z
  .object({
    id: stableQuestionId,
    intentKey: semanticKey,
    mode: z.array(z.enum(questionModes)).min(1),
    packIds: z.array(stablePackId).min(1),
    topicTags: z.array(z.enum(topicTags)).min(1),
    relationshipStages: z.array(z.enum(relationshipStages)).min(1),
    intensity,
    maturity: z.enum(maturityLevels),
    interactionType: z.enum(interactionTypes),
    starter: z.enum(starters),
    safetyTags: z.array(z.enum(safetyTags)),
    regionAllow: z.array(isoCountry).min(1).optional(),
    regionBlock: z.array(isoCountry).min(1).optional(),
    sourceClass: z.enum(sourceClasses),
    editorialNotes: z.string().min(1).optional(),
    status: z.enum(intentStatuses),
    version: z.number().int().positive(),
  })
  .strict();

export const localizedQuestionSchema = z
  .object({
    questionId: stableQuestionId,
    locale: supportedLocaleSchema,
    text: z.string().trim().min(12),
    starterText: z.string().trim().min(1).optional(),
    followUp: z.string().trim().min(1).optional(),
    shortShareText: z.string().trim().min(1).optional(),
    culturalVariant: z.string().trim().min(1).optional(),
    translatorId: machineId,
    nativeReviewerId: machineId.optional(),
    safetyReviewerId: machineId.optional(),
    status: z.enum(localizationStatuses),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const localizedPackSchema = z
  .object({
    packId: stablePackId,
    locale: supportedLocaleSchema,
    title: z.string().trim().min(1),
    promise: z.string().trim().min(1),
    description: z.string().trim().min(1),
    audience: z.string().trim().min(1),
    contentWarnings: z.array(z.string().trim().min(1)),
    sampleQuestionIds: z.tuple([stableQuestionId, stableQuestionId]),
  })
  .strict();

export const questionPackSchema = z
  .object({
    id: stablePackId,
    mode: z.enum(packModes),
    category: z.enum(packCategories),
    premium: z.boolean(),
    seasonal: z.boolean(),
    requiredAge: z.union([z.literal(13), z.literal(16), z.literal(18)]),
    minimumQuestions: z.number().int().positive(),
    intensityRange: z.tuple([intensity, intensity]),
    allowedLocales: z.array(supportedLocaleSchema).min(1),
    artworkId: machineId,
    sortOrder: z.number().int().nonnegative(),
    status: z.enum(packStatuses),
  })
  .strict()
  .refine((pack) => pack.intensityRange[0] <= pack.intensityRange[1], {
    message: 'intensityRange must be ordered',
    path: ['intensityRange'],
  });

export const editorialSourceSchema = z
  .object({
    schemaVersion: z.literal(1),
    contentVersion: z.string().regex(/^[0-9]{4}\.[0-9]{2}\.[0-9]+$/),
    minimumAppVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    approvedAt: z.string().datetime({ offset: true }),
    locale: supportedLocaleSchema,
    packs: z.array(questionPackSchema).min(1),
    localizedPacks: z.array(localizedPackSchema).min(1),
    intents: z.array(questionIntentSchema).min(1),
    localizations: z.array(localizedQuestionSchema).min(1),
  })
  .strict();

export const runtimeQuestionSchema = questionIntentSchema
  .omit({ status: true, editorialNotes: true })
  .extend({
    locale: supportedLocaleSchema,
    text: z.string().trim().min(12),
    starterText: z.string().trim().min(1).optional(),
    followUp: z.string().trim().min(1).optional(),
    shortShareText: z.string().trim().min(1).optional(),
    culturalVariant: z.string().trim().min(1).optional(),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const contentBundleSchema = z
  .object({
    schemaVersion: z.literal(1),
    contentVersion: z.string().regex(/^[0-9]{4}\.[0-9]{2}\.[0-9]+$/),
    locale: supportedLocaleSchema,
    packs: z.array(questionPackSchema),
    packCopy: z.array(localizedPackSchema),
    questions: z.array(runtimeQuestionSchema),
  })
  .strict();

export const manifestLocaleEntrySchema = z
  .object({
    bundle: z.string().regex(/^[a-z0-9-]+$/),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    questionCount: z.number().int().nonnegative(),
    approvedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const contentManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    contentVersion: z.string().regex(/^[0-9]{4}\.[0-9]{2}\.[0-9]+$/),
    minimumAppVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    locales: z.partialRecord(supportedLocaleSchema, manifestLocaleEntrySchema),
  })
  .strict();

export type QuestionIntent = z.infer<typeof questionIntentSchema>;
export type LocalizedQuestion = z.infer<typeof localizedQuestionSchema>;
export type LocalizedPack = z.infer<typeof localizedPackSchema>;
export type QuestionPack = z.infer<typeof questionPackSchema>;
export type EditorialSource = z.infer<typeof editorialSourceSchema>;
export type RuntimeQuestion = z.infer<typeof runtimeQuestionSchema>;
export type ContentBundle = z.infer<typeof contentBundleSchema>;
export type ContentManifest = z.infer<typeof contentManifestSchema>;
