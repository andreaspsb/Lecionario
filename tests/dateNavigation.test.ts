import * as assert from 'node:assert/strict';
import {
  getReadingForDate,
  getUpcomingReadings,
  parseDateInput,
} from '../src/lib/dateNavigation';

const natal = getReadingForDate(new Date(2026, 11, 25));
assert.ok(natal);
assert.equal(natal.label, 'Leitura da data');
assert.equal(natal.date.toISOString().slice(0, 10), '2026-12-25');
assert.equal(natal.sourceDate.toISOString().slice(0, 10), '2026-12-25');
assert.equal(natal.slug, 'ano-b/natal/00c-natividade-proprio3');

const weekday = getReadingForDate(new Date(2026, 5, 16));
assert.ok(weekday);
assert.equal(weekday.label, 'Leitura da data');
assert.equal(weekday.date.toISOString().slice(0, 10), '2026-06-16');
assert.equal(weekday.sourceDate.toISOString().slice(0, 10), '2026-06-16');
assert.equal(weekday.slug, 'ano-a/tempo-comum/semana-4-terca');

const thursdayBeforeSunday = getReadingForDate(new Date(2026, 5, 11));
assert.ok(thursdayBeforeSunday);
assert.equal(thursdayBeforeSunday.label, 'Leitura da data');
assert.equal(thursdayBeforeSunday.date.toISOString().slice(0, 10), '2026-06-11');
assert.equal(thursdayBeforeSunday.sourceDate.toISOString().slice(0, 10), '2026-06-11');
assert.equal(thursdayBeforeSunday.slug, 'ano-a/tempo-comum/semana-4-quinta');

const upcoming = getUpcomingReadings(new Date(2026, 11, 24), 3);
assert.equal(upcoming.length, 3);
assert.deepEqual(
  upcoming.map((reading) => reading.date.toISOString().slice(0, 10)),
  ['2026-12-24', '2026-12-25', '2026-12-26']
);
assert.equal(upcoming[1].label, 'Leitura da data');

const parsed = parseDateInput('2026-12-25');
assert.ok(parsed);
assert.equal(parsed.getFullYear(), 2026);
assert.equal(parsed.getMonth(), 11);
assert.equal(parsed.getDate(), 25);

assert.equal(parseDateInput('2026-13-25'), null);
assert.equal(parseDateInput('not-a-date'), null);

console.log('date navigation tests passed');
