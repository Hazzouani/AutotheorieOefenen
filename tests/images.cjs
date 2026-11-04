'use strict';
// Structural checks, deterministic regeneration and optional HTTP asset check.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions-extra.js'), 'utf8'), ctx);
const qs = [...ctx.window.THEORY_QUESTIONS, ...ctx.window.THEORY_QUESTIONS_EXTRA];
const pictures = qs.filter(q => q.image);
assert(pictures.length >= 80, `Only ${pictures.length} illustrated questions`);
const fingerprints = new Set();
const paths = new Set();
let total = 0;
for (const q of qs) {
  assert(Object.hasOwn(q, 'image'), `Missing image field: ${q.id}`);
  if (!q.image) { assert.equal(q.image, null); continue; }
  assert.equal(q.image, `images/question-${String(q.id).padStart(3, '0')}.svg`);
  assert(q.imageAlt.length >= 30, `Short alt: ${q.id}`);
  assert(!/(heeft voorrang|moet wachten|juiste antwoord|mag als eerste|correcte antwoord)/i.test(q.imageAlt), `Answer in alt ${q.id}`);
  assert(!paths.has(q.image), `Reused file ${q.image}`);
  paths.add(q.image);
  const svg = fs.readFileSync(path.join(root, q.image), 'utf8');
  assert(svg.startsWith('<svg '));
  assert(svg.includes('viewBox="0 0 800 500"'));
  assert(!/<(?:script|foreignObject|image|iframe)\b/i.test(svg), `Non-vector content in ${q.image}`);
  assert(!/\b(?:href|src)\s*=|@import|\b(?:NaN|undefined)\b/i.test(svg), `Broken or external reference in ${q.image}`);
  for (const reference of svg.matchAll(/url\s*\(([^)]*)\)/gi)) {
    const target = reference[1].trim().replace(/^['"]|['"]$/g, '');
    assert(/^#[\w-]+$/.test(target), `External SVG paint in ${q.image}`);
    assert(svg.includes(`id="${target.slice(1)}"`), `Missing SVG paint definition in ${q.image}`);
  }
  assert(!/\son[a-z]+\s*=/i.test(svg));
  const drawing = svg.replace(/<title>.*?<\/title>/s, '');
  const hash = crypto.createHash('sha256').update(drawing).digest('hex');
  assert(!fingerprints.has(hash), `Identical drawing ${q.id}`);
  fingerprints.add(hash);
  assert(Buffer.byteLength(svg) < 80000, `Unnecessarily large asset ${q.id}`);
  total += Buffer.byteLength(svg);
}
const signFiles = fs.readdirSync(path.join(root, 'images', 'signs')).filter(x => x.endsWith('.svg'));
assert(signFiles.length >= 15);
for (const file of signFiles) {
  const svg = fs.readFileSync(path.join(root, 'images', 'signs', file), 'utf8');
  assert(svg.includes('viewBox="0 0 120 120"'));
  assert(!/<(?:script|image|foreignObject)\b|\b(?:href|src)\s*=/i.test(svg));
}
assert(total < 3 * 1024 * 1024, 'Illustrations must remain lightweight');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'illustrations', 'manifest.json')));
assert.equal(manifest.length, pictures.length);
assert(manifest.every(r => r.note && r.alt && paths.has(r.image)), 'Every illustration needs a question-match review note');
console.log(`PASS ${pictures.length} unique local question illustrations; ${signFiles.length} signs; ${(total / 1024).toFixed(0)} KiB question SVGs.`);

const base = process.argv[2];
if (base) (async () => {
  const urls = ['index.html','script.js','style.css','questions.js','questions-extra.js', ...paths, ...signFiles.map(f=>'images/signs/'+f)];
  for (let offset=0; offset<urls.length; offset+=8) {
    await Promise.all(urls.slice(offset,offset+8).map(async file => {
      const response = await fetch(new URL(file, base));
      assert.equal(response.status, 200, `${file} HTTP failure`);
      const bytes = await response.arrayBuffer();
      assert.equal(bytes.byteLength, fs.statSync(path.join(root, file)).size, `${file} incomplete response`);
    }));
  }
  console.log(`PASS ${urls.length} local HTTP resources; no 404s or incomplete files.`);
})().catch(error => { console.error(error); process.exitCode=1; });
