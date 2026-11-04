'use strict';

// Adds a question-specific, locally rendered scene for each illustrated extension item.
// Run after traffic-images.js to rebuild the complete 217-image manifest/gallery.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const R = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const L = (x, y, x2, y2, stroke, width = 4, extra = '') => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const C = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const T = (x, y, value, size = 17, fill = '#223247', extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${esc(value)}</text>`;
const tree = (x, y, r) => `<path d="M${x} ${y + r}v${r + 12}" stroke="#748e78" stroke-width="5"/><circle cx="${x}" cy="${y}" r="${r}" fill="#91b39a"/><circle cx="${x - r * .38}" cy="${y + 3}" r="${r * .55}" fill="#a4c4a5"/>`;
const car = (x, y, color = '#3459e6', label = 'JIJ', direction = 'up', kind = 'car') => {
  const width = kind === 'truck' ? 58 : kind === 'bus' ? 55 : 44;
  const height = kind === 'truck' ? 115 : kind === 'bus' ? 110 : 76;
  const angle = direction === 'down' ? 180 : direction === 'left' ? -90 : direction === 'right' ? 90 : 0;
  return `<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="${-width / 2 - 3}" y="${-height / 2 + 12}" width="${width + 6}" height="${height - 24}" rx="7" fill="#253244"/><rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="9" fill="${color}" stroke="#26354a" stroke-width="2"/><rect x="${-width / 2 + 5}" y="${-height / 2 + 15}" width="${width - 10}" height="16" rx="4" fill="#d9edf1"/><rect x="${-width / 2 + 5}" y="${height / 2 - 29}" width="${width - 10}" height="13" rx="3" fill="#d9edf1"/><path d="M${-width / 2 + 4} ${-height / 2 + 5}h9m${width - 22} 0h9" stroke="#fff1bf" stroke-width="4"/><text x="0" y="4" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">${esc(label)}</text></g>`;
};
const bicycle = (x, y, color = '#26384a') => `<g stroke="${color}" fill="none" stroke-width="4"><circle cx="${x - 14}" cy="${y + 10}" r="10"/><circle cx="${x + 15}" cy="${y + 10}" r="10"/><path d="m${x - 14} ${y + 10} 11-21 12 21h-23l12-21m-3 0h12m-1 0 9-3"/><circle cx="${x + 3}" cy="${y - 18}" r="4" fill="${color}" stroke="none"/></g>`;
const walker = (x, y) => `<circle cx="${x}" cy="${y - 14}" r="6" fill="#27394b"/><path d="m${x} ${y - 8}-3 19m2-13 12 5m-13 8-9 17m10-17 9 17" stroke="#27394b" stroke-width="6" stroke-linecap="round"/>`;
const arrow = (x, y, direction, color = '#fff', size = 1) => {
  const paths = { up: 'M0 20V-22m-15 15L0 -22 15 -7', down: 'M0 -20V22m-15-15L0 22 15 7', left: 'M20 0H-22m15-15L-22 0l15 15', right: 'M-20 0h42M7-15 22 0 7 15' };
  return `<path d="${paths[direction]}" transform="translate(${x} ${y}) scale(${size})" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
};
const background = (id, wet = false) => {
  const trees = [tree(54, 75 + id % 40, 22), tree(746, 115 + id % 33, 25), tree(72, 422 - id % 31, 24), tree(725, 395 - id % 27, 21)].join('');
  const clouds = id % 4 === 0 ? '<path d="M94 80q9-18 26-5 12-18 25 0 19-3 18 13H94Z" fill="#fff" opacity=".68"/>' : '';
  const rain = wet ? `<g stroke="#a6c4dd" stroke-width="3" opacity=".58">${Array.from({ length: 13 }, (_, i) => L(38 + (i * 61 + id * 3) % 730, 20, 25 + (i * 61 + id * 3) % 730, 42, '#a6c4dd', 3)).join('')}</g>` : '';
  return R(0, 0, 800, 500, wet ? '#cbd9df' : '#e6eee5') + clouds + trees + rain;
};
function signSymbol(q) {
  const p = q.question.toLowerCase();
  const red = '#d63e46', blue = '#175ca8', dark = '#222c38';
  if (p.includes('a2')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/><text x="0" y="14" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="${dark}">30</text><path d="m-38 42 76-84" stroke="${red}" stroke-width="8"/>`;
  if (p.includes('c19')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/><text x="0" y="-2" text-anchor="middle" font-family="Arial" font-size="27" font-weight="700" fill="${dark}">2,0</text><text x="0" y="23" text-anchor="middle" font-family="Arial" font-size="15" fill="${dark}">m</text>`;
  if (p.includes('a1') || p.includes('maximumsnelheidsbord')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/><text x="0" y="14" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="${dark}">50</text>`;
  if (p.includes('g12a') || (p.includes('fiets') && p.includes('bromfiets') && p.includes('rond blauw'))) return C(0, 0, 55, blue) + `<g fill="white"><circle cx="-21" cy="11" r="12" fill="none" stroke="white" stroke-width="5"/><circle cx="10" cy="11" r="12" fill="none" stroke="white" stroke-width="5"/><path d="m-21 11 11-23 14 23h-25l11-23m-3 0h11" fill="none" stroke="white" stroke-width="4"/><circle cx="27" cy="-20" r="4"/><path d="m25-14-8 14 13 4 7 12m-20-16-10 14" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/></g>`;
  if (p.includes('losse steenslag') || p.includes('steentjes')) return `<path d="M0-61 59 47h-118Z" fill="#fff" stroke="${red}" stroke-width="9"/><g fill="${dark}"><circle cx="-15" cy="15" r="6"/><circle cx="4" cy="1" r="5"/><circle cx="20" cy="24" r="5"/><path d="m-22-6 6-11 5 12m21-14 6 13 6-11"/></g>`;
  if (p.includes('c1') || p.includes('toegangsverbod') || p.includes('geslotenverklaring')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/>`;
  if (p.includes('b6') || p.includes('haaientanden')) return `<path d="M-59-46h118L0 60Z" fill="#fff" stroke="${red}" stroke-width="9" stroke-linejoin="round"/>`;
  if (p.includes('b7') || p.includes('stop')) return `<path d="M-34-56h68l47 47v68L34 106h-68l-47-47v-68Z" transform="scale(.75)" fill="${red}"/><text x="0" y="8" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="white">STOP</text>`;
  if (p.includes('b1')) return `<path d="M0-60 60 0 0 60-60 0Z" fill="#f5d138" stroke="#26313c" stroke-width="5"/>`;
  if (p.includes('b2')) return `<path d="M0-60 60 0 0 60-60 0Z" fill="#f5d138" stroke="#26313c" stroke-width="5"/><path d="m-38 38 76-76" stroke="#26313c" stroke-width="8"/>`;
  if (p.includes('andreaskruis')) return `<path d="m-46-53 92 106m0-106L-46 53" stroke="#fff" stroke-width="24"/><path d="m-46-53 92 106m0-106L-46 53" stroke="#d73b40" stroke-width="8"/>`;
  if (p.includes('f5')) return `<path d="M-30 50V-43m-15 15 15-15 15 15" stroke="${red}" stroke-width="12" fill="none"/><path d="M31-50V42m-15-15 15 15 15-15" stroke="#222c38" stroke-width="12" fill="none"/>`;
  if (p.includes('f2')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="#657181" stroke-width="5"/><path d="M-38-18h34v24h-34Zm37 5h18l13 13v12H-1Z" fill="#263342"/><path d="M5-36h34v24H5Zm37 5h14l10 11v8H42Z" fill="#3971bd"/><circle cx="-26" cy="12" r="6" fill="#263342"/><circle cx="16" cy="12" r="6" fill="#263342"/><circle cx="18" cy="-4" r="6" fill="#263342"/><circle cx="53" cy="-4" r="6" fill="#263342"/>`;
  if (p.includes('e7')) return R(-50, -50, 100, 100, blue, 'rx="8"') + `<path d="M-32 7h39v25h-39Zm39 7h21l13 14v7H7Z" fill="white"/><circle cx="-22" cy="34" r="6" fill="white"/><circle cx="30" cy="34" r="6" fill="white"/>`;
  if (p.includes('e2') || p.includes('stopverbod')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/><path d="m-35-35 70 70m0-70-70 70" stroke="${red}" stroke-width="10"/>`;
  if (p.includes('e1') || p.includes('parkeerverbod')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="11"/><path d="m-34 36 68-72" stroke="${red}" stroke-width="10"/>`;
  if (p.includes('vrachtwagen') || p.includes('laadklep')) return `<circle cx="0" cy="0" r="54" fill="#fff" stroke="${red}" stroke-width="10"/><path d="M-36-20h42v31h-42Zm42 10h22l13 15v17H6Z" fill="${dark}"/><circle cx="-23" cy="18" r="7" fill="${dark}"/><circle cx="29" cy="18" r="7" fill="${dark}"/>`;
  if (p.includes('parkeergelegenheid') || p.includes('parkeerverbod')) return R(-50, -50, 100, 100, blue, 'rx="8"') + `<text x="0" y="19" text-anchor="middle" font-family="Arial" font-size="60" font-weight="700" fill="white">P</text>`;
  if (p.includes('witte licht') && p.includes('spoorweg')) return R(-52, -52, 104, 104, '#35445a', 'rx="12"') + C(0, 0, 22, '#fff', 'stroke="#cbd6df" stroke-width="5"') + `<path d="M-5 50v9m10-9v9" stroke="#29384a" stroke-width="4"/>`;
  if (p.includes('rijstrooklicht') && p.includes('witte pijl')) return R(-62, -43, 124, 86, '#27364a', 'rx="8"') + `<path d="M-34 10 20-20m-5 1 18 1-5 17" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (p.includes('matrixbord') || p.includes('rijstrook')) return `<path d="M-50-25 0 0-50 25m100-50L0 0l50 25" fill="none" stroke="${red}" stroke-width="12"/>`;
  if (p.includes('pijl') || p.includes('richting')) {
    const d = p.includes('links') ? 'M36 0H-28m0 0 24-24m-24 24 24 24' : p.includes('rechts') ? 'M-36 0h64m0 0L4-24m24 24L4 24' : 'M0 36V-28m0 0-24 24m24-24 24 24';
    return C(0, 0, 54, blue) + `<path d="${d}" fill="none" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return R(-48, -48, 96, 96, blue, 'rx="8"') + `<text x="0" y="10" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="white">${p.includes('fiet') ? 'FIETS' : 'INFO'}</text>`;
}
function signScene(q) {
  const id = q.id, wet = /regen|nat wegdek/i.test(q.question);
  let s = background(id, wet);
  s += R(0, 274, 800, 226, '#d5dbdd') + R(0, 310, 800, 145, '#667587') + L(0, 382, 800, 382, '#f7f4e8', 4, 'stroke-dasharray="28 22"');
  if (q.question.toLowerCase().includes('spoorweg')) {
    s += L(515, 280, 515, 458, '#4b5661', 8) + L(532, 280, 532, 458, '#4b5661', 8) + Array.from({ length: 7 }, (_, i) => L(501, 293 + i * 24, 546, 293 + i * 24, '#8a7765', 4)).join('');
  }
  s += car(390 + (id % 5) * 8, 415, '#3459e6', 'JIJ', 'up');
  s += L(616, 138, 616, 262, '#7a8998', 7) + `<g transform="translate(616 128)">${signSymbol(q)}</g>`;
  if (/onderbord|tijden|schooldagen|nat wegdek|vergunninghouders/i.test(q.question)) {
    s += R(554, 194, 124, 46, '#fff', 'rx="3" stroke="#47576a" stroke-width="3"') + T(616, 222, /08|7–9|schooldagen/i.test(q.question) ? 'TIJDEN' : 'ONDERBORD', 11, '#26364a', 'text-anchor="middle" font-weight="700"');
  }
  s += T(40, 470, `BORDSITUATIE · ${q.question.match(/\b(?:A1|B[1-7]|C19|C1|D[1-7]|E[1-2]|F5|G11|L3)\b/)?.[0] || 'VERKEERSTEKEN'}`, 12, '#fff', 'font-weight="700"');
  return s;
}
function junctionScene(q) {
  const id = q.id, p = q.question.toLowerCase(), wet = /regen|nat wegdek/i.test(p);
  let s = background(id, wet);
  s += R(286, 0, 228, 500, '#647386') + R(0, 146, 800, 208, '#647386');
  const shift = (id % 4) * 8;
  s += L(400, 0, 400, 140, '#f8f5e8', 4, `stroke-dasharray="${18 + shift} 16"`) + L(400, 360, 400, 500, '#f8f5e8', 4, `stroke-dasharray="${18 + shift} 16"`);
  s += L(0, 250, 282, 250, '#f8f5e8', 4, `stroke-dasharray="${18 + shift} 16"`) + L(518, 250, 800, 250, '#f8f5e8', 4, `stroke-dasharray="${18 + shift} 16"`);
  const names = [['auto|tram|bus|ambulance|voertuig|bestuurder', 'AUTO', '#e8aa51'], ['fietser|fiets', 'FIETS', '#4d9d83'], ['voetganger|kind|persoon|loopt', 'LOPER', '#d48b65']];
  if (/tram/i.test(p)) s += `<path d="M110 194H690" stroke="#c3b8a2" stroke-width="4"/><path d="M110 205H690" stroke="#c3b8a2" stroke-width="4"/><rect x="208" y="174" width="125" height="44" rx="9" fill="#c76f69" stroke="#28364a" stroke-width="2"/><rect x="220" y="181" width="92" height="13" fill="#dcebf0"/><text x="271" y="211" text-anchor="middle" font-family="Arial" font-size="11" fill="white" font-weight="700">TRAM</text>`;
  if (/uitritconstructie/i.test(p)) s += R(290, 78, 220, 35, '#d8d0c3') + R(290, 78, 220, 12, '#f6f3eb') + T(400, 67, 'DOORLOPEND TROTTOIR', 10, '#33465a', 'text-anchor="middle" font-weight="700"');
  if (/militaire colonne/i.test(p)) {
    s += car(244, 254, '#a6ac96', 'MILITAIR', 'right') + car(314, 254, '#a6ac96', 'MILITAIR', 'right') + car(384, 254, '#a6ac96', 'MILITAIR', 'right');
    s += R(517, 96, 32, 78, '#35445a', 'rx="5"') + C(533, 115, 8, '#d9474a') + C(533, 136, 7, '#c6a958') + C(533, 156, 7, '#64886e');
  }
  const count = names.filter(([word]) => new RegExp(word, 'i').test(p)).length;
  const fromRight = /rechts/i.test(p), fromLeft = /links/i.test(p);
  s += car(405, 420, '#3459e6', 'JIJ', 'up');
  if (fromRight || count > 1) s += car(690, 264, '#e8aa51', 'AUTO', 'left');
  if (fromLeft && !/tram/i.test(p)) s += car(110, 236, '#d87567', 'AUTO', 'right');
  if (/fietser|fiets/i.test(p)) s += bicycle(496, 272, '#e3bb54');
  if (/voetganger|kind|persoon|trottoir/i.test(p)) s += walker(318, 288);
  if (/haaientanden|b6/i.test(p)) s += `<path d="M345 337h110l-55 42Z" fill="#fff"/>`;
  if (/zebrapad|voetgangersoversteekplaats/i.test(p)) s += Array.from({ length: 6 }, (_, i) => R(290 + i * 38, 146, 22, 20, '#fff')).join('');
  s += T(29, 477, 'KRUISPUNT · SCHEMATISCH BOVENAANZICHT', 12, '#fff', 'font-weight="700"');
  return s;
}
function speedScene(q) {
  const id = q.id, p = q.question.toLowerCase(), wet = /regen|nat|glad|mist|aquaplaning/i.test(p);
  let s = background(id, wet);
  const slant = id % 3;
  s += R(0, 290, 800, 210, '#d7ddde') + R(0, 322, 800, 132, '#657486');
  s += L(0, 388 + slant * 4, 800, 388 + slant * 4, '#f7f4e8', 4, 'stroke-dasharray="30 22"');
  s += car(392, 408, '#3459e6', 'JIJ', 'right');
  const digits = q.question.match(/\b(\d{2,3})\s?(?:km\/u)?/i)?.[1] || '50';
  const cx = 633, cy = 188;
  s += L(cx, cy + 57, cx, 297, '#758598', 7) + C(cx, cy, 55, '#fff', 'stroke="#d63e46" stroke-width="11"') + T(cx, cy + 12, digits, 36, '#293749', 'text-anchor="middle" font-weight="700"');
  if (/blauw vierkant|adviessnelheid/i.test(p)) s = s.replace(/<circle cx="633" cy="188"[^>]*>.*?<\/circle>/, R(cx - 55, cy - 55, 110, 110, '#175ca8', 'rx="8"') + C(cx, cy, 43, '#fff') + T(cx, cy + 12, digits, 33, '#293749', 'text-anchor="middle" font-weight="700"'));
  if (/aanhanger|caravan/i.test(p)) s += `<path d="M431 406h27" stroke="#25364a" stroke-width="7"/>${R(457, 381, 57, 47, '#d8e0e5', 'rx="8" stroke="#26364a" stroke-width="3"')}${C(470, 432, 6, '#27374a')}${C(501, 432, 6, '#27374a')}`;
  if (/woon-erf|woonerf/i.test(p)) s += R(34, 52, 186, 56, '#f7f9f8', 'rx="8"') + T(127, 86, 'WOONERF', 15, '#31445a', 'text-anchor="middle" font-weight="700"');
  s += T(31, 477, wet ? 'WEGDEK EN ZICHT BEÏNVLOEDEN DE KEUZE' : 'MAXIMUMSNELHEID · BORD EN WEGSITUATIE', 12, '#fff', 'font-weight="700"');
  return s;
}
function highwayScene(q) {
  const id = q.id, p = q.question.toLowerCase(), wet = /regen|mist|nat/i.test(p);
  let s = background(id, wet);
  const lanes = 2 + id % 3, roadLeft = 149, roadWidth = 502;
  s += R(0, 0, 800, 500, wet ? '#cbd9df' : '#e4ece3') + R(roadLeft - 20, 0, roadWidth + 40, 500, '#d1d8dc') + R(roadLeft, 0, roadWidth, 500, '#677587');
  for (let i = 1; i < lanes; i++) {
    const x = roadLeft + (roadWidth / lanes) * i;
    s += L(x, 0, x, 500, '#f5f2e7', 4, `stroke-dasharray="${23 + (id % 5)} 18"`);
  }
  s += L(roadLeft, 0, roadLeft, 500, '#f5f2e7', 4) + L(roadLeft + roadWidth, 0, roadLeft + roadWidth, 500, '#f5f2e7', 4);
  const laneX = (lane) => roadLeft + roadWidth * (lane + .5) / lanes;
  s += car(laneX(Math.max(0, lanes - 1)), 410, '#3459e6', 'JIJ', 'up');
  if (/invoeg/i.test(p)) {
    s += R(667, 0, 133, 500, '#d0d8db') + R(687, 0, 87, 500, '#718095') + L(687, 0, 687, 500, '#fff', 4, 'stroke-dasharray="18 18"');
    s += car(725, 265, '#e4aa54', 'AUTO', 'up') + arrow(706, 347, 'left', '#fff', .7);
  } else if (/uitvoeg|afrit/i.test(p)) {
    s += `<path d="M535 500 Q535 330 660 255 T810 170" fill="none" stroke="#d1d8dc" stroke-width="132"/><path d="M535 500 Q535 330 660 255 T810 170" fill="none" stroke="#718095" stroke-width="88"/><path d="M535 500 Q535 330 660 255 T810 170" fill="none" stroke="#f5f2e7" stroke-width="4" stroke-dasharray="20 18"/>`;
    s += arrow(561, 340, 'right', '#fff', .7);
  } else if (/rode kruis|kruis/i.test(p)) {
    s += R(265, 34, 150, 75, '#34445b', 'rx="8"') + T(340, 88, '×', 64, '#ef5e57', 'text-anchor="middle" font-weight="700"');
  } else if (/fiets/i.test(p)) {
    s += bicycle(440, 242, '#edc45d');
  }
  if (/tegenligger|inhalen|inhaal/i.test(p)) s += car(laneX(0), 147, '#e8aa51', 'AUTO', 'down');
  if (/bus/i.test(p)) s += car(laneX(Math.max(0, lanes - 2)), 225, '#c8786e', 'BUS', 'down', 'bus');
  if (/vrachtwagen|combinatie|aanhanger/i.test(p)) s += car(laneX(Math.max(0, lanes - 2)), 180, '#d9ded9', 'VRACHT', 'up', 'truck');
  s += T(30, 477, 'RIJSTROKEN · SCHEMATISCH BOVENAANZICHT', 12, '#fff', 'font-weight="700"');
  return s;
}
function makeSvg(q) {
  let drawing;
  if (q.illustrationKind === 'sign') drawing = signScene(q);
  else if (q.illustrationKind === 'junction') drawing = junctionScene(q);
  else if (q.illustrationKind === 'speed') drawing = speedScene(q);
  else drawing = highwayScene(q);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img"><title>${esc(q.imageAlt)}</title>${drawing}</svg>\n`;
}

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'questions-extra.js'), 'utf8'), context);
const questions = context.window.THEORY_QUESTIONS_EXTRA.filter(q => q.image);
if (questions.length !== 100) throw new Error(`Expected 100 illustrated extension questions, found ${questions.length}`);
for (const q of questions) {
  const svg = makeSvg(q);
  fs.writeFileSync(path.join(root, q.image), svg);
}
const manifestPath = path.join(__dirname, 'manifest.json');
const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const additions = questions.map(q => ({ id: q.id, image: q.image, alt: q.imageAlt, note: `Zelfgetekende ${q.illustrationKind}-situatie; gekoppeld aan vraag ${q.id}. Elementen tonen alleen de situatie uit de vraag en markeren geen juist antwoord.` }));
const combined = [...existing.filter(row => !questions.some(q => q.id === row.id)), ...additions].sort((a, b) => a.id - b.id);
fs.writeFileSync(manifestPath, JSON.stringify(combined, null, 2) + '\n');
const gallery = combined.map(row => ({ ...row, question: row.id > 220 ? questions.find(q => q.id === row.id)?.question : null }));
const cards = gallery.map(row => `<figure><img loading="lazy" src="../${row.image}" alt="${esc(row.alt)}"><figcaption><strong>Vraag ${row.id}</strong>${row.question ? ` ${esc(row.question)}` : ''}</figcaption></figure>`).join('');
fs.writeFileSync(path.join(__dirname, 'overzicht.html'), `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eigen verkeersillustraties — overzicht</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;font:14px Arial,sans-serif;background:#f2f5f8;color:#25334b}header{max-width:1500px;margin:0 auto 20px}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;max-width:1500px;margin:auto}figure{margin:0;background:#fff;border:1px solid #dce2e9;border-radius:12px;overflow:hidden}img{display:block;width:100%;height:auto}figcaption{padding:10px 12px;line-height:1.45;min-height:55px}strong{color:#3459e6}@media(max-width:850px){main{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){body{padding:10px}main{grid-template-columns:1fr}}</style><header><h1>${combined.length} eigen verkeersillustraties</h1><p>Zelfgetekende situaties bij verkeersvragen. Tekens en posities tonen de casus, niet het antwoord.</p><a href="../index.html">Naar de trainer</a></header><main>${cards}</main></html>\n`);
console.log(`${questions.length} extra SVG's gemaakt; manifest bevat nu ${combined.length} illustraties.`);
