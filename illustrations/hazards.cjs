'use strict';

// Each drawing depicts the question's starting situation, before a response.
// Coordinates follow the shared 800 x 500, right-hand traffic contract.
module.exports = h => {
  const records = [];
  const ink = '#28394a';
  const asphalt = '#6e7c8d';
  const curb = '#d2d9de';
  const cycle = '#bb7772';
  const join = (...parts) => parts.flat().filter(Boolean).join('');
  const put = (id, alt, svg, note) => records.push({ id, alt, svg, note });
  const trees = points => points.map(([x, y, r = 28]) => h.tree(x, y, r)).join('');
  const hedge = (x, y, w, height) => join(
    h.rect(x, y, w, height, '#75936c', 14),
    Array.from({ length: Math.ceil(w / 27) }, (_, i) =>
      h.circle(x + 12 + i * 25, y + height / 2, Math.min(height / 2 + 3, 22), '#65845f'))
  );
  const ruralV = (width = 220, x = 400) => join(
    h.base('blank'), h.rect(x - width / 2 - 12, 0, width + 24, 500, '#b9bca7'),
    h.rect(x - width / 2, 0, width, 500, asphalt),
    h.line(x, 0, x, 500, '#f9faf6', 3, 'stroke-dasharray="24 24"'),
    h.line(x - width / 2 + 5, 0, x - width / 2 + 5, 500, '#eef0e9', 2),
    h.line(x + width / 2 - 5, 0, x + width / 2 - 5, 500, '#eef0e9', 2)
  );
  const ruralH = () => join(
    h.base('blank'), h.rect(0, 140, 800, 220, '#b9bca7'),
    h.rect(0, 150, 800, 200, asphalt),
    h.line(0, 250, 800, 250, '#fff', 3, 'stroke-dasharray="25 23"'),
    h.line(0, 157, 800, 157, '#eef0e9', 2),
    h.line(0, 343, 800, 343, '#eef0e9', 2)
  );
  const bendRight = () => {
    const d = 'M395 530 V315 Q395 145 565 145 H830';
    return join(h.base('blank'), h.path(d, 'none', '#bdc5ba', 242),
      h.path(d, 'none', asphalt, 220),
      h.path(d, 'none', '#fff', 3, 'stroke-dasharray="24 22"'));
  };
  const bendLeft = () => {
    const d = 'M400 530 V335 Q400 200 265 200 H-30';
    return join(h.base('blank'), h.path(d, 'none', '#bdc5ba', 242),
      h.path(d, 'none', asphalt, 220),
      h.path(d, 'none', '#fff', 3, 'stroke-dasharray="24 22"'));
  };
  const water = (x, y, rx, ry, opacity = 0.8) =>
    `<g opacity="${opacity}" transform="translate(${x} ${y})"><path d="M${-rx} 0 C${-rx * .9} ${-ry},${-rx * .3} ${-ry * .6},0 ${-ry} C${rx * .8} ${-ry * 1.1},${rx} ${-ry * .2},${rx} 0 C${rx * .85} ${ry},${rx * .3} ${ry * .6},0 ${ry} C${-rx * .6} ${ry * 1.1},${-rx} ${ry * .5},${-rx} 0Z" fill="#9ab9ca"/><path d="M${-rx * .6} ${-ry * .15} Q0 ${-ry * .5} ${rx * .6} ${-ry * .2} M${-rx * .3} ${ry * .45} Q${rx * .3} ${ry * .15} ${rx * .7} ${ry * .3}" fill="none" stroke="#e2f0f4" stroke-width="3" stroke-linecap="round"/></g>`;
  const ball = (x, y) => join(h.circle(x, y, 11, '#f6dca3', 'stroke="#9a7752" stroke-width="2"'),
    h.path(`M${x - 4} ${y - 3} L${x + 3} ${y - 5} L${x + 7} ${y + 1} L${x + 2} ${y + 6} L${x - 5} ${y + 4}Z`, '#69829b', 'none', 0));
  const cone = (x, y) => join(h.rect(x - 10, y + 9, 20, 5, '#454f55', 2),
    h.path(`M${x} ${y - 14} L${x + 8} ${y + 10} H${x - 8}Z`, '#db874d', 'none', 0),
    h.line(x - 4, y, x + 4, y, '#fff4dc', 4));
  const speed = (number, x, y) => join(h.line(x, y + 24, x, y + 65, '#7b8791', 5),
    h.circle(x, y, 27, '#fff', 'stroke="#cc5b56" stroke-width="6"'),
    h.text(x, y + 8, String(number), 24, ink, 'text-anchor="middle" font-weight="800"'));
  const rail = (x, y1, y2) => join(h.line(x, y1, x, y2, '#a6b2b8', 10),
    h.line(x - 2, y1, x - 2, y2, '#f0f3f3', 3),
    Array.from({ length: Math.floor((y2 - y1) / 42) + 1 }, (_, i) => h.line(x - 10, y1 + 42 * i, x + 10, y1 + 42 * i, '#7e8e99', 4)));
  const flash = (x, y, angle = 0) => `<g transform="translate(${x} ${y}) rotate(${angle})">${[-1, 1].flatMap(s => [-30, 30].map(d => join(
    h.circle(s * 23, d, 5, '#ffd05a'), h.line(s * 29, d, s * 36, d, '#dfac44', 2)))) .join('')}</g>`;
  const windsock = (x, y) => join(h.line(x, y, x, y - 75, '#7a8b91', 5),
    h.path(`M${x} ${y - 83} L${x + 65} ${y - 98} L${x + 65} ${y - 84} L${x} ${y - 63}Z`, '#e5ad79', '#8d7b66', 1),
    h.path(`M${x + 17} ${y - 87} L${x + 28} ${y - 89} L${x + 28} ${y - 72} L${x + 17} ${y - 68}Z M${x + 43} ${y - 93} L${x + 52} ${y - 95} L${x + 52} ${y - 80} L${x + 43} ${y - 77}Z`, '#f7f1df', 'none', 0));
  const windLines = () => join(
    h.path('M570 450 Q545 390 570 330 T570 170 M650 470 Q625 410 650 350 T650 190 M735 380 Q710 320 735 260 T735 100', 'none', '#809f9a', 3, 'opacity=".65" stroke-linecap="round"'));
  const beam = (x, y, angle, reach = 210, spread = 120, strong = false) =>
    `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-20 -32 L${-spread} ${-reach} Q0 ${-reach - 20} ${spread} ${-reach} L20 -32Z" fill="#f6e6a8" opacity="${strong ? .22 : .15}"/><path d="M-16 -38 L${-spread * .58} ${-reach} M16 -38 L${spread * .58} ${-reach}" stroke="#f6ecc4" stroke-width="2" opacity=".18"/></g>`;
  const walker = (x, y) => `<g transform="translate(${x} ${y})">${h.person(0, 9, '#a985ac', .95)}<path d="M-15 1 V-21 H15 V1 M-15 -10 H15" fill="none" stroke="#687b88" stroke-width="4"/><circle cx="-16" cy="-23" r="4" fill="#293c4b"/><circle cx="16" cy="-23" r="4" fill="#293c4b"/><circle cx="-16" cy="2" r="4" fill="#293c4b"/><circle cx="16" cy="2" r="4" fill="#293c4b"/></g>`;
  const pushedBike = (x, y, angle) => `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 -25 V25" fill="none" stroke="#293c4b" stroke-width="5"/><path d="M-11 -12 H11 M-7 7 H7" stroke="#293c4b" stroke-width="3"/><path d="M0 -12 L-5 7 L0 17 L5 7Z" fill="none" stroke="#6c8794" stroke-width="3"/><path d="M-5 6 H5" stroke="#263747" stroke-width="5"/></g>`;
  const deer = (x, y, angle) => `<g transform="translate(${x} ${y}) rotate(${angle})"><ellipse cx="0" cy="0" rx="15" ry="27" fill="#b8946d"/><path d="M-10 -16 L-18 -2 M10 -16 L18 -2 M-10 17 L-18 32 M10 17 L18 32" stroke="#876b51" stroke-width="5" stroke-linecap="round"/><ellipse cx="0" cy="-29" rx="8" ry="18" fill="#bd9a74"/><ellipse cx="-11" cy="-43" rx="5" ry="10" fill="#af8963" transform="rotate(-35 -11 -43)"/><ellipse cx="11" cy="-43" rx="5" ry="10" fill="#af8963" transform="rotate(35 11 -43)"/><ellipse cx="0" cy="-45" rx="7" ry="10" fill="#bd9a74"/><circle cx="0" cy="-53" r="3" fill="#594c44"/><ellipse cx="0" cy="23" rx="8" ry="5" fill="#eee1c9"/></g>`;
  const caravan = (x, y, angle = 90) => `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-13 -48 L0 -66 L13 -48" fill="none" stroke="#87929a" stroke-width="5"/><rect x="-28" y="-49" width="56" height="98" rx="11" fill="#eeeadd" stroke="#81929a" stroke-width="2"/><rect x="-20" y="-38" width="40" height="16" rx="4" fill="#778e9c"/><rect x="-12" y="0" width="24" height="25" rx="4" fill="#d4d3c7"/><rect x="-32" y="14" width="7" height="20" rx="3" fill="#2f3b45"/><rect x="25" y="14" width="7" height="20" rx="3" fill="#2f3b45"/><path d="M-23 37 H23" stroke="#c8a989" stroke-width="4"/></g>`;
  const eastTeeth = (x, y) => Array.from({ length: 4 }, (_, i) =>
    h.path(`M${x + 15} ${y + i * 20 + 9} L${x - 11} ${y + i * 20} V${y + i * 20 + 18}Z`, '#fff', 'none', 0)).join('');

  put(66, 'Blauwe auto nadert een bal die vanuit een opening tussen twee geparkeerde auto’s op de rijbaan ligt. Er is geen kind zichtbaar.',
    join(h.base('vertical'), h.rect(510, 100, 86, 290, asphalt, 10),
      h.building(645, 85, 110, 120), h.building(645, 295, 110, 125),
      h.car(550, 165, 0, 'white'), h.car(550, 330, 0, 'amber'),
      ball(491, 248), h.car(455, 425, 0, 'blue', 'JIJ'), trees([[210, 115], [205, 380]])),
    'De bal is zichtbaar, een eventueel volgend kind bewust niet. Geen remactie getekend.');

  put(67, 'Een blauwe auto nadert een geparkeerde auto rechts van de rijbaan. Door het dak is een inzittende aan de straatkant weergegeven; het portier is dicht.',
    join(h.base('vertical'), h.rect(510, 145, 88, 190, asphalt, 8),
      h.car(550, 235, 0, 'white'), h.person(537, 239, '#bb8066', .55),
      h.car(455, 420, 0, 'blue', 'JIJ'), h.building(650, 145, 115, 190),
      hedge(65, 180, 170, 45), h.rect(620, 145, 9, 190, '#b7c7ae')),
    'De inzittende zit in de geparkeerde auto. Portier nog dicht: het risico wordt niet als uitgevoerde gebeurtenis getoond.');

  put(68, 'Een blauwe auto rijdt op korte afstand achter een brede witte bestelbus. Verder voor de bestelbus rijdt nog een auto.',
    join(h.base('vertical'), h.car(455, 90, 0, 'amber'),
      h.car(455, 265, 0, 'white', '', 'van'), h.car(455, 370, 0, 'blue', 'JIJ'),
      h.building(50, 80, 155, 110), trees([[620, 115], [680, 410], [190, 420]])),
    'Beginsituatie met kleine volgafstand; de blauwe auto neemt nog geen grotere afstand.');

  put(69, 'Op een smalle weg rijdt voor de blauwe auto een scheef geplaatste fietser. Op de andere weghelft nadert een auto.',
    join(ruralV(148), hedge(110, 35, 140, 42), hedge(570, 325, 160, 42),
      h.path('M430 342 Q449 320 430 301 T429 267', 'none', '#bfcbd0', 2, 'stroke-dasharray="6 8" opacity=".75"'),
      h.bike(429, 264, -10), h.car(435, 425, 0, 'blue', 'JIJ'), h.car(365, 135, 180, 'amber'),
      trees([[635, 115, 37], [145, 425, 34]])),
    'Fietser slingert en er is een tegenligger. Geen inhaalmanoeuvre of reactie zichtbaar.');

  put(70, 'Een blauwe auto nadert een scherpe bocht naar rechts. Bomen aan de binnenzijde beperken het overzicht. Naast de weg staat een bord 80.',
    join(bendRight(), trees([[555, 320, 54], [630, 350, 49], [700, 325, 45], [585, 430, 42], [175, 140, 42]]),
      h.car(450, 445, 0, 'blue', 'JIJ'), speed(80, 233, 386)),
    'Scherpe onoverzichtelijke bocht met de genoemde limiet. Achter de bocht is geen verzonnen obstakel geplaatst.');

  put(71, 'Een blauwe auto rijdt op een donkere buitenweg. De bundel dimlicht verlicht slechts een deel van de rijbaan voor de auto.',
    join(ruralV(), trees([[175, 85, 43], [640, 180, 45], [165, 370, 40], [680, 435, 45]]),
      h.building(30, 200, 120, 90), h.weather('night'), beam(455, 405, 0, 205, 86),
      h.car(455, 405, 0, 'blue', 'JIJ')),
    'Alleen beperkt dimlichtbereik; geen snelheidskeuze in het beeld.');

  put(72, 'Twee auto’s rijden naar rechts op een natte weg tijdens een stevige regenbui. De blauwe auto rijdt achter de amberkleurige auto.',
    join(ruralH(), water(380, 315, 95, 20, .55), water(590, 186, 112, 19, .55),
      h.car(215, 300, 90, 'blue', 'JIJ'), h.car(590, 300, 90, 'amber'),
      trees([[155, 75, 36], [640, 432, 40]]), h.weather('rain')),
    'Regen en nat wegdek zichtbaar. Geen verhoogde afstand of remactie als oplossing getekend.');

  put(73, 'Op een rechte weg rijdt een witte auto erg dicht achter de blauwe auto. De rijbaan voor de blauwe auto is vrij.',
    join(h.base('horizontal'), h.car(420, 300, 90, 'blue', 'JIJ'),
      h.car(324, 300, 90, 'white'), h.building(75, 25, 185, 85),
      h.building(580, 390, 155, 85), trees([[430, 65, 31], [160, 430, 30]])),
    'Bumperklever achter de bestuurder; geen remlichten, versnelling of uitwijkactie.');

  put(74, 'De blauwe auto nadert op een autosnelweg een rij voertuigen. Verderop branden de remlichten in meerdere rijstroken.',
    join(h.base('motorway'), h.car(490, 430, 0, 'blue', 'JIJ'),
      [250, 370, 490].flatMap((x, i) => [h.car(x, 65 + i * 12, 0, i === 1 ? 'white' : 'amber', '', 'car', { brake: true }),
        h.car(x, 170 + i * 8, 0, i === 2 ? 'white' : 'gray', '', 'car', { brake: true })]),
      rail(655, 0, 500), trees([[80, 100, 38], [100, 410, 42], [735, 260, 32]])),
    'Veel remlichten ver vooruit en voldoende aanloopruimte. De blauwe auto remt niet al zichtbaar.');

  put(75, 'Een blauwe auto nadert van onderen een kruispunt zonder voorrangsborden of verkeerslichten. Een brede hoge heg staat op de hoek rechts.',
    join(h.base('cross'), hedge(530, 363, 236, 95),
      h.car(455, 420, 0, 'blue', 'JIJ'), h.building(85, 30, 130, 85),
      trees([[180, 420], [665, 70]]), h.label(620, 483, 'Hoge heg')),
    'Gelijkwaardig kruispunt: geen borden/haaientanden toegevoegd. Heg staat aan de rechterhoek van de nadering.');

  put(76, 'Een blauwe auto wil vanaf de onderste tak rechtsaf bij een rond groen verkeerslicht. Rechts naast de auto rijdt een fietser rechtdoor.',
    join(h.base('cross'), h.rect(538, 0, 38, 500, cycle),
      h.line(540, 0, 540, 500, '#f1ded8', 2),
      h.line(406, 369, 505, 369, '#fff', 7), h.light(510, 405, 'green'),
      h.car(455, 425, 0, 'blue', 'JIJ', 'car', { indicator: 'right' }),
      h.bike(557, 378, 0), h.arrow(455, 305, 0, 'right'), h.arrow(557, 285, 0),
      h.building(90, 35, 140, 80)),
    'Gewoon rond groen, geen groene richtingspijl in het verkeerslicht. Witte pijlen tonen uitsluitend de in de vraag genoemde intenties.');

  put(77, 'Een fietser rijdt naar rechts langs een rij geparkeerde auto’s. Een blauwe auto nadert de fietser van achteren.',
    join(h.base('horizontal'), h.rect(300, 354, 420, 85, asphalt, 8),
      [375, 505, 635].map((x, i) => h.car(x, 397, 90, i === 1 ? 'amber' : 'white')),
      h.bike(435, 328, 90), h.car(225, 300, 90, 'blue', 'JIJ'),
      h.building(350, 25, 240, 80), trees([[95, 420], [720, 75]])),
    'Fietser bevindt zich naast geparkeerde auto’s; portieren zijn nog dicht en de blauwe auto haalt nog niet in.');

  put(78, 'Een blauwe auto rijdt achter een tractor en nadert een bocht naar links. Dichte begroeiing schermt het weggedeelte na de bocht af.',
    join(bendLeft(), trees([[245, 360, 48], [175, 365, 48], [155, 440, 46], [630, 120, 43]]),
      h.car(455, 355, 0, 'amber', '', 'tractor'), h.car(455, 458, 0, 'blue', 'JIJ')),
    'Tractor vóór bestuurder op aanloop naar onoverzichtelijke bocht. Geen inhaalactie en geen aangenomen tegenligger.');

  put(79, 'Een blauwe auto rijdt naar rechts voorbij het einde van een groot gebouw. Het terrein rechts van het gebouw is open en een windzak staat strak in de wind.',
    join(ruralH(), h.building(70, 365, 310, 125),
      h.car(365, 300, 90, 'blue', 'JIJ'), windsock(620, 125), windLines(),
      trees([[160, 55, 32], [270, 65, 31]])),
    'Overgang uit de beschutting van een gebouw naar open terrein, met zijwind. Geen koerscorrectie afgebeeld.');

  put(80, 'De blauwe auto nadert enkele brede diepe plassen op de rechterhelft van een rechte weg. De auto staat in het beeld nog ruim vóór het water.',
    join(ruralV(), water(454, 160, 45, 52), water(464, 255, 38, 34),
      water(348, 72, 25, 20, .5), h.car(455, 425, 0, 'blue', 'JIJ'),
      trees([[170, 155, 40], [670, 335, 39]]), h.path('M560 72 Q625 40 685 70', 'none', '#bfd0d8', 17, 'opacity=".55"')),
    'Plassen liggen vóór de auto. Geen afgebeelde remactie, acceleratie of rijstrookwisseling.');

  put(81, 'Een witte bestelbus staat op de rijstrook vlak voor een zebrapad. De blauwe auto nadert achter de bus; er is geen voetganger zichtbaar.',
    join(h.base('vertical'), h.zebra(290, 215, 220), h.sign('L2', 562, 200, 52),
      h.car(455, 325, 0, 'white', '', 'van'), h.car(455, 440, 0, 'blue', 'JIJ'),
      h.building(75, 80, 145, 120), h.building(640, 325, 110, 110)),
    'Bus stopt vóór de zebra, niet erop. Geen verborgen voetganger zichtbaar gemaakt; de vraag gaat om de mogelijkheid.');

  put(82, 'Een blauwe auto nadert een persoon die met een rollator over de rijstrook loopt. De persoon bevindt zich al op de rijbaan.',
    join(h.base('horizontal'), h.car(215, 300, 90, 'blue', 'JIJ'), walker(520, 296),
      h.building(60, 25, 180, 90), h.building(580, 395, 155, 85),
      trees([[655, 65], [180, 425]])),
    'Rollator duidelijk herkenbaar; geen niet-genoemd zebrapad en geen remactie toegevoegd.');

  put(83, 'Een blauwe auto nadert een stilstaande autobus bij een halte. Twee kinderen staan aan de uitstapkant van de bus op het trottoir.',
    join(h.base('horizontal'), h.car(550, 305, 90, 'white', '', 'bus'),
      h.car(235, 300, 90, 'blue', 'JIJ'), h.sign('L3', 670, 420, 48),
      h.person(520, 383, '#c88d67', .72), h.person(563, 388, '#8b98b5', .72),
      h.rect(450, 416, 150, 8, '#91a39f', 4), h.building(80, 30, 170, 85)),
    'Kinderen naast uitstapzijde. Geen al overstekend kind vóór de bus toegevoegd. Blauwe auto nog achter de bus.');

  put(84, 'Een blauwe auto wil op een kruispunt rechtsaf. Op het fietspad vlak rechts naast en iets achter de auto rijdt een fietser rechtdoor.',
    join(h.base('cross'), h.rect(0, 359, 800, 35, cycle),
      h.line(0, 360, 800, 360, '#f1ded8', 2),
      h.car(210, 300, 90, 'blue', 'JIJ', 'car', { indicator: 'right' }),
      h.bike(188, 376, 90), h.arrow(330, 300, 90, 'right'),
      h.building(600, 30, 125, 85), trees([[105, 70]])),
    'Fietser bevindt zich aan de rechterachterzijde, niet vóór de bestuurder. Intentie rechtsaf is zichtbaar, nog niet uitgevoerd.');

  put(85, 'Een blauwe auto staat in een uitrit voor een doorlopend trottoir. Een hoge muur direct rechts van de uitrit belemmert het zicht langs het trottoir.',
    join(h.base('horizontal'), h.rect(363, 350, 106, 150, '#929b9b'),
      h.rect(0, 352, 800, 43, curb), h.rect(363, 352, 106, 43, '#c5cdca'),
      h.rect(485, 398, 280, 18, '#9b9e99', 3), h.rect(485, 416, 280, 70, '#b2b6ae'),
      h.building(100, 410, 220, 85), h.car(438, 456, 0, 'blue', 'JIJ'),
      h.person(250, 373, '#a989b0', .85), h.label(620, 465, 'Hoge muur')),
    'Uitrit kruist doorlopend trottoir. Muur staat rechts van uitrit; auto blokkeert het trottoir nog niet.');

  put(86, 'Een blauwe auto rijdt naar rechts achter een andere auto. Een laagstaande zon aan de rechterkant veroorzaakt een lichte gloed over de rijbaan.',
    join(ruralH(), h.car(235, 300, 90, 'blue', 'JIJ'), h.car(545, 300, 90, 'amber'),
      trees([[170, 65, 35], [610, 440, 39]]),
      h.circle(790, 260, 165, '#fff0bc', 'opacity=".15"'), h.circle(790, 260, 115, '#ffedaa', 'opacity=".23"'),
      h.circle(790, 260, 65, '#ffe39a', 'opacity=".8"'),
      h.path('M735 233 L305 195 L735 250 L195 300 L735 275 L380 400', 'none', '#fff3c9', 13, 'opacity=".18"')),
    'Zon staat in de rijrichting. Gegeven verblinding wordt getoond, zonder zonnebril/zonneklep of gewijzigde afstand.');

  put(87, 'Op een smalle weg rijdt een ambulance met blauwe lichtsignalen achter de blauwe auto. Heggen en geparkeerde voertuigen beperken de ruimte naast de weg.',
    join(ruralV(150), hedge(145, 60, 160, 45), hedge(500, 155, 195, 45),
      h.rect(490, 270, 75, 180, asphalt, 8), h.car(530, 325, 0, 'gray'),
      h.car(438, 245, 0, 'blue', 'JIJ'), h.car(438, 410, 0, 'white', '', 'ambulance'),
      h.path('M396 388 Q383 405 396 422 M478 388 Q491 405 478 422', 'none', '#819eaf', 3)),
    'Ambulance nadert van achteren. Geluidsbogen staan voor de genoemde sirene. De bestuurder voert nog geen uitwijkactie uit.');

  put(88, 'Een blauwe auto rijdt op een bosweg. Rechts in de berm staat een ree met de kop naar de weg, ruim vóór de auto.',
    join(ruralV(), trees([[90, 85, 48], [200, 160, 42], [110, 350, 47], [205, 440, 40], [685, 95, 46], [695, 365, 49], [602, 435, 35]]),
      deer(565, 215, 270), h.car(455, 420, 0, 'blue', 'JIJ')),
    'Ree staat nog naast de rijbaan. Geen oversteek, uitwijkmanoeuvre of remactie als feit ingevuld.');

  put(89, 'De blauwe auto nadert een kruispunt op een voorrangsweg. Vanuit de rechterzijstraat komt een amberkleurige auto dicht bij haaientanden en een voorrangsbord.',
    join(h.base('cross'), h.sign('B1', 555, 405, 52), h.sign('B6', 635, 102, 52),
      eastTeeth(550, 160), h.car(455, 410, 0, 'blue', 'JIJ'), h.car(615, 200, 270, 'amber'),
      h.building(75, 30, 160, 85), h.building(625, 385, 130, 95)),
    'Haaientanden richten zich op verkeer uit de rechterzijstraat. De naderende auto staat vóór de tanden; geen botsing getoond.');

  put(90, 'De blauwe auto rijdt op een rijstrook die verderop eindigt. Links naast de auto rijdt een amberkleurige auto iets verder naar achteren.',
    join(h.base('blank'), h.path('M240 0 H480 L600 250 V500 H240Z', asphalt, '#bac5ba', 12),
      h.line(360, 0, 360, 500, '#fff', 3, 'stroke-dasharray="24 22"'),
      h.line(480, 270, 480, 500, '#fff', 3, 'stroke-dasharray="24 22"'),
      h.path('M591 500 V253 L473 0', 'none', '#fff', 3),
      h.arrow(540, 282, 0, 'left'), h.car(540, 405, 0, 'blue', 'JIJ'), h.car(420, 439, 0, 'amber'),
      trees([[95, 125, 38], [715, 380, 40]])),
    'Rechterstrook eindigt door zichtbare versmalling. Andere auto ter hoogte van achterportier; er is nog geen strookwisseling.');

  put(91, 'De blauwe auto staat op een rijstrook met een pijl rechtdoor. Op de rechterstrook staat een rechtsafpijl. Een navigatiescherm rechts in beeld toont een route naar rechts.',
    join(h.base('blank'), h.rect(265, 0, 360, 500, curb), h.rect(0, 105, 800, 230, curb),
      h.rect(280, 0, 330, 500, asphalt), h.rect(0, 120, 800, 200, asphalt),
      h.line(390, 335, 390, 500, '#fff', 3), h.line(500, 335, 500, 500, '#fff', 3, 'stroke-dasharray="22 20"'),
      h.line(390, 0, 390, 105, '#fff', 3), h.arrow(445, 365, 0), h.arrow(555, 365, 0, 'right'),
      h.car(445, 450, 0, 'blue', 'JIJ'),
      h.rect(641, 365, 138, 106, '#f1f3ef', 13, 'stroke="#9aa9af" stroke-width="2"'),
      h.path('M665 454 V405 H752', 'none', '#6e8fa2', 8),
      h.path('M741 395 L753 405 L741 415', 'none', '#6e8fa2', 6), h.text(710, 490, 'Navigatie', 15, ink, 'text-anchor="middle"')),
    'Rechtdoorstrook en afwijkende navigatie-instructie zijn feiten uit de vraag. Scherm is een schema-inzet, geen telefoon in de hand.');

  put(92, 'Een blauwe auto nadert een wegvak met smalle stroken, verkeerskegels en afzettingen. Een tijdelijk bord geeft 50 aan. Er zijn geen wegwerkers zichtbaar.',
    join(h.base('horizontal'), h.rect(285, 348, 515, 145, '#d4c6ac'),
      h.rect(295, 335, 505, 14, '#e8e2d1', 3, 'stroke="#92988f" stroke-width="2"'),
      h.line(290, 260, 800, 260, '#f6db83', 4),
      [300, 390, 480, 570, 660, 750].map(x => cone(x, 247)),
      h.rect(95, 380, 88, 94, '#e7cf80', 5), speed(50, 139, 414),
      h.car(190, 300, 90, 'blue', 'JIJ'), h.car(615, 300, 90, 'white'),
      h.rect(565, 407, 92, 36, '#bd995e', 6), h.rect(575, 439, 72, 13, '#637078', 4),
      h.path('M640 416 L690 378 L732 407', 'none', '#c0a268', 12)),
    'Lage limiet en smaller werkvak blijven zichtbaar zonder aanwezige werknemers. De blauwe auto heeft nog geen antwoordgedrag.');

  put(93, 'Een blauwe auto trekt een caravan over een open weg. De caravan staat licht schuin achter de auto. Windlijnen en een windzak tonen windvlagen.',
    join(ruralH(), caravan(310, 310, 97), h.line(371, 304, 392, 300, '#89979c', 5),
      h.car(430, 300, 90, 'blue', 'JIJ'), windsock(655, 125), windLines(),
      h.path('M95 395 H350 M70 430 H285 M490 75 H570', 'none', '#bdccac', 3)),
    'Caravancombinatie licht onrustig door zijwind. Geen rem-, gas- of stuurbeweging aangeduid.');

  put(94, 'Een blauwe auto nadert een brug over water. Op het schaduwrijke brugdek zijn lichte ijzige plekken te zien en langs de brug staan leuningen.',
    join(h.base('blank'), h.rect(0, 120, 800, 175, '#a6c3ce'),
      h.path('M0 163 Q110 140 220 163 T440 163 T660 163 T880 163 M0 249 Q110 226 220 249 T440 249 T660 249 T880 249', 'none', '#d4e7e9', 3),
      h.rect(278, 0, 244, 500, '#bbc3bf'), h.rect(290, 0, 220, 500, asphalt),
      h.line(400, 0, 400, 500, '#fff', 3, 'stroke-dasharray="24 22"'), rail(280, 100, 315), rail(520, 100, 315),
      h.path('M290 125 L510 185 V278 L290 216Z', '#384d5b', 'none', 0, 'opacity=".18"'),
      water(450, 210, 38, 35, .45), h.path('M422 200 L440 215 M442 187 L460 202 M462 222 L479 237', 'none', '#dbe7e4', 3),
      trees([[170, 80, 49], [180, 340, 38]]), h.car(455, 435, 0, 'blue', 'JIJ')),
    'Auto nog vóór brug, mogelijke gladheid alleen op schaduwrijk brugdek. Geen reactie alvast getoond.');

  put(97, 'Een blauwe auto rijdt door een brede laag water op de rijbaan. Watergolven en opspattend water zijn rondom de banden zichtbaar.',
    join(ruralH(), water(415, 300, 200, 47), water(630, 183, 78, 19, .45),
      h.car(400, 300, 90, 'blue', 'JIJ'),
      h.path('M359 268 Q375 250 402 254 M363 335 Q386 350 411 344 M432 271 Q455 255 470 269 M433 330 Q455 349 475 337', 'none', '#e2f1f4', 4, 'stroke-linecap="round"'),
      h.weather('rain'), trees([[100, 430, 35], [600, 75, 36]])),
    'Water onder de rijdende auto illustreert de gegeven aquaplaningsituatie. Geen scherpe stuurhoek, remactie of gasreactie.');

  put(99, 'Een blauwe auto rijdt op een weg in dichte mist. De rijbaan en een voertuig verderop vervagen. Een neutrale maatlijn vermeldt ongeveer 40 meter zicht.',
    join(ruralV(), h.car(455, 130, 0, 'white'), h.car(455, 410, 0, 'blue', 'JIJ'),
      trees([[175, 155, 35], [665, 280, 35]]), h.weather('fog'),
      '<defs><linearGradient id="fog99" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5f5" stop-opacity=".8"/><stop offset=".55" stop-color="#f2f5f5" stop-opacity=".35"/><stop offset="1" stop-color="#f2f5f5" stop-opacity="0"/></linearGradient></defs>',
      h.rect(0, 0, 800, 500, 'url(#fog99)'),
      h.line(613, 195, 613, 409, '#6e8595', 2), h.line(605, 195, 621, 195, '#6e8595', 2),
      h.line(605, 409, 621, 409, '#6e8595', 2), h.text(635, 294, '± 40 m', 18, '#40576a'), h.text(635, 320, 'zicht', 16, '#40576a')),
    'Zichtafstand is exact de gegeven context; mistachterlicht is niet aangezet om geen antwoord te suggereren.');

  put(102, 'In het donker rijdt een blauwe auto met een brede bundel groot licht. Een tegemoetkomende fietser rijdt op de andere helft van de weg.',
    join(ruralV(), trees([[160, 90, 42], [640, 420, 44]]), h.weather('night'),
      beam(455, 415, 0, 360, 175, true), beam(345, 165, 180, 90, 25),
      h.bike(345, 165, 180, '#d0dadc'), h.circle(345, 188, 3, '#fff1c5'),
      h.car(455, 415, 0, 'blue', 'JIJ')),
    'Groot licht is de beginsituatie en fietser is tegenligger. Niet alvast gedimd.');

  put(107, 'Een blauwe auto staat vlak na een bocht met vier amberkleurige alarmlichten. Dichte begroeiing aan de binnenkant maakt de hindernis moeilijk vooraf zichtbaar.',
    join(bendRight(), trees([[560, 325, 52], [635, 345, 45], [600, 430, 42], [180, 170, 42]]),
      h.car(650, 200, 90, 'blue', 'JIJ'), flash(650, 200, 90)),
    'Werkende alarmlichten en beperkt zicht zijn gegeven. Geen gevarendriehoek of wachtpositie die de keuze invult.');

  put(112, 'Een blauwe auto rijdt op een winterse weg achter een strooiwagen. Achter de strooiwagen liggen kleine zoutkorrels, terwijl het wegdek nog ijzige plekken heeft.',
    join(ruralV(), water(456, 316, 40, 36, .35), water(349, 275, 37, 60, .3),
      h.car(455, 158, 0, 'amber', '', 'truck'), h.rect(433, 165, 44, 53, '#bc9b63', 5),
      h.circle(455, 223, 12, '#7f8e95'),
      Array.from({ length: 24 }, (_, i) => h.circle(420 + (i * 19) % 73, 247 + (i * 17) % 50, 2, '#e4e0d2')),
      h.car(455, 420, 0, 'blue', 'JIJ'), h.weather('ice'), trees([[170, 160, 39], [660, 330, 44]])),
    'Strooien is zichtbaar, zonder de weg als meteen ijsvrij af te beelden.');

  put(116, 'Op dezelfde snelweghelft rijden de blauwe auto en een andere auto in tegengestelde richting. Witte richtingspijlen tonen de beweging van beide voertuigen.',
    join(h.base('motorway'), h.car(370, 415, 0, 'blue', 'JIJ'), h.car(250, 145, 180, 'white'),
      h.arrow(370, 325, 0), h.arrow(250, 250, 180), rail(655, 0, 500),
      trees([[80, 150, 37], [735, 390, 36]])),
    'Witte auto rijdt tegen de rijrichting op dezelfde weghelft. Blauwe auto wijkt nog niet uit en er is geen antwoordpijl naar rechts.');

  put(117, 'De blauwe auto staat op de vluchtstrook naast een vangrail. Links daarvan rijdt verkeer over de rijstroken. Er staan nog geen mensen buiten de auto.',
    join(h.base('motorway'), rail(657, 0, 500),
      h.car(580, 285, 0, 'blue', 'JIJ'), flash(580, 285),
      h.car(490, 125, 0, 'white'), h.car(370, 410, 0, 'amber'),
      trees([[748, 120, 34], [745, 400, 37], [75, 285, 33]])),
    'Auto staat op vluchtstrook. Geen personen achter vangrail of naast auto die de gevraagde wachtplek verraden.');

  put(122, 'Een blauwe auto rijdt naar rechts op de onderste van twee rijstroken. Een motorfiets bevindt zich schuin links achter de auto. Een inzet toont een lege buitenspiegel.',
    join(h.base('blank'), h.rect(0, 140, 800, 240, curb), h.rect(0, 155, 800, 210, asphalt),
      h.line(0, 260, 800, 260, '#fff', 3, 'stroke-dasharray="28 22"'),
      h.arrow(655, 207, 90), h.arrow(655, 315, 90),
      h.car(430, 315, 90, 'blue', 'JIJ', 'car', { indicator: 'left' }),
      h.car(360, 207, 90, 'amber', '', 'motorcycle'),
      h.rect(65, 28, 170, 95, '#586f7e', 24), h.rect(74, 37, 152, 77, '#b1c6cc', 18),
      h.path('M95 113 L146 48 L210 113', '#758491', 'none', 0),
      h.path('M152 100 L155 88 M158 77 L160 67', 'none', '#e6eeeb', 3), h.text(150, 141, 'Spiegelbeeld', 15, ink, 'text-anchor="middle"')),
    'Twee rijstroken hebben dezelfde richting. Geen dodehoekmarkering of reeds uitgevoerde controle; lege spiegel is gegeven in vraag.');

  put(127, 'Een landelijke weg heeft een afzonderlijk rood fietspad rechts, gescheiden door een grasstrook. Er is geen trottoir of voetpad aanwezig.',
    join(ruralV(), h.rect(550, 0, 12, 500, '#b9bca7'), h.rect(562, 0, 42, 500, cycle),
      h.line(565, 0, 565, 500, '#ead6d0', 2), h.line(601, 0, 601, 500, '#ead6d0', 2),
      h.bike(583, 170, 0), h.car(455, 420, 0, 'white'),
      trees([[130, 95, 40], [710, 330, 38]]), h.label(677, 220, 'Fietspad')),
    'Alleen aanwezige infrastructuur; geen voetganger op één van de antwoordlocaties geplaatst.');

  put(129, 'Een fietser rijdt dwars over de strepen van een zebrapad. Een blauwe auto nadert de oversteekplaats van onderen.',
    join(h.base('vertical'), h.zebra(290, 225, 220), h.sign('L2', 566, 210, 52),
      h.bike(385, 250, 90), h.car(455, 420, 0, 'blue', 'JIJ'),
      h.building(75, 40, 145, 100), h.building(640, 350, 110, 110)),
    'De fietser zit op de fiets; geen voetganger met fiets aan de hand. Geen voorrangsmarkering voor fietser.');

  put(130, 'Op een trottoir loopt iemand naast een fiets en houdt het stuur vast. De persoon zit niet op het zadel.',
    join(h.base('horizontal'), h.rect(0, 355, 800, 98, curb),
      h.car(220, 300, 90, 'white'), h.person(455, 391, '#b58f6b', 1), pushedBike(455, 425, 90),
      h.line(466, 397, 472, 419, '#9e7f66', 4), h.building(85, 25, 190, 85),
      trees([[640, 55, 36], [720, 432, 33]])),
    'Persoon en fiets staan naast elkaar met arm naar stuur. Geen tekstlabel met de verkeersrechtelijke status.');

  put(132, 'Buiten de bebouwde kom staat een autobus in een haltehaven rechts van de rijbaan, met linker richtingaanwijzer aan. Een blauwe auto nadert achter de bus.',
    join(ruralV(), h.path('M510 105 L598 145 V330 L510 380Z', asphalt, 'none', 0),
      h.line(510, 150, 510, 333, '#fff', 3, 'stroke-dasharray="12 13"'),
      h.car(552, 235, 0, 'white', '', 'bus', { indicator: 'left' }), h.sign('L3', 655, 220, 48),
      h.car(455, 435, 0, 'blue', 'JIJ'), h.line(666, 437, 666, 492, '#81939a', 4),
      h.rect(603, 411, 126, 46, '#5a7f9e', 3, 'stroke="#fff" stroke-width="2"'),
      h.text(666, 441, 'DORP', 20, '#fff', 'text-anchor="middle" font-weight="700"'), h.line(610, 452, 722, 416, '#c4655d', 6),
      trees([[145, 80, 40], [740, 90, 37]])),
    'Halte ligt na einde bebouwde kom (doorgestreept kombord). Bus wil vanuit haven naar links de rijbaan op; auto nog geen reactie.');

  put(135, 'Een vrachtwagen wil bij een kruispunt rechtsaf. Rechts naast de vrachtwagen rijdt een fietser op een fietspad dat rechtdoor loopt.',
    join(h.base('cross'), h.rect(520, 0, 34, 500, cycle),
      h.car(455, 395, 0, 'white', '', 'truck', { indicator: 'right' }), h.bike(537, 393, 0),
      h.arrow(455, 295, 0, 'right'),
      h.building(80, 35, 145, 85), h.building(630, 385, 120, 95)),
    'Fietser rechts naast truck en intentie rechtsaf. Geen ingekleurde dode hoek of aanwijzing welk antwoord juist is.');

  put(138, 'Een lange autobus voor de blauwe auto begint naar rechts een zijstraat in te draaien. De autobus staat schuin tussen de doorgaande weg en de zijstraat.',
    join(h.base('horizontal'), h.rect(326, 350, 248, 150, curb), h.rect(340, 250, 220, 250, asphalt),
      h.line(450, 365, 450, 500, '#fff', 3, 'stroke-dasharray="23 22"'),
      h.car(340, 310, 115, 'white', '', 'bus', { indicator: 'right' }),
      h.car(165, 300, 90, 'blue', 'JIJ'), h.building(70, 395, 220, 90),
      h.building(620, 390, 125, 95), trees([[620, 55, 33]])),
    'Bus begint scherpe rechterbocht, blauwe auto erachter. Geen gekleurde uitzwaaizone of beweegpijl aan juiste hoek.');

  put(140, 'Een tram staat op rails in de rijbaan. Passagiers lopen vanaf het trottoir over de rijbaan naar deuren aan de rechterkant. De blauwe auto nadert aan die instapzijde; er is geen vluchtheuvel.',
    join(h.base('blank'), h.rect(0, 85, 800, 335, curb), h.rect(0, 100, 800, 300, asphalt),
      h.line(0, 200, 800, 200, '#fff', 3, 'stroke-dasharray="25 23"'),
      h.line(0, 234, 800, 234, '#aebac0', 4), h.line(0, 267, 800, 267, '#aebac0', 4),
      h.rect(335, 220, 235, 61, '#d4dedb', 13, 'stroke="#6f8792" stroke-width="2"'),
      h.rect(548, 229, 14, 42, '#7894a2', 4), h.rect(344, 231, 15, 38, '#8299a4', 4),
      [375, 415, 455, 495].map(x => h.rect(x, 226, 26, 12, '#839ca7', 3)),
      [402, 493].map(x => h.rect(x, 268, 25, 13, '#6d8794', 2)),
      h.line(360, 251, 540, 251, '#b8c8c7', 12),
      h.person(415, 321, '#bf9268', .9), h.person(505, 373, '#8e9bb4', .85),
      h.car(210, 349, 90, 'blue', 'JIJ'), h.sign('L3', 665, 446, 48)),
    'Passagiers kruisen rijbaan vanaf trottoir, zonder eiland. Auto passeert aan rechter instapzijde; geen reactie getekend.');

  put(144, 'Op een smalle buitenweg nadert een breed landbouwvoertuig een blauwe auto. Het landbouwvoertuig heeft een brede machine achter zich en naast de weg ligt een onverharde berm.',
    join(ruralV(160), h.path('M480 335 Q575 330 590 375 Q575 432 480 455Z', '#9ea59a', 'none', 0),
      h.rect(295, 102, 140, 25, '#a89460', 5),
      Array.from({ length: 8 }, (_, i) => h.line(304 + i * 17, 106, 304 + i * 17, 126, '#756f55', 3)),
      h.car(365, 175, 180, 'amber', '', 'tractor'), h.car(440, 420, 0, 'blue', 'JIJ'),
      hedge(90, 35, 155, 42), trees([[655, 125, 40], [145, 410, 38]])),
    'Brede tegenligger en smalle weg. Auto staat nog op rijbaan, niet in een als antwoord gekozen wachtplek.');

  return records;
};
