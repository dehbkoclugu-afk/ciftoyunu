import { createHash } from 'node:crypto';

import {
  contentBundleSchema,
  contentManifestSchema,
  type ContentBundle,
  type ContentManifest,
  type EditorialSource,
  type RuntimeQuestion,
} from './schema/schemas';
import { validateEditorialSource } from './validation';

export type RuntimeArtifacts = {
  bundle: ContentBundle;
  bundleJson: string;
  manifest: ContentManifest;
  manifestJson: string;
};

function stableJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}

export function buildRuntimeArtifacts(source: EditorialSource): RuntimeArtifacts {
  const errors = validateEditorialSource(source).filter((issue) => issue.severity === 'error');
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.code + ': ' + error.message).join('\n'));
  }

  const approvedLocalizations = new Map(
    source.localizations
      .filter(
        (localization) =>
          localization.locale === source.locale && localization.status === 'approved',
      )
      .map((localization) => [localization.questionId, localization]),
  );

  const questions: RuntimeQuestion[] = source.intents
    .filter((intent) => intent.status === 'approved')
    .flatMap((intent) => {
      const localization = approvedLocalizations.get(intent.id);
      if (!localization) return [];
      const { editorialNotes: _editorialNotes, status: _status, ...runtimeIntent } = intent;
      return [
        {
          ...runtimeIntent,
          locale: localization.locale,
          text: localization.text,
          ...(localization.starterText ? { starterText: localization.starterText } : {}),
          ...(localization.followUp ? { followUp: localization.followUp } : {}),
          ...(localization.shortShareText ? { shortShareText: localization.shortShareText } : {}),
          ...(localization.culturalVariant
            ? { culturalVariant: localization.culturalVariant }
            : {}),
          updatedAt: localization.updatedAt,
        },
      ];
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const bundle = contentBundleSchema.parse({
    schemaVersion: source.schemaVersion,
    contentVersion: source.contentVersion,
    locale: source.locale,
    packs: source.packs
      .filter((pack) => pack.status === 'active' && pack.allowedLocales.includes(source.locale))
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id)),
    questions,
  });
  const bundleJson = stableJson(bundle);

  const manifest = contentManifestSchema.parse({
    schemaVersion: source.schemaVersion,
    contentVersion: source.contentVersion,
    minimumAppVersion: source.minimumAppVersion,
    locales: {
      [source.locale]: {
        bundle: source.locale,
        sha256: createHash('sha256').update(bundleJson).digest('hex'),
        questionCount: bundle.questions.length,
        approvedAt: source.approvedAt,
      },
    },
  });

  return { bundle, bundleJson, manifest, manifestJson: stableJson(manifest) };
}
