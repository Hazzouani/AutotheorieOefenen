'use strict';

// Run from the project directory: node tests/validate.cjs
// Uses only Node built-ins. Browser interaction is tested separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const questionContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions.js'), 'utf8'), questionContext);
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions-extra.js'), 'utf8'), questionContext);
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions-nutheorie.js'), 'utf8'), questionContext);
vm.runInNewContext(fs.readFileSync(path.join(root, 'videos.js'), 'utf8'), questionContext);
const videoData = JSON.parse(JSON.stringify(questionContext.window.NUTHEORIE_VIDEOS));
const baseQuestions = questionContext.window.THEORY_QUESTIONS;
const extraQuestions = questionContext.window.THEORY_QUESTIONS_EXTRA;
const nutheorieQuestions = questionContext.window.THEORY_QUESTIONS_NUTHEORIE;
const trainerQuestions = [...baseQuestions, ...extraQuestions];
const questions = [...trainerQuestions, ...nutheorieQuestions];
const appSource = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`PASS ${name}`);
}

const exportCode = `  window.__test = {
  shuffleArray, seededRandom, blankProgress, validateSession, loadProgress, saveProgress,
  getPracticePool, startPractice, startExam, startDaily, createSession, calculateResults, submitAnswer, learningDetails,
  finishQuiz, tickTimer, toggleFavorite, resetProgress, closeConfirm, showImage, questionImage, hasLocalImage,
  renderVideos, videoLibrary, loadVideoStore, get videoStore() { return videoStore; },
  get imageDialogOpen() { return imageDialogOpen; },
  get confirmCallback() { return confirmCallback; },
  get state() { return state; }, set state(value) { state = value; },
  get setup() { return setup; }, set setup(value) { setup = value; },
  get lastResult() { return lastResult; },
  get storageAvailable() { return storageAvailable; }
};`;
assert.equal((appSource.match(/^  initApp\(\);$/gm) || []).length, 1, 'Test injection must replace exactly one init call');
const testSource = appSource.replace(/^  initApp\(\);$/m, exportCode);

function environment({ raw = null, denied = false } = {}) {
  let now = new Date('2026-10-15T12:00:00Z').getTime();
  let saved = raw;
  let writes = 0;
  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', dataset: {}, style: {}, isConnected: true,
      classList: { add() {}, remove() {}, toggle() {} },
      parentElement: { classList: { toggle() {} } },
      focus() {}, setAttribute() {}, removeAttribute() {}, scrollIntoView() {},
      querySelectorAll() { return []; }
    });
    return elements.get(selector);
  };
  const location = { hash: '#dashboard' };
  const context = {
    Date: FakeDate, console,
    window: { THEORY_QUESTIONS: baseQuestions, THEORY_QUESTIONS_EXTRA: extraQuestions, THEORY_QUESTIONS_NUTHEORIE: nutheorieQuestions, NUTHEORIE_VIDEOS: videoData, scrollTo() {} },
    document: {
      querySelector: element, querySelectorAll: () => [],
      body: element('body'), documentElement: element('html'), activeElement: null
    },
    location,
    localStorage: {
      getItem() { if (denied) throw new Error('Access denied'); return saved; },
      setItem(_key, value) { if (denied) throw new Error('Access denied'); writes++; saved = value; }
    },
    setInterval: () => 1, clearInterval() {}, setTimeout: () => 1, clearTimeout() {}
  };
  vm.runInNewContext(testSource, context, { filename: 'script.js' });
  return {
    api: context.window.__test, location, element,
    advance(ms) { now += ms; },
    get saved() { return saved; }, get writes() { return writes; }
  };
}

test('question schema: 220 existing questions plus 300 unique, complete additions', () => {
  assert.equal(baseQuestions.length, 220);
  assert.equal(extraQuestions.length, 300);
  assert.equal(trainerQuestions.length, 520);
  assert.equal(new Set(trainerQuestions.map(q => q.id)).size, trainerQuestions.length);
  assert.equal(new Set(trainerQuestions.map(q => q.question)).size, trainerQuestions.length);
  const expected = {
    'Verkeersregels': 145, 'Verkeersborden en wegmarkeringen': 80,
    'Gevaarherkenning en verkeersinzicht': 65, 'Veilig rijden': 80,
    'Bijzondere verkeersdeelnemers': 40, 'Voertuigkennis': 39,
    'Milieu en verantwoord rijgedrag': 25, 'Bestuurder, wetgeving en documenten': 46
  };
  const counts = {};
  for (const [index, q] of trainerQuestions.entries()) {
    assert.equal(q.id, index + 1);
    for (const field of ['category', 'subcategory', 'question', 'explanation', 'difficulty', 'type', 'source']) {
      assert.ok(typeof q[field] === 'string' && q[field].trim(), `${q.id}: missing ${field}`);
    }
    assert.ok(q.options.length >= 3 && q.options.length <= 4, `${q.id}: must have 3–4 options`);
    assert.equal(new Set(q.options).size, q.options.length, `${q.id}: duplicate option`);
    assert.ok(q.options.every(value => typeof value === 'string' && value.trim()));
    assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
    assert.ok(['makkelijk', 'gemiddeld', 'moeilijk'].includes(q.difficulty));
    assert.match(q.source, /^https:\/\//);
    counts[q.category] = (counts[q.category] || 0) + 1;
  }
  assert.deepEqual(counts, expected);
  const topics = {
    'Verkeersborden, onderborden en verkeerstekens': 30,
    'Voorrang, kruispunten en voorrangsregels': 30,
    'Snelheid, maximumsnelheden en aangepaste snelheid': 20,
    'Inhalen, invoegen, uitvoegen en rijstrookwisselingen': 20,
    'Plaats op de weg, voorsorteren en bijzondere manoeuvres': 20,
    'Parkeren, stilstaan en parkeerverboden': 15,
    'Verkeerslichten, aanwijzingen en verkeersregelaars': 15,
    'Gevaarherkenning en defensief rijden': 25,
    'Kwetsbare verkeersdeelnemers, fietsers en voetgangers': 20,
    'Snelwegen, autowegen, tunnels en spitsstroken': 15,
    'Weersomstandigheden, zicht, gladheid en remweg': 15,
    'Alcohol, drugs, medicijnen, vermoeidheid en afleiding': 15,
    'Voertuigkennis, banden, verlichting en onderhoud': 15,
    'Veiligheid, gordels, kinderzitjes en lading': 10,
    'Milieu, zuinig rijden en milieubewust verkeersgedrag': 10,
    'Ongevallen, pech, hulpverlening en noodsituaties': 10,
    'Wettelijke regels, documenten en voertuigverplichtingen': 5,
    'Gemengde examencasussen en complexe verkeerssituaties': 10
  };
  assert.deepEqual(Object.fromEntries(Object.keys(topics).map(topic => [topic, extraQuestions.filter(q => q.subcategory === topic).length])), topics);
  assert.deepEqual(Object.fromEntries(['makkelijk', 'gemiddeld', 'moeilijk'].map(level => [level, extraQuestions.filter(q => q.difficulty === level).length])), { makkelijk: 90, gemiddeld: 120, moeilijk: 90 });
  for (const q of extraQuestions) {
    assert.equal(q.id, 221 + extraQuestions.indexOf(q), `unstable supplemental id ${q.id}`);
    assert.equal(q.options.length, 3);
    assert.equal(q.optionExplanations.length, q.options.length);
    assert.ok(q.focusDetail && q.misconception && q.tags.length >= 2);
  }
});

test('NuTheorie-uitbreiding: 161 PDF-vragen en 117 nieuwe vragen, volledig en consistent', () => {
  assert.equal(nutheorieQuestions.length, 278);
  assert.equal(nutheorieQuestions.filter(q => q.origin === 'nutheorie').length, 161);
  assert.equal(nutheorieQuestions.filter(q => q.origin === 'nieuw').length, 117);
  assert.equal(nutheorieQuestions.filter(q => q.category === 'Rijhulpsystemen (ADAS)').length, 29);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length, 'ids must be unique over the whole bank');
  const known = new Set(['Verkeersregels', 'Verkeersborden en wegmarkeringen', 'Veilig rijden', 'Gevaarherkenning en verkeersinzicht', 'Bijzondere verkeersdeelnemers', 'Voertuigkennis', 'Milieu en verantwoord rijgedrag', 'Bestuurder, wetgeving en documenten', 'Rijhulpsystemen (ADAS)']);
  for (const q of nutheorieQuestions) {
    assert.ok(known.has(q.category), `${q.id}: unknown category`);
    for (const field of ['subcategory', 'question', 'explanation', 'difficulty', 'type', 'originLabel']) assert.ok(typeof q[field] === 'string' && q[field].trim(), `${q.id}: missing ${field}`);
    assert.ok(q.options.length >= 2 && q.options.length <= 4, `${q.id}: 2–4 options`);
    assert.equal(new Set(q.options).size, q.options.length, `${q.id}: duplicate option`);
    assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
    assert.ok(['makkelijk', 'gemiddeld', 'moeilijk'].includes(q.difficulty));
    for (const key of ['image', 'answerImage']) if (q[key]) assert.ok(fs.existsSync(path.join(root, q[key])), `${q.id}: missing ${q[key]}`);
    if (q.image) assert.ok(q.imageAlt && q.imageAlt.trim(), `${q.id}: missing alt`);
  }
});

test('fixed option order is kept for NuTheorie questions; others are shuffled as before', () => {
  const { api } = environment();
  const fixed = nutheorieQuestions.filter(q => q.fixedOrder).slice(0, 30);
  api.createSession(fixed, 'practice', 'test');
  for (const item of api.state.active.items) assert.deepEqual(item.order, questions.find(q => q.id === item.id).options.map((_, i) => i));
});

test('practice source filter selects only the chosen origin', () => {
  const { api } = environment();
  for (const [source, expected] of [['nutheorie', 161], ['nieuw', 117], ['trainer', 520], ['all', 798]]) {
    api.setup = { ...api.setup, category: 'all', difficulty: 'all', instinker: false, imageOnly: false, smart: false, source };
    assert.equal(api.getPracticePool().length, expected, source);
  }
});

test("NuTheorie-video's: hoofdstuk 1 tot en met 9, lessen op volgorde, alle bestanden aanwezig", () => {
  const chapters = videoData.chapters;
  assert.deepEqual(chapters.map(c => c.number), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const all = chapters.flatMap(c => c.videos.map(v => ({ ...v, chapter: c.number })));
  assert.equal(all.length, 34);
  assert.equal(new Set(all.map(v => v.id)).size, all.length);
  for (const c of chapters) {
    assert.deepEqual(c.videos.map(v => v.number), c.videos.map((_, i) => i + 1), `hoofdstuk ${c.number}: lessen niet op volgorde`);
    for (const v of c.videos) {
      assert.equal(v.id, `h${c.number}-${String(v.number).padStart(2, '0')}`);
      assert.match(v.file, new RegExp(`^Nutheorie_Videos/Hoofdstuk${c.number}/0?${v.number}_[^/]+\\.mp4$`));
      assert.ok(v.title.trim() && !v.title.includes('_'), `${v.id}: titel`);
      assert.ok(Number.isFinite(v.duration) && v.duration > 30, `${v.id}: speelduur`);
      assert.ok(v.poster && fs.existsSync(path.join(root, v.poster)), `${v.id}: voorbeeldplaatje ontbreekt`);
    }
  }
  const folder = path.join(root, 'Nutheorie_Videos');
  if (fs.existsSync(folder)) {
    for (const v of all) {
      const file = path.join(root, v.file);
      assert.ok(fs.existsSync(file), `${v.file} ontbreekt`);
      const lfsPointer = fs.statSync(file).size < 1024 && fs.readFileSync(file, 'utf8').startsWith('version https://git-lfs.github.com/spec/');
      assert.ok(!lfsPointer, `${v.file} is nog een Git LFS-verwijzing: voer 'git lfs pull' uit (zie README)`);
      assert.ok(fs.statSync(file).size > 1000000, `${v.file} is leeg of onvolledig`);
    }
    const onDisk = fs.readdirSync(folder).filter(d => /^Hoofdstuk\d+$/.test(d))
      .flatMap(d => fs.readdirSync(path.join(folder, d)).filter(f => /\.(mp4|m4v|webm)$/i.test(f)).map(f => `Nutheorie_Videos/${d}/${f}`));
    assert.deepEqual([...onDisk].sort(), all.map(v => v.file).sort(), 'elke video in de map staat op de pagina en andersom');
  } else console.log("  (map Nutheorie_Videos niet gevonden: bestandscontrole overgeslagen)");
});

test("video page lists every video in chapter order and is reachable from the menu", () => {
  const env = environment();
  env.api.renderVideos();
  const html = env.element('#view').innerHTML;
  const order = videoData.chapters.flatMap(c => c.videos.map(v => v.id));
  const chapterSection = html.slice(html.indexOf('id="video-chapters"'), html.indexOf('id="video-check-title"'));
  const cards = [...chapterSection.matchAll(/class="video-card[^"]*" data-action="play-video" data-video="([\w-]+)"/g)].map(m => m[1]);
  assert.deepEqual(cards, order);
  assert.equal((chapterSection.match(/class="video-chapter panel"/g) || []).length, 9);
  assert.ok(html.includes(`src="${videoData.chapters[0].videos[0].file}"`), 'speler start bij hoofdstuk 1, video 1');
  assert.match(html, /data-action="video-check"/);
  assert.match(appSource, /'practice', 'videos', 'exam'/);
  assert.match(appSource, /videos: renderVideos/);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /<a class="nav-link" data-page="videos" href="#videos">Video's<\/a>/);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /<script src="videos\.js" defer><\/script>\s*<script src="script\.js(?:[^"]*)"/);
});

test('video watch progress is validated and kept apart from practice progress', () => {
  const raw = JSON.stringify({ type: 'theorietrainer-videos', version: 1, current: 'h3-02', watched: ['h1-01', 'h1-01', 'onbekend'], positions: { 'h1-02': 120.7, x: 5, 'h2-01': -3 }, speed: 1.5 });
  const env = environment({ raw });
  assert.equal(env.api.videoStore.current, 'h3-02');
  assert.deepEqual(plain(env.api.videoStore.watched), ['h1-01']);
  assert.deepEqual(plain(env.api.videoStore.positions), { 'h1-02': 120 });
  assert.equal(env.api.videoStore.speed, 1.5);
  for (const bad of ['{kapot', JSON.stringify({ version: 1, total: 3 }), JSON.stringify({ type: 'theorietrainer-videos', version: 2, current: 'h3-02' })]) {
    const clean = environment({ raw: bad }).api.videoStore;
    assert.equal(clean.current, 'h1-01');
    assert.deepEqual(plain(clean.watched), []);
  }
  assert.equal(environment({ denied: true }).api.videoStore.current, 'h1-01');
});

test('shuffle preserves input and values, without duplicates', () => {
  const { api } = environment();
  const input = Array.from({ length: 40 }, (_, i) => i);
  const original = [...input];
  const shuffled = api.shuffleArray(input, api.seededRandom('reproducible'));
  assert.deepEqual(input, original);
  assert.notStrictEqual(shuffled, input);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
  assert.notDeepEqual([...shuffled], original);
});

test('answer rationales follow the shuffled option letters in practice and review', () => {
  const { api } = environment();
  const q = extraQuestions.find(question => question.question.includes('tram komt op een gelijkwaardig kruispunt van rechts'));
  const order = [0, 2, 1];
  const html = api.learningDetails(q, order);
  assert.ok(html.includes(`B. ${q.options[2]}</strong> ${q.optionExplanations[2]}`));
  assert.ok(html.includes(`C. ${q.options[1]}</strong> ${q.optionExplanations[1]}`));
  const result = api.calculateResults({ items: [{ id: q.id, order, unscored: false }], answers: { [q.id]: q.correctAnswer } });
  assert.deepEqual([...result.rows[0].order], order);
});

test('practice clamps a small pool instead of duplicating questions', () => {
  const { api } = environment();
  api.setup = { category: 'Milieu en verantwoord rijgedrag', count: 50, difficulty: 'all', smart: false };
  api.startPractice();
  assert.equal(api.state.active.items.length, 25);
  assert.equal(new Set(api.state.active.items.map(item => item.id)).size, 25);
});

test('instinker and image-only practice filters return only matching questions', () => {
  const { api } = environment();
  api.setup = { category: 'all', count: 10, difficulty: 'all', smart: false, instinker: true, imageOnly: false };
  const traps = api.getPracticePool();
  assert.ok(traps.length >= 90);
  assert.ok(traps.every(q => q.type === 'instinker' || q.tags?.includes('instinker')));
  api.setup = { category: 'all', count: 10, difficulty: 'all', smart: false, instinker: false, imageOnly: true };
  const illustrated = api.getPracticePool();
  assert.equal(trainerQuestions.filter(q => q.image).length, 217);
  assert.equal(illustrated.length, questions.filter(q => q.image).length);
  assert.ok(illustrated.every(q => q.image));
});

test('exam presents 52 unique questions across all nine categories; only 50 are scored', () => {
  const { api } = environment();
  api.startExam();
  const session = api.state.active;
  assert.equal(session.items.length, 52);
  assert.equal(session.items.filter(item => !item.unscored).length, 50);
  assert.equal(session.items.filter(item => item.unscored).length, 2);
  assert.equal(new Set(session.items.map(item => item.id)).size, 52);
  assert.equal(new Set(session.items.filter(item => !item.unscored).map(item => questions.find(q => q.id === item.id).category)).size, 9);
  assert.equal(session.deadline - session.startedAt, 30 * 60 * 1000);
  for (const item of session.items) {
    const q = questions.find(q => q.id === item.id);
    assert.deepEqual([...item.order].sort(), [...q.options].map((_, i) => i));
  }
});

test('shuffled display order maps to original answer indices', () => {
  const { api } = environment();
  const q = questions[0];
  const order = [2, 0, 1];
  const displayedCorrect = order.indexOf(q.correctAnswer);
  const session = { items: [{ id: q.id, order }], answers: { [q.id]: order[displayedCorrect] } };
  assert.equal(api.calculateResults(session).correct, 1);
  session.answers[q.id] = (q.correctAnswer + 1) % q.options.length;
  assert.equal(api.calculateResults(session).correct, 0);
  delete session.answers[q.id];
  assert.equal(api.calculateResults(session).unanswered, 1);
});

test('practice counts an answer once and persists a resumable answer/order', () => {
  const env = environment();
  const q = questions[0];
  env.api.createSession([q], 'practice', 'Single question');
  env.api.submitAnswer(q.correctAnswer);
  env.api.submitAnswer((q.correctAnswer + 1) % q.options.length);
  assert.equal(env.api.state.total, 1);
  assert.equal(env.api.state.correct, 1);
  const resumed = environment({ raw: env.saved });
  assert.equal(resumed.api.state.total, 1);
  assert.equal(resumed.api.state.active.answers[q.id], q.correctAnswer);
  assert.deepEqual(plain(resumed.api.state.active.items), plain(env.api.state.active.items));
  resumed.api.submitAnswer(q.correctAnswer);
  assert.equal(resumed.api.state.total, 1);
});

test('a wrong answer is removed from the review list after a correct retry', () => {
  const env = environment();
  const q = questions[0];
  env.api.createSession([q], 'practice', 'Wrong');
  env.api.submitAnswer((q.correctAnswer + 1) % q.options.length);
  assert.ok(env.api.state.wrongIds.includes(q.id));
  env.location.hash = '#dashboard';
  env.api.createSession([q], 'wrong', 'Retry');
  env.api.submitAnswer(q.correctAnswer);
  assert.equal(env.api.state.wrongIds.includes(q.id), false);
  assert.equal(env.api.state.total, 2);
  assert.equal(env.api.state.correct, 1);
});

test('exam answers are counted only on finish, using the final answer', () => {
  const { api } = environment();
  api.startExam();
  const scoredItem = api.state.active.items.find(item => !item.unscored);
  api.state.active.position = api.state.active.items.findIndex(item => item.id === scoredItem.id);
  const q = questions.find(q => q.id === scoredItem.id);
  api.submitAnswer((q.correctAnswer + 1) % q.options.length);
  api.submitAnswer(q.correctAnswer);
  assert.equal(api.state.total, 0);
  assert.equal(api.state.examCount, 0);
  api.finishQuiz();
  assert.equal(api.state.total, 1);
  assert.equal(api.state.correct, 1);
  assert.equal(api.state.examCount, 1);
  assert.equal(api.lastResult.correct, 1);
  assert.equal(api.lastResult.unanswered, 49);
  assert.equal(api.state.wrongIds.length, 49);
  assert.equal(api.lastResult.total, 50);
  api.finishQuiz();
  assert.equal(api.state.examCount, 1);
});

test('expired exams finish once, including after reloading their saved session', () => {
  const env = environment();
  env.api.startExam();
  const saved = env.saved;
  const resumed = environment({ raw: saved });
  resumed.advance(30 * 60 * 1000 + 1);
  resumed.api.tickTimer();
  assert.equal(resumed.api.state.active, null);
  assert.equal(resumed.api.state.examCount, 1);
  assert.equal(resumed.api.lastResult.timedOut, true);
  assert.equal(resumed.api.lastResult.unanswered, 50);
  resumed.api.tickTimer();
  assert.equal(resumed.api.state.examCount, 1);
});

test('malformed JSON and null session items recover without disabling storage', () => {
  for (const raw of ['{invalid', JSON.stringify({ version: 1, active: { mode: 'practice', title: 'Broken', items: [null], position: 0, startedAt: Date.now(), answers: {} } })]) {
    const env = environment({ raw });
    assert.equal(env.api.state.active, null);
    assert.equal(env.api.storageAvailable, true);
    env.api.saveProgress();
    assert.equal(env.writes, 1);
    assert.equal(JSON.parse(env.saved).version, 1);
  }
});

test('denied localStorage still permits in-memory practice', () => {
  const env = environment({ denied: true });
  const q = questions[0];
  assert.equal(env.api.storageAvailable, false);
  env.api.createSession([q], 'practice', 'Offline memory');
  env.api.submitAnswer(q.correctAnswer);
  assert.equal(env.api.state.total, 1);
  assert.equal(env.api.state.correct, 1);
  assert.equal(env.writes, 0);
});

test('favorites toggle and survive a reload', () => {
  const env = environment();
  env.api.toggleFavorite(1);
  env.api.toggleFavorite(1);
  assert.equal(env.api.state.favoriteIds.length, 0);
  env.api.toggleFavorite(2);
  const resumed = environment({ raw: env.saved });
  assert.deepEqual([...resumed.api.state.favoriteIds], [2]);
});

test('daily question selection is stable on the same date', () => {
  const a = environment(), b = environment();
  a.api.startDaily(); b.api.startDaily();
  assert.equal(a.api.state.active.items.length, 10);
  assert.deepEqual([...a.api.state.active.items].map(q => q.id), [...b.api.state.active.items].map(q => q.id));
  assert.equal(new Set(a.api.state.active.items.map(q => q.id)).size, 10);
});

test('earned80 survives history truncation, reload, and legacy history migration', () => {
  const env = environment();
  const q = questions[0];
  env.api.createSession([q], 'practice', 'Achievement');
  env.api.submitAnswer(q.correctAnswer);
  env.api.finishQuiz();
  assert.equal(env.api.state.earned80, true);
  env.api.state.history = Array.from({ length: 50 }, () => ({ title: 'Later session', mode: 'practice', total: 10, correct: 0, endedAt: Date.now() }));
  env.api.saveProgress();
  assert.equal(environment({ raw: env.saved }).api.state.earned80, true);
  const legacy = env.api.blankProgress();
  delete legacy.earned80;
  legacy.history = [{ title: 'Old achievement', mode: 'practice', total: 10, correct: 8, endedAt: Date.now() }];
  assert.equal(environment({ raw: JSON.stringify(legacy) }).api.state.earned80, true);
});

test('reset requires confirmation, cancel preserves data, confirm preserves only theme', () => {
  const env = environment();
  env.api.state.theme = 'dark';
  env.api.toggleFavorite(1);
  env.api.createSession([questions[0]], 'practice', 'Reset test');
  env.api.submitAnswer(questions[0].correctAnswer);
  env.api.resetProgress();
  assert.equal(env.api.state.total, 1);
  env.api.closeConfirm();
  assert.equal(env.api.state.total, 1);
  env.api.resetProgress();
  const confirm = env.api.confirmCallback;
  env.api.closeConfirm();
  confirm();
  assert.equal(env.api.state.total, 0);
  assert.equal(env.api.state.favoriteIds.length, 0);
  assert.equal(env.api.state.active, null);
  assert.equal(env.api.state.theme, 'dark');
  assert.equal(JSON.parse(env.saved).total, 0);
});

test('image dialog uses local assets, isolates background and leaves quiz answers untouched', () => {
  const env = environment();
  const q = questions.find(q => q.image);
  assert(q, 'Expected generated illustrations');
  env.api.createSession([q], 'practice', 'Image test');
  const before = JSON.stringify(env.api.state);
  env.api.showImage(q.id);
  assert.equal(env.api.imageDialogOpen, true);
  assert.equal(env.element('#main-content').inert, true);
  assert(env.element('#modal-root').innerHTML.includes(q.image));
  assert(env.element('#modal-root').innerHTML.includes('aria-modal="true"'));
  env.api.closeConfirm();
  assert.equal(env.api.imageDialogOpen, false);
  assert.equal(env.element('#main-content').inert, false);
  assert.equal(env.element('#modal-root').innerHTML, '');
  assert.equal(JSON.stringify(env.api.state), before);
  assert.equal(env.api.questionImage({image:null}), '');
  for (const image of ['https://example.com/a.svg','images/../secret.svg','data:image/svg+xml,abc']) {
    assert.equal(env.api.hasLocalImage({image}), false);
    assert.equal(env.api.questionImage({image}), '');
  }
});

test('exam deadline closes an enlarged image and records the exam exactly once', () => {
  const env = environment();
  env.api.startExam();
  env.api.showImage(questions.find(q => q.image).id);
  env.advance(31 * 60000);
  env.api.tickTimer();
  assert.equal(env.api.imageDialogOpen, false);
  assert.equal(env.api.state.examCount, 1);
  env.api.tickTimer();
  assert.equal(env.api.state.examCount, 1);
});

console.log(`\n${passed} validation groups passed.`);
