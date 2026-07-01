import * as assert from 'node:assert/strict';
import { buildReadingExport, stripFrontmatter } from '../src/lib/readingExport';

const markdownWithFrontmatter = `---
titulo: "Primeiro Domingo do Advento"
ano: "A"
---

# Primeiro Domingo do Advento

## Leituras

| | |
|---|---|
| **Evangelho** | Mateus 24:36-44 |

## Reflexão

Texto devocional preenchido.
`;

assert.equal(
  stripFrontmatter(markdownWithFrontmatter).startsWith('# Primeiro Domingo do Advento'),
  true,
);

const exportData = buildReadingExport({
  title: 'Primeiro Domingo do Advento',
  ano: 'A',
  estacao: 'Advento',
  tipo: 'Domingo',
  markdown: markdownWithFrontmatter,
  url: 'https://example.test/Lecionario/leitura/ano-a/advento/01-domingo',
  slug: 'ano-a/advento/01-domingo',
});

assert.equal(exportData.filenameBase, 'primeiro-domingo-do-advento-ano-a');
assert.equal(exportData.markdown.includes('titulo:'), false);
assert.equal(exportData.markdown.includes('Texto devocional preenchido.'), true);
assert.equal(exportData.markdown.includes('https://example.test/Lecionario/leitura/ano-a/advento/01-domingo'), true);

assert.equal(exportData.shareText, [
  'Primeiro Domingo do Advento',
  'Ano A · Advento · Domingo',
  'https://example.test/Lecionario/leitura/ano-a/advento/01-domingo',
].join('\n'));

assert.equal(exportData.html.includes('<h1>Primeiro Domingo do Advento</h1>'), true);
assert.equal(exportData.html.includes('<td><strong>Evangelho</strong></td>'), true);
assert.equal(exportData.html.includes('Texto devocional preenchido.'), true);
assert.equal(exportData.html.includes('<script>'), false);

console.log('reading export tests passed');
