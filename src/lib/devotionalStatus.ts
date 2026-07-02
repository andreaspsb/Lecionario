export const DEVOTIONAL_PLACEHOLDER = '<!-- Texto devocional aqui -->';

export type DevotionalStatus = 'placeholder' | 'filled' | 'missing-section';

export interface DevotionalSource {
  slug: string;
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
  markdown: string;
}

export interface DevotionalFileStatus extends Omit<DevotionalSource, 'markdown'> {
  status: DevotionalStatus;
  hasReflectionSection: boolean;
  hasPlaceholder: boolean;
}

export interface DevotionalGroupStatus {
  key: string;
  ano: string;
  estacao: string;
  total: number;
  placeholderCount: number;
  filledCount: number;
  missingSectionCount: number;
  completionPercent: number;
}

export interface DevotionalReport {
  total: number;
  placeholderCount: number;
  filledCount: number;
  missingSectionCount: number;
  completionPercent: number;
  files: DevotionalFileStatus[];
  byGroup: DevotionalGroupStatus[];
}

export interface DevotionalFilters {
  ano?: string;
  estacao?: string;
  status?: DevotionalStatus | 'all';
}

const REFLECTION_HEADING = /^##\s+Reflex[aã]o\b/im;

function completionPercent(filled: number, total: number): number {
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

export function analyzeDevotionalSource(source: DevotionalSource): DevotionalFileStatus {
  const hasReflectionSection = REFLECTION_HEADING.test(source.markdown);
  const hasPlaceholder = source.markdown.includes(DEVOTIONAL_PLACEHOLDER);
  const status: DevotionalStatus = !hasReflectionSection
    ? 'missing-section'
    : hasPlaceholder ? 'placeholder' : 'filled';

  return {
    slug: source.slug,
    title: source.title,
    ano: source.ano,
    estacao: source.estacao,
    tipo: source.tipo,
    status,
    hasReflectionSection,
    hasPlaceholder,
  };
}

export function buildDevotionalReport(files: DevotionalFileStatus[]): DevotionalReport {
  const groups = new Map<string, DevotionalGroupStatus>();
  let placeholderCount = 0;
  let filledCount = 0;
  let missingSectionCount = 0;

  for (const file of files) {
    if (file.status === 'placeholder') placeholderCount++;
    if (file.status === 'filled') filledCount++;
    if (file.status === 'missing-section') missingSectionCount++;

    const key = `${file.ano}|${file.estacao}`;
    const group = groups.get(key) ?? {
      key,
      ano: file.ano,
      estacao: file.estacao,
      total: 0,
      placeholderCount: 0,
      filledCount: 0,
      missingSectionCount: 0,
      completionPercent: 0,
    };

    group.total++;
    if (file.status === 'placeholder') group.placeholderCount++;
    if (file.status === 'filled') group.filledCount++;
    if (file.status === 'missing-section') group.missingSectionCount++;
    groups.set(key, group);
  }

  const byGroup = Array.from(groups.values())
    .map((group) => ({
      ...group,
      completionPercent: completionPercent(group.filledCount, group.total),
    }))
    .sort((a, b) => a.ano.localeCompare(b.ano) || a.estacao.localeCompare(b.estacao));

  return {
    total: files.length,
    placeholderCount,
    filledCount,
    missingSectionCount,
    completionPercent: completionPercent(filledCount, files.length),
    files,
    byGroup,
  };
}

export function filterDevotionalFiles<T extends DevotionalFileStatus>(
  files: T[],
  filters: DevotionalFilters,
): T[] {
  return files.filter((file) => {
    const matchesAno = !filters.ano || filters.ano === 'all' || file.ano === filters.ano;
    const matchesEstacao = !filters.estacao || filters.estacao === 'all' || file.estacao === filters.estacao;
    const matchesStatus = !filters.status || filters.status === 'all' || file.status === filters.status;
    return matchesAno && matchesEstacao && matchesStatus;
  });
}
