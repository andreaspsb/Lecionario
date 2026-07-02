import {
  type AnoLiturgico,
  type DiaLiturgico,
  getDiaLiturgico,
  previousOrSameSunday,
} from './liturgicalCalendar';
import { type SumarioLink, parseSumarioLinks } from './sumarioParser';

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

function diaFromSumarioLink(link: SumarioLink): DiaLiturgico | null {
  const [anoDir, estacao] = link.slug.split('/');
  const ano = anoDir?.replace('ano-', '').toUpperCase();

  if ((ano !== 'A' && ano !== 'B' && ano !== 'C') || !estacao) {
    return null;
  }

  return {
    ano: ano as AnoLiturgico,
    estacao,
    arquivo: `${link.slug}.md`,
    nome: link.nome,
  };
}

function anchorSundayForLiturgicalWeek(date: Date): Date | null {
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    return cloneDate(date);
  }

  const anchor = cloneDate(date);

  if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    anchor.setDate(anchor.getDate() - dayOfWeek);
    return anchor;
  }

  if (dayOfWeek >= 4 && dayOfWeek <= 6) {
    anchor.setDate(anchor.getDate() + (7 - dayOfWeek));
    return anchor;
  }

  return null;
}

function getWeekdaySlug(date: Date): string | null {
  return [
    null,
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
  ][date.getDay()] ?? null;
}

function findDailyLinkForDate(date: Date): SumarioLink | null {
  const daySlug = getWeekdaySlug(date);
  const anchorSunday = anchorSundayForLiturgicalWeek(date);

  if (!daySlug || !anchorSunday) {
    return null;
  }

  const anchorDia = getDiaLiturgico(anchorSunday);
  if (!anchorDia) {
    return null;
  }

  const links = parseSumarioLinks();
  const anchorSlug = toSlug(anchorDia);
  const anchorIndex = links.findIndex((link) => link.slug === anchorSlug);

  if (anchorIndex === -1) {
    return null;
  }

  const step = date.getDay() <= 3 ? 1 : -1;

  for (let offset = step; Math.abs(offset) <= 8; offset += step) {
    const candidate = links[anchorIndex + offset];
    if (candidate?.slug.endsWith(`-${daySlug}`)) {
      return candidate;
    }
  }

  return null;
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

  const dailyLink = findDailyLinkForDate(requestedDate);
  const dailyDia = dailyLink ? diaFromSumarioLink(dailyLink) : null;

  if (dailyDia) {
    return {
      date: requestedDate,
      sourceDate: requestedDate,
      dia: dailyDia,
      label: 'Leitura da data',
      slug: toSlug(dailyDia),
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
