import {
  type CalendarDay,
  type CalendarMonth,
  formatCalendarDate,
  getCalendarMonthWithLinks,
  parseMonthInput,
} from './calendarMonthCore';
import { parseSumarioLinks } from './sumarioParser';

export type { CalendarDay, CalendarMonth };
export { formatCalendarDate, parseMonthInput };

export function getCalendarMonth(year: number, monthIndex: number): CalendarMonth {
  return getCalendarMonthWithLinks(year, monthIndex, parseSumarioLinks());
}
