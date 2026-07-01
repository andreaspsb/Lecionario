import { type DateReading, getReadingForDate } from './dateNavigation';
import { formatarData } from './liturgicalCalendar';

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

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCalendarMonth(year: number, monthIndex: number): CalendarMonth {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    days.push({
      date,
      dayOfMonth: day,
      isoDate: toIsoDate(date),
      reading: getReadingForDate(date),
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
