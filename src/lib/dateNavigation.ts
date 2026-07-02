import {
  type DateReading,
  getReadingForDateWithLinks,
  getUpcomingReadingsWithLinks,
  parseDateInput,
} from './dateNavigationCore';
import { parseSumarioLinks } from './sumarioParser';

export type { DateReading };
export { parseDateInput };

export function getReadingForDate(date: Date): DateReading | null {
  return getReadingForDateWithLinks(date, parseSumarioLinks());
}

export function getUpcomingReadings(startDate: Date, count = 7): DateReading[] {
  return getUpcomingReadingsWithLinks(startDate, parseSumarioLinks(), count);
}
