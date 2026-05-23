/**
 * format-reflexao.ts
 * Insere e formata um texto devocional (reflexão) em um arquivo diário do lecionário,
 * substituindo o placeholder "<!-- Texto devocional aqui -->".
 *
 * Uso:
 *   npm run format-reflexao -- --file <caminho-do-arquivo> --texto <caminho-do-texto>
 *   npm run format-reflexao -- --file <caminho-do-arquivo>          # lê do stdin
 *   npm run format-reflexao -- --file <caminho-do-arquivo> --reformat  # reformata conteúdo existente
 *
 * Exemplos:
 *   npm run format-reflexao -- --file ano-a/advento/semana-1-segunda.md --texto /tmp/reflexao.txt
 *   npm run format-reflexao -- --file ano-a/pascoa/semana-8-sabado.md --reformat
 *
 * O formatador converte automaticamente:
 *   - Headers de seção (Devocional, Saudação, Meditação, etc.) → ### heading
 *   - Subsections numeradas (1. Título) → #### heading
 *   - Referências bíblicas (Êxodo 20:1–21 (NAA)) → *itálico*
 *   - Textos de oração e bênção → > blockquote
 *
 * Run from: scripts/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const ROOT = path.resolve(__dirname, '..', '..');
const PLACEHOLDER = '<!-- Texto devocional aqui -->';

// ── Reflexão formatter ────────────────────────────────────────────────────────

type FormattingState = 'normal' | 'prayer' | 'blessing';

/** Section headers that become ### and may change formatting state */
const MAIN_HEADERS: { pattern: RegExp; state: FormattingState }[] = [
  { pattern: /^Devocional:/,                          state: 'normal'   },
  { pattern: /^Saudação e Oração/i,                   state: 'prayer'   },
  { pattern: /^Meditação:/i,                          state: 'normal'   },
  { pattern: /^Tópicos para Reflexão/i,               state: 'normal'   },
  { pattern: /^Oração Final/i,                        state: 'prayer'   },
  { pattern: /^Bênção/i,                              state: 'blessing' },
];

/** Scripture reference on its own line: "Êxodo 20:1–21 (NAA)" */
const SCRIPTURE_REF_RE = /^[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕ][a-záéíóúâêîôûàèìòùãõ]+ \d+:\d+/;

/** Numbered heading: "1. Capitalized Title Without Trailing Sentence Punctuation" */
const NUMBERED_HEADING_RE = /^\d+\.\s+[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕ]/;

/**
 * Converts raw devotional text to properly formatted markdown.
 * If the text already contains markdown headings (### / ####), returns it unchanged.
 */
function formatReflexao(rawText: string): string {
  if (rawText.includes('### ') || rawText.includes('#### ')) {
    return rawText; // Already formatted — don't double-format
  }

  const lines = rawText.split('\n');
  const out: string[] = [];
  let state: FormattingState = 'normal';

  function lastIsBlank(): boolean {
    if (out.length === 0) return true;
    const last = out[out.length - 1];
    return last === '' || last === '>';
  }

  function ensureBlankBefore(): void {
    if (!lastIsBlank()) out.push('');
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // ── H3 main section headers ──────────────────────────────────────────────
    const headerDef = MAIN_HEADERS.find(h => h.pattern.test(trimmed));
    if (headerDef) {
      state = headerDef.state;
      ensureBlankBefore();
      const headerText = trimmed.replace(/:$/, ''); // Remove trailing colon if any
      out.push(`### ${headerText}`);
      out.push('');
      continue;
    }

    // ── H4 numbered subsection headings ─────────────────────────────────────
    // Only in 'normal' state; must start with digit, be uppercase, not end with sentence punctuation
    if (
      state === 'normal' &&
      NUMBERED_HEADING_RE.test(trimmed) &&
      trimmed.length >= 15 &&
      trimmed.length <= 150 &&
      !/[.,;]$/.test(trimmed)
    ) {
      ensureBlankBefore();
      out.push(`#### ${trimmed}`);
      out.push('');
      continue;
    }

    // ── Scripture references ──────────────────────────────────────────────────
    if (SCRIPTURE_REF_RE.test(trimmed) && trimmed.length < 60) {
      out.push(`*${trimmed}*`);
      continue;
    }

    // ── Empty lines ───────────────────────────────────────────────────────────
    if (trimmed === '') {
      out.push(state !== 'normal' ? '>' : '');
      continue;
    }

    // ── Regular lines (apply blockquote in prayer/blessing state) ────────────
    out.push(state !== 'normal' ? `> ${trimmed}` : line);
  }

  // Remove trailing blank/blockquote lines
  while (out.length > 0 && (out[out.length - 1] === '' || out[out.length - 1] === '>')) {
    out.pop();
  }

  return out.join('\n');
}

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

const fileArg = getArg('--file');
const textoArg = getArg('--texto');
const reformatMode = args.includes('--reformat');

if (!fileArg) {
  console.error('Uso: npm run format-reflexao -- --file <caminho> [--texto <arquivo>] [--reformat]');
  console.error('Exemplo: npm run format-reflexao -- --file ano-a/advento/semana-1-segunda.md --texto /tmp/reflexao.txt');
  process.exit(1);
}

const targetPath = path.isAbsolute(fileArg) ? fileArg : path.join(ROOT, fileArg);

if (!fs.existsSync(targetPath)) {
  console.error(`Erro: arquivo não encontrado: ${targetPath}`);
  process.exit(1);
}

// ── Read existing file ────────────────────────────────────────────────────────

const original = fs.readFileSync(targetPath, 'utf8');

if (!original.includes('## Reflexão')) {
  console.error('Erro: o arquivo não possui a seção "## Reflexão".');
  console.error('Execute primeiro: npm run fix-reflexao');
  process.exit(1);
}

// ── Reformat mode: reformata conteúdo já inserido ────────────────────────────

if (reformatMode) {
  const REFLEXAO_MARKER = '\n## Reflexão\n\n';
  const markerIdx = original.indexOf(REFLEXAO_MARKER);

  if (markerIdx === -1) {
    console.error('Erro: não foi possível localizar o início da seção ## Reflexão.');
    process.exit(1);
  }

  const contentStart = markerIdx + REFLEXAO_MARKER.length;
  const rodapeIdx = original.indexOf('\n---\n', contentStart);
  const contentEnd = rodapeIdx !== -1 ? rodapeIdx : original.length;
  const existingContent = original.slice(contentStart, contentEnd).trim();

  if (!existingContent || existingContent === PLACEHOLDER) {
    console.error('Erro: a seção Reflexão está vazia ou ainda contém o placeholder.');
    console.error('Use sem --reformat para inserir o conteúdo primeiro.');
    process.exit(1);
  }

  const formatted = formatReflexao(existingContent);
  const tail = rodapeIdx !== -1 ? original.slice(rodapeIdx) : '';
  const updated = original.slice(0, contentStart) + formatted + '\n' + tail;

  fs.writeFileSync(targetPath, updated, 'utf8');
  console.log(`✓ Reflexão reformatada em: ${path.relative(ROOT, targetPath)}`);
  process.exit(0);
}

// ── Normal mode: verifica placeholder ────────────────────────────────────────

if (!original.includes(PLACEHOLDER)) {
  console.warn('Aviso: o placeholder já foi substituído neste arquivo.');
  console.warn('Use --reformat para reformatar o conteúdo existente.');
  console.warn('Arquivo: ' + path.relative(ROOT, targetPath));
  process.exit(0);
}

// ── Read reflexão text ────────────────────────────────────────────────────────

async function readStdin(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  const lines: string[] = [];
  for await (const line of rl) lines.push(line);
  return lines.join('\n');
}

async function main() {
  let reflexaoText: string;

  if (textoArg) {
    const textoPath = path.isAbsolute(textoArg) ? textoArg : path.join(process.cwd(), textoArg);
    if (!fs.existsSync(textoPath)) {
      console.error(`Erro: arquivo de texto não encontrado: ${textoPath}`);
      process.exit(1);
    }
    reflexaoText = fs.readFileSync(textoPath, 'utf8').trim();
  } else {
    console.log('Cole o texto da reflexão abaixo (Ctrl+Z + Enter no Windows para encerrar):');
    reflexaoText = (await readStdin()).trim();
  }

  if (!reflexaoText) {
    console.error('Erro: texto da reflexão está vazio.');
    process.exit(1);
  }

  // ── Format and inject ────────────────────────────────────────────────────────

  const formattedText = formatReflexao(reflexaoText);
  const updated = original.replace(PLACEHOLDER, formattedText);
  fs.writeFileSync(targetPath, updated, 'utf8');

  console.log(`\n✓ Reflexão inserida e formatada em: ${path.relative(ROOT, targetPath)}`);
  console.log(`  (${formattedText.split('\n').length} linhas adicionadas)`);
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
