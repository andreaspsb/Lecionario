import { getReadingForDate } from './dateNavigation';
import { normalizeSeasonKey } from './navigationFilters';

export interface SeasonEntry {
  slug: string;
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
}

export interface SeasonOverviewOptions {
  currentSlug: string;
  seasonKey: string;
  ano: string;
  order: string[];
  recentCount?: number;
  upcomingCount?: number;
  sundayCount?: number;
}

export interface SeasonOverview<T extends SeasonEntry = SeasonEntry> {
  seasonKey: string;
  ano: string;
  current: T | null;
  entries: T[];
  recent: T[];
  upcoming: T[];
  upcomingSundays: T[];
}

function isSundayOrFeast(entry: SeasonEntry): boolean {
  return entry.tipo === 'Domingo' || entry.tipo === 'Dia Festo';
}

export function getCurrentSeasonKey(date: Date): string | null {
  const reading = getReadingForDate(date);
  return reading ? normalizeSeasonKey(reading.dia.estacao) : null;
}

export function buildSeasonOverview<T extends SeasonEntry>(
  entries: T[],
  options: SeasonOverviewOptions,
): SeasonOverview<T> {
  const orderIndex = new Map(options.order.map((slug, index) => [slug, index]));
  const seasonEntries = entries
    .filter((entry) => entry.ano === options.ano)
    .filter((entry) => normalizeSeasonKey(entry.estacao) === options.seasonKey)
    .sort((a, b) => (orderIndex.get(a.slug) ?? 999999) - (orderIndex.get(b.slug) ?? 999999));

  const currentIndex = seasonEntries.findIndex((entry) => entry.slug === options.currentSlug);
  const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
  const current = seasonEntries[fallbackIndex] ?? null;

  const recentCount = options.recentCount ?? 5;
  const upcomingCount = options.upcomingCount ?? 10;
  const sundayCount = options.sundayCount ?? 4;

  return {
    seasonKey: options.seasonKey,
    ano: options.ano,
    current,
    entries: seasonEntries,
    recent: seasonEntries.slice(Math.max(0, fallbackIndex - recentCount), fallbackIndex),
    upcoming: seasonEntries.slice(fallbackIndex + 1, fallbackIndex + 1 + upcomingCount),
    upcomingSundays: seasonEntries
      .slice(fallbackIndex + 1)
      .filter(isSundayOrFeast)
      .slice(0, sundayCount),
  };
}
