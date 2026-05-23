/**
 * generate-daily.ts
 * Fetches and generates daily (weekday) lectionary readings from the Vanderbilt
 * Revised Common Lectionary Daily Readings pages.
 *
 * Run: npm run generate-daily (from scripts/)
 *
 * Output structure:
 *   leituras-diarias/ano-a/advento/semana-1.md
 *   leituras-diarias/ano-a/advento/semana-2.md
 *   ...
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');

// ── Vanderbilt year codes (for the 2025–2028 liturgical cycle)
// The readings themselves repeat every 3 years (A→B→C→A...)
const ANOS_VANDERBILT = [
  { ano: 'A', code: '17134' },
  { ano: 'B', code: '18921' },
  { ano: 'C', code: '19342' },
];

// ── Book name translation (English → Portuguese) ──────────────────────────────

const LIVROS_PT: [RegExp, string][] = [
  [/\bGenesis\b/g, 'Gênesis'],
  [/\bExodus\b/g, 'Êxodo'],
  [/\bLeviticus\b/g, 'Levítico'],
  [/\bNumbers\b/g, 'Números'],
  [/\bDeuteronomy\b/g, 'Deuteronômio'],
  [/\bJoshua\b/g, 'Josué'],
  [/\bJudges\b/g, 'Juízes'],
  [/\bRuth\b/g, 'Rute'],
  [/\b1 Samuel\b/g, '1 Samuel'],
  [/\b2 Samuel\b/g, '2 Samuel'],
  [/\b1 Kings\b/g, '1 Reis'],
  [/\b2 Kings\b/g, '2 Reis'],
  [/\b1 Chronicles\b/g, '1 Crônicas'],
  [/\b2 Chronicles\b/g, '2 Crônicas'],
  [/\bEzra\b/g, 'Esdras'],
  [/\bNehemiah\b/g, 'Neemias'],
  [/\bEsther\b/g, 'Ester'],
  [/\bJob\b/g, 'Jó'],
  [/\bPsalms\b/g, 'Salmo'],
  [/\bPsalm\b/g, 'Salmo'],
  [/\bProverbs\b/g, 'Provérbios'],
  [/\bEcclesiastes\b/g, 'Eclesiastes'],
  [/\bSong of Solomon\b/g, 'Cântico dos Cânticos'],
  [/\bSong of Songs\b/g, 'Cântico dos Cânticos'],
  [/\bIsaiah\b/g, 'Isaías'],
  [/\bJeremiah\b/g, 'Jeremias'],
  [/\bLamentations\b/g, 'Lamentações'],
  [/\bEzekiel\b/g, 'Ezequiel'],
  [/\bDaniel\b/g, 'Daniel'],
  [/\bHosea\b/g, 'Oséias'],
  [/\bJoel\b/g, 'Joel'],
  [/\bAmos\b/g, 'Amós'],
  [/\bObadiah\b/g, 'Obadias'],
  [/\bJonah\b/g, 'Jonas'],
  [/\bMicah\b/g, 'Miquéias'],
  [/\bNahum\b/g, 'Naum'],
  [/\bHabakkuk\b/g, 'Habacuque'],
  [/\bZephaniah\b/g, 'Sofonias'],
  [/\bHaggai\b/g, 'Ageu'],
  [/\bZechariah\b/g, 'Zacarias'],
  [/\bMalachi\b/g, 'Malaquias'],
  [/\bMatthew\b/g, 'Mateus'],
  [/\bMark\b/g, 'Marcos'],
  [/\bLuke\b/g, 'Lucas'],
  [/\bJohn\b/g, 'João'],
  [/\bActs\b/g, 'Atos'],
  [/\bRomans\b/g, 'Romanos'],
  [/\b1 Corinthians\b/g, '1 Coríntios'],
  [/\b2 Corinthians\b/g, '2 Coríntios'],
  [/\bGalatians\b/g, 'Gálatas'],
  [/\bEphesians\b/g, 'Efésios'],
  [/\bPhilippians\b/g, 'Filipenses'],
  [/\bColossians\b/g, 'Colossenses'],
  [/\b1 Thessalonians\b/g, '1 Tessalonicenses'],
  [/\b2 Thessalonians\b/g, '2 Tessalonicenses'],
  [/\b1 Timothy\b/g, '1 Timóteo'],
  [/\b2 Timothy\b/g, '2 Timóteo'],
  [/\bTitus\b/g, 'Tito'],
  [/\bPhilemon\b/g, 'Filêmon'],
  [/\bHebrews\b/g, 'Hebreus'],
  [/\bJames\b/g, 'Tiago'],
  [/\b1 Peter\b/g, '1 Pedro'],
  [/\b2 Peter\b/g, '2 Pedro'],
  [/\b1 John\b/g, '1 João'],
  [/\b2 John\b/g, '2 João'],
  [/\b3 John\b/g, '3 João'],
  [/\bJude\b/g, 'Judas'],
  [/\bRevelation\b/g, 'Apocalipse'],
  [/\bSirach\b/g, 'Eclesiástico'],
  [/\bWisdom\b/g, 'Sabedoria'],
  [/\bTobit\b/g, 'Tobias'],
  [/\bJudith\b/g, 'Judite'],
  [/\bBaruch\b/g, 'Baruc'],
  [/\b1 Maccabees\b/g, '1 Macabeus'],
  [/\b2 Maccabees\b/g, '2 Macabeus'],
];

function traduzirReferencia(ref: string): string {
  let r = ref;
  for (const [pattern, pt] of LIVROS_PT) {
    r = r.replace(pattern, pt);
  }
  return r;
}

// ── Translation maps ─────────────────────────────────────────────────────────

const DIA_PT: Record<string, string> = {
  Monday: 'segunda',
  Tuesday: 'terca',
  Wednesday: 'quarta',
  Thursday: 'quinta',
  Friday: 'sexta',
  Saturday: 'sabado',
};

const DIA_NOME_PT: Record<string, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
};

const ESTACAO_MAP: Record<string, { nome: string; slug: string }> = {
  Advent: { nome: 'Advento', slug: 'advento' },
  Christmas: { nome: 'Natal', slug: 'natal' },
  Epiphany: { nome: 'Epifania', slug: 'epifania' },
  Lent: { nome: 'Quaresma', slug: 'quaresma' },
  'Holy Week': { nome: 'Semana Santa', slug: 'semana-santa' },
  Easter: { nome: 'Páscoa', slug: 'pascoa' },
  'Season after Pentecost': { nome: 'Tempo Comum', slug: 'tempo-comum' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Leitura3 {
  salmo: string;
  primeiraLeitura: string;
  segundaLeitura: string;
}

interface DiaLeitura {
  slug: string; // 'segunda', 'terca', etc.
  nomePortugues: string;
  simples?: Leitura3;
  semicontinua?: Leitura3;
  complementar?: Leitura3;
}

interface SemanaLiturgica {
  domingoNome: string; // e.g. "First Sunday of Advent"
  domingoNomePT: string; // e.g. "Primeiro Domingo do Advento"
  estacaoSlug: string;
  estacaoNome: string;
  numeroSemana: number;
  diasAntes: DiaLeitura[]; // Thu, Fri, Sat
  diasDepois: DiaLeitura[]; // Mon, Tue, Wed
}

// ── HTTP Fetch ────────────────────────────────────────────────────────────────

function fetchHtml(url: string, redirectCount = 0): Promise<string> {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LecionarioPT/1.0)',
        Accept: 'text/html',
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchHtml(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

// ── HTML Parsing ──────────────────────────────────────────────────────────────

/**
 * Parse readings string like:
 *   "Psalm 122; Daniel 9:15-19; James 4:1-10;"
 * or two-track:
 *   " Semi-continuous: Psalm 119:41-48; Genesis 18:16-33; Matthew 12:1-8; Complementary: Psalm 40:1-8; ..."
 */
function parseReadingText(text: string): Pick<DiaLeitura, 'simples' | 'semicontinua' | 'complementar'> {
  const t = text.trim();

  if (t.toLowerCase().includes('semi-continuous:') || t.toLowerCase().includes('complementary:')) {
    // Two-track Ordinary Time format
    const scIdx = t.toLowerCase().indexOf('semi-continuous:');
    const compIdx = t.toLowerCase().indexOf('complementary:');

    const scText = scIdx >= 0
      ? t.slice(scIdx + 'semi-continuous:'.length, compIdx >= 0 ? compIdx : undefined).trim()
      : '';
    const compText = compIdx >= 0
      ? t.slice(compIdx + 'complementary:'.length).trim()
      : '';

    const parseSimple = (s: string): Leitura3 | undefined => {
      // Could have nested semi/comp — take just raw text
      const parts = s.split(';').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return {
          salmo: traduzirReferencia(parts[0]),
          primeiraLeitura: traduzirReferencia(parts[1]),
          segundaLeitura: traduzirReferencia(parts[2]),
        };
      }
      return undefined;
    };

    return {
      semicontinua: parseSimple(scText) ?? undefined,
      complementar: parseSimple(compText) ?? undefined,
    };
  }

  // Simple format
  const rawParts = t.split(';').map(p => p.trim()).filter(Boolean);

  // Merge parts that start with a digit (e.g. "15:20-21" continues "Exodus 14:10-31")
  const parts: string[] = [];
  for (const part of rawParts) {
    if (parts.length > 0 && /^\d+[:.]/.test(part)) {
      // Continuation of previous reading (cross-chapter reference)
      parts[parts.length - 1] += '; ' + part;
    } else {
      parts.push(part);
    }
  }

  if (parts.length >= 3) {
    return {
      simples: {
        salmo: traduzirReferencia(parts[0]),
        primeiraLeitura: traduzirReferencia(parts[1]),
        segundaLeitura: traduzirReferencia(parts[2]),
      },
    };
  }

  return {};
}

interface RawEntry {
  season: string;       // 'Advent', 'Christmas', etc.
  dayOfWeek: string;   // 'Monday', 'Sunday', etc.
  date: string;         // 'November 27, 2025'
  isSunday: boolean;
  sundayName?: string; // if Sunday
  readings?: Pick<DiaLeitura, 'simples' | 'semicontinua' | 'complementar'>;
}

function parseVanderbiltHtml(html: string): RawEntry[] {
  const entries: RawEntry[] = [];
  let currentSeason = 'Unknown';

  // Strip CDATA / script content to reduce noise
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Match section headers (h2) and list items (li) in document order
  const tokenRegex = /<h2[^>]*>([\s\S]*?)<\/h2>|<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(cleaned)) !== null) {
    if (m[1] !== undefined) {
      // H2 — season header
      const h2Text = m[1].replace(/<[^>]+>/g, '').trim();
      if (ESTACAO_MAP[h2Text]) {
        currentSeason = h2Text;
      }
    } else if (m[2] !== undefined) {
      // LI — daily entry
      const liHtml = m[2];

      // Extract plain text from li
      const liText = liHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      // Match: "DayName, Month DD, YYYY: content"
      const dateMatch = liText.match(/^(\w+),\s+(\w+ \d+,\s*\d{4}):\s*([\s\S]*)$/);
      if (!dateMatch) continue;

      const dayOfWeek = dateMatch[1];
      const date = dateMatch[2].trim();
      const content = dateMatch[3].trim();

      if (dayOfWeek === 'Sunday') {
        entries.push({
          season: currentSeason,
          dayOfWeek,
          date,
          isSunday: true,
          sundayName: content,
        });
      } else if (DIA_PT[dayOfWeek]) {
        entries.push({
          season: currentSeason,
          dayOfWeek,
          date,
          isSunday: false,
          readings: parseReadingText(content),
        });
      }
    }
  }

  return entries;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const MONTH_NUM: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12,
};

function parseDateToNum(dateStr: string): number {
  // "November 27, 2025" → comparable number
  const m = dateStr.match(/(\w+)\s+(\d+),\s*(\d+)/);
  if (!m) return 0;
  return parseInt(m[3]) * 10000 + (MONTH_NUM[m[1]] ?? 0) * 100 + parseInt(m[2]);
}

// ── Sunday name → Portuguese ──────────────────────────────────────────────────

const SUNDAY_NAMES: Record<string, string> = {
  // Advent
  'First Sunday of Advent': 'Primeiro Domingo do Advento',
  'Second Sunday of Advent': 'Segundo Domingo do Advento',
  'Third Sunday of Advent': 'Terceiro Domingo do Advento',
  'Fourth Sunday of Advent': 'Quarto Domingo do Advento',
  // Christmas
  'First Sunday after Christmas Day': 'Primeiro Domingo após o Natal',
  'Second Sunday after Christmas Day': 'Segundo Domingo após o Natal',
  // Epiphany
  'Baptism of the Lord': 'Batismo do Senhor',
  'Second Sunday after the Epiphany': 'Segundo Domingo da Epifania',
  'Third Sunday after the Epiphany': 'Terceiro Domingo da Epifania',
  'Fourth Sunday after the Epiphany': 'Quarto Domingo da Epifania',
  'Fifth Sunday after the Epiphany': 'Quinto Domingo da Epifania',
  'Sixth Sunday after the Epiphany': 'Sexto Domingo da Epifania',
  'Seventh Sunday after the Epiphany': 'Sétimo Domingo da Epifania',
  'Eighth Sunday after the Epiphany': 'Oitavo Domingo da Epifania',
  'Transfiguration Sunday': 'Transfiguração do Senhor',
  // Lent / Holy Week
  'First Sunday in Lent': 'Primeiro Domingo da Quaresma',
  'Second Sunday in Lent': 'Segundo Domingo da Quaresma',
  'Third Sunday in Lent': 'Terceiro Domingo da Quaresma',
  'Fourth Sunday in Lent': 'Quarto Domingo da Quaresma',
  'Fifth Sunday in Lent': 'Quinto Domingo da Quaresma',
  'Palm Sunday': 'Domingo de Ramos',
  'Liturgy of the Palms': 'Domingo de Ramos — Liturgia das Palmas',
  'Liturgy of the Passion': 'Liturgia da Paixão',
  // Easter
  'Easter Vigil': 'Vigília Pascal',
  'Easter Day': 'Domingo de Páscoa',
  'Easter Sunday': 'Domingo de Páscoa',
  'Easter Evening': 'Tarde de Páscoa',
  'Second Sunday of Easter': 'Segundo Domingo da Páscoa',
  'Third Sunday of Easter': 'Terceiro Domingo da Páscoa',
  'Fourth Sunday of Easter': 'Quarto Domingo da Páscoa',
  'Fifth Sunday of Easter': 'Quinto Domingo da Páscoa',
  'Sixth Sunday of Easter': 'Sexto Domingo da Páscoa',
  'Seventh Sunday of Easter': 'Sétimo Domingo da Páscoa',
  'Ascension of the Lord': 'Ascensão do Senhor',
  'Day of Pentecost': 'Pentecostes',
  // Ordinary Time / Season after Pentecost
  'Trinity Sunday': 'Domingo da Santíssima Trindade',
  'First Sunday after Pentecost': 'Domingo da Santíssima Trindade',
  'All Saints Day': 'Todos os Santos',
  'All Saints': 'Todos os Santos',
  // Visitation is treated as a precursor to Trinity Sunday (diasAntes) in the Vanderbilt data
  'Visitation of Mary to Elizabeth': 'Domingo da Santíssima Trindade',
  'Reign of Christ': 'Cristo Rei',
  'Thanksgiving Day': 'Ação de Graças',
};

// Handle "Proper N (M)" patterns
function translateSundayName(name: string): string {
  if (SUNDAY_NAMES[name]) return SUNDAY_NAMES[name];

  // Proper N pattern
  const properMatch = name.match(/Proper (\d+)/);
  if (properMatch) {
    return `Próprio ${properMatch[1]}`;
  }
  // "Reign of Christ" with Proper
  if (name.includes('Reign of Christ')) return 'Cristo Rei';

  return name;
}

// ── Grouping into liturgical weeks ────────────────────────────────────────────

function groupIntoWeeks(entries: RawEntry[]): SemanaLiturgica[] {
  const weeks: SemanaLiturgica[] = [];

  // Find all Sundays
  const sundays = entries.filter(e => e.isSunday);

  for (let i = 0; i < sundays.length; i++) {
    const sunday = sundays[i];
    const sundayNum = parseDateToNum(sunday.date);
    const nextSundayNum = i + 1 < sundays.length ? parseDateToNum(sundays[i + 1].date) : Infinity;
    const prevSundayNum = i > 0 ? parseDateToNum(sundays[i - 1].date) : -Infinity;

    const estacao = ESTACAO_MAP[sunday.season] ?? { nome: sunday.season, slug: sunday.season.toLowerCase() };

    // Skip Holy Week Sundays (Palm Sunday is in Lent/Holy Week; Easter Vigil, etc.)
    // We only skip if it's not a regular "Sunday" pattern
    if (sunday.season === 'Holy Week') continue;

    // Get weekdays belonging to this week:
    // - Thu/Fri/Sat between prev Sunday and this Sunday
    // - Mon/Tue/Wed between this Sunday and next Sunday
    const weekdays = entries.filter(e => {
      if (e.isSunday) return false;
      const dNum = parseDateToNum(e.date);
      const dow = e.dayOfWeek;
      const isBefore = dNum < sundayNum && dNum > prevSundayNum;
      const isAfter = dNum > sundayNum && dNum < nextSundayNum;
      return isBefore || isAfter;
    });

    const diasAntes: DiaLeitura[] = weekdays
      .filter(e => {
        const dNum = parseDateToNum(e.date);
        return dNum < sundayNum && dNum > prevSundayNum &&
          ['Thursday', 'Friday', 'Saturday'].includes(e.dayOfWeek);
      })
      .sort((a, b) => parseDateToNum(a.date) - parseDateToNum(b.date))
      .map(e => ({
        slug: DIA_PT[e.dayOfWeek]!,
        nomePortugues: DIA_NOME_PT[DIA_PT[e.dayOfWeek]!] ?? e.dayOfWeek,
        ...e.readings,
      }));

    const diasDepois: DiaLeitura[] = weekdays
      .filter(e => {
        const dNum = parseDateToNum(e.date);
        return dNum > sundayNum && dNum < nextSundayNum &&
          ['Monday', 'Tuesday', 'Wednesday'].includes(e.dayOfWeek);
      })
      .sort((a, b) => parseDateToNum(a.date) - parseDateToNum(b.date))
      .map(e => ({
        slug: DIA_PT[e.dayOfWeek]!,
        nomePortugues: DIA_NOME_PT[DIA_PT[e.dayOfWeek]!] ?? e.dayOfWeek,
        ...e.readings,
      }));

    // Skip weeks with no actual weekday readings (e.g. Easter Vigil, Easter Evening)
    const hasReadings = (dias: DiaLeitura[]) => dias.some(d => d.simples || d.semicontinua || d.complementar);
    if (!hasReadings(diasAntes) && !hasReadings(diasDepois)) continue;

    // Determine week number within season
    const sameSeasonWeeks = weeks.filter(w => w.estacaoSlug === estacao.slug);
    const numeroSemana = sameSeasonWeeks.length + 1;

    weeks.push({
      domingoNome: sunday.sundayName ?? '',
      domingoNomePT: translateSundayName(sunday.sundayName ?? ''),
      estacaoSlug: estacao.slug,
      estacaoNome: estacao.nome,
      numeroSemana,
      diasAntes,
      diasDepois,
    });
  }

  return weeks;
}

// ── Markdown generation ───────────────────────────────────────────────────────

function formatLeituras3(l: Leitura3): string {
  return `| ${l.salmo} | ${l.primeiraLeitura} | ${l.segundaLeitura} |`;
}

function renderDia(dia: DiaLeitura): string {
  // Skip days with no readings at all
  if (!dia.simples && !dia.semicontinua && !dia.complementar) return '';

  const header = `### ${dia.nomePortugues}\n\n`;
  const tableHeader = `| Salmo | Primeira Leitura | Segunda Leitura |\n|-------|-----------------|-----------------|`;

  if (dia.simples) {
    return `${header}${tableHeader}\n${formatLeituras3(dia.simples)}\n`;
  }

  const parts: string[] = [header];

  if (dia.semicontinua) {
    parts.push(`**Via Semicontínua (SC)**\n\n${tableHeader}\n${formatLeituras3(dia.semicontinua)}\n`);
  }
  if (dia.complementar) {
    parts.push(`**Via Complementar (C)**\n\n${tableHeader}\n${formatLeituras3(dia.complementar)}\n`);
  }

  return parts.join('\n');
}

// Article agreement: seasons that are feminine in Portuguese
const ESTACAO_ARTIGO: Record<string, string> = {
  advento: 'do',
  natal: 'do',
  epifania: 'da',
  quaresma: 'da',
  'semana-santa': 'da',
  pascoa: 'da',
  'tempo-comum': 'do',
};

function generateDiaMarkdown(
  dia: DiaLeitura,
  semana: SemanaLiturgica,
  ano: string,
): string {
  const ordinal = semana.numeroSemana;
  const artigo = ESTACAO_ARTIGO[semana.estacaoSlug] ?? 'do';
  const titulo = `${dia.nomePortugues} — ${ordinal}ª Semana ${artigo} ${semana.estacaoNome}`;
  const tableHeader = `| Salmo | Primeira Leitura | Segunda Leitura |\n|-------|-----------------|-----------------|`;

  let md = `---
tipo: leitura-diaria
nome: "${titulo} (Ano ${ano})"
dia: "${dia.slug}"
ano: "${ano}"
estacao: "${semana.estacaoNome}"
semana: ${ordinal}
domingo: "${semana.domingoNomePT}"
---

# ${titulo} (Ano ${ano})

**Estação Litúrgica:** ${semana.estacaoNome} — Ano ${ano} | Semana do **${semana.domingoNomePT}**

## Leituras

`;

  if (dia.simples) {
    md += `${tableHeader}\n${formatLeituras3(dia.simples)}\n`;
  } else {
    if (dia.semicontinua) {
      md += `**Via Semicontínua**\n\n${tableHeader}\n${formatLeituras3(dia.semicontinua)}\n\n`;
    }
    if (dia.complementar) {
      md += `**Via Complementar**\n\n${tableHeader}\n${formatLeituras3(dia.complementar)}\n`;
    }
  }

  md += `\n---\n\n## Reflexão\n\n<!-- Texto devocional aqui -->\n\n---\n\n*Lecionário Revisado Comum (RCL) — Leituras Diárias, Ano ${ano}*\n`;
  return md;
}

// ── File generation ───────────────────────────────────────────────────────────

function gerarArquivoDia(dia: DiaLeitura, semana: SemanaLiturgica, ano: string): void {
  const dir = path.join(ROOT, `ano-${ano.toLowerCase()}`, semana.estacaoSlug);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `semana-${semana.numeroSemana}-${dia.slug}.md`;
  const filepath = path.join(dir, filename);

  // Preserve manually-added devotional content: skip overwrite if file already
  // has custom text (i.e. the placeholder was replaced by the user).
  if (fs.existsSync(filepath)) {
    const existing = fs.readFileSync(filepath, 'utf8');
    if (!existing.includes('<!-- Texto devocional aqui -->')) {
      return;
    }
  }

  const content = generateDiaMarkdown(dia, semana, ano);
  fs.writeFileSync(filepath, content, 'utf8');
}

// ── Summary generation ────────────────────────────────────────────────────────

/**
 * Inserts daily-reading links into an existing sumario.md content string.
 * For each liturgical week, finds the matching Sunday heading line
 * (identified by [domingoNomePT] inside the correct year's section)
 * and appends the weekday links immediately after it.
 *
 * Liturgical week model: Thu–Wed (Thu before Sunday N through Wed after Sunday N).
 * Day order under each Sunday: Thu/Fri/Sat (diasAntes, start of week) then Mon/Tue/Wed (diasDepois).
 */
function intercalarDiariosNoSumario(
  sumarioContent: string,
  todosSemanas: Map<string, SemanaLiturgica[]>,
): string {
  let updated = sumarioContent;

  for (const [ano, semanas] of todosSemanas) {
    for (let idx = 0; idx < semanas.length; idx++) {
      const semana = semanas[idx];
      const ordinal = semana.numeroSemana;
      const estacaoSlug = semana.estacaoSlug;
      const domingoNomePT = semana.domingoNomePT;

      // A liturgical week runs Thu–Wed (Thu before Sunday N through Wed after Sunday N).
      // Both diasAntes (Thu/Fri/Sat before Sunday N) and diasDepois (Mon/Tue/Wed after Sunday N)
      // belong to Week N and use the current semana's ordinal and estacaoSlug.
      // Display order: Thu/Fri/Sat first (calendar start of the week), then Mon/Tue/Wed.
      const diasAntesLinks = semana.diasAntes
        .filter(d => d.simples || d.semicontinua || d.complementar)
        .map(dia => {
          const link = `ano-${ano.toLowerCase()}/${estacaoSlug}/semana-${ordinal}-${dia.slug}.md`;
          return `  · [${dia.nomePortugues}](${link})`;
        });

      const diasDepoisLinks = semana.diasDepois
        .filter(d => d.simples || d.semicontinua || d.complementar)
        .map(dia => {
          const link = `ano-${ano.toLowerCase()}/${estacaoSlug}/semana-${ordinal}-${dia.slug}.md`;
          return `  · [${dia.nomePortugues}](${link})`;
        });

      if (diasAntesLinks.length === 0 && diasDepoisLinks.length === 0) continue;

      // Match the Sunday line in the correct year section.
      const escapedNome = domingoNomePT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linePattern = new RegExp(
        `([ \\t]*[◉✦][ \\t]+\\[${escapedNome}[^\\]]*\\]\\(ano-${ano.toLowerCase()}/[^)]+\\))`,
        'g',
      );

      // Thu/Fri/Sat go BEFORE domingo; Mon/Tue/Wed go AFTER domingo.
      const before = diasAntesLinks.length > 0 ? diasAntesLinks.join('\n') + '\n' : '';
      const after = diasDepoisLinks.length > 0 ? '\n' + diasDepoisLinks.join('\n') : '';

      updated = updated.replace(linePattern, `${before}$1${after}`);
    }
  }

  return updated;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const todosSemanas = new Map<string, SemanaLiturgica[]>();
  let totalArquivos = 0;

  for (const { ano, code } of ANOS_VANDERBILT) {
    const url = `https://lectionary.library.vanderbilt.edu/daily-readings?y=${code}`;
    console.log(`\nBuscando leituras diárias do Ano ${ano}...`);
    console.log(`  URL: ${url}`);

    let html: string;
    try {
      html = await fetchHtml(url);
      console.log(`  HTML recebido: ${html.length} chars`);
    } catch (err) {
      console.error(`  ERRO ao buscar Ano ${ano}:`, err);
      continue;
    }

    const entries = parseVanderbiltHtml(html);
    console.log(`  Entradas parseadas: ${entries.length} (${entries.filter(e => e.isSunday).length} domingos)`);

    const semanas = groupIntoWeeks(entries);
    console.log(`  Semanas identificadas: ${semanas.length}`);

    for (let idx = 0; idx < semanas.length; idx++) {
      const semana = semanas[idx];
      // diasAntes: Thu/Fri/Sat before this Sunday → belong to THIS liturgical week (week N).
      // A liturgical week runs Thu–Wed (Thu before Sunday N through Wed after Sunday N).
      // So the days BEFORE Sunday N are still part of Week N.
      for (const dia of semana.diasAntes) {
        if (dia.simples || dia.semicontinua || dia.complementar) {
          gerarArquivoDia(dia, semana, ano);
          totalArquivos++;
        }
      }

      // diasDepois: Mon/Tue/Wed after this Sunday → belong to THIS liturgical week (week N).
      for (const dia of semana.diasDepois) {
        if (dia.simples || dia.semicontinua || dia.complementar) {
          gerarArquivoDia(dia, semana, ano);
          totalArquivos++;
        }
      }
    }

    todosSemanas.set(ano, semanas);
  }

  // Interleave daily links into the existing sumario.md
  const mainSumarioPath = path.join(ROOT, 'sumario.md');
  let mainSumario = fs.existsSync(mainSumarioPath)
    ? fs.readFileSync(mainSumarioPath, 'utf8')
    : '';

  // Remove any legacy appended daily section (old approach)
  const DAILY_MARKER = '\n\n---\n\n## Leituras Diárias (Feriais)';
  const dailyStart = mainSumario.indexOf(DAILY_MARKER);
  if (dailyStart !== -1) {
    mainSumario = mainSumario.slice(0, dailyStart);
  }

  // Remove previously interleaved daily links (idempotent re-runs)
  mainSumario = mainSumario.replace(
    /\n  · \[[^\]]+\]\(ano-[abc]\/[^)]+\/semana-\d+-[a-z]+\.md\)/g,
    '',
  );

  // Insert daily links after each matching Sunday line
  mainSumario = intercalarDiariosNoSumario(mainSumario, todosSemanas);
  fs.writeFileSync(mainSumarioPath, mainSumario, 'utf8');

  console.log(`\n✓ ${totalArquivos} arquivos de leituras diárias gerados.`);
  console.log(`✓ Links diários intercalados em sumario.md`);
}

main().catch(console.error);
