import * as assert from 'node:assert/strict';
import { getHomeHighlight } from '../src/lib/homeHighlight';

const natal = getHomeHighlight(new Date(2026, 11, 25));
assert.ok(natal);
assert.equal(natal.label, 'Hoje');
assert.equal(natal.displayDate.toISOString().slice(0, 10), '2026-12-25');
assert.equal(natal.dia.arquivo, 'ano-b/natal/00c-natividade-proprio3.md');

const weekday = getHomeHighlight(new Date(2026, 5, 16));
assert.ok(weekday);
assert.equal(weekday.label, 'Domingo mais recente');
assert.equal(weekday.displayDate.toISOString().slice(0, 10), '2026-06-14');
assert.equal(weekday.dia.arquivo, 'ano-a/tempo-comum/prop06-domingo.md');

console.log('home highlight tests passed');
