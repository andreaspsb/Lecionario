import fs from 'node:fs';
import path from 'node:path';

export interface SumarioLink {
  nome: string;
  slug: string;
}

/**
 * Lê o sumario.md e extrai a ordem canônica dos links de leitura.
 */
export function parseSumarioLinks(): SumarioLink[] {
  const projectRoot = process.env.INIT_CWD
    ?? (path.basename(process.cwd()) === 'dist' ? path.dirname(process.cwd()) : process.cwd());
  const sumarioPath = path.resolve(projectRoot, 'sumario.md');

  if (!fs.existsSync(sumarioPath)) {
    return [];
  }

  const content = fs.readFileSync(sumarioPath, 'utf-8');
  const regex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
  const links: SumarioLink[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const nome = match[1].trim();
    const filePath = match[2].trim();

    if (!filePath.startsWith('ano-')) {
      continue;
    }

    links.push({
      nome,
      slug: filePath.replace(/\.md$/, ''),
    });
  }

  return links;
}
