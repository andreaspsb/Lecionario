export interface ReadingExportInput {
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
  markdown: string;
  url: string;
  slug: string;
}

export interface ReadingExportData {
  filenameBase: string;
  markdown: string;
  html: string;
  shareText: string;
}

export function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---')) {
    return markdown.trim();
  }

  const end = markdown.indexOf('\n---', 3);
  if (end < 0) {
    return markdown.trim();
  }

  const bodyStart = markdown.indexOf('\n', end + 4);
  return markdown.slice(bodyStart + 1).trim();
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdownToHtml(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderTable(lines: string[]): string {
  const rows = lines
    .filter((line) => !isTableSeparator(line))
    .map(splitTableRow)
    .filter((cells) => cells.some(Boolean));

  const body = rows
    .map((cells) => `<tr>${cells.map((cell) => `<td>${inlineMarkdownToHtml(cell)}</td>`).join('')}</tr>`)
    .join('\n');

  return `<table>\n<tbody>\n${body}\n</tbody>\n</table>`;
}

export function markdownToSimpleHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().includes('|')) {
        tableLines.push(lines[index]);
        index++;
      }
      index--;
      html.push(renderTable(tableLines));
      continue;
    }

    if (trimmed === '---') {
      html.push('<hr>');
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2])}</h${level}>`);
      continue;
    }

    html.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`);
  }

  return html.join('\n');
}

export function buildReadingExport(input: ReadingExportInput): ReadingExportData {
  const body = stripFrontmatter(input.markdown);
  const shareText = [
    input.title,
    `Ano ${input.ano} · ${input.estacao} · ${input.tipo}`,
    input.url,
  ].join('\n');
  const markdown = `${body}\n\n---\n\nFonte: ${input.url}`;
  const filenameBase = `${slugify(input.title)}-ano-${slugify(input.ano) || slugify(input.slug)}`;
  const html = [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${escapeHtml(input.title)}</title>`,
    '</head>',
    '<body>',
    markdownToSimpleHtml(body),
    `<p><strong>Fonte:</strong> <a href="${escapeHtml(input.url)}">${escapeHtml(input.url)}</a></p>`,
    '</body>',
    '</html>',
  ].join('\n');

  return {
    filenameBase,
    markdown,
    html,
    shareText,
  };
}
