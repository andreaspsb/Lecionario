import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseSumarioLinks } from '../src/lib/sumarioParser';

const contentDirs = ['ano-a', 'ano-b', 'ano-c'];

function listMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listMarkdownFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath.replace(/\\/g, '/')] : [];
  });
}

const markdownFiles = contentDirs.flatMap(listMarkdownFiles);
const weeklyFiles = markdownFiles.filter((file) => path.basename(file).startsWith('semana-'));
const slugsInSumario = new Set(parseSumarioLinks().map((link) => link.slug));
const slugsOnDisk = markdownFiles.map((file) => file.replace(/\.md$/, ''));

assert.equal(markdownFiles.length, 1097);
assert.equal(weeklyFiles.length, 875);

const missingFromSumario = slugsOnDisk.filter((slug) => !slugsInSumario.has(slug));
assert.deepEqual(missingFromSumario, []);

const duplicateFiles = slugsOnDisk.filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
assert.deepEqual(duplicateFiles, []);

console.log('content integrity tests passed');
