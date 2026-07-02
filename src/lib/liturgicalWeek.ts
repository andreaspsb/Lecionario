import { normalizeSeasonKey } from './navigationFilters';

export type LiturgicalWeekPosition = 'before' | 'anchor' | 'after';

export interface LiturgicalWeekEntry {
  slug: string;
  title: string;
  ano: string;
  estacao: string;
  tipo: string;
}

export interface LiturgicalWeekDay<T extends LiturgicalWeekEntry = LiturgicalWeekEntry> {
  entry: T;
  slug: string;
  position: LiturgicalWeekPosition;
}

export interface LiturgicalWeek<T extends LiturgicalWeekEntry = LiturgicalWeekEntry> {
  anchor: T;
  ano: string;
  estacao: string;
  seasonKey: string;
  days: LiturgicalWeekDay<T>[];
}

const BEFORE_DAYS = new Set(['quinta', 'sexta', 'sabado']);
const AFTER_DAYS = new Set(['segunda', 'terca', 'quarta']);

function weekdaySlug(slug: string): string | null {
  return /semana-\d+-(segunda|terca|quarta|quinta|sexta|sabado)$/.exec(slug)?.[1] ?? null;
}

function isAnchor(entry: LiturgicalWeekEntry): boolean {
  return entry.tipo === 'Domingo' || entry.tipo === 'Dia Festo';
}

function sortEntriesByOrder<T extends LiturgicalWeekEntry>(entries: T[], order: string[]): T[] {
  const orderIndex = new Map(order.map((slug, index) => [slug, index]));
  return [...entries].sort((a, b) => {
    const aIndex = orderIndex.get(a.slug) ?? 999999;
    const bIndex = orderIndex.get(b.slug) ?? 999999;
    return aIndex - bIndex || a.slug.localeCompare(b.slug);
  });
}

export function buildLiturgicalWeeks<T extends LiturgicalWeekEntry>(
  entries: T[],
  order: string[],
): LiturgicalWeek<T>[] {
  const sortedEntries = sortEntriesByOrder(entries, order);
  const weeks: LiturgicalWeek<T>[] = [];
  let pendingBefore: LiturgicalWeekDay<T>[] = [];
  let activeWeek: LiturgicalWeek<T> | null = null;

  for (const entry of sortedEntries) {
    if (isAnchor(entry)) {
      activeWeek = {
        anchor: entry,
        ano: entry.ano,
        estacao: entry.estacao,
        seasonKey: normalizeSeasonKey(entry.estacao),
        days: [
          ...pendingBefore,
          { entry, slug: entry.slug, position: 'anchor' },
        ],
      };
      weeks.push(activeWeek);
      pendingBefore = [];
      continue;
    }

    const day = weekdaySlug(entry.slug);
    if (day && BEFORE_DAYS.has(day)) {
      pendingBefore.push({ entry, slug: entry.slug, position: 'before' });
      continue;
    }

    if (day && AFTER_DAYS.has(day) && activeWeek) {
      activeWeek.days.push({ entry, slug: entry.slug, position: 'after' });
    }
  }

  return weeks;
}

export function findLiturgicalWeekForSlug<T extends LiturgicalWeekEntry>(
  weeks: LiturgicalWeek<T>[],
  slug: string,
): LiturgicalWeek<T> | null {
  return weeks.find((week) => week.days.some((day) => day.slug === slug)) ?? null;
}
