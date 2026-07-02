import * as assert from 'node:assert/strict';
import {
  buildLiturgicalWeeks,
  findLiturgicalWeekForSlug,
  type LiturgicalWeekEntry,
} from '../src/lib/liturgicalWeek';

const entries: LiturgicalWeekEntry[] = [
  {
    slug: 'ano-a/advento/semana-1-quinta',
    title: 'Quinta-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-1-sexta',
    title: 'Sexta-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-1-sabado',
    title: 'Sábado',
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
    slug: 'ano-a/advento/semana-1-segunda',
    title: 'Segunda-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-1-terca',
    title: 'Terça-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-1-quarta',
    title: 'Quarta-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/semana-2-quinta',
    title: 'Quinta-feira',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Ferial',
  },
  {
    slug: 'ano-a/advento/02-domingo',
    title: 'Segundo Domingo do Advento',
    ano: 'A',
    estacao: 'Advento',
    tipo: 'Domingo',
  },
];

const order = entries.map((entry) => entry.slug);
const weeks = buildLiturgicalWeeks(entries, order);

assert.equal(weeks.length, 2);
assert.equal(weeks[0].anchor.slug, 'ano-a/advento/01-domingo');
assert.deepEqual(
  weeks[0].days.map((day) => day.slug),
  [
    'ano-a/advento/semana-1-quinta',
    'ano-a/advento/semana-1-sexta',
    'ano-a/advento/semana-1-sabado',
    'ano-a/advento/01-domingo',
    'ano-a/advento/semana-1-segunda',
    'ano-a/advento/semana-1-terca',
    'ano-a/advento/semana-1-quarta',
  ],
);
assert.deepEqual(
  weeks[0].days.map((day) => day.position),
  ['before', 'before', 'before', 'anchor', 'after', 'after', 'after'],
);

assert.equal(
  findLiturgicalWeekForSlug(weeks, 'ano-a/advento/semana-1-segunda')?.anchor.slug,
  'ano-a/advento/01-domingo',
);
assert.equal(
  findLiturgicalWeekForSlug(weeks, 'ano-a/advento/semana-2-quinta')?.anchor.slug,
  'ano-a/advento/02-domingo',
);

console.log('liturgical week tests passed');
