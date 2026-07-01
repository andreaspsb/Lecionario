import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calcularInicioAdvento,
  calcularPascoa,
  getAnoLiturgico,
  getDiaLiturgico,
} from '../src/lib/liturgicalCalendar';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function assertMappedFileExists(date: Date, expectedFile: string): void {
  const result = getDiaLiturgico(date);

  assert.ok(result, `Expected a liturgical day for ${isoDate(date)}`);
  assert.equal(result.arquivo, expectedFile);
  assert.equal(
    fs.existsSync(path.resolve(expectedFile)),
    true,
    `Expected mapped file to exist: ${expectedFile}`
  );
}

assert.equal(isoDate(calcularPascoa(2026)), '2026-04-05');
assert.equal(isoDate(calcularInicioAdvento(2026)), '2026-11-29');

assert.equal(getAnoLiturgico(new Date(2026, 4, 24)), 'A');
assert.equal(getAnoLiturgico(new Date(2026, 11, 1)), 'B');

assertMappedFileExists(new Date(2026, 3, 2), 'ano-a/semana-santa/05-quinta.md');
assertMappedFileExists(new Date(2026, 3, 3), 'ano-a/semana-santa/06-sexta.md');
assertMappedFileExists(new Date(2026, 4, 24), 'ano-a/pascoa/pentecostes.md');
assertMappedFileExists(new Date(2026, 4, 31), 'ano-a/tempo-comum/trindade.md');

console.log('liturgical calendar tests passed');
