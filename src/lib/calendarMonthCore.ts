import { getReadingForDateWithLinks, type DateReading, type SumarioLinkLike } from './dateNavigationCore';
import { formatarData } from './liturgicalCalendar';
import { toIsoDate } from './localDate';

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isoDate: string;
  reading: DateReading | null;
}

export interface CalendarMonth {
  year: number;
  monthIndex: number;
  label: string;
  leadingBlankDays: number;
  days: CalendarDay[];
}

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function getCalendarMonthWithLinks(
  year: number,
  monthIndex: number,
  links: SumarioLinkLike[]
): CalendarMonth {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    days.push({
      date,
      dayOfMonth: day,
      isoDate: toIsoDate(date),
      reading: getReadingForDateWithLinks(date, links),
    });
  }

  return {
    year,
    monthIndex,
    label: `${MONTH_NAMES[monthIndex]} de ${year}`,
    leadingBlankDays: firstDay.getDay(),
    days,
  };
}

export function parseMonthInput(yearValue: string | null, monthValue: string | null): {
  year: number;
  monthIndex: number;
} | null {
  if (!yearValue || !monthValue) {
    return null;
  }

  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, monthIndex: month - 1 };
}

export function formatCalendarDate(date: Date): string {
  return formatarData(date);
}
