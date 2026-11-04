/* TheorieTrainer — zelfstandige app, zonder netwerkverzoeken of dependencies. */
(() => {
  'use strict';
  const STORAGE_KEY = 'theorietrainer.v1';
  const EXAM_SECONDS = 30 * 60;
  const EXAM_SCORE_QUESTIONS = 50;
  const EXAM_PRESENTED_QUESTIONS = 52;
  const EXAM_PASS = 44;
  const categories = [
    { name: 'Verkeersregels', label: 'Verkeersregels', icon: 'route', color: 'blue', description: 'Van voorrang tot veilig afslaan.' },
    { name: 'Verkeersborden en wegmarkeringen', label: 'Borden & markeringen', icon: 'sign', color: 'orange', description: 'Begrijp wat de weg je vertelt.' },
    { name: 'Veilig rijden', label: 'Veilig rijden', icon: 'shield', color: 'green', description: 'Houd grip op elke situatie.' },
    { name: 'Gevaarherkenning en verkeersinzicht', label: 'Gevaarherkenning', icon: 'eye', color: 'purple', description: 'Kijk vooruit. Herken het risico.' },
    { name: 'Bijzondere verkeersdeelnemers', label: 'Verkeersdeelnemers', icon: 'people', color: 'pink', description: 'Samen veilig op weg.' },
    { name: 'Voertuigkennis', label: 'Voertuigkennis', icon: 'car', color: 'teal', description: 'Leer je auto beter kennen.' },
    { name: 'Milieu en verantwoord rijgedrag', label: 'Milieu & rijgedrag', icon: 'leaf', color: 'green', description: 'Bewust rijden maakt verschil.' },
    { name: 'Bestuurder, wetgeving en documenten', label: 'Bestuurder & documenten', icon: 'document', color: 'slate', description: 'Goed voorbereid achter het stuur.' },
    { name: 'Rijhulpsystemen (ADAS)', label: 'Rijhulpsystemen (ADAS)', icon: 'spark', color: 'purple', description: 'Nieuw accent in het examen sinds 1 oktober 2026.' }
  ];
  const sources = [
    { value: 'all', label: 'Alle vragen' },
    { value: 'trainer', label: 'TheorieTrainer-vragen' },
    { value: 'nutheorie', label: 'NuTheorie-PDF-vragen' },
    { value: 'nieuw', label: 'Nieuwe vragen (incl. ADAS)' }
  ];
  const originOf = q => q.origin === 'nutheorie' || q.origin === 'nieuw' ? q.origin : 'trainer';
  const originPill = q => q.originLabel ? `<span class="pill ${q.origin === 'nieuw' ? 'purple' : 'orange'}">${escapeHtml(q.originLabel)}</span>` : '';
  const paths = {
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
    book: '<path d="M12 5C8 2 4 3 3 4v15c3-2 6-1 9 1 3-2 6-3 9-1V4c-3-2-6-1-9 1Zm0 0v15"/>',
    route: '<path d="m7 3-4 18m14-18 4 18M12 3v3m0 4v4m0 4v3"/>',
    sign: '<path d="m12 2 10 10-10 10L2 12Z"/><path d="M8 15v-4h8m-3-3 3 3-3 3"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
    car: '<path d="m5 9 2-5h10l2 5M3 11l2-2h14l2 2v7H3Zm2 7v3m14-3v3M6 13h2m8 0h2"/>',
    leaf: '<path d="M20 3c-11-1-17 4-16 11 1 9 17 7 16-11Z"/><path d="M3 22 15 10m-7 7v-6m0 6h6"/>',
    document: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M7 14h4m3-6h3m-3 4h3M7 17h10"/>',
    trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4m-4 2v5m-4 2h8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 3v18h17M8 17v-5m5 5V7m5 10V3"/>',
    fire: '<path d="M12 2c1 6 6 6 6 11 3-2 3-3 3-3 2 8-3 12-9 12S2 16 4 11c1 2 2 3 2 3-1-5 4-7 6-12Z"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    repeat: '<path d="M20 7H7a4 4 0 0 0-4 4m14-7 3 3-3 3M4 17h13a4 4 0 0 0 4-4M7 14l-3 3 3 3"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
    play: '<path d="M8 5.5v13l10.5-6.5Z"/>',
    video: '<rect x="2.5" y="5.5" width="14" height="13" rx="2.5"/><path d="m16.5 10 5-3v10l-5-3Z"/>'
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const questions = Array.isArray(window.THEORY_QUESTIONS)
    ? [...window.THEORY_QUESTIONS, ...(Array.isArray(window.THEORY_QUESTIONS_EXTRA) ? window.THEORY_QUESTIONS_EXTRA : []), ...(Array.isArray(window.THEORY_QUESTIONS_NUTHEORIE) ? window.THEORY_QUESTIONS_NUTHEORIE : [])]
    : [];
  const questionById = new Map(questions.map(q => [q.id, q]));
  const categoryByName = new Map(categories.map(c => [c.name, c]));
  const $ = selector => document.querySelector(selector);
  const percent = (correct, total) => total ? Math.round(correct / total * 100) : 0;
  const integer = (value, max = 10000000) => Number.isSafeInteger(value) && value >= 0 && value <= max;
  const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && value <= dayKey();
  const blankProgress = () => ({ version: 1, total: 0, correct: 0, incorrect: 0, percentage: 0, perCategory: Object.fromEntries(categories.map(c => [c.name, { total: 0, correct: 0 }])), wrongIds: [], favoriteIds: [], questionHistory: [], bestExamScore: null, examCount: 0, earned80: false, history: [], days: [], dailyCompleted: [], active: null, theme: 'light' });
  let storageAvailable = true;
  let storageWarning = '';
  let state = loadProgress();
  let route = '';
  let lastResult = null;
  let timer = null;
  let toastTimeout;
  let confirmCallback = null;
  let imageDialogOpen = false;
  let focusBeforeDialog = null;
  let libraryPage = 1;
  let libraryFilters = { search: '', category: 'all', difficulty: 'all' };
  let setup = { category: 'all', count: 10, difficulty: 'all', smart: false, instinker: false, imageOnly: false, source: 'all' };
  const VIDEO_STORAGE_KEY = 'theorietrainer.videos.v1';
  const VIDEO_SPEEDS = [1, 1.25, 1.5, 2];
  const videoLibrary = (() => {
    const data = window.NUTHEORIE_VIDEOS;
    const safeFile = file => typeof file === 'string' && /^Nutheorie_Videos\/[^:?#\\]+\.(mp4|m4v|webm)$/i.test(file) && !file.includes('..');
    const safeImage = file => typeof file === 'string' && /^images\/videos\/[\w-]+\.(jpg|jpeg|png|webp)$/i.test(file);
    const chapters = (Array.isArray(data?.chapters) ? data.chapters : [])
      .filter(c => c && Number.isInteger(c.number) && Array.isArray(c.videos))
      .map(c => ({
        number: c.number,
        title: typeof c.title === 'string' && c.title.trim() ? c.title : `Hoofdstuk ${c.number}`,
        videos: c.videos
          .filter(v => v && typeof v.id === 'string' && /^[\w-]+$/.test(v.id) && Number.isInteger(v.number) && typeof v.title === 'string' && safeFile(v.file))
          .map(v => ({ id: v.id, number: v.number, title: v.title, file: v.file, duration: Number.isFinite(v.duration) && v.duration > 0 ? v.duration : null, poster: safeImage(v.poster) ? v.poster : null, summary: v.summary === true }))
          .sort((a, b) => a.number - b.number)
      }))
      .filter(c => c.videos.length)
      .sort((a, b) => a.number - b.number);
    const list = chapters.flatMap(c => c.videos.map((v, index) => ({ ...v, chapter: c.number, index, chapterSize: c.videos.length })));
    return { chapters, list };
  })();
  const videoById = new Map(videoLibrary.list.map(v => [v.id, v]));
  const blankVideoStore = () => ({ type: 'theorietrainer-videos', version: 1, current: videoLibrary.list[0]?.id || null, watched: [], positions: {}, speed: 1 });
  let videoStore = loadVideoStore();
  let videoSavedAt = 0;
  let videoCheckRunning = false;

  // Validate every persisted field. Invalid sessions are discarded, never executed.
  function loadProgress() {
    const clean = blankProgress();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clean;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || typeof data !== 'object') throw new Error('Ongeldig opslagformaat');
      for (const c of categories) {
        const row = data.perCategory?.[c.name];
        if (row && integer(row.total) && integer(row.correct) && row.correct <= row.total) clean.perCategory[c.name] = { total: row.total, correct: row.correct };
      }
      clean.total = Object.values(clean.perCategory).reduce((sum, row) => sum + row.total, 0);
      clean.correct = Object.values(clean.perCategory).reduce((sum, row) => sum + row.correct, 0);
      clean.incorrect = clean.total - clean.correct;
      clean.percentage = percent(clean.correct, clean.total);
      for (const key of ['wrongIds', 'favoriteIds']) clean[key] = Array.isArray(data[key]) ? [...new Set(data[key].filter(id => questionById.has(id)))] : [];
      clean.questionHistory = Array.isArray(data.questionHistory) ? [...new Set(data.questionHistory.filter(id => questionById.has(id)))].slice(0, 100) : [];
      for (const key of ['days', 'dailyCompleted']) clean[key] = Array.isArray(data[key]) ? [...new Set(data[key].filter(validDay))].sort().slice(-2000) : [];
      clean.examCount = integer(data.examCount) ? data.examCount : 0;
      clean.bestExamScore = integer(data.bestExamScore, EXAM_SCORE_QUESTIONS) ? data.bestExamScore : null;
      clean.theme = data.theme === 'dark' ? 'dark' : 'light';
      clean.history = Array.isArray(data.history) ? data.history.filter(h => h && typeof h.title === 'string' && h.title.length < 160 && integer(h.total, questions.length) && h.total > 0 && integer(h.correct, h.total) && Number.isFinite(h.endedAt) && ['practice', 'exam', 'daily', 'wrong', 'favorites'].includes(h.mode)).slice(0, 50).map(h => ({ title: h.title, total: h.total, correct: h.correct, endedAt: h.endedAt, mode: h.mode })) : [];
      clean.active = validateSession(data.active);
      clean.earned80 = data.earned80 === true || clean.history.some(h => percent(h.correct, h.total) >= 80);
    } catch (error) {
      storageWarning = error instanceof SyntaxError || error.message === 'Ongeldig opslagformaat' ? 'Opgeslagen gegevens waren beschadigd. Je kunt met een schone voortgang verder.' : 'Je browser staat lokale opslag niet toe. Je kunt oefenen, maar je voortgang blijft alleen tijdens dit bezoek bewaard.';
      if (!(error instanceof SyntaxError) && error.message !== 'Ongeldig opslagformaat') storageAvailable = false;
    }
    return clean;
  }

  function validateSession(s) {
    if (!s || !['practice', 'exam', 'daily', 'wrong', 'favorites'].includes(s.mode) || typeof s.title !== 'string' || s.title.length > 160 || !Array.isArray(s.items) || !s.items.length || s.items.length > questions.length || !integer(s.position, s.items.length - 1) || !Number.isFinite(s.startedAt) || !s.answers || typeof s.answers !== 'object') return null;
    if (s.mode === 'exam' && (![EXAM_SCORE_QUESTIONS, EXAM_PRESENTED_QUESTIONS].includes(s.items.length) || !Number.isFinite(s.deadline) || s.deadline !== s.startedAt + EXAM_SECONDS * 1000)) return null;
    const ids = new Set();
    let unscoredCount = 0;
    for (const item of s.items) {
      if (!item || typeof item !== 'object') return null;
      const q = questionById.get(item.id);
      if (!q || ids.has(item.id) || !Array.isArray(item.order) || item.order.length !== q.options.length || new Set(item.order).size !== q.options.length || !item.order.every(n => integer(n, q.options.length - 1))) return null;
      if (item.unscored === true) unscoredCount++;
      ids.add(item.id);
    }
    if (s.mode === 'exam' && (s.items.length === EXAM_PRESENTED_QUESTIONS ? unscoredCount !== 2 : unscoredCount !== 0)) return null;
    const answers = {};
    for (const item of s.items) {
      const answer = s.answers[item.id];
      if (answer !== undefined) {
        if (!integer(answer, questionById.get(item.id).options.length - 1)) return null;
        answers[item.id] = answer;
      }
    }
    return { mode: s.mode, title: s.title, items: s.items.map(item => ({ id: item.id, order: [...item.order], unscored: item.unscored === true })), position: s.position, answers, startedAt: s.startedAt, deadline: s.mode === 'exam' ? s.deadline : null, day: validDay(s.day) ? s.day : dayKey(new Date(s.startedAt)), settings: s.settings && typeof s.settings === 'object' ? { category: categoryByName.has(s.settings.category) ? s.settings.category : 'all', count: [10, 20, 30, 50].includes(s.settings.count) ? s.settings.count : 10, difficulty: ['makkelijk', 'gemiddeld', 'moeilijk'].includes(s.settings.difficulty) ? s.settings.difficulty : 'all', smart: s.settings.smart === true, instinker: s.settings.instinker === true, imageOnly: s.settings.imageOnly === true, source: sources.some(o => o.value === s.settings.source) ? s.settings.source : 'all' } : null };
  }

  function saveProgress() {
    state.incorrect = state.total - state.correct;
    state.percentage = percent(state.correct, state.total);
    if (!storageAvailable) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { storageAvailable = false; toast('Opslaan lukt niet. Je voortgang blijft voor dit bezoek beschikbaar.'); }
  }

  // Fisher-Yates shuffles copies: question data and correct answer indices stay intact.
  function shuffleArray(array, random = Math.random) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function seededRandom(seed) {
    let value = 2166136261;
    for (const char of seed) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); }
    return () => { value += 0x6D2B79F5; let n = value; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
  }
  function getStreak() {
    const days = new Set(state.days);
    const cursor = new Date();
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(dayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
    return streak;
  }
  function markDay() {
    const day = dayKey();
    if (!state.days.includes(day)) state.days.push(day);
  }
  function recordAnswer(q, answer) {
    const correct = answer === q.correctAnswer;
    state.questionHistory = [q.id, ...(state.questionHistory || []).filter(id => id !== q.id)].slice(0, 100);
    state.total++;
    state.perCategory[q.category].total++;
    if (correct) {
      state.correct++;
      state.perCategory[q.category].correct++;
      state.wrongIds = state.wrongIds.filter(id => id !== q.id);
    } else if (!state.wrongIds.includes(q.id)) state.wrongIds.push(q.id);
    markDay();
  }
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
  }
  function button(label, action, extra = '', type = 'primary', symbol = '') {
    return `<button class="button ${type}" data-action="${action}" ${extra}>${symbol ? icon(symbol) : ''}${label}</button>`;
  }
  function heading(eyebrow, title, description) {
    return `<div class="page-heading"><div class="eyebrow">${eyebrow}</div><h1 tabindex="-1">${title}</h1><p class="page-description">${description}</p></div>`;
  }
  function progressBar(value, label = '') {
    return `<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-label="${escapeHtml(label)}"><div class="progress-fill" style="width:${value}%"></div></div>`;
  }
  function emptyState(symbol, title, description, action = 'practice', label = 'Start met oefenen') {
    return `<div class="empty-state"><span class="empty-icon">${icon(symbol)}</span><h3>${title}</h3><p>${description}</p>${button(label, 'navigate', `data-target="${action}"`, 'secondary', 'arrow')}</div>`;
  }
  function resumeBanner() {
    const s = state.active;
    if (!s) return '';
    return `<div class="notice resume-notice">${icon('book')}<div><strong>Je sessie staat voor je klaar</strong><span>${escapeHtml(s.title)} · ${Object.keys(s.answers).length} van ${s.items.length} beantwoord${s.mode === 'exam' ? ' · de timer loopt door' : ''}</span></div>${button('Verder oefenen', 'resume', '', 'primary small', 'arrow')}</div>`;
  }

  function heroArt() {
    return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 540 350" fill="none"><defs><linearGradient id="island" x1="140" y1="70" x2="420" y2="330" gradientUnits="userSpaceOnUse"><stop stop-color="#e3ece2"/><stop offset="1" stop-color="#d3e2da"/></linearGradient><linearGradient id="carpaint" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7397ff"/><stop offset="1" stop-color="#3158d9"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#7585a3" flood-opacity=".16"/></filter></defs><ellipse cx="280" cy="290" rx="195" ry="35" fill="#c7d4e6" opacity=".25"/><g filter="url(#shadow)"><path d="M55 193 270 72 493 194 279 319Z" fill="#c6d6d0"/><path d="M55 181 270 60 493 182 279 307Z" fill="url(#island)"/><path d="m55 181 224 126v12L55 193Z" fill="#b9cdc4"/><path d="m279 307 214-125v12L279 319Z" fill="#a9bfb7"/><path d="m106 152 222 126 53-30L158 122Z" fill="#f8fafc"/><path d="m116 147 222 126 33-19-223-126Z" fill="#69788e"/><path d="m177 249 232-133 49 27-232 135Z" fill="#f8fafc"/><path d="m187 255 233-133 29 16-233 134Z" fill="#69788e"/><path d="m132 144 68 39m100 58 52 30M204 255l58-34m80-47 88-50" stroke="#f8fafc" stroke-width="3" stroke-dasharray="13 13"/><path d="m176 204 25 14m-16-19 25 14m-16-19 25 14m-16-19 25 14" stroke="white" stroke-width="6"/><path d="m327 181 24 14m-15-19 24 14m-15-19 24 14" stroke="white" stroke-width="6"/><g transform="translate(190 140)"><ellipse cx="33" cy="33" rx="43" ry="17" fill="#314863" opacity=".16"/><path d="m0 18 26-15 49 27-26 15Z" fill="#3154b9"/><path d="M0 13 26-2l49 27v8L49 47 0 20Z" fill="url(#carpaint)"/><path d="m9 10 18-10 25 13-18 11Z" fill="#d5e4ff"/><path d="m13 9 6-14 17-9 22 12 2 18-23 13Z" fill="#5d85ec"/><path d="m21-4 14-8 18 10-15 9Z" fill="#b9d4f3"/><path d="m14 10 6-12 15 9 1 16Z" fill="#203e70"/><path d="m39 8 15-9 3 14-17 10Z" fill="#e1edff"/><path d="m2 14 8 5m51 8 8 4" stroke="#fff3bc" stroke-width="4"/><ellipse cx="15" cy="28" rx="6" ry="8" fill="#233448" transform="rotate(-25 15 28)"/><ellipse cx="50" cy="43" rx="6" ry="8" fill="#233448" transform="rotate(-25 50 43)"/><ellipse cx="15" cy="28" rx="2.5" ry="4" fill="#99abc3" transform="rotate(-25 15 28)"/><ellipse cx="50" cy="43" rx="2.5" ry="4" fill="#99abc3" transform="rotate(-25 50 43)"/></g><g transform="translate(359 128)"><path d="m0 7 16-9 32 18v9l-17 10L0 17Z" fill="#fcfcf9"/><path d="m8 3 5-12 11-6 18 10v16l-14 8Z" fill="#e7b16c"/><path d="m15-8 9-5 13 8-10 6Z" fill="#bed3e2"/><path d="m9 3 5-9 11 8v12Z" fill="#344d68"/><path d="m28 3 11-7v14l-11 6Z" fill="#c2d9e7"/><ellipse cx="10" cy="20" rx="4" ry="6" fill="#26374b"/><ellipse cx="32" cy="31" rx="4" ry="6" fill="#26374b"/></g><g><path d="M126 145v-46m305 80v-45M302 100V57m-17 205v-39" stroke="#81978d" stroke-width="5"/><ellipse cx="126" cy="86" rx="20" ry="30" fill="#7ca890"/><ellipse cx="119" cy="80" rx="12" ry="23" fill="#95bba1"/><ellipse cx="431" cy="126" rx="21" ry="30" fill="#7ca890"/><ellipse cx="424" cy="120" rx="12" ry="23" fill="#93b79b"/><ellipse cx="302" cy="50" rx="18" ry="27" fill="#7ca890"/><ellipse cx="296" cy="44" rx="11" ry="19" fill="#a5c6aa"/><ellipse cx="285" cy="217" rx="17" ry="24" fill="#8cb59a"/></g><g transform="translate(380 193)"><path d="M0 0v49" stroke="#8a98aa" stroke-width="4"/><circle r="18" fill="white" stroke="#e66c69" stroke-width="5"/><text y="6" text-anchor="middle" fill="#293b52" font-size="18" font-weight="700" font-family="sans-serif">30</text></g><g transform="translate(237 97)"><path d="M0 0v48" stroke="#7e8d9f" stroke-width="4"/><rect x="-9" y="-18" width="18" height="37" rx="5" fill="#35475e"/><circle cy="-10" r="4" fill="#8090a4"/><circle r="4" fill="#8090a4"/><circle cy="10" r="4" fill="#8ee0ad"/></g></g><g transform="translate(322 43)"><rect width="155" height="47" rx="14" fill="white"/><circle cx="25" cy="24" r="12" fill="#e5f6ec"/><path d="m20 24 4 4 7-8" stroke="#41a978" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="46" y="28" fill="#35435a" font-family="sans-serif" font-size="12" font-weight="600">Goed op weg!</text></g><circle cx="93" cy="73" r="5" fill="#a5b8f1"/><path d="M468 240h12m-6-6v12M72 247h9m-4.5-4.5v9" stroke="#97aedf" stroke-width="2"/><circle cx="465" cy="101" r="3" fill="#d2ae74"/></svg><span class="art-caption">JOUW RIJBEWIJS BEGINT HIER</span></div>`;
  }

  function updateDashboard() {
    const streak = getStreak();
    $('#view').innerHTML = `<div class="page-container"><div class="dashboard-topline"><span class="breadcrumb">Jouw leeromgeving <span>/</span> <strong>Dashboard</strong></span><span class="streak-chip">${icon('fire')} ${streak} ${streak === 1 ? 'dag' : 'dagen'} op rij</span></div>${resumeBanner()}<section class="hero"><div class="hero-copy"><div class="hero-kicker"><span class="live-dot"></span> KLAAR VOOR DE WEG</div><h1 tabindex="-1">Haal je theorie<br> met <span class="accent">vertrouwen.</span></h1><p class="hero-description">Oefen honderden vragen over verkeersregels, verkeersinzicht, veiligheid en voertuigkennis.<br>In jouw tempo. Op jouw manier.</p><div class="hero-actions">${button('Start met oefenen', 'navigate', 'data-target="practice"', 'primary', 'arrow')}${button('Start proefexamen', 'navigate', 'data-target="exam"', 'secondary', 'clock')}</div><div class="hero-proof"><span>${icon('check')} ${questions.length} unieke vragen</span><span>${icon('check')} Helemaal gratis</span><span>${icon('check')} Geen account nodig</span></div></div>${heroArt()}</section><section class="stats-grid" aria-label="Jouw statistieken">${statCard('book', 'blue', state.total, 'Oefenvragen gemaakt', 'Elke vraag brengt je verder')}${statCard('target', 'green', state.total ? `${percent(state.correct, state.total)}<small>%</small>` : '—', 'Percentage correct', state.total ? `${state.correct} goed van ${state.total} vragen` : 'Je eerste stap begint hier')}${statCard('trophy', 'orange', state.bestExamScore === null ? '—' : `${state.bestExamScore}<small>/50</small>`, 'Beste examenscore', `${state.examCount} proefexamens afgerond`)}${statCard('repeat', 'purple', state.wrongIds.length, 'Nog te oefenen fouten', 'Herhalen helpt je onthouden', 'wrong')}</section>${videoPromo()}<section class="section-space"><div class="section-header"><div class="section-title"><div class="eyebrow">STAP VOOR STAP</div><h2>Waar wil je op oefenen?</h2><p class="section-subtitle">Kies een onderwerp en maak er jouw sterke punt van.</p></div><a class="text-button" href="#library">Bekijk alle vragen ${icon('arrow')}</a></div><div class="category-grid">${categories.map((c, i) => {
      const data = state.perCategory[c.name];
      const score = percent(data.correct, data.total);
      return `<article class="category-card"><div class="category-top"><span class="category-icon ${c.color}">${icon(c.icon)}</span><span class="category-count">${questions.filter(q => q.category === c.name).length} vragen</span></div><h3>${c.label}</h3><p class="category-description">${c.description}</p><div class="category-footer"><div class="category-percent"><span>${data.total ? 'Goed beantwoord' : 'Klaar voor je eerste vraag'}</span><strong>${data.total ? score + '%' : '—'}</strong></div>${progressBar(score, `Percentage correct: ${c.label}`)}<button class="category-action" data-action="category" data-category="${i}">Oefenen ${icon('arrow')}</button></div></article>`;
    }).join('')}</div></section><section class="dashboard-bottom section-space"><div class="panel"><div class="section-header"><div class="section-title"><h2>Je laatste sessies</h2><p class="section-subtitle">Kleine stappen, zichtbare vooruitgang.</p></div><a class="text-button" href="#progress">Voortgang ${icon('arrow')}</a></div>${recentResults(3)}</div><div class="daily-card"><span class="daily-badge">JOUW DAGELIJKSE MOMENT</span><span class="daily-icon">${icon('spark')}</span><h2>10 vragen.<br>Een stap dichterbij.</h2><p>Een beetje oefenen, elke dag. Bouw aan je kennis en houd je ritme vast.</p>${button(state.dailyCompleted.includes(dayKey()) ? 'Vandaag voltooid · nog eens' : 'Dagelijkse 10 vragen', 'daily', '', 'primary', 'arrow')}<span class="daily-note">${icon('clock')} Ongeveer 5 minuten</span></div></section><div class="dashboard-caption"><h2>TheorieTrainer Rijbewijs B</h2><p>Oefen slim voor je Nederlandse auto-theorie-examen</p></div></div>`;
  }
  function statCard(symbol, color, value, label, note, target = '') {
    return `<${target ? 'a href="#' + target + '"' : 'div'} class="stat-card"><div class="stat-icon ${color}">${icon(symbol)}</div><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div><div class="stat-note">${note}</div></div></${target ? 'a' : 'div'}>`;
  }
  function recentResults(limit = 8) {
    if (!state.history.length) return `<div class="empty-state compact"><span class="empty-icon">${icon('chart')}</span><h3>Hier begint jouw vooruitgang</h3><p>Rond je eerste sessie af en zie hier hoe je groeit.</p></div>`;
    return `<div class="recent-list">${state.history.slice(0, limit).map(h => `<div class="recent-item"><span class="recent-icon">${icon(h.mode === 'exam' ? 'trophy' : 'book')}</span><div class="recent-copy"><strong>${escapeHtml(h.title)}</strong><span>${new Date(h.endedAt).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · ${h.total} vragen</span></div><div class="recent-score">${percent(h.correct, h.total)}%<span>${h.correct}/${h.total} goed</span></div></div>`).join('')}</div>`;
  }

  function getPracticePool() {
    return questions.filter(q => (setup.category === 'all' || q.category === setup.category)
      && (!setup.source || setup.source === 'all' || originOf(q) === setup.source)
      && (setup.difficulty === 'all' || q.difficulty === setup.difficulty)
      && (!setup.instinker || q.type === 'instinker' || q.tags?.includes('instinker'))
      && (!setup.imageOnly || Boolean(q.image)));
  }
  function renderPractice() {
    const pool = getPracticePool();
    const available = Math.min(setup.count, pool.length);
    $('#view').innerHTML = `<div class="page-container">${heading('JOUW TEMPO, JOUW KEUZE', 'Een goede rit begint met oefenen.', 'Stel je oefensessie samen. Na elke vraag krijg je meteen uitleg.')}${resumeBanner()}<div class="setup-layout"><section class="setup-card"><h2>Wat wil je vandaag leren?</h2><div class="form-grid"><div class="field"><label for="practice-category">Onderwerp</label><select id="practice-category"><option value="all">Alle onderwerpen</option>${categories.map(c => `<option value="${escapeHtml(c.name)}" ${setup.category === c.name ? 'selected' : ''}>${c.label}</option>`).join('')}</select></div><div class="field"><label for="practice-source">Vragenbron</label><select id="practice-source">${sources.map(o => `<option value="${o.value}" ${setup.source === o.value ? 'selected' : ''}>${o.label} (${questions.filter(q => o.value === 'all' || originOf(q) === o.value).length})</option>`).join('')}</select></div><div class="field"><label for="practice-difficulty">Moeilijkheid</label><select id="practice-difficulty">${[['all', 'Gemengd'], ['makkelijk', 'Makkelijk'], ['gemiddeld', 'Gemiddeld'], ['moeilijk', 'Moeilijk']].map(([value, label]) => `<option value="${value}" ${setup.difficulty === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div></div><fieldset class="count-fieldset"><legend>Aantal vragen</legend><div class="segmented-options">${[10, 20, 30, 50].map(n => `<button class="choice-button ${setup.count === n ? 'selected' : ''}" data-action="count" data-count="${n}" aria-pressed="${setup.count === n}">${n}<span>vragen</span></button>`).join('')}</div></fieldset><label class="checkbox-row"><input type="checkbox" id="smart-practice" ${setup.smart ? 'checked' : ''}><span><strong>${icon('spark')} Slim oefenen</strong><span>Geef extra aandacht aan onderwerpen waarop je minder goed scoort.</span></span></label><label class="checkbox-row"><input type="checkbox" id="instinker-practice" ${setup.instinker ? "checked" : ""}><span><strong>${icon("spark")} Instinkers</strong><span>Oefen veelgemaakte denkfouten en lastige uitzonderingen.</span></span></label><label class="checkbox-row"><input type="checkbox" id="image-practice" ${setup.imageOnly ? "checked" : ""}><span><strong>${icon("search")} Alleen met afbeelding</strong><span>Toon vragen met een bijbehorende verkeersillustratie.</span></span></label><div class="setup-summary">${icon('info')}<span>${pool.length ? `${available} unieke vragen geselecteerd uit ${pool.length} beschikbare vragen.${available < setup.count ? ' Je krijgt alle passende vragen, zonder herhaling.' : ''}` : 'Er zijn geen vragen met deze combinatie. Kies een andere moeilijkheid.'}</span></div>${button(`Start ${available} vragen`, 'start-practice', available ? '' : 'disabled', 'primary', 'arrow')}</section><aside class="info-card"><span class="category-icon blue">${icon('book')}</span><h2>Begrijpen is beter<br>dan onthouden.</h2><p>Je leert het meest van het waarom. Neem na iedere vraag even de tijd voor de uitleg.</p><div class="info-list"><div class="info-row">${icon('check')} Direct feedback en uitleg</div><div class="info-row">${icon('check')} Geen tijdsdruk</div><div class="info-row">${icon('check')} Fouten automatisch bewaren</div><div class="info-row">${icon('check')} Later gewoon verdergaan</div></div><a class="text-button" href="#library">Blader door alle vragen ${icon('arrow')}</a></aside></div></div>`;
  }
  function renderExam() {
    $('#view').innerHTML = `<div class="page-container">${heading('TEST JEZELF', 'Klaar voor het echte werk?', 'Ontdek waar je staat met een compleet proefexamen. Neem er rustig de tijd voor.')}${resumeBanner()}<div class="setup-layout"><section class="setup-card exam-setup"><span class="category-icon blue">${icon('trophy')}</span><h2>Proefexamen Rijbewijs B</h2><p>Een mix van alle negen onderwerpen, inclusief rijhulpsystemen (ADAS), met elke keer een nieuwe selectie vragen.</p><div class="exam-facts"><div><strong>52</strong><span>vragen · 50 tellen mee</span></div><div><strong>30 <small>min</small></strong><span>om te antwoorden</span></div><div><strong>44 <small>/ 50</small></strong><span>nodig om te slagen</span></div></div><div class="info-list"><div class="info-row">${icon('check')} Uitslag en uitleg aan het einde</div><div class="info-row">${icon('check')} Vragen overslaan en later beantwoorden</div><div class="info-row">${icon('check')} Antwoorden aanpassen zolang de tijd loopt</div></div>${button('Start proefexamen', 'start-exam', '', 'primary', 'arrow')}<p class="source-note">De timer start zodra je begint en loopt door als je de pagina verlaat. Onbeantwoorde vragen tellen als fout.</p></section><aside class="info-card"><span class="category-icon orange">${icon('info')}</span><h2>Een eerlijke oefening.</h2><p>Deze oefentoets gebruikt de tijd en slaaggrens van het reguliere CBR-examen. Het zijn eigen oefenvragen, geen officiële CBR-vragen.</p><p>Bij het CBR krijg je daarnaast twee niet-meetellende testvragen en vooraf twee oefenvragen. Hier staan 52 vragen: 50 tellen mee en 2 zijn testvragen zonder invloed op de score. De 2 oefenvragen vooraf van het CBR zijn niet inbegrepen. De officiële vraagvormen, waaronder animaties, kunnen anders zijn.</p><a class="text-button" href="https://www.cbr.nl/nl/rijbewijs-halen/auto/theorie-examen-auto/hoe-gaat-het-theorie-examen-auto" target="_blank" rel="noopener noreferrer">Bekijk de examenopzet bij het CBR ${icon('arrow')}</a></aside></div></div>`;
  }
  function replaceSession(callback) {
    if (state.active) showConfirm('Een nieuwe sessie beginnen?', 'Je huidige sessie wordt vervangen. Antwoorden uit de oefenmodus zijn al opgeslagen. Een onafgemaakt proefexamen krijgt geen uitslag.', 'Nieuwe sessie', callback);
    else callback();
  }
  function startPractice() {
    const pool = getPracticePool();
    if (!pool.length) return;
    let selected;
    if (setup.smart) {
      // Weighted sampling without replacement: weaker or untried categories get higher weight.
      selected = pool.map(q => {
        const row = state.perCategory[q.category];
        const weight = row.total ? 1 + 4 * (1 - row.correct / row.total) : 3;
        return { q, rank: -Math.log(Math.max(Number.EPSILON, Math.random())) / weight };
      }).sort((a, b) => a.rank - b.rank).map(item => item.q).slice(0, setup.count);
    } else selected = shuffleArray(pool).slice(0, setup.count);
    replaceSession(() => createSession(selected, 'practice', setup.category === 'all' ? (setup.smart ? 'Slim oefenen · alle onderwerpen' : 'Alle onderwerpen') : categoryByName.get(setup.category).label));
  }
  function startExam() {
    // Keep the scored selection balanced, then add two unseen practice-simulation items.
    const quotas = [9, 7, 7, 6, 5, 4, 4, 5, 3];
    const scored = categories.flatMap((c, i) => shuffleArray(questions.filter(q => q.category === c.name)).slice(0, quotas[i]));
    const scoredIds = new Set(scored.map(q => q.id));
    const unscored = shuffleArray(questions.filter(q => !scoredIds.has(q.id))).slice(0, EXAM_PRESENTED_QUESTIONS - EXAM_SCORE_QUESTIONS);
    const unscoredIds = new Set(unscored.map(q => q.id));
    replaceSession(() => createSession(shuffleArray([...scored, ...unscored]), 'exam', 'Proefexamen Rijbewijs B', unscoredIds));
  }
  function startDaily() {
    const selected = shuffleArray(questions, seededRandom(dayKey())).slice(0, 10);
    replaceSession(() => createSession(selected, 'daily', 'Dagelijkse 10 vragen'));
  }
  function startCollection(mode, ids = null) {
    const list = ids || (mode === 'wrong' ? state.wrongIds : state.favoriteIds);
    const pool = shuffleArray(list.map(id => questionById.get(id)).filter(Boolean));
    if (!pool.length) { toast(mode === 'wrong' ? 'Je hebt geen foute vragen om te herhalen.' : 'Bewaar eerst een vraag met het sterretje.'); return; }
    replaceSession(() => createSession(pool, mode, mode === 'wrong' ? 'Mijn foute vragen' : 'Favoriete vragen'));
  }
  function createSession(selected, mode, title, unscoredIds = new Set()) {
    clearInterval(timer);
    const now = Date.now();
    state.active = { mode, title, items: selected.map(q => ({ id: q.id, order: q.fixedOrder ? q.options.map((_, i) => i) : shuffleArray(q.options.map((_, i) => i)), unscored: unscoredIds.has(q.id) })), position: 0, answers: {}, startedAt: now, deadline: mode === 'exam' ? now + EXAM_SECONDS * 1000 : null, day: dayKey(), settings: mode === 'practice' ? { ...setup } : null };
    lastResult = null;
    saveProgress();
    navigate('quiz');
    startTimer();
  }
  function startTimer() {
    clearInterval(timer);
    if (state.active?.mode !== 'exam') return;
    tickTimer();
    if (state.active?.mode === 'exam') timer = setInterval(tickTimer, 500);
  }
  function tickTimer() {
    const s = state.active;
    if (!s || s.mode !== 'exam') return;
    const left = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000));
    const label = $('#exam-timer');
    if (label) {
      label.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
      label.parentElement.classList.toggle('urgent', left <= 300);
    }
    if (!left) { closeConfirm(); finishQuiz(true); }
  }
  function hasLocalImage(q) {
    return Boolean(q?.image && /^images\/[\w./-]+\.(svg|png|jpg|jpeg|webp)$/i.test(q.image) && !q.image.includes('..'));
  }
  function questionImage(q) {
    if (!hasLocalImage(q)) return '';
    return `<figure class="question-image"><img src="${escapeHtml(q.image)}" alt="${escapeHtml(q.imageAlt)}" width="800" height="500" loading="lazy" decoding="async"><figcaption><span>${escapeHtml(q.imageCaption || 'Schematische weergave')}</span><button class="image-zoom-button" data-action="zoom-image" data-id="${q.id}" aria-haspopup="dialog">${icon('search')} Afbeelding vergroten</button></figcaption></figure>`;
  }
  function showImage(id) {
    const q = questionById.get(id);
    if (!hasLocalImage(q)) return;
    focusBeforeDialog = document.activeElement;
    imageDialogOpen = true;
    $('#modal-root').innerHTML = `<div class="modal-backdrop image-backdrop"><section class="modal image-modal" role="dialog" aria-modal="true" aria-labelledby="image-dialog-title"><header class="image-modal-header"><div><span class="eyebrow">VRAAG ${q.id}</span><h2 id="image-dialog-title">Bekijk de verkeerssituatie</h2></div><button class="icon-button" data-action="close-image" aria-label="Afbeelding sluiten">${icon('close')}</button></header><div class="image-modal-toolbar"><span>Schematische weergave</span><button class="image-zoom-button" data-action="image-detail" aria-pressed="false">2× vergroten</button></div><div class="image-modal-canvas" tabindex="0" aria-label="Verkeersafbeelding; na vergroten kun je scrollen"><img src="${escapeHtml(q.image)}" alt="${escapeHtml(q.imageAlt)}" width="800" height="500"></div><p class="image-description">${escapeHtml(q.imageAlt)}</p><span class="image-modal-hint">Sluit met Escape of klik buiten dit venster.</span></section></div>`;
    document.body.classList.add('dialog-open');
    for (const element of [$('.skip-link'), $('.site-header'), $('#main-content'), $('.footer')]) element.inert = true;
    $('[data-action="close-image"]').focus();
  }
  function favoriteButton(id) {
    const active = state.favoriteIds.includes(id);
    return `<button class="icon-button favorite-button ${active ? 'active' : ''}" data-action="favorite" data-id="${id}" aria-label="${active ? 'Verwijderen uit favorieten' : 'Bewaren als favoriet'}" aria-pressed="${active}">${icon('star')}</button>`;
  }
  function sourceLink(q) {
    if (!q.source || !/^https:\/\/(?:[a-z0-9-]+\.)*(?:rijksoverheid\.nl|overheid\.nl|cbr\.nl|rdw\.nl|swov\.nl|vvn\.nl|rijkswaterstaat\.nl|rwsverkeersinfo\.nl|renault\.com|volvocars\.com|fordservicecontent\.com|politie\.nl|anwb\.nl|het-parket\.nl|rijveiligmetmedicijnen\.nl|rodekruis\.nl)(?:\/|$)/i.test(q.source)) return '';
    return `<a class="source-link" href="${escapeHtml(q.source)}" target="_blank" rel="noopener noreferrer">Lees de bron ${icon('arrow')}</a>`;
  }
  function learningDetails(q, order = q.options.map((_, index) => index)) {
    const details = [
      q.focusDetail ? `<p><strong>Beslissend detail:</strong> ${escapeHtml(q.focusDetail)}</p>` : '',
      q.misconception ? `<p><strong>Veelgemaakte denkfout:</strong> ${escapeHtml(q.misconception)}</p>` : '',
      Array.isArray(q.optionExplanations) ? `<details class="option-explanations"><summary>Waarom zijn de antwoordopties goed of fout?</summary><ul>${order.map((original, index) => `<li><strong>${String.fromCharCode(65 + index)}. ${escapeHtml(q.options[original])}</strong> ${escapeHtml(q.optionExplanations[original])}</li>`).join('')}</ul></details>` : ''
    ].filter(Boolean).join('');
    const answerFigure = q.answerImage && hasLocalImage({ image: q.answerImage }) ? `<figure class="question-image"><img src="${escapeHtml(q.answerImage)}" alt="${escapeHtml(q.answerImageAlt || 'Antwoordafbeelding')}" width="800" height="500" loading="lazy" decoding="async"><figcaption><span>Antwoord uit het NuTheorie-oefenmateriaal</span></figcaption></figure>` : '';
    return `<p>${escapeHtml(q.explanation)}</p>${details}${answerFigure}`;
  }
  function loadQuestion(moveFocus = false) {
    const s = state.active;
    if (!s) { navigate('dashboard'); return; }
    if (s.mode === 'exam' && Date.now() >= s.deadline) { finishQuiz(true); return; }
    const item = s.items[s.position];
    const q = questionById.get(item.id);
    const answer = s.answers[q.id];
    const answered = answer !== undefined;
    const exam = s.mode === 'exam';
    const showFeedback = answered && !exam;
    const completed = Object.keys(s.answers).length;
    const correct = answer === q.correctAnswer;
    $('#view').innerHTML = `<div class="page-container quiz-container"><div class="quiz-topbar"><div><button class="text-button" data-action="navigate" data-target="dashboard">${icon('back')} Dashboard</button><h1 class="quiz-title" tabindex="-1">${escapeHtml(s.title)}</h1></div>${exam ? `<span class="timer">${icon('clock')}<span id="exam-timer">30:00</span><span class="sr-only"> resterend</span></span>` : `<span class="pill">${icon('book')} In jouw tempo</span>`}</div><div class="quiz-meta"><strong>Vraag ${s.position + 1} <span>van ${s.items.length}</span></strong><span>${s.items.length - completed} ${s.items.length - completed === 1 ? 'vraag' : 'vragen'} onbeantwoord</span></div><div class="quiz-progress">${progressBar(percent(completed, s.items.length), 'Beantwoorde vragen')}</div><article class="question-card"><div class="question-heading"><div class="question-tags"><span class="pill blue">${categoryByName.get(q.category).label}</span><span class="pill">${q.difficulty}</span>${originPill(q)}</div><div class="question-tools">${favoriteButton(q.id)}</div></div><span class="eyebrow question-subcategory">${escapeHtml(q.subcategory)}</span><h2 class="question-text" id="question-text" tabindex="-1">${escapeHtml(q.question)}</h2>${questionImage(q)}<div class="answer-list" role="group" aria-labelledby="question-text">${item.order.map((original, i) => {
      const isSelected = original === answer;
      const isCorrect = original === q.correctAnswer;
      const className = showFeedback ? (isCorrect ? 'correct' : isSelected ? 'incorrect' : '') : isSelected ? 'selected' : '';
      return `<button class="answer-option ${className} ${showFeedback ? 'locked' : ''}" data-action="answer" data-answer="${original}" aria-pressed="${isSelected}" ${showFeedback ? 'disabled' : ''}><span class="answer-letter">${String.fromCharCode(65 + i)}</span><span class="answer-content">${escapeHtml(q.options[original])}</span><span class="answer-status">${showFeedback && isCorrect ? icon('check') : showFeedback && isSelected ? icon('close') : isSelected ? icon('check') : ''}</span></button>`;
    }).join('')}</div>${showFeedback ? `<div class="feedback ${correct ? 'success' : 'error'}" role="status"><div class="feedback-title">${icon(correct ? 'check' : 'close')}${correct ? 'Goed!' : `Helaas, het juiste antwoord is: ${escapeHtml(q.options[q.correctAnswer])}`}</div>${learningDetails(q, item.order)}${sourceLink(q)}</div>` : ''}<div class="quiz-footer"><span class="keyboard-hint">${exam ? 'Je kunt je antwoord later nog aanpassen.' : (answered ? 'Neem de uitleg mee naar je volgende vraag.' : 'Kies een antwoord om de uitleg te zien.')}</span>${exam ? button(s.position === s.items.length - 1 ? 'Examen afronden' : 'Volgende vraag', s.position === s.items.length - 1 ? 'finish' : 'next', '', 'primary', s.position === s.items.length - 1 ? 'check' : 'arrow') : answered ? button(s.position === s.items.length - 1 ? 'Bekijk je resultaat' : 'Volgende vraag', 'next', '', 'primary', 'arrow') : ''}</div></article>${exam ? `<div class="question-nav">${button('Vorige vraag', 'previous', s.position === 0 ? 'disabled' : '', 'secondary', 'back')}<span>${completed}/${s.items.length} beantwoord</span>${button('Afronden', 'finish', '', 'ghost')}</div><nav class="question-dots" aria-label="Ga naar een examenvraag">${s.items.map((entry, i) => `<button class="question-dot ${s.answers[entry.id] !== undefined ? 'answered' : ''} ${i === s.position ? 'current' : ''}" data-action="jump" data-position="${i}" aria-label="Vraag ${i + 1}, ${s.answers[entry.id] === undefined ? 'onbeantwoord' : 'beantwoord'}" ${i === s.position ? 'aria-current="step"' : ''}>${i + 1}</button>`).join('')}</nav>` : `<p class="quiz-save-note">${icon('lock')} Je voortgang wordt automatisch ${storageAvailable ? 'lokaal opgeslagen' : 'voor dit bezoek bijgehouden'}.</p>`}</div>`;
    if (exam) tickTimer();
    if (moveFocus) $('#question-text')?.focus({ preventScroll: true });
  }
  function submitAnswer(answer) {
    const s = state.active;
    if (!s) return;
    if (s.mode === 'exam' && Date.now() >= s.deadline) { finishQuiz(true); return; }
    const q = questionById.get(s.items[s.position].id);
    if (!integer(answer, q.options.length - 1) || (s.mode !== 'exam' && s.answers[q.id] !== undefined)) return;
    s.answers[q.id] = answer;
    if (s.mode !== 'exam') recordAnswer(q, answer);
    saveProgress();
    loadQuestion();
    if (s.mode !== 'exam') $('.quiz-footer .button')?.focus({ preventScroll: true });
    else $(`[data-answer="${answer}"]`)?.focus({ preventScroll: true });
  }
  function nextQuestion() {
    const s = state.active;
    if (!s) return;
    if (s.mode !== 'exam' && s.answers[s.items[s.position].id] === undefined) return;
    if (s.position < s.items.length - 1) { s.position++; saveProgress(); loadQuestion(true); window.scrollTo({ top: 0, behavior: 'instant' }); }
    else if (s.mode === 'exam') requestFinish();
    else finishQuiz();
  }
  function requestFinish() {
    const s = state.active;
    if (!s) return;
    const unanswered = s.items.length - Object.keys(s.answers).length;
    showConfirm('Je proefexamen afronden?', unanswered ? `Je hebt nog ${unanswered} onbeantwoorde vragen. Die tellen als fout. Wil je je antwoorden inleveren?` : 'Je hebt alle vragen beantwoord. Lever je antwoorden in om je uitslag en uitleg te bekijken.', 'Bekijk uitslag', () => finishQuiz());
  }
  function calculateResults(session) {
    const rows = session.items.map(item => {
      const q = questionById.get(item.id);
      return { q, answer: session.answers[q.id], correct: session.answers[q.id] === q.correctAnswer, order: [...item.order], unscored: item.unscored === true };
    });
    const byCategory = categories.map(c => {
      const entries = rows.filter(row => !row.unscored && row.q.category === c.name);
      return { category: c, total: entries.length, correct: entries.filter(row => row.correct).length };
    }).filter(row => row.total);
    const scoredRows = rows.filter(row => !row.unscored);
    return { rows, byCategory, total: scoredRows.length, correct: scoredRows.filter(row => row.correct).length, unanswered: scoredRows.filter(row => row.answer === undefined).length };
  }
  function finishQuiz(timedOut = false) {
    const s = state.active;
    if (!s) return;
    clearInterval(timer);
    const result = calculateResults(s);
    state.earned80 = state.earned80 || percent(result.correct, result.total) >= 80;
    if (s.mode === 'exam') {
      for (const row of result.rows) {
        if (row.unscored) continue;
        if (row.answer !== undefined) recordAnswer(row.q, row.answer);
        else if (!state.wrongIds.includes(row.q.id)) state.wrongIds.push(row.q.id);
      }
      state.examCount++;
      state.bestExamScore = Math.max(state.bestExamScore ?? 0, result.correct);
    }
    if (s.mode === 'daily' && !state.dailyCompleted.includes(s.day)) state.dailyCompleted.push(s.day);
    if (Object.keys(s.answers).length) markDay();
    state.history.unshift({ title: s.title, mode: s.mode, total: result.total, correct: result.correct, endedAt: Date.now() });
    state.history = state.history.slice(0, 50);
    lastResult = { ...result, mode: s.mode, title: s.title, timedOut, ids: s.items.map(item => item.id), settings: s.settings };
    state.active = null;
    saveProgress();
    navigate('results');
  }

  function renderResults() {
    const r = lastResult;
    if (!r) { navigate('dashboard'); return; }
    const score = percent(r.correct, r.total);
    const exam = r.mode === 'exam';
    const passed = r.correct >= EXAM_PASS;
    const weak = [...r.byCategory].filter(c => c.correct < c.total).sort((a, b) => a.correct / a.total - b.correct / b.total).slice(0, 2);
    const feedback = weak.length ? `Oefen nog wat extra op ${weak.map(c => c.category.label).join(' en ')}. Lees de uitleg en probeer je foute vragen opnieuw.` : 'Alles goed! Houd je kennis vast met een nieuwe sessie of een proefexamen.';
    $('#view').innerHTML = `<div class="page-container results-layout">${heading('WEER EEN STAP VERDER', exam ? (passed ? 'Geslaagd voor je proefexamen!' : 'Je weet nu waar je kunt groeien.') : 'Goed geoefend. Dit is je resultaat.', escapeHtml(r.title))}${r.timedOut ? '<div class="notice warning">De tijd is om. Je ingevulde antwoorden zijn automatisch ingeleverd. Onbeantwoorde vragen tellen als fout.</div>' : ''}<section class="result-hero"><div class="score-ring" style="--score:${score}%" role="img" aria-label="${score} procent correct"><div class="score-number">${score}<small>%</small><span>correct</span></div></div><div class="result-summary"><span class="pill ${exam && !passed ? 'orange' : 'green'}">${icon(exam ? 'trophy' : 'check')}${exam ? (passed ? 'Slaaggrens behaald' : 'Nog even dooroefenen') : 'Sessie afgerond'}</span><h2>${r.correct} <span>/ ${r.total} goed</span></h2><p>${feedback}</p><div class="result-facts"><span class="result-fact">${icon('check')} ${r.correct} goed</span><span class="result-fact">${icon('close')} ${r.total - r.correct} fout${r.unanswered ? ` (${r.unanswered} onbeantwoord)` : ''}</span>${exam ? '<span class="result-fact">Slaaggrens: 44/50</span>' : ''}</div></div></section><div class="result-actions">${button('Opnieuw oefenen', 'retry', '', 'primary', 'repeat')}${button('Foute vragen oefenen', 'retry-wrong', r.correct === r.total ? 'disabled' : '', 'secondary', 'book')}${button('Terug naar dashboard', 'navigate', 'data-target="dashboard"', 'ghost', 'arrow')}</div><section class="panel section-space"><div class="section-title"><h2>Zo ging het per onderwerp</h2><p class="section-subtitle">Dit zijn de resultaten van deze sessie.</p></div><div class="category-results">${r.byCategory.map(row => `<div class="category-result"><span class="category-icon ${row.category.color}">${icon(row.category.icon)}</span><div><strong>${row.category.label}</strong>${progressBar(percent(row.correct, row.total), row.category.label)}</div><span><strong>${percent(row.correct, row.total)}%</strong><small>${row.correct} / ${row.total} goed</small></span></div>`).join('')}</div></section><section class="section-space"><div class="section-header"><div class="section-title"><h2>Neem je antwoorden door</h2><p class="section-subtitle">Bekijk de uitleg en neem het mee naar je volgende rit.</p></div></div><div class="review-list">${r.rows.map((row, i) => `<details class="review-card"><summary><span class="review-status ${row.correct ? 'is-correct' : 'is-incorrect'}">${icon(row.correct ? 'check' : 'close')}</span><span><small>Vraag ${i + 1} · ${row.unscored ? "testvraag (telt niet mee)" : "telt mee"} · ${categoryByName.get(row.q.category).label}</small>${escapeHtml(row.q.question)}</span><span class="review-chevron">⌄</span></summary><div class="review-body">${questionImage(row.q)}<p><strong>Jouw antwoord:</strong> ${row.answer === undefined ? 'Niet beantwoord' : escapeHtml(row.q.options[row.answer])}</p><p><strong>Juiste antwoord:</strong> ${escapeHtml(row.q.options[row.q.correctAnswer])}</p>${learningDetails(row.q, row.order)}<div class="library-top">${sourceLink(row.q)}${favoriteButton(row.q.id)}</div></div></details>`).join('')}</div></section></div>`;
  }
  function renderLibrary() {
    const mode = ['wrong', 'favorites'].includes(route) ? route : 'library';
    const copy = mode === 'wrong' ? ['LEREN VAN JE FOUTEN', 'Mijn foute vragen', 'Fouten horen erbij. Beantwoord een vraag later goed en hij verdwijnt uit deze lijst.'] : mode === 'favorites' ? ['JOUW EIGEN VERZAMELING', 'Favoriete vragen', 'Bewaar vragen die je nog eens wilt bekijken. Ze blijven hier voor je klaarstaan.'] : route === 'reviewed' ? ['JOUW RECENTE VRAGEN', 'Recent beantwoord', 'De laatste unieke vragen die je hebt beantwoord, met uitleg en afbeeldingen.'] : ['ONTDEK ALLE ONDERWERPEN', 'Alle vragen', `${questions.length} unieke oefenvragen. Zoek, ontdek en leer op jouw manier.`];
    $('#view').innerHTML = `<div class="page-container">${heading(...copy)}${mode !== 'library' ? `<div class="collection-actions">${button(mode === 'wrong' ? 'Oefen mijn foute vragen' : 'Oefen mijn favorieten', 'collection', `data-mode="${mode}" ${(mode === 'wrong' ? state.wrongIds : state.favoriteIds).length ? '' : 'disabled'}`, 'primary', 'arrow')}<a class="text-button" href="#library">Bekijk alle vragen ${icon('arrow')}</a></div>` : ''}<div class="filter-bar"><div class="search-field">${icon('search', 'search-icon')}<label class="sr-only" for="question-search">Zoek in vragen en onderwerpen</label><input id="question-search" type="search" placeholder="Zoek een vraag of onderwerp…" value="${escapeHtml(libraryFilters.search)}"></div><div class="field"><label class="sr-only" for="library-category">Filter op onderwerp</label><select id="library-category"><option value="all">Alle onderwerpen</option>${categories.map(c => `<option value="${escapeHtml(c.name)}" ${libraryFilters.category === c.name ? 'selected' : ''}>${c.label}</option>`).join('')}</select></div><div class="field"><label class="sr-only" for="library-difficulty">Filter op moeilijkheid</label><select id="library-difficulty">${[['all', 'Alle niveaus'], ['makkelijk', 'Makkelijk'], ['gemiddeld', 'Gemiddeld'], ['moeilijk', 'Moeilijk']].map(([value, label]) => `<option value="${value}" ${libraryFilters.difficulty === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div></div><div id="library-content"></div></div>`;
    renderLibraryItems();
  }
  function renderLibraryItems() {
    const collection = route === 'wrong' ? questions.filter(q => state.wrongIds.includes(q.id)) : route === 'favorites' ? questions.filter(q => state.favoriteIds.includes(q.id)) : route === 'reviewed' ? (state.questionHistory || []).map(id => questionById.get(id)).filter(Boolean) : questions;
    const search = libraryFilters.search.trim().toLocaleLowerCase('nl');
    const filtered = collection.filter(q => (libraryFilters.category === 'all' || q.category === libraryFilters.category) && (libraryFilters.difficulty === 'all' || q.difficulty === libraryFilters.difficulty) && (!search || `${q.question} ${q.subcategory} ${q.category}`.toLocaleLowerCase('nl').includes(search)));
    const pages = Math.max(1, Math.ceil(filtered.length / 12));
    libraryPage = Math.min(libraryPage, pages);
    const pageItems = filtered.slice((libraryPage - 1) * 12, libraryPage * 12);
    $('#library-content').innerHTML = `<div class="list-toolbar" role="status"><span>${filtered.length} ${filtered.length === 1 ? 'vraag' : 'vragen'} gevonden</span><span>${filtered.length ? `Pagina ${libraryPage} van ${pages}` : ''}</span></div>${!collection.length ? emptyState(route === 'wrong' ? 'check' : route === 'reviewed' ? 'book' : 'star', route === 'wrong' ? 'Een schone lei' : route === 'reviewed' ? 'Je recente vragen verschijnen hier' : 'Je favoriete vragen, op één plek', route === 'wrong' ? 'Zodra je een vraag fout beantwoordt, bewaren we hem hier voor je.' : route === 'reviewed' ? 'Beantwoord een vraag om je recente vragen hier terug te vinden.' : 'Tik op het sterretje bij een vraag om hem hier te bewaren.', 'library', 'Ontdek de vragen') : !filtered.length ? `<div class="empty-state"><span class="empty-icon">${icon('search')}</span><h3>Geen vragen gevonden</h3><p>Probeer een andere zoekterm of verruim je filters.</p>${button('Filters wissen', 'clear-filters', '', 'secondary')}</div>` : `<div class="question-list">${pageItems.map(q => `<article class="library-card"><div class="library-top"><div class="question-tags"><span class="pill blue">${categoryByName.get(q.category).label}</span><span class="pill">${q.difficulty}</span>${originPill(q)}</div>${favoriteButton(q.id)}</div><span class="eyebrow question-subcategory">${escapeHtml(q.subcategory)}</span><h2>${escapeHtml(q.question)}</h2>${questionImage(q)}<ol class="library-options" type="A">${q.options.map(option => `<li>${escapeHtml(option)}</li>`).join('')}</ol><details class="answer-reveal"><summary>Bekijk antwoord en uitleg <span aria-hidden="true">⌄</span></summary><div><p><strong>${escapeHtml(q.options[q.correctAnswer])}</strong></p>${learningDetails(q)}${sourceLink(q)}</div></details></article>`).join('')}</div><nav class="pagination" aria-label="Vragenpagina's">${button('Vorige', 'library-page', `data-page="${libraryPage - 1}" ${libraryPage <= 1 ? 'disabled' : ''}`, 'secondary', 'back')}<span>${libraryPage} / ${pages}</span>${button('Volgende', 'library-page', `data-page="${libraryPage + 1}" ${libraryPage >= pages ? 'disabled' : ''}`, 'secondary', 'arrow')}</nav>`}`;
  }
  function toggleFavorite(id) {
    if (!questionById.has(id)) return;
    const remove = state.favoriteIds.includes(id);
    state.favoriteIds = remove ? state.favoriteIds.filter(value => value !== id) : [...state.favoriteIds, id];
    saveProgress();
    document.querySelectorAll(`[data-action="favorite"][data-id="${id}"]`).forEach(element => {
      element.classList.toggle('active', !remove);
      element.setAttribute('aria-pressed', String(!remove));
      element.setAttribute('aria-label', remove ? 'Bewaren als favoriet' : 'Verwijderen uit favorieten');
    });
    if (route === 'favorites') {
      renderLibraryItems();
      const start = $('[data-action="collection"]');
      if (start) start.disabled = !state.favoriteIds.length;
    }
    toast(remove ? 'Vraag verwijderd uit je favorieten.' : 'Vraag bewaard in je favorieten.');
  }
  function renderStatistics() {
    const streak = getStreak();
    const badges = [
      ['book', 'De eerste stap', '10 vragen beantwoord', state.total >= 10],
      ['route', 'Op weg', '50 vragen beantwoord', state.total >= 50],
      ['trophy', 'Kilometers gemaakt', '100 vragen beantwoord', state.total >= 100],
      ['target', 'Scherp gezien', '80% in een sessie', state.earned80],
      ['shield', 'Examenervaring', 'Eerste proefexamen afgerond', state.examCount > 0],
      ['fire', 'Lekker in je ritme', '3 dagen achter elkaar', streak >= 3 || hasHistoricalStreak(3)]
    ];
    $('#view').innerHTML = `<div class="page-container">${heading('KIJK HOEVER JE BENT', 'Jouw vooruitgang, in beeld.', 'Elke vraag telt. Ontdek je sterke punten en zie waar je nog kunt groeien.')}<section class="stats-grid">${statCard('book', 'blue', state.total, 'Vragen beantwoord', `${state.correct} goed · ${state.total - state.correct} fout`)}${statCard('target', 'green', state.total ? `${percent(state.correct, state.total)}<small>%</small>` : '—', 'Percentage correct', 'Over al je beantwoorde vragen')}${statCard('trophy', 'orange', state.bestExamScore === null ? '—' : `${state.bestExamScore}<small>/50</small>`, 'Beste proefexamen', `${state.examCount} proefexamens afgerond`)}${statCard('fire', 'purple', streak, 'Dagen achter elkaar', `${state.days.length} dagen geoefend`)}</section><div class="progress-layout section-space"><section class="panel"><div class="section-title"><h2>Jouw kennis per onderwerp</h2><p class="section-subtitle">Percentage goed over alle beantwoorde vragen.</p></div><div class="chart">${categories.map((c, i) => {
      const row = state.perCategory[c.name];
      const score = percent(row.correct, row.total);
      return `<div class="chart-row"><div class="chart-label"><span>${c.label}</span><small>${row.total} beantwoord</small></div><div class="chart-bar">${progressBar(score, c.label)}</div><strong class="chart-value">${row.total ? score + '%' : '—'}</strong><button class="icon-button" data-action="category" data-category="${i}" aria-label="Oefen ${c.label}">${icon('arrow')}</button></div>`;
    }).join('')}</div></section><section class="panel"><div class="section-title"><h2>Blijf in beweging</h2><p class="section-subtitle">Je oefendagen in de afgelopen vier weken.</p></div><div class="activity-grid">${Array.from({ length: 28 }, (_, i) => {
      const day = new Date(); day.setDate(day.getDate() - 27 + i);
      const active = state.days.includes(dayKey(day));
      return `<span class="activity-day ${active ? 'active' : ''}" title="${day.toLocaleDateString('nl-NL')}: ${active ? 'geoefend' : 'niet geoefend'}"><span class="sr-only">${day.toLocaleDateString('nl-NL')}: ${active ? 'geoefend' : 'niet geoefend'}</span>${day.getDate()}</span>`;
    }).join('')}</div><p class="activity-legend"><span></span> Geoefend</p>${button('Dagelijkse 10 vragen', 'daily', '', 'secondary', 'spark')}</section></div><section class="section-space"><div class="section-header"><div class="section-title"><h2>Kleine overwinningen</h2><p class="section-subtitle">Verdien badges terwijl je je kennis opbouwt.</p></div><span class="pill">${badges.filter(b => b[3]).length} / ${badges.length} behaald</span></div><div class="badge-grid">${badges.map(([symbol, title, description, unlocked]) => `<div class="achievement ${unlocked ? 'unlocked' : ''}"><span class="achievement-icon">${icon(symbol)}</span><h3>${title}</h3><p>${description}</p><span>${unlocked ? 'Behaald' : 'Nog te behalen'}</span></div>`).join('')}</div></section><section class="panel section-space"><h2>Recente resultaten</h2>${recentResults(12)}</section><section class="settings-panel section-space"><div><h3>Jouw gegevens, op dit apparaat</h3><p>Je voortgang en favorieten worden in deze browser bewaard. Wissen van browsergegevens of verplaatsen van de bestanden kan de opslag verwijderen.</p></div>${button('Voortgang resetten', 'reset', '', 'danger')}</section></div>`;
  }
  function hasHistoricalStreak(length) {
    const days = new Set(state.days);
    return state.days.some(day => {
      const date = new Date(day + 'T12:00:00');
      for (let i = 1; i < length; i++) { date.setDate(date.getDate() - 1); if (!days.has(dayKey(date))) return false; }
      return true;
    });
  }
  // NuTheorie-video's: de lijst komt uit videos.js. Kijkvoortgang staat los van de oefenvoortgang.
  function loadVideoStore() {
    const clean = blankVideoStore();
    try {
      const data = JSON.parse(localStorage.getItem(VIDEO_STORAGE_KEY) || 'null');
      if (!data || data.type !== 'theorietrainer-videos' || data.version !== 1) return clean;
      if (videoById.has(data.current)) clean.current = data.current;
      if (Array.isArray(data.watched)) clean.watched = [...new Set(data.watched.filter(id => videoById.has(id)))];
      if (data.positions && typeof data.positions === 'object') {
        for (const [id, seconds] of Object.entries(data.positions)) {
          if (videoById.has(id) && Number.isFinite(seconds) && seconds > 0 && seconds < 86400) clean.positions[id] = Math.floor(seconds);
        }
      }
      if (VIDEO_SPEEDS.includes(data.speed)) clean.speed = data.speed;
    } catch (_) { /* Beschadigde of geblokkeerde opslag: begin met een schone kijkvoortgang. */ }
    return clean;
  }
  function saveVideoStore() {
    try { localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videoStore)); } catch (_) { /* Kijkvoortgang opslaan is optioneel. */ }
  }
  const videoPath = v => {
    const path = v.file.split('/').map(encodeURIComponent).join('/');
    const isGitHubPages = typeof location?.hostname === 'string' && location.hostname.toLowerCase() === 'hazzouani.github.io';
    return isGitHubPages
      ? `https://media.githubusercontent.com/media/Hazzouani/AutotheorieOefenen/refs/heads/main/${path}`
      : path;
  };
  const videoLabel = v => `${v.chapter}.${v.number}`;
  const isWatched = id => videoStore.watched.includes(id);
  const sumDuration = items => items.reduce((sum, v) => sum + (v.duration || 0), 0);
  function formatClock(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '—';
    const total = Math.floor(seconds), h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  function formatSpan(seconds, html = false) {
    const minutes = Math.round((seconds || 0) / 60), hours = Math.floor(minutes / 60), rest = minutes % 60;
    if (html) return hours ? `${hours}<small>u</small> ${rest}<small>min</small>` : `${minutes}<small>min</small>`;
    return hours ? `${hours} u ${rest} min` : `${minutes} min`;
  }
  function neighbourVideo(id, step) {
    const index = videoLibrary.list.findIndex(v => v.id === id);
    return index < 0 ? null : videoLibrary.list[index + step] || null;
  }
  function mediaErrorText(error) {
    return ({ 1: 'Het laden is afgebroken.', 2: 'Het bestand kon niet worden gelezen.', 3: 'De video kon niet worden gedecodeerd.', 4: 'Het bestand is niet gevonden of het formaat wordt niet ondersteund.' })[error?.code] || 'Onbekende fout.';
  }
  function videoThumb(v, extra = '') {
    return `${v.poster ? `<img src="${escapeHtml(v.poster)}" alt="" width="640" height="360" loading="lazy" decoding="async">` : ''}<span class="video-play" aria-hidden="true">${icon('play')}</span>${extra}`;
  }
  function videoPromo() {
    const list = videoLibrary.list;
    if (!list.length) return '';
    const watched = list.filter(v => isWatched(v.id)).length;
    const v = videoById.get(videoStore.current) || list[0];
    const started = watched > 0 || Object.keys(videoStore.positions).length > 0 || videoStore.current !== list[0].id;
    const last = videoLibrary.chapters.at(-1).number;
    return `<section class="video-promo section-space" aria-labelledby="video-promo-title"><a class="video-promo-thumb" href="#videos" tabindex="-1" aria-hidden="true">${videoThumb(v)}</a><div class="video-promo-copy"><div class="eyebrow">NUTHEORIE VIDEOLESSEN</div><h2 id="video-promo-title">${started ? 'Ga verder met kijken' : `Leer met ${list.length} video's`}</h2><p>${started ? `Hoofdstuk ${v.chapter} · video ${videoLabel(v)}: ${escapeHtml(v.title)}` : `Uitleg in ${videoLibrary.chapters.length} hoofdstukken over regels, borden, voorrang en meer. Bekijk ze op volgorde, van hoofdstuk ${videoLibrary.chapters[0].number} tot en met ${last}.`}</p><div class="video-promo-progress"><span>${watched} van ${list.length} video's bekeken</span>${progressBar(percent(watched, list.length), "Bekeken video's")}</div>${button(started ? 'Verder kijken' : "Bekijk de video's", 'navigate', 'data-target="videos"', 'primary', 'play')}</div></section>`;
  }
  function videoStatsHtml() {
    const list = videoLibrary.list;
    const watched = list.filter(v => isWatched(v.id)).length;
    return `${statCard('video', 'blue', list.length, "Video's", `${videoLibrary.chapters.length} hoofdstukken, op volgorde`)}${statCard('clock', 'orange', formatSpan(sumDuration(list), true), 'Totale speelduur', 'Kijk in je eigen tempo')}${statCard('check', 'green', `${watched}<small>/${list.length}</small>`, 'Bekeken', watched === list.length ? "Alle video's bekeken!" : `Nog ${list.length - watched} te gaan`)}${statCard('chart', 'purple', `${percent(watched, list.length)}<small>%</small>`, 'Kijkvoortgang', 'Bewaard op dit apparaat')}`;
  }
  function videoInfoHtml(v) {
    const watched = isWatched(v.id);
    const previous = neighbourVideo(v.id, -1), next = neighbourVideo(v.id, 1);
    return `<div class="video-info-top"><div class="question-tags"><span class="pill blue">${icon('video')}Hoofdstuk ${v.chapter}</span><span class="pill">Video ${v.index + 1} van ${v.chapterSize}</span><span class="pill">${icon('clock')}${formatClock(v.duration)}</span>${watched ? `<span class="pill green">${icon('check')}Bekeken</span>` : ''}</div><div class="video-speed" role="group" aria-label="Afspeelsnelheid">${VIDEO_SPEEDS.map(speed => `<button type="button" data-action="video-speed" data-speed="${speed}" aria-pressed="${videoStore.speed === speed}">${String(speed).replace('.', ',')}×</button>`).join('')}</div></div><span class="eyebrow video-eyebrow">VIDEO ${videoLabel(v)}${v.summary ? ' · SAMENVATTING' : ''}</span><h2 class="video-title" id="video-title">${escapeHtml(v.title)}</h2><div class="video-controls">${button('Vorige video', 'video-prev', previous ? `aria-label="Vorige video: ${escapeHtml(`${videoLabel(previous)} ${previous.title}`)}"` : 'disabled', 'secondary', 'back')}${button(watched ? 'Markeer als niet bekeken' : 'Markeer als bekeken', 'video-watched', `aria-pressed="${watched}"`, 'ghost', 'check')}${button('Volgende video', 'video-next', next ? `aria-label="Volgende video: ${escapeHtml(`${videoLabel(next)} ${next.title}`)}"` : 'disabled', 'primary', 'arrow')}</div>`;
  }
  function videoQueueHtml(v) {
    const chapter = videoLibrary.chapters.find(c => c.number === v.chapter);
    const done = chapter.videos.filter(item => isWatched(item.id)).length;
    const nextChapter = videoLibrary.chapters.find(c => c.number > v.chapter);
    return `<div class="video-queue-head"><span class="eyebrow">IN DIT HOOFDSTUK</span><h2>${escapeHtml(chapter.title)}</h2><p class="section-subtitle">${done} van ${chapter.videos.length} bekeken · ${formatSpan(sumDuration(chapter.videos))}</p>${progressBar(percent(done, chapter.videos.length), `Bekeken in ${chapter.title}`)}</div><ol class="video-queue-list">${chapter.videos.map(item => {
      const current = item.id === v.id, seen = isWatched(item.id);
      return `<li><button type="button" class="video-queue-item ${current ? 'current' : ''} ${seen ? 'watched' : ''}" data-action="play-video" data-video="${item.id}" ${current ? 'aria-current="true"' : ''}><span class="video-queue-num" aria-hidden="true">${seen && !current ? icon('check') : item.number}</span><span class="video-queue-title">${escapeHtml(item.title)}<span class="sr-only">${current ? ', nu geselecteerd' : ''}${seen ? ', bekeken' : ''}</span></span><span class="video-queue-time">${formatClock(item.duration)}</span></button></li>`;
    }).join('')}</ol>${nextChapter ? `<button type="button" class="text-button video-queue-next" data-action="play-video" data-video="${nextChapter.videos[0].id}">Naar ${escapeHtml(nextChapter.title.toLowerCase())} ${icon('arrow')}</button>` : ''}`;
  }
  function videoCardHtml(v) {
    const current = v.id === videoStore.current, seen = isWatched(v.id);
    const badge = current ? `<span class="video-badge current">${icon('play')}Nu geselecteerd</span>` : seen ? `<span class="video-badge watched">${icon('check')}Bekeken</span>` : '';
    return `<button type="button" class="video-card ${current ? 'current' : ''} ${seen ? 'watched' : ''}" data-action="play-video" data-video="${v.id}" ${current ? 'aria-current="true"' : ''} aria-label="Video ${videoLabel(v)}: ${escapeHtml(v.title)}, ${formatClock(v.duration)}${seen ? ', bekeken' : ''}${current ? ', nu geselecteerd' : ''}"><span class="video-thumb">${videoThumb(v, `<span class="video-duration">${formatClock(v.duration)}</span>${badge}`)}</span><span class="video-card-body"><span class="video-card-label">Video ${videoLabel(v)}${v.summary ? ' · samenvatting' : ''}</span><strong>${escapeHtml(v.title)}</strong></span></button>`;
  }
  function videoChaptersHtml() {
    return videoLibrary.chapters.map(c => {
      const done = c.videos.filter(v => isWatched(v.id)).length;
      return `<section class="video-chapter panel" id="video-chapter-${c.number}" aria-labelledby="video-chapter-title-${c.number}"><div class="video-chapter-head"><span class="video-chapter-number" aria-hidden="true">${c.number}</span><div><h3 id="video-chapter-title-${c.number}">${escapeHtml(c.title)}</h3><p class="section-subtitle">${c.videos.length} ${c.videos.length === 1 ? 'video' : "video's"} · ${formatSpan(sumDuration(c.videos))}</p></div><div class="video-chapter-progress"><span>${done} van ${c.videos.length} bekeken</span>${progressBar(percent(done, c.videos.length), `Bekeken in ${c.title}`)}</div></div><div class="video-grid">${c.videos.map(v => videoCardHtml(videoById.get(v.id))).join('')}</div></section>`;
    }).join('');
  }
  function renderVideos() {
    const list = videoLibrary.list;
    if (!list.length) {
      $('#view').innerHTML = `<div class="page-container">${heading('NUTHEORIE VIDEOLESSEN', "Video's", 'Bekijk de videolessen van NuTheorie.')}<div class="notice warning"><strong>De videolijst kon niet worden geladen.</strong> Zet videos.js en de map Nutheorie_Videos naast index.html en open de pagina opnieuw.</div></div>`;
      return;
    }
    const v = videoById.get(videoStore.current) || list[0];
    videoStore.current = v.id;
    const first = videoLibrary.chapters[0].number, last = videoLibrary.chapters.at(-1).number;
    $('#view').innerHTML = `<div class="page-container videos-page">${heading('NUTHEORIE VIDEOLESSEN', "Leer met de NuTheorie-video's", `Alle ${list.length} videolessen, op volgorde van hoofdstuk ${first} tot en met ${last}. Kies een video of ga verder waar je gebleven was. Je kijkvoortgang blijft alleen op dit apparaat.`)}<section class="stats-grid video-stats" id="video-stats" aria-label="Jouw kijkvoortgang">${videoStatsHtml()}</section><section class="video-stage" id="video-stage" aria-label="Videospeler"><div class="video-player-card"><div class="video-frame"><video id="video-player" controls preload="metadata" playsinline data-video="${v.id}" ${v.poster ? `poster="${escapeHtml(v.poster)}"` : ''} src="${escapeHtml(videoPath(v))}" aria-labelledby="video-title">Je browser kan deze video niet afspelen.</video></div><div class="video-info" id="video-info">${videoInfoHtml(v)}</div><div class="video-message" id="video-message" role="status" aria-live="polite"></div></div><aside class="video-queue panel" id="video-queue" aria-label="Video's in dit hoofdstuk">${videoQueueHtml(v)}</aside></section><section class="section-space" aria-labelledby="video-overview-title"><div class="section-header"><div class="section-title"><div class="eyebrow">HOOFDSTUK ${first} TOT EN MET ${last}</div><h2 id="video-overview-title">Alle video's</h2><p class="section-subtitle">Op volgorde van hoofdstuk en les. Klik op een video om hem af te spelen.</p></div></div><nav class="video-chapter-nav" aria-label="Spring naar een hoofdstuk">${videoLibrary.chapters.map(c => `<button type="button" class="choice-button" data-action="video-chapter" data-chapter="${c.number}">${escapeHtml(c.title)}</button>`).join('')}</nav><div id="video-chapters">${videoChaptersHtml()}</div></section><section class="panel section-space video-check" aria-labelledby="video-check-title"><div class="section-header"><div class="section-title"><h2 id="video-check-title">Werken alle video's?</h2><p class="section-subtitle">Je browser laadt elke video, speelt hem kort af zonder geluid en springt naar het einde. Dit duurt ongeveer een minuut.</p></div>${button("Controleer alle video's", 'video-check', '', 'secondary', 'search')}</div><div id="video-check-results"></div></section><div class="video-footer">${button('Kijkvoortgang wissen', 'video-reset', '', 'ghost', 'repeat')}</div></div>`;
    setupVideoPlayer();
  }
  function currentPlayer() {
    const player = $('#video-player');
    return player && typeof player.addEventListener === 'function' && player.isConnected ? player : null;
  }
  function videoMessage(html) {
    const box = $('#video-message');
    if (box) box.innerHTML = html;
  }
  function saveVideoPosition() {
    const player = currentPlayer();
    const v = player && videoById.get(player.dataset.video);
    if (!v || !Number.isFinite(player.currentTime)) return;
    if (player.ended || (Number.isFinite(player.duration) && player.currentTime >= player.duration - 10)) delete videoStore.positions[v.id];
    else if (player.currentTime > 5) videoStore.positions[v.id] = Math.floor(player.currentTime);
    saveVideoStore();
  }
  function rerender(selector, html) {
    const element = $(selector);
    if (!element) return;
    const active = document.activeElement;
    const focused = active && typeof element.contains === 'function' && element.contains(active) ? active : null;
    let key = null;
    if (focused?.dataset?.video) key = `[data-video="${focused.dataset.video}"]`;
    else if (focused?.dataset?.action) key = `[data-action="${focused.dataset.action}"]${focused.dataset.speed ? `[data-speed="${focused.dataset.speed}"]` : ''}`;
    element.innerHTML = html;
    if (key) element.querySelector(key)?.focus({ preventScroll: true });
  }
  function refreshVideoInfo() {
    const v = videoById.get(videoStore.current);
    if (v) rerender('#video-info', videoInfoHtml(v));
  }
  function refreshVideoPage() {
    const v = videoById.get(videoStore.current);
    if (!v || !currentPlayer()) return;
    rerender('#video-stats', videoStatsHtml());
    refreshVideoInfo();
    rerender('#video-queue', videoQueueHtml(v));
    rerender('#video-chapters', videoChaptersHtml());
  }
  function setVideoWatched(id, watched) {
    if (!videoById.has(id)) return;
    const has = videoStore.watched.includes(id);
    if (watched && !has) videoStore.watched.push(id);
    if (!watched && has) videoStore.watched = videoStore.watched.filter(item => item !== id);
    saveVideoStore();
    refreshVideoPage();
  }
  function scrollBehavior() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
  function selectVideo(id, autoplay = true) {
    const v = videoById.get(id);
    if (!v) return;
    const player = currentPlayer();
    if (!player) { videoStore.current = v.id; saveVideoStore(); navigate('videos'); return; }
    $('#video-stage')?.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    if (player.dataset.video === v.id) {
      player.focus({ preventScroll: true });
      if (autoplay && player.paused) player.play().catch(() => {});
      return;
    }
    saveVideoPosition();
    videoStore.current = v.id;
    saveVideoStore();
    player.pause();
    player.dataset.video = v.id;
    if (v.poster) player.setAttribute('poster', v.poster); else player.removeAttribute('poster');
    player.src = videoPath(v);
    player.load();
    videoMessage('');
    refreshVideoPage();
    player.focus({ preventScroll: true });
    if (autoplay) player.play().catch(() => {});
  }
  function setupVideoPlayer() {
    const player = currentPlayer();
    if (!player) return;
    player.addEventListener('loadedmetadata', () => {
      const v = videoById.get(player.dataset.video);
      if (!v) return;
      player.playbackRate = videoStore.speed;
      const saved = videoStore.positions[v.id];
      if (saved && saved > 5 && Number.isFinite(player.duration) && saved < player.duration - 10) {
        player.currentTime = saved;
        videoMessage(`<div class="notice video-notice">${icon('clock')}<span>Je gaat verder op ${formatClock(saved)}, waar je de vorige keer stopte.</span><button type="button" class="text-button" data-action="video-restart">Vanaf het begin</button></div>`);
      }
    });
    player.addEventListener('timeupdate', () => {
      const v = videoById.get(player.dataset.video);
      if (!v || !Number.isFinite(player.duration) || !player.duration) return;
      if (Date.now() - videoSavedAt > 5000) { videoSavedAt = Date.now(); saveVideoPosition(); }
      if (player.currentTime >= player.duration * 0.9 && !isWatched(v.id)) setVideoWatched(v.id, true);
    });
    player.addEventListener('pause', saveVideoPosition);
    player.addEventListener('ratechange', () => {
      if (VIDEO_SPEEDS.includes(player.playbackRate) && player.playbackRate !== videoStore.speed) { videoStore.speed = player.playbackRate; saveVideoStore(); refreshVideoInfo(); }
    });
    player.addEventListener('ended', () => {
      const v = videoById.get(player.dataset.video);
      if (!v) return;
      delete videoStore.positions[v.id];
      setVideoWatched(v.id, true);
      const next = neighbourVideo(v.id, 1);
      videoMessage(next
        ? `<div class="notice video-notice success">${icon('check')}<span>Klaar met video ${videoLabel(v)}. Volgende: <strong>${videoLabel(next)} ${escapeHtml(next.title)}</strong></span><button type="button" class="button primary small" data-action="play-video" data-video="${next.id}">${icon('play')}Speel af</button></div>`
        : `<div class="notice video-notice success">${icon('trophy')}<span>Dit was de laatste video. Je hebt alle hoofdstukken doorlopen!</span></div>`);
    });
    player.addEventListener('error', () => {
      const v = videoById.get(player.dataset.video);
      if (!v || !player.error) return;
      videoMessage(`<div class="notice warning video-notice">${icon('info')}<span><strong>Deze video kan niet worden afgespeeld.</strong> ${mediaErrorText(player.error)} Controleer of de map <code>Nutheorie_Videos</code> naast index.html staat en of <code>${escapeHtml(v.file.replace(/^Nutheorie_Videos\//, ''))}</code> bestaat. Project van GitHub gekloond? Haal de video's dan op met <code>git lfs pull</code>.</span></div>`);
    });
  }
  function probeVideo(probe, v) {
    return new Promise(resolve => {
      let finished = false, poll = null;
      const done = (ok, detail) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        clearInterval(poll);
        probe.onloadedmetadata = probe.onerror = probe.onseeked = probe.oncanplay = null;
        try { probe.pause(); } catch (_) { /* niets te pauzeren */ }
        resolve({ v, ok, detail });
      };
      const timeout = setTimeout(() => done(false, 'Geen reactie binnen 20 seconden.'), 20000);
      probe.onerror = () => done(false, mediaErrorText(probe.error));
      probe.onloadedmetadata = () => {
        if (!probe.videoWidth || !Number.isFinite(probe.duration)) { done(false, 'Geen bruikbaar beeld gevonden.'); return; }
        if (v.duration && Math.abs(probe.duration - v.duration) > 2) { done(false, `Afwijkende speelduur: ${formatClock(probe.duration)} in plaats van ${formatClock(v.duration)}. Is het bestand vervangen?`); return; }
        const start = probe.currentTime, begun = Date.now();
        probe.play().then(() => {
          poll = setInterval(() => {
            if (probe.currentTime > start + 0.25) {
              clearInterval(poll);
              probe.pause();
              const ready = () => done(true, `Speelt af · ${probe.videoWidth}×${probe.videoHeight} · ${formatClock(probe.duration)}`);
              probe.onseeked = () => { if (probe.readyState >= 2) ready(); else probe.oncanplay = ready; };
              probe.currentTime = Math.max(0, probe.duration - 1.5);
            } else if (Date.now() - begun > 10000) done(false, 'De video start niet.');
          }, 100);
        }).catch(error => done(false, `Afspelen lukt niet (${error.name}).`));
      };
      probe.src = videoPath(v);
      probe.load();
    });
  }
  async function checkAllVideos() {
    const box = $('#video-check-results');
    const trigger = $('[data-action="video-check"]');
    if (videoCheckRunning || !box) return;
    videoCheckRunning = true;
    trigger.disabled = true;
    currentPlayer()?.pause();
    const list = videoLibrary.list;
    box.innerHTML = `<div class="video-check-live"><video class="video-check-preview" muted playsinline preload="auto" aria-hidden="true"></video><div class="video-check-status" role="status" aria-live="polite"></div></div>`;
    const probe = box.querySelector('video');
    probe.muted = true;
    const status = box.querySelector('.video-check-status');
    const results = [];
    for (const [index, v] of list.entries()) {
      if (route !== 'videos' || !box.isConnected) break;
      status.innerHTML = `<strong>Bezig met video ${index + 1} van ${list.length}</strong><span>${escapeHtml(`${videoLabel(v)} ${v.title}`)}</span>${progressBar(percent(index, list.length), 'Voortgang van de controle')}`;
      results.push(await probeVideo(probe, v));
    }
    probe.removeAttribute('src');
    probe.load();
    videoCheckRunning = false;
    if (!box.isConnected) return;
    trigger.disabled = false;
    if (results.length < list.length) { box.innerHTML = ''; return; }
    const failed = results.filter(r => !r.ok);
    box.innerHTML = `${failed.length
      ? `<div class="notice warning video-notice" role="status">${icon('info')}<span><strong>${failed.length} van ${list.length} video's werken niet.</strong> Controleer of de map Nutheorie_Videos naast index.html staat en of de bestandsnamen niet zijn veranderd. Project van GitHub gekloond? Haal de video's dan op met <code>git lfs pull</code>.</span></div>`
      : `<div class="notice video-notice success" role="status">${icon('check')}<span><strong>Alle ${list.length} video's werken.</strong> Elke video is in deze browser geladen, kort afgespeeld en tot het einde doorgespoeld.</span></div>`}<details class="video-check-details" ${failed.length ? 'open' : ''}><summary>Bekijk de uitslag per video</summary><ol class="video-check-list">${results.map(r => `<li class="${r.ok ? 'ok' : 'fail'}"><span class="video-check-icon">${icon(r.ok ? 'check' : 'close')}</span><span><strong>${videoLabel(r.v)} ${escapeHtml(r.v.title)}</strong><small>${escapeHtml(r.detail)}</small></span></li>`).join('')}</ol></details>`;
  }
  function resetVideoProgress() {
    showConfirm('Kijkvoortgang wissen?', 'Alle vinkjes "bekeken" en opgeslagen afspeelposities worden gewist. Je oefenvoortgang blijft bewaard.', 'Wissen', () => {
      videoStore = { ...blankVideoStore(), current: videoStore.current, speed: videoStore.speed };
      saveVideoStore();
      videoMessage('');
      refreshVideoPage();
      toast('Je kijkvoortgang is gewist.');
    });
  }
  function renderSources() {
    $('#view').innerHTML = `<div class="page-container">${heading('WETEN WAAR JE OP BOUWT', 'Bronnen & over deze trainer', 'Zelfstandig oefenen, met heldere uitleg en controleerbare informatie.')}<div class="setup-layout"><section class="panel prose"><h2>Eigen oefenmateriaal</h2><p>TheorieTrainer bevat ${questions.length} vragen over negen onderwerpen voor Rijbewijs B: ${questions.filter(q => originOf(q) === 'trainer').length} eigen TheorieTrainer-vragen, ${questions.filter(q => originOf(q) === 'nutheorie').length} vragen uit het NuTheorie-oefenmateriaal (PDF, met originele antwoorden en uitleg) en ${questions.filter(q => originOf(q) === 'nieuw').length} nieuwe vragen, waaronder rijhulpsystemen (ADAS). Het is een onafhankelijke oefenwebsite en geen product van of erkende examentraining door het CBR. De oefeningen zijn geen voorspelling van je echte examenuitslag.</p><h3>Hoe zijn de vragen samengesteld?</h3><p>Wettelijke regels zijn waar mogelijk gecontroleerd bij officiële Nederlandse bronnen op 24 oktober 2026. Bij elke uitleg kun je de gebruikte bron openen. Verkeersinzichtvragen vragen naar een veilige aanpak in de beschreven situatie; een veiligheidsadvies is niet automatisch een wettelijke verplichting.</p><h3>Regels kunnen veranderen</h3><p>Volg onderweg altijd de actuele verkeersborden, aanwijzingen en regels. Bekijk de bron als je een uitzondering wilt nalezen. De lokale vragenverzameling wordt niet automatisch bijgewerkt.</p><h3>De oefentoets en het CBR</h3><p>Het proefexamen toont 52 vragen, waarvan 50 meetellen, in 30 minuten; 44/50 is de slaaggrens. Het CBR gebruikt daarnaast twee oefenvragen vooraf; die zijn niet inbegrepen. Deze trainer gebruikt tekstvragen en zelfgetekende verkeersillustraties; de officiële toets bevat ook andere vraagvormen en animaties.</p><h3>Privé en offline</h3><p>De app werkt volledig op je apparaat, ook door index.html te openen. Er zijn geen accounts, trackers, advertenties of externe lettertypen. Je antwoorden, favorieten en instellingen blijven in de lokale opslag van je browser. Alleen als je zelf een bronlink opent, bezoek je een externe website.</p><p>De getoonde grafieken tellen beantwoorde vragen. Onbeantwoorde examenvragen tellen wel als fout in de examenuitslag en komen in je herhaallijst.</p></section><aside class="info-card"><h2>Meer weten?</h2><div class="source-list"><a href="https://www.cbr.nl/nl/rijbewijs-halen/auto/theorie-examen-auto/hoe-gaat-het-theorie-examen-auto" target="_blank" rel="noopener noreferrer"><strong>CBR ${icon('arrow')}</strong><span>De actuele examenopzet</span></a><a href="https://wetten.overheid.nl/BWBR0004825/" target="_blank" rel="noopener noreferrer"><strong>RVV 1990 ${icon('arrow')}</strong><span>Verkeersregels en verkeerstekens</span></a><a href="https://www.rijksoverheid.nl/onderwerpen/verkeersveiligheid" target="_blank" rel="noopener noreferrer"><strong>Rijksoverheid ${icon('arrow')}</strong><span>Verkeersveiligheid en regels</span></a><a href="https://www.rdw.nl/particulier/voertuigen/auto" target="_blank" rel="noopener noreferrer"><strong>RDW ${icon('arrow')}</strong><span>Voertuigen, kenteken en APK</span></a><a href="https://swov.nl/nl/factsheets" target="_blank" rel="noopener noreferrer"><strong>SWOV ${icon('arrow')}</strong><span>Onderzoek naar verkeersveiligheid</span></a></div></aside></div></div>`;
  }

  function showConfirm(title, message, confirmLabel, callback) {
    focusBeforeDialog = document.activeElement;
    confirmCallback = callback;
    $('#modal-root').innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><span class="category-icon blue">${icon('info')}</span><h2 id="modal-title">${escapeHtml(title)}</h2><p id="modal-description">${escapeHtml(message)}</p><div class="modal-actions">${button('Annuleren', 'cancel-dialog', '', 'secondary')}${button(escapeHtml(confirmLabel), 'confirm-dialog', '', 'primary')}</div></section></div>`;
    document.body.classList.add('dialog-open');
    for (const element of [$('.skip-link'), $('.site-header'), $('#main-content'), $('.footer')]) element.inert = true;
    $('[data-action="cancel-dialog"]').focus();
  }
  function closeConfirm() {
    $('#modal-root').innerHTML = '';
    confirmCallback = null;
    imageDialogOpen = false;
    document.body.classList.remove('dialog-open');
    for (const element of [$('.skip-link'), $('.site-header'), $('#main-content'), $('.footer')]) element.inert = false;
    if (focusBeforeDialog?.isConnected) focusBeforeDialog.focus({ preventScroll: true });
    focusBeforeDialog = null;
  }
  function resetProgress() {
    showConfirm('Je voortgang echt resetten?', 'Alle resultaten, foute vragen, favorieten, badges en je huidige sessie worden verwijderd. Je kleurthema blijft bewaard. Dit kun je niet ongedaan maken.', 'Ja, alles resetten', () => {
      clearInterval(timer);
      const theme = state.theme;
      state = blankProgress();
      state.theme = theme;
      lastResult = null;
      saveProgress();
      navigate('dashboard');
      toast('Je voortgang is gereset. Klaar voor een nieuwe start.');
    });
  }
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const dark = state.theme === 'dark';
    $('#theme-toggle').innerHTML = icon(dark ? 'sun' : 'moon');
    $('#theme-toggle').setAttribute('aria-label', `${dark ? 'Lichte' : 'Donkere'} modus inschakelen`);
    $('#theme-toggle').setAttribute('aria-pressed', String(dark));
  }
  function closeMenu() {
    $('.main-nav').classList.remove('open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#menu-toggle').setAttribute('aria-label', 'Navigatie openen');
  }
  function navigate(target) {
    if (location.hash === '#' + target) renderRoute();
    else location.hash = target;
  }
  function renderRoute() {
    closeConfirm();
    saveVideoPosition();
    const allowed = ['dashboard', 'practice', 'videos', 'exam', 'wrong', 'favorites', 'reviewed', 'progress', 'library', 'quiz', 'results', 'sources'];
    const requested = location.hash.slice(1);
    route = allowed.includes(requested) ? requested : 'dashboard';
    if (route === 'quiz' && !state.active) route = 'dashboard';
    if (route === 'results' && !lastResult) route = 'dashboard';
    const pages = { dashboard: updateDashboard, practice: renderPractice, exam: renderExam, wrong: renderLibrary, favorites: renderLibrary, reviewed: renderLibrary, library: renderLibrary, progress: renderStatistics, quiz: loadQuestion, results: renderResults, sources: renderSources, videos: renderVideos };
    pages[route]();
    document.querySelectorAll('.nav-link').forEach(link => {
      const current = link.dataset.page === route || (route === 'quiz' && link.dataset.page === (state.active?.mode === 'exam' ? 'exam' : 'practice'));
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    closeMenu();
    const title = $('#view h1');
    document.title = `${title?.textContent || 'Dashboard'} — TheorieTrainer`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    title?.focus({ preventScroll: true });
  }
  function onAction(event) {
    if (imageDialogOpen && event.target.classList.contains('image-backdrop')) { closeConfirm(); return; }
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    const action = target.dataset.action;
    switch (action) {
      case 'navigate': navigate(target.dataset.target); break;
      case 'category': setup.category = categories[Number(target.dataset.category)]?.name || 'all'; setup.difficulty = 'all'; navigate('practice'); break;
      case 'count': setup.count = Number(target.dataset.count); renderPractice(); $(`[data-count="${setup.count}"]`)?.focus({ preventScroll: true }); break;
      case 'start-practice': startPractice(); break;
      case 'start-exam': startExam(); break;
      case 'daily': startDaily(); break;
      case 'collection': startCollection(target.dataset.mode); break;
      case 'resume': navigate('quiz'); startTimer(); break;
      case 'favorite': toggleFavorite(Number(target.dataset.id)); break;
      case 'answer': submitAnswer(Number(target.dataset.answer)); break;
      case 'next': nextQuestion(); break;
      case 'previous': if (state.active && state.active.position > 0) { state.active.position--; saveProgress(); loadQuestion(true); } break;
      case 'jump': if (state.active && integer(Number(target.dataset.position), state.active.items.length - 1)) { state.active.position = Number(target.dataset.position); saveProgress(); loadQuestion(true); } break;
      case 'finish': requestFinish(); break;
      case 'retry': if (lastResult) { if (lastResult.mode === 'exam') startExam(); else if (lastResult.mode === 'daily') startDaily(); else if (lastResult.mode === 'practice') { setup = lastResult.settings || setup; startPractice(); } else startCollection(lastResult.mode, lastResult.ids); } break;
      case 'retry-wrong': if (lastResult) startCollection('wrong', lastResult.rows.filter(row => !row.unscored && !row.correct).map(row => row.q.id)); break;
      case 'library-page': libraryPage = Math.max(1, Number(target.dataset.page)); renderLibraryItems(); $('.filter-bar')?.scrollIntoView({ block: 'start' }); $('#question-search')?.focus({ preventScroll: true }); break;
      case 'clear-filters': libraryFilters = { search: '', category: 'all', difficulty: 'all' }; libraryPage = 1; renderLibrary(); $('#question-search').focus(); break;
      case 'reset': resetProgress(); break;
      case 'zoom-image': showImage(Number(target.dataset.id)); break;
      case 'close-image': closeConfirm(); break;
      case 'image-detail': { const zoomed = $('.image-modal-canvas').classList.toggle('is-enlarged'); target.setAttribute('aria-pressed', String(zoomed)); target.textContent = zoomed ? 'Hele afbeelding' : '2× vergroten'; break; }
      case 'cancel-dialog': closeConfirm(); break;
      case 'confirm-dialog': { const callback = confirmCallback; closeConfirm(); callback?.(); break; }
      case 'play-video': selectVideo(target.dataset.video, true); break;
      case 'video-next': { const next = neighbourVideo(videoStore.current, 1); if (next) selectVideo(next.id, true); break; }
      case 'video-prev': { const previous = neighbourVideo(videoStore.current, -1); if (previous) selectVideo(previous.id, true); break; }
      case 'video-watched': setVideoWatched(videoStore.current, !isWatched(videoStore.current)); break;
      case 'video-speed': {
        const speed = Number(target.dataset.speed);
        if (VIDEO_SPEEDS.includes(speed)) { videoStore.speed = speed; saveVideoStore(); const player = currentPlayer(); if (player) player.playbackRate = speed; refreshVideoInfo(); }
        break;
      }
      case 'video-restart': { const player = currentPlayer(); if (player) { player.currentTime = 0; delete videoStore.positions[videoStore.current]; saveVideoStore(); videoMessage(''); player.play().catch(() => {}); } break; }
      case 'video-chapter': $(`#video-chapter-${Number(target.dataset.chapter)}`)?.scrollIntoView({ block: 'start', behavior: scrollBehavior() }); break;
      case 'video-check': checkAllVideos(); break;
      case 'video-reset': resetVideoProgress(); break;
    }
  }
  function initApp() {
    if (questions.length < 200 || questionById.size !== questions.length) {
      $('#view').innerHTML = '<div class="page-container"><div class="notice warning"><h1>De vragen konden niet worden geladen</h1><p>Zet index.html, style.css, questions.js en script.js samen in dezelfde map en open index.html opnieuw.</p></div></div>';
      return;
    }
    console.info(`Aantal vragen geladen: ${questions.length}`);
    applyTheme();
    document.addEventListener('click', onAction);
    $('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main-content').focus(); });
    window.addEventListener('hashchange', renderRoute);
    document.addEventListener('change', event => {
      switch (event.target.id) {
        case 'practice-category': setup.category = event.target.value; renderPractice(); $('#practice-category').focus(); break;
        case 'practice-difficulty': setup.difficulty = event.target.value; renderPractice(); $('#practice-difficulty').focus(); break;
        case 'practice-source': setup.source = sources.some(o => o.value === event.target.value) ? event.target.value : 'all'; renderPractice(); $('#practice-source').focus(); break;
        case 'smart-practice': setup.smart = event.target.checked; break;
        case 'instinker-practice': setup.instinker = event.target.checked; renderPractice(); $('#instinker-practice').focus(); break;
        case 'image-practice': setup.imageOnly = event.target.checked; renderPractice(); $('#image-practice').focus(); break;
        case 'library-category': libraryFilters.category = event.target.value; libraryPage = 1; renderLibraryItems(); break;
        case 'library-difficulty': libraryFilters.difficulty = event.target.value; libraryPage = 1; renderLibraryItems(); break;
      }
    });
    document.addEventListener('input', event => {
      if (event.target.id === 'question-search') { libraryFilters.search = event.target.value; libraryPage = 1; renderLibraryItems(); }
    });
    // A missing optional local image must never leave a broken-image icon in the UI.
    document.addEventListener('error', event => {
      if (event.target instanceof HTMLImageElement) {
        event.target.closest('.question-image')?.remove();
        if (event.target.closest('.video-thumb, .video-promo-thumb')) event.target.remove();
      }
    }, true);
    $('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveProgress(); });
    // Een link naar de pagina waar je al bent geeft geen hashchange: ga dan zelf terug naar boven.
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]:not(.skip-link)');
      if (!link || link.getAttribute('href') !== location.hash) return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      $('#view h1')?.focus({ preventScroll: true });
    });
    $('.main-nav').addEventListener('click', event => { if (event.target.closest('.nav-link')) closeMenu(); });
    // Een tik buiten het uitgeklapte menu sluit het menu (pointerdown: ook op de videospeler, die zelf de klik afhandelt).
    document.addEventListener('pointerdown', event => {
      if ($('.main-nav').classList.contains('open') && !event.target.closest('.main-nav, #menu-toggle')) closeMenu();
    });
    $('#menu-toggle').addEventListener('click', () => {
      const open = $('.main-nav').classList.toggle('open');
      $('#menu-toggle').setAttribute('aria-expanded', String(open));
      $('#menu-toggle').setAttribute('aria-label', open ? 'Navigatie sluiten' : 'Navigatie openen');
    });
    document.addEventListener('keydown', event => {
      if (confirmCallback || imageDialogOpen) {
        if (event.key === 'Escape') { event.preventDefault(); closeConfirm(); }
        if (event.key === 'Tab') {
          const focusables = [...$('.modal').querySelectorAll('button, a[href], input, select, [tabindex="0"]')];
          const first = focusables[0], last = focusables.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      } else if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tickTimer(); else saveVideoPosition(); });
    window.addEventListener('pagehide', saveVideoPosition);
    renderRoute();
    startTimer();
    if (storageWarning) toast(storageWarning);
  }
  initApp();
})();
