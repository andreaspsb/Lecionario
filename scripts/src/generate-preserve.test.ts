import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { shouldPreserveExistingFile } from './generate.js';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lecionario-generate-'));

const missingPath = path.join(tmpDir, 'missing.md');
assert.equal(shouldPreserveExistingFile(missingPath), false);

const placeholderPath = path.join(tmpDir, 'placeholder.md');
fs.writeFileSync(placeholderPath, '## Reflexão\n\n<!-- Texto devocional aqui -->\n', 'utf8');
assert.equal(shouldPreserveExistingFile(placeholderPath), false);

const devotionalPath = path.join(tmpDir, 'devotional.md');
fs.writeFileSync(devotionalPath, '## Reflexão\n\nTexto devocional preenchido.\n', 'utf8');
assert.equal(shouldPreserveExistingFile(devotionalPath), true);

console.log('generate preserve tests passed');
