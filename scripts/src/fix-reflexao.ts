/**
 * fix-reflexao.ts
 * Inserts the "## Reflexão" section into daily lectionary files that are
 * missing it. Skips files that already have the section or that have
 * real content beyond the placeholder.
 *
 * Run: npm run fix-reflexao (from scripts/)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');

const REFLEXAO_BLOCK = `\n---\n\n## Reflexão\n\n<!-- Texto devocional aqui -->\n\n---\n`;
const RODAPE_PATTERN = /\n---\n\n\*Lecionário Revisado Comum \(RCL\) — Leituras Diárias/;

let total = 0;
let fixed = 0;
let skippedHasSection = 0;
let skippedHasContent = 0;

function processFile(filepath: string): void {
  const content = fs.readFileSync(filepath, 'utf8');

  // Only process daily files
  if (!content.includes('tipo: leitura-diaria')) return;

  total++;

  // Skip if already has the section
  if (content.includes('## Reflexão')) {
    skippedHasSection++;
    return;
  }

  // Skip if has real content after the last --- (user already filled it)
  // Detect: last --- followed by non-RCL content that isn't just whitespace
  const parts = content.split(/\n---\n/);
  const lastPart = parts[parts.length - 1].trim();
  const isRodape = lastPart.startsWith('*Lecionário Revisado Comum');
  if (!isRodape && lastPart.length > 0) {
    skippedHasContent++;
    console.log(`  SKIP (has content): ${path.relative(ROOT, filepath)}`);
    return;
  }

  // Insert ## Reflexão block before the closing rodapé line
  const updated = content.replace(
    RODAPE_PATTERN,
    REFLEXAO_BLOCK + '\n\n*Lecionário Revisado Comum (RCL) — Leituras Diárias',
  );

  if (updated === content) {
    // Fallback: append at end if pattern didn't match
    const appended = content.trimEnd() + REFLEXAO_BLOCK + '\n\n*Lecionário Revisado Comum (RCL) — Leituras Diárias, ' +
      (content.match(/Ano ([ABC])/))?.[0]?.replace('Ano ', '') + '\n';
    fs.writeFileSync(filepath, appended, 'utf8');
  } else {
    fs.writeFileSync(filepath, updated, 'utf8');
  }

  fixed++;
  console.log(`  FIXED: ${path.relative(ROOT, filepath)}`);
}

function walkDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

console.log('Verificando arquivos diários...\n');

for (const ano of ['ano-a', 'ano-b', 'ano-c']) {
  walkDir(path.join(ROOT, ano));
}

console.log(`\n── Resultado ──────────────────────────`);
console.log(`Total de arquivos diários: ${total}`);
console.log(`Corrigidos:               ${fixed}`);
console.log(`Já tinham ## Reflexão:    ${skippedHasSection}`);
console.log(`Já têm conteúdo real:     ${skippedHasContent}`);
