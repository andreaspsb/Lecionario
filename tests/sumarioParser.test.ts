import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseSumarioLinks } from '../src/lib/sumarioParser';

const links = parseSumarioLinks();

assert.equal(links.length, 1097);
assert.equal(links[0].slug, 'ano-a/advento/semana-1-quinta');
assert.equal(links.some((link) => link.slug === 'ano-a/advento/01-domingo'), true);

const duplicateSlugs = links
  .map((link) => link.slug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
assert.deepEqual(duplicateSlugs, []);

for (const link of links) {
  const markdownPath = path.resolve(`${link.slug}.md`);
  assert.equal(fs.existsSync(markdownPath), true, `Missing file for sumario link: ${link.slug}`);
}

console.log('sumario parser tests passed');
