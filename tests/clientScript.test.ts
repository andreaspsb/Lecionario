import * as assert from 'node:assert/strict';
import fs from 'node:fs';

for (const page of ['src/pages/calendario.astro', 'src/pages/data.astro']) {
  const source = fs.readFileSync(page, 'utf-8');
  const inlineImport = /<script\s+define:vars=[\s\S]*?import\s+\{/.test(source);
  assert.equal(inlineImport, false, `${page} must not emit raw imports inside inline scripts`);
}

console.log('client script tests passed');
