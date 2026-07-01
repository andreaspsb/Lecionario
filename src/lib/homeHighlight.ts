import {
  type DiaLiturgico,
  getDiaLiturgico,
  previousOrSameSunday,
} from './liturgicalCalendar';

export interface HomeHighlight {
  dia: DiaLiturgico;
  label: 'Hoje' | 'Domingo mais recente';
  displayDate: Date;
}

export function getHomeHighlight(date: Date): HomeHighlight | null {
  const diaHoje = getDiaLiturgico(date);

  if (diaHoje) {
    return {
      dia: diaHoje,
      label: 'Hoje',
      displayDate: date,
    };
  }

  const domingoRecente = previousOrSameSunday(date);
  const diaDomingo = getDiaLiturgico(domingoRecente);

  if (!diaDomingo) {
    return null;
  }

  return {
    dia: diaDomingo,
    label: 'Domingo mais recente',
    displayDate: domingoRecente,
  };
}
