export const APP_TIME_ZONE = 'America/Sao_Paulo';

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

export function getDatePartsInTimeZone(
  date: Date,
  timeZone = APP_TIME_ZONE
): DateParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

export function dateFromParts(parts: DateParts): Date {
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function getTodayInAppTimeZone(now = new Date()): Date {
  return dateFromParts(getDatePartsInTimeZone(now));
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
