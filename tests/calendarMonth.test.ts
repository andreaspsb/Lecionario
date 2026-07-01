import * as assert from 'node:assert/strict';
import { getCalendarMonth, parseMonthInput } from '../src/lib/calendarMonth';

const december = getCalendarMonth(2026, 11);

assert.equal(december.year, 2026);
assert.equal(december.monthIndex, 11);
assert.equal(december.label, 'dezembro de 2026');
assert.equal(december.days.length, 31);
assert.equal(december.leadingBlankDays, 2);

const christmas = december.days.find((day) => day.isoDate === '2026-12-25');
assert.ok(christmas);
assert.equal(christmas.reading?.label, 'Leitura da data');
assert.equal(christmas.reading?.slug, 'ano-b/natal/00c-natividade-proprio3');

const weekday = december.days.find((day) => day.isoDate === '2026-12-29');
assert.ok(weekday);
assert.equal(weekday.reading?.label, 'Domingo mais recente');
assert.equal(weekday.reading?.sourceDate.toISOString().slice(0, 10), '2026-12-27');

assert.deepEqual(parseMonthInput('2026', '12'), { year: 2026, monthIndex: 11 });
assert.deepEqual(parseMonthInput('2026', '01'), { year: 2026, monthIndex: 0 });
assert.equal(parseMonthInput('2026', '13'), null);
assert.equal(parseMonthInput('abcd', '12'), null);

console.log('calendar month tests passed');
