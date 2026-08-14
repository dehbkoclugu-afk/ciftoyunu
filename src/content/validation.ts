import type { EditorialSource, LocalizedQuestion, QuestionIntent } from './schema/schemas';

export type ContentIssue = {
  severity: 'error' | 'warning';
  code: string;
  recordId: string;
  message: string;
};

const forbiddenText = /\{\{[^}]+\}\}|%s|\[PLAYER\]|\b(?:TODO|TBD|lorem ipsum)\b/i;
const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'to', 'of', 'and', 'or', 'do', 'does']);

export function normalizeQuestionText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text: string): Set<string> {
  return new Set(
    normalizeQuestionText(text)
      .split(' ')
      .filter((token) => token && !stopWords.has(token)),
  );
}

export function tokenJaccard(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function issue(
  severity: ContentIssue['severity'],
  code: string,
  recordId: string,
  message: string,
): ContentIssue {
  return { severity, code, recordId, message };
}

function findDuplicateIds(source: EditorialSource): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const groups: [string, string[]][] = [
    ['pack', source.packs.map((pack) => pack.id)],
    ['intent', source.intents.map((intent) => intent.id)],
    [
      'localization',
      source.localizations.map(
        (localization) => localization.questionId + ':' + localization.locale,
      ),
    ],
  ];

  for (const [kind, ids] of groups) {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        issues.push(issue('error', 'duplicate_id', id, 'Duplicate ' + kind + ' ID'));
      }
      seen.add(id);
    }
  }
  return issues;
}

function validateText(localization: LocalizedQuestion): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (forbiddenText.test(localization.text)) {
    issues.push(
      issue(
        'error',
        'forbidden_placeholder',
        localization.questionId,
        'Question contains a forbidden placeholder or draft marker',
      ),
    );
  }
  if (!localization.text.trim().endsWith('?')) {
    issues.push(
      issue(
        'warning',
        'missing_question_mark',
        localization.questionId,
        'Question does not end with a question mark',
      ),
    );
  }
  return issues;
}

function validateIntentPolicy(
  intent: QuestionIntent,
  source: EditorialSource,
  localization?: LocalizedQuestion,
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const regions = new Set(intent.regionAllow ?? []);
  const overlap = (intent.regionBlock ?? []).find((region) => regions.has(region));
  if (overlap) {
    issues.push(
      issue('error', 'region_overlap', intent.id, 'Region appears in both allow and block lists'),
    );
  }

  if (intent.maturity === 'explicit') {
    const hasAdultPack = intent.packIds.every(
      (packId) => source.packs.find((pack) => pack.id === packId)?.requiredAge === 18,
    );
    if (!hasAdultPack) {
      issues.push(
        issue('error', 'mature_pack_age', intent.id, 'Explicit content requires age 18 packs'),
      );
    }
    if (!intent.safetyTags.includes('adult') || !intent.safetyTags.includes('consent')) {
      issues.push(
        issue(
          'error',
          'missing_adult_safety_tags',
          intent.id,
          'Explicit content requires adult and consent safety tags',
        ),
      );
    }
    if (!localization?.safetyReviewerId) {
      issues.push(
        issue(
          'error',
          'missing_safety_review',
          intent.id,
          'Explicit approved content requires a safety reviewer',
        ),
      );
    }
  }
  return issues;
}

function validateDuplicates(localizations: LocalizedQuestion[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (let leftIndex = 0; leftIndex < localizations.length; leftIndex += 1) {
    const left = localizations[leftIndex]!;
    for (let rightIndex = leftIndex + 1; rightIndex < localizations.length; rightIndex += 1) {
      const right = localizations[rightIndex]!;
      if (left.locale !== right.locale) continue;
      const normalizedLeft = normalizeQuestionText(left.text);
      const normalizedRight = normalizeQuestionText(right.text);
      if (normalizedLeft === normalizedRight) {
        issues.push(
          issue(
            'error',
            'exact_duplicate',
            right.questionId,
            'Exact normalized duplicate of ' + left.questionId,
          ),
        );
      } else if (tokenJaccard(left.text, right.text) > 0.82) {
        issues.push(
          issue(
            'error',
            'near_duplicate',
            right.questionId,
            'Near duplicate of ' + left.questionId,
          ),
        );
      }
    }
  }
  return issues;
}

export function validateEditorialSource(source: EditorialSource): ContentIssue[] {
  const issues = findDuplicateIds(source);
  const packs = new Map(source.packs.map((pack) => [pack.id, pack]));
  const intents = new Map(source.intents.map((intent) => [intent.id, intent]));
  const approvedLocalizations = new Map(
    source.localizations
      .filter((localization) => localization.status === 'approved')
      .map((localization) => [localization.questionId + ':' + localization.locale, localization]),
  );

  for (const localization of source.localizations) {
    if (!intents.has(localization.questionId)) {
      issues.push(
        issue(
          'error',
          'missing_intent',
          localization.questionId,
          'Localization references a missing intent',
        ),
      );
    }
    issues.push(...validateText(localization));
  }

  for (const intent of source.intents) {
    for (const packId of intent.packIds) {
      if (!packs.has(packId)) {
        issues.push(issue('error', 'missing_pack', intent.id, 'Intent references ' + packId));
      }
    }
    const localization = approvedLocalizations.get(intent.id + ':' + source.locale);
    if (intent.status === 'approved' && !localization) {
      issues.push(
        issue(
          'error',
          'missing_approved_localization',
          intent.id,
          'Approved intent lacks an approved localization',
        ),
      );
    }
    issues.push(...validateIntentPolicy(intent, source, localization));
  }

  for (const pack of source.packs.filter((candidate) => candidate.status === 'active')) {
    const count = source.intents.filter(
      (intent) =>
        intent.status === 'approved' &&
        intent.packIds.includes(pack.id) &&
        approvedLocalizations.has(intent.id + ':' + source.locale),
    ).length;
    if (count < pack.minimumQuestions) {
      issues.push(
        issue(
          'error',
          'pack_minimum',
          pack.id,
          'Pack has ' + count + ' approved questions; minimum is ' + pack.minimumQuestions,
        ),
      );
    }
  }

  issues.push(
    ...validateDuplicates(
      source.localizations.filter((localization) => localization.status === 'approved'),
    ),
  );
  return issues;
}
