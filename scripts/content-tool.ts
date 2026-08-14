import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { buildRuntimeArtifacts } from '../src/content/build';
import { editorialSourceSchema } from '../src/content/schema/schemas';
import { validateEditorialSource, type ContentIssue } from '../src/content/validation';

const root = process.cwd();
const sourcePath = path.join(root, 'content-source/seed/en.json');
const bundlePath = path.join(root, 'src/content/bundles/en.json');
const manifestPath = path.join(root, 'src/content/manifests/embedded.json');

async function loadSource() {
  return editorialSourceSchema.parse(JSON.parse(await readFile(sourcePath, 'utf8')));
}

function printIssues(issues: ContentIssue[]): void {
  if (issues.length === 0) {
    console.log('Content validation passed.');
    return;
  }
  for (const issue of issues) {
    console.log(
      `${issue.severity.toUpperCase()} ${issue.code} ${issue.recordId}: ${issue.message}`,
    );
  }
}

function failOnErrors(issues: ContentIssue[]): void {
  if (issues.some((issue) => issue.severity === 'error')) process.exitCode = 1;
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'validate';
  const source = await loadSource();
  const issues = validateEditorialSource(source);

  if (command === 'validate') {
    printIssues(issues);
    failOnErrors(issues);
    return;
  }

  if (command === 'duplicates') {
    const duplicateIssues = issues.filter((issue) => issue.code.includes('duplicate'));
    printIssues(duplicateIssues);
    failOnErrors(duplicateIssues);
    return;
  }

  if (command === 'report') {
    console.log(
      JSON.stringify(
        {
          contentVersion: source.contentVersion,
          locale: source.locale,
          packs: source.packs.length,
          approvedQuestions: source.intents.filter((intent) => intent.status === 'approved').length,
          errors: issues.filter((issue) => issue.severity === 'error').length,
          warnings: issues.filter((issue) => issue.severity === 'warning').length,
        },
        null,
        2,
      ),
    );
    failOnErrors(issues);
    return;
  }

  const artifacts = buildRuntimeArtifacts(source);
  if (command === 'build') {
    await Promise.all([
      mkdir(path.dirname(bundlePath), { recursive: true }),
      mkdir(path.dirname(manifestPath), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(bundlePath, artifacts.bundleJson),
      writeFile(manifestPath, artifacts.manifestJson),
    ]);
    console.log(`Built ${artifacts.bundle.questions.length} approved ${source.locale} questions.`);
    return;
  }

  if (command === 'check') {
    const [bundleJson, manifestJson] = await Promise.all([
      readFile(bundlePath, 'utf8'),
      readFile(manifestPath, 'utf8'),
    ]);
    if (bundleJson !== artifacts.bundleJson || manifestJson !== artifacts.manifestJson) {
      throw new Error('Generated content drift detected. Run npm run content:build.');
    }
    console.log('Generated content is current.');
    return;
  }

  throw new Error(`Unknown content command: ${command}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
