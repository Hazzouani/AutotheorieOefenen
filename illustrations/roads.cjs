'use strict';

// Original, question-specific vector scenes. North is up; all intent arrows are neutral.
module.exports = h => {
  const records = [];
  const add = (id, alt, note, ...layers) => records.push({ id, alt, note, svg: layers.flat().join('') });
  const asphalt = '#6e7c8d', curb = '#d2d9de', white = '#fbfaf0';
  const dash = 'stroke-dasharray="22 18"';
  const roadV = () => h.base('blank') + h.rect(282,0,236,500,'#a9bba6') + h.rect(290,0,220,500,asphalt) + h.line(400,0,400,500,white,3,dash) + h.line(296,0,296,500,white,3) + h.line(504,0,504,500,white,3);
  const roadH = () => h.base('blank') + h.rect(0,142,800,216,'#a9bba6') + h.rect(0,150,800,200,asphalt) + h.line(0,250,800,250,white,3,dash) + h.line(0,156,800,156,white,3) + h.line(0,344,800,344,white,3);
  const town = () => h.building(40,35,135,65) + h.building(615,30,140,70) + h.building(40,405,135,65) + h.tree(650,430,24);
  const fields = () => [42,67,92,117].map(y => h.line(25,y,240,y,'#b5c99a',9)).join('') + [382,407,432,457].map(y => h.line(560,y,775,y,'#c9cf9e',9)).join('') + h.tree(650,70,27) + h.tree(735,95,22);
  const speedSign = (n,x,y,size=72) => h.line(x,y,x,y+size*.85,'#7e8a96',5) + h.circle(x,y,size*.44,'white',`stroke="#d72f3b" stroke-width="${size*.08}"`) + h.text(x,y+size*.12,n,size*.35,'#25334b','text-anchor="middle" font-weight="700"');
  const intent = (d, tip, angle=0) => h.path(d,'none',white,5,'stroke-linecap="round" stroke-linejoin="round"') + `<g transform="translate(${tip[0]} ${tip[1]}) rotate(${angle})">${h.path('M-9 12L0 0 9 12','none',white,5,'stroke-linecap="round" stroke-linejoin="round"')}</g>`;
  const lotBay = (x,y,w=78,ht=128) => h.path(`M${x} ${y}v${ht}h${w}V${y}`,'none',white,3);
  const hatch = (x,y,w,ht) => h.rect(x,y,w,ht,asphalt,0,'stroke="#fbfaf0" stroke-width="3"') + Array.from({length:Math.floor(ht/26)},(_,i)=>h.line(x+5,y+8+i*26,x+w-5,y+27+i*26,white,5)).join('');
  const officer = (x,y) => `<g transform="translate(${x} ${y})">${h.line(-7,16,-11,39,'#344760',7)}${h.line(8,16,12,39,'#344760',7)}${h.rect(-17,-11,34,34,'#eead47',5)}${h.rect(-17,2,34,6,'#f6f5dc')}${h.line(-19,-4,-34,10,'#344760',8)}${h.line(18,-5,31,-30,'#344760',8)}${h.circle(32,-35,7,'#f8f4e7')}${h.circle(0,-24,12,'#efc8a3')}${h.rect(-13,-36,26,7,'#344760',3)}</g>`;

  add(1,
    'Gelijkwaardig kruispunt zonder borden. De blauwe auto nadert van onderen en wil rechtdoor; een amberkleurige auto komt van rechts.',
    'Blauw noordwaarts x455; auto van rechts westwaarts y200. Geen voorrangstekens.',
    h.base('cross'), town(), h.car(455,421,0,'blue','JIJ'), h.arrow(455,350), h.car(658,200,270,'amber'), h.arrow(568,200,270));

  add(2,
    'Twee verharde wegen kruisen elkaar. Een blauwe auto rijdt naar het kruispunt; van rechts nadert een fietser die rechtdoor wil.',
    'Fietser rijdt op de noordelijke helft westwaarts, niet op een los fietspad; gelijkwaardige aansluiting.',
    h.base('cross'), h.building(54,30,172,70), h.tree(680,435), h.tree(185,421,24),
    h.car(455,425,0,'blue','JIJ'), h.arrow(455,356), h.bike(641,184,270,'#d7a24f'), h.arrow(559,184,270), h.person(242,90));

  add(3,
    'Een blauwe auto rijdt over een verharde buitenweg. Rechts sluit een onverharde weg aan, waaruit een amberkleurige auto nadert.',
    'T-aansluiting onverhard zonder doorlopend trottoir of uitritdrempel. Van rechts komt de andere auto.',
    roadV(), h.rect(510,150,290,200,'#bda586'), h.line(504,150,504,350,asphalt,9),
    Array.from({length:35},(_,i)=>h.circle(530+(i*71)%264,164+(i*43)%172,2+(i%3),'#97866e','opacity=".45"')),
    h.tree(95,85,38), h.tree(180,405,31), h.car(455,418,0,'blue','JIJ'), h.car(661,200,270,'amber'), h.arrow(563,200,270));

  add(4,
    'Een blauwe auto nadert een kruispunt van onderen. Een tram nadert van links op rails die door de kruisende straat lopen.',
    'Tram rijdt oostwaarts op y300. Kruispunt bevat geen voorrangsborden of verkeerslichten.',
    h.base('cross'), h.building(35,35,180,65), h.building(590,415,170,60),
    h.line(0,280,800,280,'#c5cbd0',5), h.line(0,319,800,319,'#c5cbd0',5),
    h.rect(113,276,147,47,'#e6b25a',10,'stroke="#35465b" stroke-width="2"'),
    h.rect(237,282,14,35,'#b9d6e4',3), h.rect(121,283,13,33,'#496176',3),
    [145,176,207].map(x=>h.rect(x,283,23,32,'#ece1bc',3)), h.path('M167 299l18 -17 18 17-18 17Z','none','#435568',2),
    h.text(186,266,'TRAM',13,'#344760','text-anchor="middle" font-weight="700"'), h.car(455,423,0,'blue','JIJ'), h.arrow(455,350));

  add(5,
    'De blauwe auto wil rechtsaf. Een voetganger loopt op het rechtertrottoir in dezelfde richting en wil de zijstraat rechtdoor oversteken.',
    'Blauwe bocht voert naar oostelijke rijstrook y300; voetganger blijft op dezelfde noordwaartse weg. Geen zebra of licht.',
    h.base('cross'), h.building(65,30,130,70), h.tree(690,70), h.car(455,427,0,'blue','JIJ','car',{indicator:'right'}),
    intent('M455 363V330Q455 300 490 300H552',[552,300],90), h.person(520,401,'#c88759',1.25), h.arrow(520,351), h.building(620,410,135,60));

  add(6,
    'De blauwe auto nadert van onderen en wil linksaf. De tegemoetkomende amberkleurige auto wil rechtsaf dezelfde zijstraat in.',
    'Blauw noordwaarts, tegenligger zuidwaarts. Beide bochten eindigen westwaarts op de noordelijke helft van de zijstraat.',
    h.base('cross'), h.tree(100,425), h.building(630,35,130,70),
    h.car(455,423,0,'blue','JIJ','car',{indicator:'left'}), h.car(345,70,180,'amber','','car',{indicator:'right'}),
    intent('M455 355V247Q455 200 406 200H283',[283,200],270), intent('M345 120V161Q345 185 316 185H250',[250,185],270));

  add(7,
    'Een blauwe auto rijdt vanuit een inrit naar de straat. Een voetganger loopt over het doorlopende trottoir voor de inrit.',
    'Doorlopend trottoir duidelijk onderscheiden van particuliere verharding en openbare rijbaan.',
    h.base('horizontal'), h.rect(366,368,128,132,'#bcbab3'), h.rect(0,352,800,41,curb),
    [360,378].map(y=>h.line(0,y,800,y,'#c0c8cb',1)), h.line(368,392,492,392,'#eeeee7',6),
    h.building(570,412,180,70), h.building(55,410,180,70), h.car(430,446,0,'blue'), h.label(373,455,'JIJ'), h.person(534,373,'#d99b52',1.2), h.arrow(495,373,270));

  add(8,
    'De blauwe auto staat met zijn neus in een parkeervak en rijdt achteruit richting de rijroute. Daar nadert een amberkleurige auto van rechts.',
    'Blauwe auto wijst noord; achteruitpijl wijst zuid naar de rijroute. Parkeerterrein, geen straatkruispunt.',
    h.base('blank'), h.rect(85,40,630,420,curb,14), h.rect(100,55,600,390,asphalt,10),
    [125,205,285,365,445,525,605].map(x=>lotBay(x,65,75,140)),
    [125,205,285,365,445,525,605].map(x=>lotBay(x,340,75,94)),
    h.car(242,138,0,'blue','JIJ'), h.rect(225,170,8,5,'#fff'), h.rect(250,170,8,5,'#fff'), h.arrow(242,249,180),
    h.car(571,285,270,'amber'), h.car(484,136,0,'gray'), h.car(403,389,180,'white'), h.tree(47,375,27));

  add(9,
    'Binnen een bebouwde omgeving staat een autobus in een haltekom. De linker richtingaanwijzer brandt; de blauwe auto nadert van achteren.',
    'Noordwaartse halte rechts van rijbaan; bus geeft naar links aan. Geen voorrangantwoord afgebeeld.',
    h.base('vertical'), h.path('M510 85H558Q582 85 582 113V277Q582 306 510 330Z',asphalt,'none',0),
    h.line(578,104,578,281,'#e7c36a',5,'stroke-dasharray="12 8"'), h.car(544,206,0,'amber','','bus',{indicator:'left'}), h.car(455,429,0,'blue','JIJ'),
    h.sign('L3',632,130,66), h.rect(650,205,85,44,'#b7c8cf',5), h.line(660,220,725,220,'#eef3f2',6), h.building(45,45,160,95), h.building(45,330,160,95));

  add(10,
    'Een blauwe auto nadert een zebrapad. Een voetganger staat rechts aan de rand van de oversteekplaats; er zijn geen verkeerslichten.',
    'Voetganger nog naast de zebra, op punt van oversteken. Auto blijft vóór de oversteek in de beginsituatie.',
    h.base('vertical'), h.zebra(296,216,216), h.person(541,241,'#dfaa58',1.35), h.sign('L2',607,166,66),
    h.car(455,414,0,'blue','JIJ'), h.building(55,70,145,95), h.tree(675,390,35));

  add(11,
    'Een blauwe auto nadert een persoon met een witte stok met rode ringen die aan de rechterkant van de straat wil oversteken. Er ligt geen zebrapad.',
    'Witte stok en rode ringen zijn apart getekend; geen zebra, verkeerslicht of antwoordmarkering.',
    h.base('vertical'), h.person(544,242,'#c89461',1.4), h.line(535,248,508,282,'#fafaf4',5),
    h.line(526,259,522,265,'#bc5660',5), h.line(517,270,513,276,'#bc5660',5),
    h.car(455,418,0,'blue','JIJ'), h.tree(155,120,36), h.building(610,75,145,80), h.building(615,380,130,80));

  add(12,
    'Een blauwe auto rijdt op een buitenweg in mist. Verderop vervagen de wegmarkeringen en een auto in de mist.',
    'Beperkt zicht zichtbaar door meerdere mistlagen; geen snelheid of stopafstand als antwoord aangegeven.',
    roadV(), h.tree(150,170,40), h.tree(650,60,35), h.tree(700,300,40),
    `<g opacity=".4">${h.car(455,84,0,'gray')}</g>`, h.car(455,414,0,'blue','JIJ'), h.weather('fog'), h.rect(0,0,800,125,'#edf2f1',0,'opacity=".25"'));

  add(13,
    'Een blauwe auto rijdt in een straat met huizen, stoepen en een plaatsnaambord. Er staat geen snelheidsbord.',
    'Bebouwde kom gegeven via plaatsnaambord en bebouwing; geen getal 50 in beeld.',
    h.base('horizontal'), h.building(35,30,150,75), h.building(245,35,145,70), h.building(70,397,155,78), h.building(570,402,165,75),
    h.rect(615,28,150,58,'#2265a7',4,'stroke="white" stroke-width="3"'), h.text(690,65,'LINDEN',24,'white','text-anchor="middle" font-weight="700"'),
    h.line(638,87,638,115,'#7e8a96',5), h.line(743,87,743,115,'#7e8a96',5), h.car(386,300,90,'blue','JIJ'), h.tree(487,82,27), h.person(482,375));

  add(14,
    'Een blauwe personenauto rijdt over een gewone buitenweg met landbouwgrond en bomen. Er staan geen snelheids- of autowegborden.',
    'Gewone tweerichtingsweg buiten de kom; geen aanhanger of impliciete autosnelwegmarkering.',
    roadH(), fields(), h.line(0,110,800,110,'#b1cfce',13), h.car(285,300,90,'blue','JIJ'), h.car(700,200,270,'white'), h.tree(110,427,28));

  add(15,
    'Een blauwe personenauto zonder aanhanger rijdt over een buitenweg met het autowegbord. Er staat geen lagere maximumsnelheid aangegeven.',
    'G3 toont wegtype, geen antwoordgetal. Blauwe auto op rechterhelft noordwaarts.',
    roadV(), h.sign('G3',591,160,80), h.tree(164,90,37), h.tree(180,370,35), h.building(642,35,110,65),
    h.car(455,390,0,'blue','JIJ'), h.car(345,105,180,'white'), h.line(65,480,245,480,'#c4c99d',12));

  add(16,
    'Een blauwe auto bevindt zich in een erf met klinkerbestrating, huizen, spelende kinderen, voetgangers en het erf-bord.',
    'Erf zonder gewone rijstrookmarkering; het getal 15 is niet afgebeeld.',
    h.base('blank'), h.rect(120,40,545,460,'#c4bfb6',22),
    Array.from({length:16},(_,i)=>h.line(125,52+i*28,657,52+i*28,'#b7b3ac',1)),
    h.building(20,55,150,95), h.building(20,310,150,95), h.building(615,65,155,100),
    h.rect(185,65,108,130,'#d3d0c7',5), lotBay(195,70,86,117), h.car(237,130,0,'gray'),
    h.circle(510,260,42,'#a6bd9b'), h.tree(510,260,26), h.person(350,207,'#cf8756'), h.person(390,229,'#6488af',.8), h.circle(421,240,9,'#e4ae58'),
    h.car(405,402,0,'blue','JIJ'), h.sign('G5',708,350,84));

  add(17,
    'Een blauwe auto met een aanhanger rijdt op een autosnelweg. Een bord geeft 100 aan; bij de aanhanger staat de toegestane maximummassa van 1.500 kilogram.',
    'Aanhanger achter noordwaartse auto; 100 is gegeven bord, 1.500 kg gegeven massa. Geen 90 zichtbaar.',
    h.base('motorway'), h.car(490,285,0,'blue'), h.label(435,290,'JIJ'), h.line(490,327,490,354,'#37475a',7),
    h.rect(463,354,54,81,'#b8c2c8',5,'stroke="#35465b" stroke-width="2"'), h.rect(469,362,42,62,'#dddcd5',3),
    h.rect(456,382,7,27,'#293747',2), h.rect(517,382,7,27,'#293747',2), h.line(465,432,515,432,'#b95f5e',4),
    speedSign(100,707,110,78), h.label(635,395,'TMM'), h.text(635,422,'1.500 kg',20), h.car(250,117,0,'white'));

  add(18,
    'Een vrijwel lege autosnelweg met drie doorgaande rijstroken en een afgescheiden vluchtstrook. De blauwe auto nadert over de middelste strook.',
    'Beginsituatie in middelste strook; geen pijl naar gewenste antwoordstrook. Rechterstrook zichtbaar vrij.',
    h.base('motorway'), h.car(370,421,0,'blue','JIJ'), h.arrow(250,185), h.arrow(370,185), h.arrow(490,185),
    h.sign('G1',706,110,77), h.tree(75,120,30), h.tree(730,400,27));

  add(19,
    'Op een gewone tweerichtingsweg rijdt een blauwe auto achter een witte auto. De middenstreep is onderbroken en er is verder vrij zicht.',
    'Geen inhaalpijl: welke zijde gebruikt moet worden is de vraag. Beide voertuigen noordwaarts op eigen rechterhelft.',
    roadV(), h.car(455,420,0,'blue','JIJ'), h.car(455,226,0,'white'), h.tree(145,80,32), h.tree(655,387,36),
    h.line(71,265,230,265,'#b7cb9f',11), h.line(71,295,230,295,'#b7cb9f',11));

  add(20,
    'Een witte auto staat links voorgesorteerd met de linker richtingaanwijzer aan. De blauwe auto nadert; rechts van de voorsorteerder is ruime rijbaan beschikbaar.',
    'Brede noordwaartse rijbaan; voorsorteerder naast de wegas. Geen fietsstrook, trottoir of pijl die de inhaalzijde voorschrijft.',
    h.base('blank'), h.rect(225,0,395,500,curb), h.rect(240,0,365,500,asphalt), h.rect(0,133,240,180,curb), h.rect(0,150,240,145,asphalt),
    h.line(390,0,390,132,white,3,dash), h.line(390,317,390,500,white,3,dash), h.line(0,220,220,220,white,3,dash),
    h.car(424,323,0,'white','','car',{indicator:'left'}), h.arrow(424,246,0,'left'), h.car(539,428,0,'blue','JIJ'), h.building(650,70,110,105), h.tree(126,413,34));

  add(21,
    'Op een snelweg staan rijen auto’s. De rij rechts van de blauwe auto heeft grotere tussenruimten en rijdt voorbij de langzamer rijdende middelste rij.',
    'Alle rijstroken lopen in dezelfde richting. Verschil in filevoortgang gegeven via voertuigen en neutrale label, niet via toestemmingssymbool.',
    h.base('motorway'), [75,180,285].map((y,i)=>h.car(370,y,0,i%2?'amber':'white','','car',{brake:true})), h.car(370,424,0,'blue','JIJ'),
    [90,225,360].map((y,i)=>h.car(250,y,0,i%2?'gray':'white','','car',{brake:true})), h.car(490,105,0,'amber'), h.car(490,338,0,'white'), h.arrow(490,232),
    h.label(651,270,'Fileverkeer'));

  add(22,
    'Voor de blauwe auto is het verkeerslicht groen. Direct na het kruispunt staat een file, waardoor er achter het kruispunt nauwelijks vrije ruimte is.',
    'Laatste fileauto eindigt bij noordrand van kruispunt; onvoldoende vrije lengte achter kruispunt. Geen stopantwoord getekend.',
    h.base('cross'), town(), h.car(455,421,0,'blue','JIJ'), h.line(405,366,505,366,white,7), h.light(560,361,'green'),
    h.car(455,94,0,'amber','','car',{brake:true}), h.car(455,8,0,'gray','','car',{brake:true}), h.car(345,420,180,'white'));

  add(23,
    'De blauwe auto nadert een spoorwegovergang met omhoogstaande slagbomen. Aan de overkant staat een korte file vlak naast het spoor.',
    'File direct voorbij spoor laat minder dan een autolengte vrij; slagbomen staan verticaal open.',
    roadV(), h.rail(250), h.line(540,330,540,232,'#fafaf0',10), h.line(260,169,260,267,'#fafaf0',10),
    [243,268,293,318].map(y=>h.line(540,y,540,y+11,'#c45d5d',10)), [180,205,230,255].map(y=>h.line(260,y,260,y+11,'#c45d5d',10)),
    h.rect(527,326,26,28,'#536476',5), h.rect(247,142,26,28,'#536476',5), h.car(455,173,0,'white','','car',{brake:true}), h.car(455,78,0,'amber','','car',{brake:true}),
    h.car(455,419,0,'blue','JIJ'), h.tree(120,390,37), h.tree(690,85,37));

  add(24,
    'Een blauwe auto nadert op ruime afstand een verkeerslicht dat geel brandt. Een stopstreep ligt vóór de kruisende weg.',
    'Afstand is schematisch, niet op schaal; voldoende stopmogelijkheid volgt uit vraagtekst. Geel licht duidelijk van rood en groen onderscheiden.',
    h.base('vertical'), h.rect(0,50,800,140,curb), h.rect(0,67,800,106,asphalt), h.line(0,120,272,120,white,3,dash), h.line(528,120,800,120,white,3,dash),
    h.line(405,211,505,211,white,8), h.light(562,196,'yellow'), h.car(455,416,0,'blue','JIJ'), h.building(40,280,142,95), h.tree(696,365,35));

  add(25,
    'Een verkeersregelaar met reflecterende kleding en een opgestoken hand staat voor de blauwe auto op het kruispunt. Het verkeerslicht voor de auto is groen.',
    'Handgebaar en groen licht zijn beide gegeven feiten. Geen tekst die de rangorde of het antwoord uitlegt.',
    h.base('cross'), h.car(455,430,0,'blue','JIJ'), h.light(567,372,'green'), officer(447,272), h.building(35,33,150,65), h.tree(681,420,35), h.car(647,200,270,'white'));

  add(28,
    'De blauwe auto rijdt op de rechterrijstrook en geeft links richting aan. Op de rijstrook ernaast rijdt een witte auto schuin voor hem.',
    'Rijstrookwisseling als voornemen, geen uitgevoerde manoeuvre of voorrangssuggestie.',
    h.base('motorway'), h.car(490,385,0,'blue','JIJ','car',{indicator:'left'}), h.car(370,318,0,'white'),
    intent('M490 328V298Q490 273 463 273H433',[433,273],270), h.car(250,90,0,'gray'), h.tree(712,265,34));

  add(29,
    'Een blauwe auto rijdt naar rechts door een straat. Achter hem nadert een ambulance met blauwe zwaailichten en getekende geluidsgolven voor de sirene.',
    'Ambulance oostwaarts achter blauwe auto; blauwe lichten en sirene beide zichtbaar. Geen uitwijkroute of stopgebaar.',
    h.base('horizontal'), h.building(60,35,160,70), h.building(575,400,170,70), h.tree(655,68,30), h.car(425,300,90,'blue','JIJ'), h.car(171,300,90,'white','','ambulance'),
    [27,39,51].map(r=>h.path(`M${170-r*.35} ${300-r}q25 -12 45 0`,'none','#438fc4',2.5,'opacity=".8"')),
    h.line(195,259,205,249,'#609ddb',3), h.line(195,341,205,351,'#609ddb',3));

  add(30,
    'De blauwe auto staat langs de rechterkant van een straat, vlak bij het kruispunt. Een maatlijn tussen de voorzijde en het kruispunt is aangeduid met 2 meter.',
    'Maatlijn geeft uitsluitend de afstand uit de vraag. Geen parkeervak of verbodssymbool.',
    h.base('cross'), h.car(482,408,0,'blue','JIJ'), h.line(565,350,565,370,'#344760',2), h.line(557,350,573,350,'#344760',2), h.line(557,370,573,370,'#344760',2),
    h.text(583,367,'2 m',20,'#344760','font-weight="700"'), h.building(55,405,150,70), h.tree(685,80,30));

  add(31,
    'Een blauwe auto staat op de rijbaan naast een witte auto in een parkeerstrook. Aan de rechterkant staat een winkel met een pakketje bij de ingang.',
    'Blauwe auto werkelijk naast geparkeerde auto, niet in een eigen parkeervak; geen antwoordmarkering.',
    h.base('blank'), h.rect(245,0,370,500,curb), h.rect(260,0,337,500,asphalt), h.line(395,0,395,500,white,3,dash),
    [20,145,270,395].map(y=>h.path(`M528 ${y}h63v116h-63Z`,'none',white,2)),
    h.car(560,208,0,'white'), h.car(493,208,0,'blue','JIJ'), h.person(455,231,'#6488b2'),
    h.building(655,140,115,140), h.rect(680,249,34,30,'#caa879',2), h.path('M697 249v30m-17-15h34','none','#a58863',2), h.tree(120,360,38));

  add(32,
    'De blauwe auto bevindt zich direct naast een rood gemarkeerde fietsstrook aan de rechterzijde van de rijbaan. Verderop rijdt een fietser over de strook.',
    'Rode fietsstrook bevat fietssymbool en afscheiding; auto staat er direct naast, geen parkeerstrook ertussen.',
    h.base('vertical'), h.rect(470,0,40,500,'#b77e78'), h.line(470,0,470,500,white,3,dash),
    h.car(435,300,0,'blue','JIJ'), h.bike(490,143,0,'#dab361'),
    `<g opacity=".85" transform="translate(490 413)">${h.circle(0,-13,8,'none','stroke="white" stroke-width="2"')}${h.circle(0,13,8,'none','stroke="white" stroke-width="2"')}${h.line(0,-13,0,13,white,3)}${h.line(-8,-5,8,-5,white,2)}</g>`,
    h.building(50,70,140,85), h.tree(650,315,34));

  add(33,
    'Een blauwe auto staat langs de straat voor een brede inrit die naar een garage leidt. Het trottoir loopt herkenbaar door voor de inrit.',
    'Carrosserie blokkeert de inritopening; geen parkeerverbodsbord of antwoordtekst nodig.',
    h.base('horizontal'), h.rect(378,0,114,132,'#bcbab3'), h.building(315,7,240,80), h.rect(390,45,90,42,'#a7b7bc',3),
    [54,63,72,81].map(y=>h.line(396,y,474,y,'#8e9fa7',2)), h.rect(0,116,800,34,curb), h.line(378,148,492,148,'#eeeeea',6),
    h.car(434,179,270,'blue','JIJ'), h.tree(130,75,30), h.building(590,400,150,70));

  add(34,
    'Een blauwe auto is op een autosnelweg een afrit voorbijgereden. Rechts buigt de uitrijstrook af, met een driehoekig puntstuk tussen afrit en doorgaande rijbaan.',
    'Noordwaartse blauwe auto staat voorbij het aftakpunt; geen achteruitpijl of aanbevolen vervolgroute.',
    h.base('motorway'), h.path('M565 355Q625 245 835 165','none',curb,95), h.path('M565 355Q625 245 835 165','none',asphalt,76),
    h.path('M620 244L674 235 620 291Z',white,'none',0), h.line(550,310,550,500,white,4),
    h.path('M595 315Q650 245 800 191','none',white,3,dash), h.car(490,76,0,'blue','JIJ'), h.car(370,357,0,'white'),
    h.rect(665,65,118,62,'#2767a4',6), h.text(724,92,'AFRIT',17,'white','text-anchor="middle" font-weight="700"'), h.path('M692 109h54m-12-8 12 8-12 8','none','white',3));

  add(201,
    'Een blauwe auto nadert het begin van een autoweg. Het blauwe bord met een autosymbool staat rechts naast de rijbaan; de weg buigt verderop naar rechts.',
    'G3 geeft uitsluitend wegtype; geen getal dat de minimale toelatingssnelheid verklapt. Auto op rechterhelft van bochttoegang.',
    h.base('curve'), h.car(510,417,0,'blue','JIJ'), h.sign('G3',647,358,83), h.tree(162,101,39), h.tree(189,360,34), h.building(580,28,145,70));

  add(202,
    'Een blauwe auto rijdt op de rechterrijstrook van een autosnelweg. Naast hem ligt een lege vluchtstrook achter een doorgetrokken streep. Een klein navigatiekaartje staat apart naast de weg.',
    'Nog geen stop op vluchtstrook uitgevoerd; geen noodgeval of geopend spitsstrookteken. Navigatie geeft alleen bedoeling uit vraag weer.',
    h.base('motorway'), h.car(490,414,0,'blue','JIJ'), h.car(370,90,0,'white'), h.label(642,316,'Vluchtstrook'),
    h.rect(665,62,111,145,'#f4f2e9',10,'stroke="#899aa6" stroke-width="3"'),
    h.path('M680 73v120m-3-52h88m-88 38h88','none','#d3dcd5',8), h.path('M688 185v-44h60v-53','none','#8ca5bb',4), h.circle(688,185,6,'#3459e6'));

  add(203,
    'Op een voorrangsweg tussen landbouwgrond staat de blauwe auto langs de rand van de rijbaan. Het gele ruitvormige voorrangswegbord staat verderop rechts.',
    'Buiten de kom, auto op asfalt en niet in berm of parkeervak. B1 is gegeven context, geen parkeerverbod afgebeeld.',
    roadV(), fields(), h.sign('B1',591,123,74), h.car(480,333,0,'blue','JIJ'), h.tree(150,295,31), h.line(570,222,785,222,'#b2cecc',13));

  add(204,
    'De blauwe auto nadert de onderste toerit van een rotonde met haaientanden en een omlopend rood fietspad. Op de rotonde komt een amberkleurige auto van links naar de toerit toe; op het fietspad rijdt niemand.',
    'Rotonde tegen de klok in: auto linksonder rijdt naar rechtsonder. Eigen noordwaartse toerit heeft haaientanden vóór het lege fietspad; geen extra fietsers of voorrangsaanspraken.',
    h.base('blank'), `<g transform="translate(0 -30)">${h.base('roundabout')}</g>`, h.rect(272,470,256,30,curb), h.rect(290,470,220,30,asphalt),
    h.circle(400,220,181,'none','stroke="#d2d9de" stroke-width="28"'), h.circle(400,220,181,'none','stroke="#b77e78" stroke-width="22"'),
    `<g transform="translate(400 39)" fill="none" stroke="#fbfaf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
      '<circle cx="-9" cy="3" r="5"/><circle cx="10" cy="3" r="5"/><path d="M-9 3l6-9 5 9H-9m6-9h8l5 9M-4-8h5m4-1h4"/></g>',
    `<g transform="translate(455 464) scale(.9)">${h.car(0,0,0,'blue')}</g>`, h.label(491,480,'JIJ'), h.teeth(418,406,4), h.sign('B6',575,425,55),
    h.car(335,323,120,'amber'), h.sign('D1',400,242,62), h.tree(125,85,30), h.tree(682,422,28));

  add(205,
    'Een blauwe auto nadert een rustige T-aansluiting en wil rechtsaf, aangegeven met een witte intentiepijl. Er is geen ander verkeer zichtbaar.',
    'Pijl toont alleen het gegeven afslagvoornemen. Geen brandende richtingaanwijzer die het gevraagde tijdstip al voordoet.',
    h.base('blank'), h.rect(272,0,256,500,curb), h.rect(290,0,220,500,asphalt), h.rect(510,132,290,236,curb), h.rect(510,150,290,200,asphalt),
    h.line(400,0,400,140,white,3,dash), h.line(400,370,400,500,white,3,dash), h.line(530,250,800,250,white,3,dash),
    h.car(455,426,0,'blue','JIJ'), intent('M455 355V330Q455 300 490 300H558',[558,300],90), h.tree(145,250,39), h.building(622,35,130,65));

  add(206,
    'Een blauwe auto staat achter andere auto’s op een stedelijke doorgaande rijstrook. Rechts ligt een afzonderlijke strook met het woord BUS; daarop rijdt verderop een autobus.',
    'BUS-strook apart met doorgetrokken grens. Geen toestemming of verboden-pictogram over blauwe auto.',
    h.base('motorway'), h.rect(550,0,70,500,'#707f88'), h.line(550,0,550,500,white,4),
    h.text(584,315,'BUS',23,white,'text-anchor="middle" font-weight="700"'), h.text(584,460,'BUS',23,white,'text-anchor="middle" font-weight="700"'),
    h.car(490,428,0,'blue','JIJ'), h.car(490,316,0,'white','','car',{brake:true}), h.car(490,205,0,'gray','','car',{brake:true}), h.car(490,94,0,'amber','','car',{brake:true}),
    h.car(584,132,0,'amber','','bus'), h.building(670,50,100,115), h.building(28,285,100,130));

  add(207,
    'De blauwe auto rijdt op een gewone weg naast een langwerpig vlak met schuine witte strepen. Het vlak is door een witte rand van de rijstrook gescheiden.',
    'Verdrijvingsvlak, geen spitsstrook/busstrook, zonder voertuigen of antwoordmarkeringen erop.',
    h.base('blank'), h.rect(270,0,343,500,curb), h.rect(285,0,313,500,asphalt), h.line(400,0,400,500,white,3,dash),
    hatch(523,77,62,333), h.car(455,414,0,'blue','JIJ'), h.car(345,117,180,'white'), h.tree(128,230,39), h.tree(688,99,31));

  add(208,
    'Een blauwe auto nadert een rood verkeerslicht bij een kruispunt. Een brede witte stopstreep ligt vóór de kruising en vóór de paal van het licht.',
    'Auto nog op afstand vóór de streep, niet al als juiste eindpositie geplaatst. Licht en streep afzonderlijk zichtbaar.',
    h.base('cross'), h.car(455,447,0,'blue'), h.label(490,471,'JIJ'), h.line(405,381,505,381,white,9), h.light(567,286,'red'),
    h.car(175,300,90,'white'), h.building(630,30,135,65), h.tree(143,423,29));

  add(209,
    'Bij een kruispunt nadert een blauwe auto een geel knipperend verkeerslicht. Rond de gele lamp staan korte stralen. Een amberkleurige auto nadert de kruising van rechts.',
    'Knipperen statisch verbeeld met stralen rond gele lamp; geen eigen voorrang of verplicht stopmoment gevisualiseerd.',
    h.base('cross'), h.car(455,426,0,'blue','JIJ'), h.car(660,200,270,'amber'), h.light(565,363,'yellow'),
    [[-27,-13],[-31,2],[-27,17],[27,-13],[31,2],[27,17]].map(([x,y])=>h.line(565+x,363+y,565+x*1.27,363+y*1.27,'#d9ab34',3)),
    h.building(49,35,145,65), h.tree(691,421,30));

  add(210,
    'Een blauwe auto rijdt op een autosnelweg. Naast de weg staat een vast bord met 100; boven zijn rijstrook toont een zwart matrixbord 70.',
    'Beide getallen zijn gegeven tekens, identiek neutraal weergegeven zonder juiste antwoord te markeren.',
    h.base('motorway'), h.line(170,193,633,193,'#8b9aa5',12), h.line(170,193,170,284,'#8b9aa5',9), h.line(633,193,633,284,'#8b9aa5',9),
    h.rect(447,159,86,66,'#263544',6,'stroke="#c5ced3" stroke-width="3"'), h.circle(490,192,26,'#263544','stroke="#e16961" stroke-width="4"'),
    h.text(490,201,'70',25,'#fafaf2','text-anchor="middle" font-weight="700"'), speedSign(100,719,316,75),
    h.car(490,418,0,'blue','JIJ'), h.car(250,80,0,'white'), h.tree(74,389,29));

  return records;
};
