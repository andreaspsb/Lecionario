export type NavigationFilterType = 'all' | 'ferial' | 'dominical-festivo';

export interface NavigationFilters {
  ano?: string;
  estacao?: string;
  tipo?: NavigationFilterType;
}

export interface NavigationFilterEntry {
  slug: string;
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
}

export function normalizeSeasonKey(estacao: string): string {
  return estacao.toLowerCase()
    .replace(/\s*\(.*\)$/, '')
    .trim()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesFilterType(tipo: string, filterType?: NavigationFilterType): boolean {
  if (!filterType || filterType === 'all') {
    return true;
  }

  if (filterType === 'ferial') {
    return tipo === 'Ferial';
  }

  return tipo === 'Domingo' || tipo === 'Dia Festo';
}

export function filterNavigationEntries<T extends NavigationFilterEntry>(
  entries: T[],
  filters: NavigationFilters,
): T[] {
  return entries.filter((entry) => {
    const matchesAno = !filters.ano || filters.ano === 'all' || entry.ano === filters.ano;
    const matchesEstacao = !filters.estacao
      || filters.estacao === 'all'
      || normalizeSeasonKey(entry.estacao) === filters.estacao;
    const matchesTipo = matchesFilterType(entry.tipo, filters.tipo);

    return matchesAno && matchesEstacao && matchesTipo;
  });
}
