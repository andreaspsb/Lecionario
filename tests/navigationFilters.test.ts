import * as assert from 'node:assert/strict';
import {
  filterNavigationEntries,
  normalizeSeasonKey,
  type NavigationFilterEntry,
} from '../src/lib/navigationFilters';

const entries: NavigationFilterEntry[] = [
  {
    slug: 'ano-a/advento/01-domingo',
    title: '1º Domingo do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
  {
    slug: 'ano-a/tempo-comum/semana-4-segunda',
    title: 'Segunda-feira',
    ano: 'A',
    estacao: 'Tempo Comum',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-b/tempo-comum/trindade',
    title: 'Domingo da Santíssima Trindade',
    ano: 'B',
    estacao: 'Tempo Comum (Após Pentecostes)',
    tipo: 'Dia Festo',
  },
];

assert.equal(normalizeSeasonKey('Tempo Comum (Após Pentecostes)'), 'tempo-comum');
assert.equal(normalizeSeasonKey('Quaresma'), 'quaresma');

assert.deepEqual(
  filterNavigationEntries(entries, { ano: 'A' }).map((entry) => entry.slug),
  ['ano-a/advento/01-domingo', 'ano-a/tempo-comum/semana-4-segunda']
);

assert.deepEqual(
  filterNavigationEntries(entries, { estacao: 'tempo-comum' }).map((entry) => entry.slug),
  ['ano-a/tempo-comum/semana-4-segunda', 'ano-b/tempo-comum/trindade']
);

assert.deepEqual(
  filterNavigationEntries(entries, { tipo: 'dominical-festivo' }).map((entry) => entry.slug),
  ['ano-a/advento/01-domingo', 'ano-b/tempo-comum/trindade']
);

assert.deepEqual(
  filterNavigationEntries(entries, {
    ano: 'A',
    estacao: 'tempo-comum',
    tipo: 'ferial',
  }).map((entry) => entry.slug),
  ['ano-a/tempo-comum/semana-4-segunda']
);

console.log('navigation filter tests passed');
