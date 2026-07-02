import { nomeEstacao } from './liturgicalCalendar';
import { normalizeSeasonKey } from './navigationFilters';

export interface AnnualCalendarEntry {
  slug: string;
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
}

export interface AnnualCalendarSeason<T extends AnnualCalendarEntry = AnnualCalendarEntry> {
  key: string;
  title: string;
  entries: T[];
}

export interface AnnualCalendar<T extends AnnualCalendarEntry = AnnualCalendarEntry> {
  ano: string;
  total: number;
  seasons: AnnualCalendarSeason<T>[];
}

export interface AnnualCalendarOptions {
  ano: string;
  order: string[];
}

const SEASON_ORDER = ['advento', 'natal', 'epifania', 'quaresma', 'semana-santa', 'pascoa', 'tempo-comum'];

function isSundayOrFeast(entry: AnnualCalendarEntry): boolean {
  return entry.tipo === 'Domingo' || entry.tipo === 'Dia Festo';
}

export function buildAnnualCalendar<T extends AnnualCalendarEntry>(
  entries: T[],
  options: AnnualCalendarOptions,
): AnnualCalendar<T> {
  const orderIndex = new Map(options.order.map((slug, index) => [slug, index]));
  const groups = new Map<string, AnnualCalendarSeason<T>>();

  const orderedEntries = entries
    .filter((entry) => entry.ano === options.ano)
    .filter(isSundayOrFeast)
    .sort((a, b) => {
      const aIndex = orderIndex.get(a.slug) ?? 999999;
      const bIndex = orderIndex.get(b.slug) ?? 999999;
      return aIndex - bIndex || a.slug.localeCompare(b.slug);
    });

  for (const entry of orderedEntries) {
    const key = normalizeSeasonKey(entry.estacao);
    const group = groups.get(key) ?? {
      key,
      title: nomeEstacao(key),
      entries: [],
    };
    group.entries.push(entry);
    groups.set(key, group);
  }

  const seasons = Array.from(groups.values()).sort((a, b) => (
    SEASON_ORDER.indexOf(a.key) - SEASON_ORDER.indexOf(b.key)
  ));

  return {
    ano: options.ano,
    total: orderedEntries.length,
    seasons,
  };
}
