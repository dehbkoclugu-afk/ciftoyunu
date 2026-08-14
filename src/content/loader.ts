import englishBundleJson from './bundles/en.json';
import embeddedManifestJson from './manifests/embedded.json';
import { contentBundleSchema, contentManifestSchema, type ContentBundle } from './schema/schemas';
import type { SupportedLocale } from './schema/vocabulary';

const manifest = contentManifestSchema.parse(embeddedManifestJson);
const embeddedBundles: Partial<Record<SupportedLocale, unknown>> = {
  en: englishBundleJson,
};

export function getEmbeddedManifest() {
  return manifest;
}

export function loadEmbeddedContent(locale: SupportedLocale): ContentBundle | null {
  const rawBundle = embeddedBundles[locale];
  const manifestEntry = manifest.locales[locale];
  if (!rawBundle || !manifestEntry) return null;

  const bundle = contentBundleSchema.parse(rawBundle);
  if (
    bundle.locale !== locale ||
    bundle.contentVersion !== manifest.contentVersion ||
    bundle.questions.length !== manifestEntry.questionCount
  ) {
    throw new Error(`Embedded ${locale} content does not match its manifest.`);
  }
  return bundle;
}
