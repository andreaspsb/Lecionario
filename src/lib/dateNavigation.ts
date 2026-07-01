import {
  type DiaLiturgico,
  getDiaLiturgico,
  previousOrSameSunday,
} from './liturgicalCalendar';

export interface DateReading {
  date: Date;
  sourceDate: Date;
  dia: DiaLiturgico;
  label: 'Leitura da data' | 'Domingo mais recente';
  slug: string;
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toSlug(dia: DiaLiturgico): string {
  return dia.arquivo.replace(/\.md$/, '');
}

export function getReadingForDate(date: Date): DateReading | null {
  const requestedDate = cloneDate(date);
  const diaDaData = getDiaLiturgico(requestedDate);

  if (diaDaData) {
    return {
      date: requestedDate,
      sourceDate: requestedDate,
      dia: diaDaData,
      label: 'Leitura da data',
      slug: toSlug(diaDaData),
    };
  }

  const domingoRecente = previousOrSameSunday(requestedDate);
  const diaDomingo = getDiaLiturgico(domingoRecente);

  if (!diaDomingo) {
    return null;
  }

  return {
    date: requestedDate,
    sourceDate: domingoRecente,
    dia: diaDomingo,
    label: 'Domingo mais recente',
    slug: toSlug(diaDomingo),
  };
}

export function getUpcomingReadings(startDate: Date, count = 7): DateReading[] {
  const readings: DateReading[] = [];
  const cursor = cloneDate(startDate);

  for (let index = 0; index < count; index++) {
    const reading = getReadingForDate(cursor);
    if (reading) {
      readings.push(reading);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return readings;
}

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
