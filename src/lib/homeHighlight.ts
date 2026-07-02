import type { DiaLiturgico } from './liturgicalCalendar';
import { getReadingForDate } from './dateNavigation';

export interface HomeHighlight {
  dia: DiaLiturgico;
  label: 'Hoje' | 'Domingo mais recente';
  displayDate: Date;
}

export function getHomeHighlight(date: Date): HomeHighlight | null {
  const reading = getReadingForDate(date);

  if (!reading) {
    return null;
  }

  const usesFallback = reading.label === 'Domingo mais recente';

  return {
    dia: reading.dia,
    label: usesFallback ? 'Domingo mais recente' : 'Hoje',
    displayDate: usesFallback ? reading.sourceDate : reading.date,
  };
}
