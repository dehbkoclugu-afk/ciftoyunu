import { getEmbeddedManifest, loadEmbeddedContent } from './loader';

describe('embedded content loader', () => {
  it('loads the validated English bundle and matches its manifest', () => {
    const bundle = loadEmbeddedContent('en');
    const manifest = getEmbeddedManifest();

    expect(bundle?.questions).toHaveLength(50);
    expect(bundle?.questions.every((question) => question.locale === 'en')).toBe(true);
    expect(bundle?.contentVersion).toBe(manifest.contentVersion);
    expect(bundle?.questions).toHaveLength(manifest.locales.en!.questionCount);
  });

  it('does not silently mix English into a missing locale', () => {
    expect(loadEmbeddedContent('ar')).toBeNull();
  });
});
