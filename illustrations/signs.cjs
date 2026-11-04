'use strict';

// Original geometric drawings. Shapes and meanings checked against RVV 1990,
// Bijlage 1: https://wetten.overheid.nl/BWBR0004825/#Bijlage1
// L3 colour layout: https://zoek.officielebekendmakingen.nl/stcrt-2010-20348.pdf
// No downloaded artwork, fonts or embedded remote assets.
const red = '#d52f3b', blue = '#1757ad', ink = '#17212d', white = '#fff';
const circle = `<circle cx="60" cy="60" r="51" fill="${white}" stroke="${red}" stroke-width="10"/>`;
const disc = `<circle cx="60" cy="60" r="54" fill="${blue}" stroke="white" stroke-width="3"/>`;
const square = `<rect x="7" y="7" width="106" height="106" rx="5" fill="${blue}" stroke="white" stroke-width="3"/>`;
const upright = '<path d="M53 96V48H35L60 21l25 27H67v48Z" fill="white"/>';
const carFace = (color, transform = '') => `<g transform="${transform}" fill="${color}"><path d="m28 47 6-20q1-4 6-4h40q5 0 6 4l6 20 3 5v29H25V52Zm10-16-4 17h52l-4-17Z" fill-rule="evenodd"/><rect x="27" y="76" width="10" height="15" rx="3"/><rect x="83" y="76" width="10" height="15" rx="3"/><path d="M31 59h12v7H31Zm46 0h12v7H77Z" fill="white"/></g>`;
const motor = `<g fill="${ink}" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round"><circle cx="31" cy="75" r="12" fill="none" stroke-width="6"/><circle cx="87" cy="75" r="12" fill="none" stroke-width="6"/><circle cx="60" cy="35" r="7" stroke="none"/><path d="m58 46-12 14 22 3 9 12M49 60H34l15 15h20l-7-16m-1-13 12 6 9 23M73 52l9-6" fill="none" stroke-width="7"/></g>`;
const walker = `<g fill="${ink}" stroke="${ink}" stroke-linecap="round"><circle cx="61" cy="39" r="5" stroke="none"/><path d="m59 48-8 15 13 8 10 14m-11-14-16 15m10-33 14 8 8-4" fill="none" stroke-width="6"/></g>`;
const symbols = {
  A1: circle + `<text x="60" y="77" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="700" fill="${ink}">50</text>`,
  B1: `<path d="m60 5 55 55-55 55L5 60Z" fill="white" stroke="${ink}" stroke-width="2"/><path d="m60 17 43 43-43 43-43-43Z" fill="#f8cf36" stroke="${ink}" stroke-width="2"/>`,
  B2: `<path d="m60 5 55 55-55 55L5 60Z" fill="white" stroke="${ink}" stroke-width="2"/><path d="m60 17 43 43-43 43-43-43Z" fill="#f8cf36" stroke="${ink}" stroke-width="2"/><path d="m20 69 49-49M26 76l50-50M33 83l50-50M40 90l50-50M47 97l50-50" stroke="${ink}" stroke-width="4"/>`,
  B6: `<path d="M8 14h104L60 107Z" fill="white" stroke="${red}" stroke-width="10" stroke-linejoin="round"/>`,
  B7: `<path d="M39 6h42l33 33v42l-33 33H39L6 81V39Z" fill="${red}" stroke="white" stroke-width="3"/><path d="M41 12h38l29 29v38l-29 29H41L12 79V41Z" fill="none" stroke="white" stroke-width="2"/><text x="60" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="white">STOP</text>`,
  C1: circle,
  C2: `<circle cx="60" cy="60" r="55" fill="${red}" stroke="white" stroke-width="3"/><rect x="25" y="49" width="70" height="22" fill="white"/>`,
  C3: `<rect x="26" y="4" width="68" height="112" rx="4" fill="${blue}" stroke="white" stroke-width="3"/>${upright}`,
  C7: circle + `<g fill="${ink}"><path d="M23 41h45v37H23Zm47 12h15l11 15v10H70Z"/><path d="M75 57h8l7 10H75Z" fill="white"/><circle cx="36" cy="80" r="8"/><circle cx="81" cy="80" r="8"/></g>`,
  C11: circle + motor,
  C12: circle + carFace(ink, 'translate(19 -1) scale(.68)') + `<g transform="translate(19 36) scale(.68)">${motor}</g>`,
  D1: disc + [0, 120, 240].map(a => `<g transform="rotate(${a} 60 60)"><path d="M67 24A37 37 0 0 0 25 55" fill="none" stroke="white" stroke-width="8"/><path d="m14 49 12 21 15-19Z" fill="white"/></g>`).join(''),
  D2: disc + `<g transform="rotate(135 60 60)">${upright}</g>`,
  D4: disc + upright,
  D5: disc + '<path d="M31 94V61q0-15 15-15h25V28l28 25-28 25V60H48q-3 0-3 5v29Z" fill="white"/>',
  D6: disc + '<path d="M43 97V47H27l23-26 23 26H57v15h16V46l24 23-24 23V76H57v21Z" fill="white"/>',
  D7: disc + '<path d="M53 96V63H41v17L15 56l26-24v17h38V32l26 24-26 24V63H67v33Z" fill="white"/>',
  E1: `<circle cx="60" cy="60" r="51" fill="${blue}" stroke="${red}" stroke-width="10"/><path d="m24 96 72-72" stroke="${red}" stroke-width="10"/>`,
  E2: `<circle cx="60" cy="60" r="51" fill="${blue}" stroke="${red}" stroke-width="10"/><path d="m24 96 72-72m-72 0 72 72" stroke="${red}" stroke-width="10"/>`,
  F1: circle + carFace(red, 'translate(6 18) scale(.53)') + carFace(ink, 'translate(53 18) scale(.53)'),
  G1: `<rect x="17" y="4" width="86" height="112" rx="4" fill="${blue}" stroke="white" stroke-width="3"/><path d="M30 98 47 24h9L46 98Zm44 0L64 24h9l17 74Z" fill="white"/><path d="M27 53h66v9H27Z" fill="white"/>`,
  G3: square + carFace(white, 'translate(4 2) scale(.93)').replaceAll('fill="white"/></g>', `fill="${blue}"/></g>`),
  G5: square + '<g fill="white"><path d="M15 48 34 28l20 20v38H15Zm7 4v14h9V52Zm15 0v14h9V52Z" fill-rule="evenodd"/><path d="M13 96h94v5H13Z"/><path d="m70 66 6-15h23l6 15v19H69Zm9-11-4 12h25l-4-12Z" fill-rule="evenodd"/><rect x="71" y="82" width="7" height="9" rx="2"/><rect x="97" y="82" width="7" height="9" rx="2"/><circle cx="57" cy="52" r="5"/><path d="m55 61-5 13 7 9-1 10m0-10 10 9m-13-27 11 6" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/><circle cx="43" cy="89" r="4"/></g>',
  J21: `<path d="m60 7 54 101H6Z" fill="white" stroke="${red}" stroke-width="9" stroke-linejoin="round"/><g fill="${ink}" stroke="${ink}" stroke-linecap="round"><circle cx="52" cy="43" r="6" stroke="none"/><circle cx="77" cy="58" r="5" stroke="none"/><path d="m51 54-9 20 12 7 7 15m-16-23-12 20m14-33 16 5 9-1m2 4-5 14 12 8m-12-8-9 13m10-20 13 4" fill="none" stroke-width="6"/></g>`,
  L2: square + `<path d="m60 18 45 80H15Z" fill="white"/><path d="m26 89 9-7h7l-8 7Zm16 0 7-7h7l-4 7Zm17 0 1-7h7l2 7Zm18 0-4-7h7l8 7Z" fill="${ink}"/>${walker}`,
  L3: `<rect x="20" y="4" width="80" height="112" rx="4" fill="${blue}" stroke="white" stroke-width="3"/><rect x="29" y="14" width="62" height="88" rx="2" fill="white"/><g fill="${ink}"><rect x="39" y="25" width="42" height="62" rx="7"/><rect x="42" y="82" width="8" height="12" rx="2"/><rect x="70" y="82" width="8" height="12" rx="2"/><rect x="44" y="33" width="32" height="23" rx="2" fill="white"/><path d="M46 63h28v4H46Z" fill="white"/><circle cx="47" cy="76" r="4" fill="white"/><circle cx="73" cy="76" r="4" fill="white"/></g>`
};

const files = {
  A1: 'maximum-50.svg', B1: 'voorrangsweg.svg', B2: 'einde-voorrangsweg.svg',
  B6: 'voorrang-verlenen.svg', B7: 'stop.svg', C1: 'gesloten-weg.svg', C2: 'verboden-in-te-rijden.svg',
  C3: 'eenrichtingsweg.svg', C7: 'gesloten-voor-vrachtautos.svg', C11: 'gesloten-voor-motorfietsen.svg',
  C12: 'gesloten-voor-motorvoertuigen.svg', D1: 'rotonde.svg', D2: 'rechts-passeren.svg',
  D4: 'verplicht-rechtdoor.svg', D5: 'verplicht-rechtsaf.svg', D6: 'rechtdoor-of-rechtsaf.svg',
  D7: 'linksaf-of-rechtsaf.svg', E1: 'parkeerverbod.svg', E2: 'stopverbod.svg', F1: 'inhaalverbod.svg',
  G1: 'autosnelweg.svg', G3: 'autoweg.svg', G5: 'erf.svg', J21: 'kinderen.svg',
  L2: 'voetgangersoversteekplaats.svg', L3: 'bushalte.svg'
};

function questions(h) {
  const records = [];
  const add = (id, alt, svg, note) => records.push({ id, alt, svg, note });
  // A consistent enlarged sign inset keeps symbol details legible on phones.
  // The adjacent road remains a neutral context, without answer arrows or badges.
  const detail = (code, size = 188) => h.rect(25, 74, 230, 329, '#f8fbfd', 20, 'stroke="#dae3e7" stroke-width="2"') + h.rect(137, 240, 9, 125, '#8c99a8', 3) + `<g transform="translate(${140-size/2} ${205-size/2}) scale(${size/120})">${symbols[code]}</g>`;
  const trees = () => h.tree(670, 65, 30) + h.tree(715, 411, 37);
  const scene = (code, type, content) => h.base(type) + trees() + content + detail(code);

  add(36, 'Een groot geel ruitvormig bord met witte rand naast een weg met een blauwe auto.',
    scene('B1', 'vertical', h.car(455, 378, 0, 'blue', 'JIJ') + h.sign('B1', 552, 215, 62) + h.car(345, 110, 180, 'amber')),
    'B1: gele ruit, geen aanvullende voorrangsuitspraak in het beeld.');
  add(37, 'Een omgekeerd driehoekig bord met rode rand. Rechts nadert een blauwe auto een kruispunt met witte driehoeken op het wegdek.',
    scene('B6', 'cross', h.teeth(416, 365, 4) + h.car(455, 438, 0, 'blue', 'JIJ') + h.car(645, 200, 270, 'amber') + h.sign('B6', 554, 364, 63)),
    'B6 bij de noordwaartse aanrijrichting; kruisend voertuig rijdt aan zijn rechterzijde.');
  add(38, 'Een rood achthoekig bord met het woord STOP. Rechts staat een blauwe auto voor een brede witte lijn bij een kruispunt.',
    scene('B7', 'cross', h.line(404, 365, 502, 365, '#fff', 8) + h.car(455, 427, 0, 'blue', 'JIJ') + h.sign('B7', 550, 355, 64) + h.building(590, 30, 140, 72)),
    'B7 met stopstreep, geen zichtbare wachttijd of antwoordindicatie.');
  add(39, 'Een rond wit bord met rode rand, zonder symbool of onderbord. Op de weg ernaast nadert een blauwe auto.',
    scene('C1', 'vertical', h.car(455, 405, 0, 'blue', 'JIJ') + h.sign('C1', 550, 194, 63) + h.building(597, 140, 130, 104)),
    'C1 is leeg vanbinnen en heeft geen uitzonderingsonderbord.');
  add(40, 'Een rood rond bord met een witte horizontale balk. Een blauwe auto nadert vanaf de onderzijde een straat met dat bord.',
    scene('C2', 'vertical', h.car(455, 407, 0, 'blue', 'JIJ') + h.sign('C2', 552, 210, 64) + h.building(598, 160, 128, 120) + h.person(541, 309)),
    'C2 staat tegenover de naderende bestuurder; geen auto rijdt het verbod al voorbij.');
  add(41, 'Een rond wit bord met rode rand en een zwart vrachtwagensymbool. Rechts is een straat met een blauwe personenauto te zien.',
    scene('C7', 'vertical', h.car(455, 395, 0, 'blue', 'JIJ') + h.sign('C7', 551, 208, 64) + h.building(586, 160, 168, 105) + h.rect(600, 280, 140, 14, '#c1ccd4', 4)),
    'Vrachtwagenpictogram getekend, geen bestelwagen of personenauto als symbool.');
  add(42, 'Een rond wit bord met rode rand en een zwarte motorfiets met bestuurder. Rechts loopt een rustige tweerichtingsweg.',
    scene('C11', 'vertical', h.car(455, 413, 0, 'blue', 'JIJ') + h.sign('C11', 550, 235, 65) + h.person(520, 353) + h.building(605, 190, 130, 80)),
    'C11 heeft uitsluitend het motorfietspictogram, geen autopictogram.');
  add(43, 'Een rond wit bord met rode rand, een auto bovenin en een motorfiets eronder. Een blauwe auto nadert het bord.',
    scene('C12', 'vertical', h.car(455, 425, 0, 'blue', 'JIJ') + h.sign('C12', 552, 222, 65) + h.tree(628, 260, 45) + h.person(520, 354)),
    'C12 bevat zowel auto als motorfiets. Geen uitgebeelde overtreding.');
  add(44, 'Een blauw rond bord met drie witte rondlopende pijlen. Rechts is een ronde rijbaan om een groen eiland zichtbaar.',
    scene('D1', 'roundabout', h.car(452, 438, 0, 'blue', 'JIJ') + h.car(516, 211, 335, 'amber') + h.sign('D1', 566, 383, 64)),
    'D1 geeft linksom rondgaande pijlen. Er zijn bewust geen voorrangsborden of haaientanden toegevoegd.');
  add(45, 'Een blauw rond bord met een witte schuin naar rechtsonder wijzende pijl. Op de weg staat een smalle verkeersheuvel.',
    scene('D2', 'vertical', h.rect(379, 185, 43, 140, '#dde4e5', 21, 'stroke="#b8c5cd" stroke-width="3"') + h.sign('D2', 401, 225, 61) + h.car(455, 407, 0, 'blue', 'JIJ')),
    'D2 pijl wijst rechtsonder; heuvel ligt middenin rijbaan.');
  add(46, 'Een blauw rond bord met één witte pijl naar boven. Rechts nadert een blauwe auto een kruising.',
    scene('D4', 'cross', h.car(455, 424, 0, 'blue', 'JIJ') + h.sign('D4', 555, 358, 64) + h.car(345, 75, 180, 'white')),
    'D4 rechtuit; auto staat nog voor het kruispunt zonder richtingpijl op wegdek.');
  add(47, 'Een blauw rond bord met een gebogen witte pijl naar rechts. Rechts staat een blauwe auto op de aanrijweg van een kruispunt.',
    scene('D5', 'cross', h.car(455, 424, 0, 'blue', 'JIJ') + h.sign('D5', 552, 360, 64) + h.building(590, 35, 150, 70)),
    'D5 uitvoering rechtsaf; geen voertuigpositie na de manoeuvre.');
  add(48, 'Een blauw rond bord met witte pijlen naar boven en naar rechts. Een blauwe auto nadert een kruispunt.',
    scene('D6', 'cross', h.car(455, 432, 0, 'blue', 'JIJ') + h.sign('D6', 558, 360, 64) + h.tree(624, 77, 39) + h.car(681, 300, 90, 'white')),
    'D6 heeft exact rechtdoor en rechtsaf, zoals gevraagd.');
  add(49, 'Een blauw rond bord met witte pijlen naar links en naar rechts. De aanrijweg rechts eindigt op een dwarsstraat.',
    scene('D7', 'cross', h.rect(288, 0, 224, 149, '#dce8dc') + h.rect(269, 118, 262, 31, '#dce1e3') + h.car(455, 429, 0, 'blue', 'JIJ') + h.sign('D7', 550, 359, 64)),
    'D7 links/rechts en een T-aansluiting ondersteunen dezelfde situatieschets.');
  add(50, 'Een blauw rond bord met rode rand en één rode diagonale streep. Het bord staat langs de rechterkant van een straat.',
    scene('E1', 'vertical', h.car(455, 405, 0, 'blue', 'JIJ') + h.sign('E1', 551, 233, 65) + h.building(603, 150, 132, 110) + h.person(548, 318)),
    'E1 met één schuine streep, geen gele markering of onderbord.');
  add(51, 'Een blauw rond bord met rode rand en twee rode diagonale strepen. Naast de weg staat een rij gebouwen.',
    scene('E2', 'vertical', h.car(455, 410, 0, 'blue', 'JIJ') + h.sign('E2', 550, 217, 65) + h.building(604, 145, 130, 95) + h.building(604, 278, 130, 86)),
    'E2 rood kruis is onderdeel van het echte bord, geen beoordelingsoverlay.');
  add(52, 'Een blauw rechthoekig bord met twee witte wegbanen en een witte dwarsbalk. Rechts ligt een brede weg met meerdere rijstroken.',
    scene('G1', 'motorway', h.car(490, 399, 0, 'blue', 'JIJ') + h.car(370, 168, 0, 'amber') + h.sign('G1', 672, 223, 74)),
    'G1 herkenbaar als witte wegen met viaduct op blauw; geen snelheidsgetal toegevoegd.');
  add(53, 'Een blauw vierkant bord met de voorkant van een witte auto. Rechts loopt een weg met twee rijrichtingen.',
    scene('G3', 'vertical', h.car(455, 400, 0, 'blue', 'JIJ') + h.sign('G3', 555, 221, 69) + h.car(345, 113, 180, 'white')),
    'G3 witte auto op blauw; geen autosnelwegsymbool.');
  add(54, 'Een blauw vierkant bord met een huis, een klein persoon, een bal en een auto. Rechts staan woningen aan een smalle straat.',
    scene('G5', 'vertical', h.rect(292, 0, 216, 500, '#a7a9a4') + Array.from({ length: 12 }, (_, i) => h.line(293, i * 44, 507, i * 44, '#babcb6', 2)).join('') + h.car(455, 408, 0, 'blue', 'JIJ') + h.sign('G5', 551, 212, 74) + h.building(608, 140, 120, 100) + h.person(553, 335)),
    'G5 erf met wooncontext, maar geen parkeersuggestie of gemarkeerd correct parkeervak.');
  add(55, 'Een driehoekig bord met rode rand en twee zwarte lopende figuren van verschillende grootte. Rechts is een straat met een schoolgebouw.',
    scene('J21', 'vertical', h.car(455, 413, 0, 'blue', 'JIJ') + h.sign('J21', 553, 210, 70) + h.building(606, 145, 137, 123) + h.rect(620, 278, 110, 68, '#d8c7ac', 6) + h.person(551, 313, '#e0a15b', .75)),
    'J21 twee kinderen; geen oversteekplaats of verplicht voetpad toegevoegd.');
  add(56, 'Een rond wit bord met rode rand en het zwarte getal 50. Een blauwe auto rijdt op de weg naast het bord.',
    scene('A1', 'vertical', h.car(455, 411, 0, 'blue', 'JIJ') + h.sign('A1', 552, 213, 65) + h.building(610, 170, 127, 80)),
    'A1 gebruikt 50 als concreet zichtbaar getal; geen minimum- of adviesvorm.');
  add(57, 'Een rond wit bord met rode rand en twee autosymbolen, links rood en rechts zwart. Op de weg rijden een blauwe en een witte auto achter elkaar.',
    scene('F1', 'vertical', h.car(455, 417, 0, 'blue', 'JIJ') + h.car(455, 205, 0, 'white') + h.sign('F1', 552, 276, 66)),
    'F1 kleurenvolgorde rood links, zwart rechts. Auto blijft achter voorligger.');
  add(58, 'Een blauw rechthoekig bord met een zwart bussymbool in een wit vlak. Rechts staat een bus langs een stoep met een wachthokje.',
    scene('L3', 'vertical', h.car(455, 403, 0, 'blue', 'JIJ') + h.car(475, 177, 0, 'white', '', 'bus') + h.sign('L3', 555, 183, 77) + h.rect(591, 141, 82, 76, '#c3d8df', 4, 'stroke="#768b96" stroke-width="4"') + h.rect(600, 190, 64, 9, '#8b9ca9', 2) + h.person(550, 265)),
    'L3 blauw-wit bord met zwarte bus. Bus en wachtplek dienen als visuele context.');

  // Road-marking questions: seven independent overhead situations.
  add(59, 'Een blauwe auto rijdt achter een witte auto. Een ononderbroken witte middenlijn scheidt hen van een tegemoetkomende amberkleurige auto.',
    h.base('vertical') + h.rect(391, 0, 18, 500, '#687684') + h.line(400, 0, 400, 500, '#fff', 5) + h.car(455, 398, 0, 'blue', 'JIJ') + h.car(455, 217, 0, 'white') + h.car(345, 87, 180, 'amber') + h.tree(205, 90, 43) + h.tree(637, 360, 52),
    'Één doorgetrokken middenstreep zonder onderbroken buur; bestuurder blijft rechts.');
  add(60, 'Een blauwe auto rijdt rechts van twee witte middenlijnen. De lijn direct naast deze auto is onderbroken; de andere lijn is ononderbroken.',
    h.base('vertical') + h.rect(383, 0, 34, 500, '#687684') + h.line(391, 0, 391, 500, '#fff', 5) + h.line(409, 0, 409, 500, '#fff', 5, 'stroke-dasharray="28 24"') + h.car(455, 403, 0, 'blue', 'JIJ') + h.car(455, 161, 0, 'gray') + h.tree(648, 118, 48) + h.building(95, 320, 125, 93),
    'Onderbroken lijn x409 ligt aan bestuurderskant x455; geen inhaalbeweging getekend.');
  add(61, 'Een blauwe auto nadert een kruispunt. Vlak voor de dwarsstraat staat een rij witte driehoeken op de eigen weghelft. Een amberkleurige auto nadert van rechts.',
    h.base('cross') + h.teeth(413, 363, 5) + h.car(455, 431, 0, 'blue', 'JIJ') + h.car(663, 200, 270, 'amber') + h.car(154, 300, 90, 'white') + h.tree(146, 63, 45) + h.tree(669, 420, 47),
    'Haaientanden alleen op eigen aanrijstrook; geen STOP-bord of stopstreep.');
  add(62, 'Langs de rechterrand van een straat loopt een ononderbroken gele streep. Een blauwe auto rijdt op de rijbaan en naast de stoep staan gebouwen.',
    h.base('vertical') + h.line(506, 25, 506, 475, '#f2cb49', 7) + h.car(455, 378, 0, 'blue', 'JIJ') + h.car(345, 113, 180, 'white') + h.building(585, 60, 150, 110) + h.building(585, 258, 150, 130) + h.person(550, 220),
    'Gele doorgetrokken kantmarkering. Geen uit-/instappende persoon, geen correct/fout parkeergedrag.');
  add(63, 'Langs de rechterrand van de rijbaan liggen losse gele streepstukken. Een blauwe auto rijdt langs een stoep met woningen en een boom.',
    h.base('vertical') + h.line(506, 18, 506, 490, '#f2cb49', 7, 'stroke-dasharray="36 23"') + h.car(455, 390, 0, 'blue', 'JIJ') + h.building(590, 65, 135, 110) + h.tree(647, 299, 47) + h.car(345, 194, 180, 'amber') + h.person(550, 252),
    'Duidelijk onderbroken gele kantmarkering; geen doorgetrokken gele delen.');
  add(64, 'Een snelweg met drie rijstroken en een portaal met drie donkere signaalpanelen. Op het rechterpaneel brandt een rood kruis. Een blauwe auto nadert over de middelste strook.',
    h.base('motorway') + h.rect(160, 123, 476, 10, '#adbac5', 4) + h.rect(162, 121, 10, 70, '#8d9ca9', 3) + h.rect(624, 121, 10, 70, '#8d9ca9', 3) + [250,370,490].map(x => h.rect(x - 35, 97, 70, 62, '#202f3c', 6, 'stroke="#dce3e9" stroke-width="3"')).join('') + h.line(474, 110, 506, 146, '#fa4a4b', 7) + h.line(506, 110, 474, 146, '#fa4a4b', 7) + h.car(370, 405, 0, 'blue', 'JIJ') + h.car(250, 251, 0, 'white') + h.tree(718, 367, 43),
    'Rood kruis uitsluitend als werkelijk matrixsignaal boven rechter rijstrook, niet als antwoordmarkering.');
  add(65, 'Een blauwe auto staat op de linker van twee voorsorteerstroken in dezelfde rijrichting. Voor die auto staat een witte pijl naar links; in de strook ernaast staat een pijl rechtdoor.',
    h.base('cross') + h.rect(288, 350, 224, 150, '#687684') + h.line(291, 351, 291, 500, '#fff', 4) + h.line(508, 351, 508, 500, '#fff', 4) + h.line(400, 350, 400, 500, '#fff', 4, 'stroke-dasharray="20 16"') + h.arrow(345, 369, 0, 'left') + h.arrow(455, 369, 0, 'straight') + h.car(345, 438, 0, 'blue', 'JIJ') + h.car(455, 438, 0, 'white') + h.tree(640, 70, 43) + h.building(82, 45, 120, 75),
    'Zuidelijke tak is hier expliciet eenrichtingsaanvoer met twee noordwaartse voorsorteerstroken; eigen strook heeft alleen linksafpijl.');
  return records;
}

module.exports = { symbols, files, questions };
