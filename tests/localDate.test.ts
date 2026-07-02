import * as assert from 'node:assert/strict';
import { getTodayInAppTimeZone, toIsoDate } from '../src/lib/localDate';

const lateUtc = new Date('2026-07-02T01:30:00.000Z');
const saoPauloToday = getTodayInAppTimeZone(lateUtc);

assert.equal(toIsoDate(saoPauloToday), '2026-07-01');
assert.equal(saoPauloToday.getHours(), 0);
assert.equal(saoPauloToday.getMinutes(), 0);

console.log('local date tests passed');
