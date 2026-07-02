import * as assert from 'node:assert/strict';
import {
  buildAnnualCalendar,
  type AnnualCalendarEntry,
} from '../src/lib/annualCalendar';

const entries: AnnualCalendarEntry[] = [
  {
    slug: 'ano-a/advento/semana-1-quinta',
    title: 'Quinta-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/01-domingo',
    title: 'Primeiro Domingo do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
  {
    slug: 'ano-a/advento/02-domingo',
    title: 'Segundo Domingo do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
  {
    slug: 'ano-a/natal/00c-natividade-proprio3',
    title: 'Natividade do Senhor',
    ano: 'A',
    estacao: 'Natal',
    tipo: 'Dia Festo',
  },
  {
    slug: 'ano-b/advento/01-domingo',
    title: 'Primeiro Domingo do Advento',
    ano: 'B',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
];

const calendar = buildAnnualCalendar(entries, {
  ano: 'A',
  order: [
    'ano-a/advento/semana-1-quinta',
    'ano-a/advento/01-domingo',
    'ano-a/advento/02-domingo',
    'ano-a/natal/00c-natividade-proprio3',
    'ano-b/advento/01-domingo',
  ],
});

assert.equal(calendar.ano, 'A');
assert.equal(calendar.total, 3);
assert.deepEqual(
  calendar.seasons.map((season) => ({
    key: season.key,
    title: season.title,
    count: season.entries.length,
  })),
  [
    { key: 'advento', title: 'Advento', count: 2 },
    { key: 'natal', title: 'Natal', count: 1 },
  ],
);
assert.deepEqual(
  calendar.seasons.flatMap((season) => season.entries.map((entry) => entry.slug)),
  [
    'ano-a/advento/01-domingo',
    'ano-a/advento/02-domingo',
    'ano-a/natal/00c-natividade-proprio3',
  ],
);

console.log('annual calendar tests passed');
