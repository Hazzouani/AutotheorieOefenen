# Zelfgemaakte verkeersillustraties

Alle afbeeldingen zijn lokaal getekend, zonder externe media. Bouw de complete verzameling opnieuw op met eerst `node traffic-images.js` en daarna `node illustrations/extra.cjs`. De eerste opdracht schrijft de 117 basis-SVG’s en afbeeldingsvelden in `questions.js`; de tweede bouwt 100 SVG’s voor de uitbreiding, werkt het gezamenlijke manifest bij en genereert de galerij. Voer ze in deze volgorde uit. De browser heeft deze generatoren niet nodig.

## Tekencontract

Canvas 800 × 500. Noord is boven. Positieve rotatie is met de klok mee. Voertuigen wijzen bij 0 graden naar boven, 90 naar rechts, 180 beneden, 270 links. Nederlands rechts rijden: op een verticale weg rijdt de rechterhelft omhoog, op een horizontale weg de onderste helft naar rechts.

Elke module exporteert `module.exports = h => [...]` met records `{ id, alt, svg, note }`. `svg` is de inhoud zonder buitenste svg-tag. `note` is een korte controle van koppeling met de vraag, geen tekst in de afbeelding. Lees voor ieder record de originele vraag, opties en uitleg in questions.js. Geen antwoord verklappende teksten of markeringen. Blauwe auto is de bestuurder (JIJ), andere auto's amber/wit. Alle pijlen zijn wit/grijs en geven alleen bedoelde richting weer.

Tekenfuncties (allemaal retourneren SVG-string):

- `h.base(type)` type `cross`, `vertical`, `horizontal`, `motorway`, `roundabout`, `curve`, `blank`. Met groen terrein en stoepen. Verticale rijbaan x290..510; horizontaal y150..350; kruis heeft beide, midden zonder lijnen. Verticale lanes: x345 zuidwaarts, x455 noordwaarts. Horizontaal: y200 westwaarts, y300 oostwaarts. Motorway: x180..620, omhoogrijdende lanes x250/370/490, vluchtstrook x580; rijstrooklijnen x310/430/550. Roundabout centrum(400,250), buitenradius155, binnenradius90, toegangen boven/onder/links/rechts. Curve bocht van (455,500) via (455,250) naar (800,200).
- `h.rect(x,y,w,h,fill,rx=0,extra='')`, `h.line(x1,y1,x2,y2,stroke='#fff',width=4,extra='')`, `h.path(d,fill='none',stroke='#fff',width=4,extra='')`, `h.circle(x,y,r,fill,extra='')`, `h.text(x,y,label,size=18,fill='#25334b',extra='')`. escape automatisch bij text.
- `h.car(x,y,angle=0,color='blue',label='',kind='car',opts={})`. Color blue/amber/white/red/gray of hex. kind car/van/truck/bus/ambulance/tractor/motorcycle. opts.door (open bestuurdersdeur links), opts.indicator 'left'/'right', opts.brake true. Afmetingen gewone auto44×76 gecentreerd, van48×94, bus54×128. Label 'JIJ' op het autodak (meedraaiend). Geen label indien onbekend perspectief.
- `h.bike(x,y,angle=0,color='#25334b')` 20×44. `h.person(x,y,color='#de9a55',scale=1)` van boven. `h.tree(x,y,r=28)`, `h.building(x,y,w,h)`, `h.label(x,y,text)` kleine neutrale straat-/objectaanduiding.
- `h.zebra(x,y,width=130,angle=0)` strepen over horizontale breedte, dus over verticale rijbaan. `h.teeth(x,y,count=4,angle=0)` driehoeken punt omlaag, naar verkeer dat vanuit beneden nadert. `h.arrow(x,y,angle=0,turn='straight')` witte intentiepijl omhoog of left/right. `h.light(x,y,state='red')` in kader met drie lampen; h.sign(code,x,y,size=64) op paaltje, symbool hergebruikt uit sign module. Voor onbekende code fallback tekst is NIET toegestaan: gebruik alleen de geleverde codes.
- `h.weather(type)` rain/fog/snow/ice/night/sun/wind, transparante passende weereffecten over scene. Weather heeft geen antwoordtekst. `h.rail(y=250)` horizontale spoorbaan.

Signmodule exporteert `{ symbols, files, questions }`, symbols is een object code→SVG-inhoud in viewBox0 0 120 120; files code→Nederlandse bestandsnaam; questions(h) geeft records. Root renderer definieert `h.sign` daarmee. Gebruik codes A1, B1,B2,B6,B7,C1,C2,C3,C7,C11,C12,D1,D2,D4,D5,D6,D7,E1,E2,F1,G1,G3,G5,J21,L2,L3. A1 standaard50; kan expliciet ander getal tekenen met eigen helper.
