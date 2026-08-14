import seedJson from '../../content-source/seed/en.json';
import { buildRuntimeArtifacts } from './build';
import { editorialSourceSchema } from './schema/schemas';
import { validateEditorialSource } from './validation';

describe('content build', () => {
  const source = editorialSourceSchema.parse(seedJson);

  it('accepts the 50-question English seed source', () => {
    expect(validateEditorialSource(source).filter((issue) => issue.severity === 'error')).toEqual(
      [],
    );
    expect(source.intents).toHaveLength(50);
    expect(source.localizations).toHaveLength(50);
  });

  it('builds only approved runtime fields deterministically', () => {
    const first = buildRuntimeArtifacts(source);
    const second = buildRuntimeArtifacts(source);

    expect(first).toEqual(second);
    expect(first.bundle.questions).toHaveLength(50);
    expect(first.bundle.packCopy).toHaveLength(5);
    expect(first.bundle.packCopy[0]?.title).toBe('Warm Start');
    expect(first.manifest.locales.en?.questionCount).toBe(50);
    expect(first.bundleJson).not.toContain('editorialNotes');
    expect(first.bundleJson).not.toContain('nativeReviewerId');
  });
});
