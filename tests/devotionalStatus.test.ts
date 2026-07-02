import * as assert from 'node:assert/strict';
import {
  analyzeDevotionalSource,
  buildDevotionalReport,
  DEVOTIONAL_PLACEHOLDER,
  filterDevotionalFiles,
} from '../src/lib/devotionalStatus';

const placeholder = analyzeDevotionalSource({
  slug: 'ano-a/advento/01-domingo',
  title: 'Primeiro Domingo do Advento',
  ano: 'A',
  estacao: 'Advento',
  tipo: 'Domingo',
  markdown: `# Primeiro Domingo do Advento

## Reflexão

${DEVOTIONAL_PLACEHOLDER}
`,
});

assert.equal(placeholder.status, 'placeholder');
assert.equal(placeholder.hasReflectionSection, true);
assert.equal(placeholder.hasPlaceholder, true);

const filled = analyzeDevotionalSource({
  slug: 'ano-a/advento/semana-1-segunda',
  title: 'Segunda-feira',
  ano: 'A',
  estacao: 'Advento',
  tipo: 'leitura-diaria',
  markdown: `# Segunda-feira

## Reflexão

Uma reflexão pastoral preenchida.
`,
});

assert.equal(filled.status, 'filled');
assert.equal(filled.hasReflectionSection, true);
assert.equal(filled.hasPlaceholder, false);

const missing = analyzeDevotionalSource({
  slug: 'ano-b/natal/01-domingo',
  title: 'Primeiro Domingo do Natal',
  ano: 'B',
  estacao: 'Natal',
  tipo: 'Domingo',
  markdown: '# Primeiro Domingo do Natal',
});

assert.equal(missing.status, 'missing-section');
assert.equal(missing.hasReflectionSection, false);

const report = buildDevotionalReport([placeholder, filled, missing]);

assert.equal(report.total, 3);
assert.equal(report.placeholderCount, 1);
assert.equal(report.filledCount, 1);
assert.equal(report.missingSectionCount, 1);
assert.equal(report.completionPercent, 33);
assert.deepEqual(
  report.byGroup.map((group) => ({
    key: group.key,
    total: group.total,
    placeholderCount: group.placeholderCount,
    filledCount: group.filledCount,
    missingSectionCount: group.missingSectionCount,
  })),
  [
    {
      key: 'A|Advento',
      total: 2,
      placeholderCount: 1,
      filledCount: 1,
      missingSectionCount: 0,
    },
    {
      key: 'B|Natal',
      total: 1,
      placeholderCount: 0,
      filledCount: 0,
      missingSectionCount: 1,
    },
  ],
);

assert.deepEqual(
  filterDevotionalFiles(report.files, { ano: 'A', estacao: 'Advento', status: 'placeholder' })
    .map((file) => file.slug),
  ['ano-a/advento/01-domingo'],
);

assert.deepEqual(
  filterDevotionalFiles(report.files, { status: 'filled' })
    .map((file) => file.slug),
  ['ano-a/advento/semana-1-segunda'],
);

assert.deepEqual(
  filterDevotionalFiles(report.files, { ano: 'all', estacao: 'all', status: 'all' })
    .map((file) => file.slug),
  [
    'ano-a/advento/01-domingo',
    'ano-a/advento/semana-1-segunda',
    'ano-b/natal/01-domingo',
  ],
);

console.log('devotional status tests passed');
