import * as assert from 'node:assert/strict';
import {
  buildSeasonOverview,
  getCurrentSeasonKey,
  type SeasonEntry,
} from '../src/lib/currentSeason';

const entries: SeasonEntry[] = [
  {
    slug: 'ano-a/advento/01-domingo',
    title: '1º Domingo do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
  {
    slug: 'ano-a/advento/semana-1-segunda',
    title: 'Segunda-feira da 1ª semana do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-1-terca',
    title: 'Terça-feira da 1ª semana do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/02-domingo',
    title: '2º Domingo do Advento',
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
];

assert.equal(getCurrentSeasonKey(new Date(2026, 11, 25)), 'natal');
assert.equal(getCurrentSeasonKey(new Date(2025, 11, 1)), 'advento');

const overview = buildSeasonOverview(entries, {
  currentSlug: 'ano-a/advento/semana-1-segunda',
  seasonKey: 'advento',
  ano: 'A',
  order: [
    'ano-a/advento/01-domingo',
    'ano-a/advento/semana-1-segunda',
    'ano-a/advento/semana-1-terca',
    'ano-a/advento/02-domingo',
    'ano-a/natal/00c-natividade-proprio3',
  ],
  recentCount: 2,
  upcomingCount: 3,
  sundayCount: 2,
});

assert.equal(overview.seasonKey, 'advento');
assert.equal(overview.current?.slug, 'ano-a/advento/semana-1-segunda');
assert.deepEqual(
  overview.recent.map((entry) => entry.slug),
  ['ano-a/advento/01-domingo']
);
assert.deepEqual(
  overview.upcoming.map((entry) => entry.slug),
  ['ano-a/advento/semana-1-terca', 'ano-a/advento/02-domingo']
);
assert.deepEqual(
  overview.upcomingSundays.map((entry) => entry.slug),
  ['ano-a/advento/02-domingo']
);

console.log('current season tests passed');
