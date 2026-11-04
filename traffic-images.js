/* Eigen vectorillustraties. Eenmalig genereren met: node traffic-images.js
 * Geen pakketten, downloads of netwerkverzoeken; de app gebruikt alleen de SVG's.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = __dirname;
const colors = { blue: '#3459e6', amber: '#e8aa51', white: '#f7f7f0', red: '#c46560', gray: '#a9b6c6' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const h = {
  rect: (x,y,w,ht,fill,rx=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${ht}" rx="${rx}" fill="${fill}" ${extra}/>`,
  line: (x,y,x2,y2,stroke='#fff',width=4,extra='') => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`,
  path: (d,fill='none',stroke='#fff',width=4,extra='') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`,
  circle: (x,y,r,fill,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`,
  text: (x,y,label,size=18,fill='#25334b',extra='') => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${esc(label)}</text>`,
};
h.label = (x,y,label) => h.text(x,y,label,16,'#33465a','font-weight="700"');
h.base = type => {
  let s = h.rect(0,0,800,500,'#dce8db');
  const v = h.rect(272,0,256,500,'#d2d9de') + h.rect(290,0,220,500,'#6e7c8d');
  const hor = h.rect(0,132,800,236,'#d2d9de') + h.rect(0,150,800,200,'#6e7c8d');
  if (type === 'cross') return s+v+hor+h.rect(290,130,220,240,'#6e7c8d')+h.line(400,0,400,130,'#f5f2df',3,'stroke-dasharray="22 18"')+h.line(400,370,400,500,'#f5f2df',3,'stroke-dasharray="22 18"')+h.line(0,250,270,250,'#f5f2df',3,'stroke-dasharray="22 18"')+h.line(530,250,800,250,'#f5f2df',3,'stroke-dasharray="22 18"');
  if (type === 'vertical') return s+v+h.line(400,0,400,500,'#f5f2df',3,'stroke-dasharray="22 18"');
  if (type === 'horizontal') return s+hor+h.line(0,250,800,250,'#f5f2df',3,'stroke-dasharray="22 18"');
  if (type === 'motorway') return s+h.rect(156,0,490,500,'#ccd4d8')+h.rect(180,0,440,500,'#6e7c8d')+[310,430].map(x=>h.line(x,0,x,500,'#fff',3,'stroke-dasharray="28 18"')).join('')+h.line(550,0,550,500)+h.line(188,0,188,500)+h.line(615,0,615,500)+h.line(160,0,160,500,'#8a9ba6',7);
  if (type === 'roundabout') return s+v+hor+h.circle(400,250,172,'#d2d9de')+h.circle(400,250,155,'#6e7c8d')+h.circle(400,250,94,'#d2d9de')+h.circle(400,250,86,'#b1c8a8')+h.tree(400,250,33);
  if (type === 'curve') return s+h.path('M455 550V390Q455 200 640 200H850','none','#d2d9de',244)+h.path('M455 550V390Q455 200 640 200H850','none','#6e7c8d',220)+h.path('M455 550V390Q455 200 640 200H850','none','#f5f2df',3,'stroke-dasharray="22 18"');
  return s;
};
h.car = (x,y,angle=0,color='blue',label='',kind='car',opts={}) => {
  const fill=colors[color] || color;
  const size = {car:[44,76],van:[48,94],truck:[56,132],bus:[54,128],ambulance:[50,100],tractor:[52,78],motorcycle:[22,50]}[kind] || [44,76];
  const [w,l]=size, top=-l/2;
  let s=h.rect(-w/2-3,top+15,w+6,l-30,'#293747',5)+h.rect(-w/2,top,w,l,fill,9,'stroke="#35465b" stroke-width="1.5"');
  s+=h.rect(-w/2+5,top+13,w-10,15,'#c8e6f1',4)+h.rect(-w/2+5,l/2-21,w-10,10,'#496176',3);
  s+=h.rect(-w/2+3,top+3,9,4,'#fff3be',1)+h.rect(w/2-12,top+3,9,4,'#fff3be',1);
  s+=h.rect(-w/2+3,l/2-7,8,4,opts.brake?'#fa6054':'#c74c4a',1)+h.rect(w/2-11,l/2-7,8,4,opts.brake?'#fa6054':'#c74c4a',1);
  if (kind==='truck') s+=h.rect(-w/2+3,top+35,w-6,l-42,'#eef0e9',3)+h.line(-w/2+8,top+41,w/2-8,top+41,'#bac7d0',2);
  if (kind==='bus') s+=h.rect(-w/2+5,top+37,w-10,51,'#e8c478',3)+[top+37,top+58,top+79].map(a=>h.line(-w/2,a,-w/2,a+12,'#c8e6f1',5)+h.line(w/2,a,w/2,a+12,'#c8e6f1',5)).join('');
  if (kind==='ambulance') s+=h.rect(-w/2+3,top+32,w-6,9,'#287ce0',2)+h.rect(-w/2+4,top+47,w-8,21,'#e9df5f',2)+h.path('M-10 0L0 10 10 0','none','#d16f55',4)+h.circle(-20,top+36,5,'#8ad9ff')+h.circle(20,top+36,5,'#8ad9ff');
  if (kind==='tractor') s+=h.rect(-33,8,15,31,'#293747',3)+h.rect(18,8,15,31,'#293747',3)+h.rect(-14,-7,28,28,'#b8d5d8',4);
  if (kind==='motorcycle') s+=h.circle(0,0,9,'#2d3d52');
  if (opts.door) s+=h.path(`M${-w/2} -8l-34 -18 0 28 ${34} 10Z`,fill,'#35465b',2)+h.path(`M${-w/2-5} -8l-23 -12v14l23 9Z`,'#c8e6f1','#35465b',1);
  if (opts.indicator) { const side=opts.indicator==='left'?-1:1; s+=h.circle(side*(w/2+3),top+10,5,'#ffca49','stroke="#755e31" stroke-width="1"'); }
  if (label) s+=h.rect(-17,-5,34,20,'#fff',5)+h.text(0,9,label,12,'#25334b','font-weight="700" text-anchor="middle"');
  return `<g transform="translate(${x} ${y}) rotate(${angle})">${s}</g>`;
};
h.bike = (x,y,angle=0,color='#25334b') => `<g transform="translate(${x} ${y}) rotate(${angle})">${h.line(0,-24,0,24,'#263748',5)}${h.line(-11,-11,11,-11,'#263748',3)}${h.line(-8,7,8,7,'#263748',3)}${h.rect(-8,-5,16,19,color,5)}${h.circle(0,-10,7,'#efc8a3')}${h.circle(0,-12,5,'#f3ecdb')}</g>`;
h.person = (x,y,color='#de9a55',scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${h.line(-4,5,-6,16,'#344760',4)}${h.line(4,5,7,14,'#344760',4)}${h.rect(-9,-3,18,13,color,5)}${h.circle(0,-6,7,'#efc8a3')}</g>`;
h.tree = (x,y,r=28) => h.circle(x+4,y+5,r,'#537764','opacity=".15"')+h.circle(x,y,r,'#97b69b')+h.circle(x-r*.2,y-r*.25,r*.65,'#a9c6a4');
h.building = (x,y,w,ht) => h.rect(x+5,y+5,w,ht,'#b5c7c1',5)+h.rect(x,y,w,ht,'#e9e3d8',5,'stroke="#bdc5bf" stroke-width="2"')+h.rect(x+8,y+8,w-16,ht-16,'#d2c9bd',3);
h.zebra = (x,y,width=130,angle=0) => `<g transform="translate(${x} ${y}) rotate(${angle})">${Array.from({length:Math.floor(width/22)},(_,i)=>h.rect(i*22,0,12,50,'#fbfaf0')).join('')}</g>`;
h.teeth = (x,y,count=4,angle=0) => `<g transform="translate(${x} ${y}) rotate(${angle})">${Array.from({length:count},(_,i)=>h.path(`M${i*18} 5l7 15 7 -15Z`,'#fbfaf0','none',0)).join('')}</g>`;
h.arrow = (x,y,angle=0,turn='straight') => `<g transform="translate(${x} ${y}) rotate(${angle})">${h.path(turn==='straight'?'M0 28V-25m-10 11 10-11 10 11':turn==='left'?'M0 28V0Q0 -18 -18 -18H-35m10 -10-10 10 10 10':'M0 28V0Q0 -18 18 -18H35m-10 -10 10 10-10 10','none','#f9f8ed',5,'stroke-linecap="round" stroke-linejoin="round"')}</g>`;
h.light = (x,y,state='red') => h.line(x,y,x,y+65,'#495867',5)+h.rect(x-15,y-39,30,82,'#263544',10)+['red','yellow','green'].map((v,i)=>h.circle(x,y-24+i*26,9,v===state?({red:'#ef574d',yellow:'#f8cf52',green:'#68cb96'}[v]):'#465466')).join('');
h.rail = (y=250) => h.rect(0,y-26,800,52,'#b9c3c9')+Array.from({length:27},(_,i)=>h.line(i*30,y-21,i*30,y+21,'#8b989e',5)).join('')+h.line(0,y-13,800,y-13,'#465466',4)+h.line(0,y+13,800,y+13,'#465466',4);
h.weather = type => {
  if (type==='rain') return h.rect(0,0,800,500,'#6584a8',0,'opacity=".12"')+Array.from({length:60},(_,i)=>h.line((i*137)%800,(i*79)%500,(i*137)%800-9,(i*79)%500+19,'#c8e4f5',2,'opacity=".65"')).join('');
  if (type==='fog') return Array.from({length:7},(_,i)=>h.path(`M-20 ${30+i*75} Q200 ${i*75-20} 420 ${30+i*75}T840 ${i*75+15}`,'none','#f2f5f5',38,'opacity=".36"')).join('');
  if (type==='snow') return h.rect(0,0,800,500,'#eef4f3',0,'opacity=".2"')+Array.from({length:65},(_,i)=>h.circle((i*137)%800,(i*79)%500,3,'#fff','opacity=".8"')).join('');
  if (type==='ice') return h.path('M285 160q100 -30 230 20l-10 60q-150 20-210 -10Z','#cce5ed','none',0,'opacity=".45"')+h.line(315,185,410,190,'#e6f6ff',2)+h.line(360,213,473,217,'#e6f6ff',2);
  if (type==='night') return h.rect(0,0,800,500,'#102038',0,'opacity=".48"')+h.circle(718,66,25,'#f6edc4')+h.circle(728,58,23,'#81939b');
  if (type==='sun') return h.circle(620,65,88,'#fff5bf','opacity=".4"')+h.circle(620,65,45,'#fff4b2','opacity=".7"')+[[-90,130],[-40,180],[30,190]].map(([a,b])=>h.line(620,90,620+a,90+b,'#fff5c8',17,'opacity=".3"')).join('');
  if (type==='wind') return [100,160,220].map(y=>h.path(`M40 ${y}q50 -30 120 0t110 0`,'none','#f2f6ef',4,'opacity=".8"')).join('');
  return '';
};

function generate() {
  const signs = require('./illustrations/signs.cjs');
  h.sign = (code,x,y,size=64) => {
    if (!signs.symbols[code]) throw new Error(`Onbekend verkeersbord: ${code}`);
    return h.line(x,y,x,y+size*.85,'#7e8a96',5)+`<g transform="translate(${x-size/2} ${y-size/2}) scale(${size/120})">${signs.symbols[code]}</g>`;
  };
  const records = [...require('./illustrations/roads.cjs')(h), ...signs.questions(h), ...require('./illustrations/hazards.cjs')(h)].sort((a,b)=>a.id-b.id);
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'questions.js'),'utf8'),context);
  const questions=context.window.THEORY_QUESTIONS;
  const byId=new Map(questions.map(q=>[q.id,q]));
  const seen=new Set();
  fs.mkdirSync(path.join(ROOT,'images','signs'),{recursive:true});
  const wrap=(svg,title,w=800,ht=500)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${ht}" width="${w}" height="${ht}" role="img"><title>${esc(title)}</title>${svg}</svg>\n`;
  for (const q of questions) { q.image=null; q.imageAlt=''; }
  for (const item of records) {
    if (seen.has(item.id) || !byId.has(item.id) || !item.alt || !item.svg) throw new Error(`Ongeldig illustratierecord ${item.id}`);
    seen.add(item.id);
    const q=byId.get(item.id);
    q.image=`images/question-${String(q.id).padStart(3,'0')}.svg`;
    q.imageAlt=item.alt;
    fs.writeFileSync(path.join(ROOT,q.image),wrap(item.svg,item.alt));
  }
  for (const [code,svg] of Object.entries(signs.symbols)) {
    const filename=signs.files[code];
    if (!filename || !/^[a-z0-9-]+\.svg$/.test(filename)) throw new Error(`Onjuist bordbestand ${code}`);
    fs.writeFileSync(path.join(ROOT,'images','signs',filename),wrap(svg,`Zelfgetekend verkeersbord ${code}`,120,120));
  }
  fs.writeFileSync(path.join(ROOT,'questions.js'),'/* Zelfgeschreven oefenvragen voor Rijbewijs B. Afbeeldingen: eigen lokale SVG-illustraties. */\nwindow.THEORY_QUESTIONS = '+JSON.stringify(questions,null,2)+';\n');
  fs.writeFileSync(path.join(ROOT,'illustrations','manifest.json'),JSON.stringify(records.map(r=>({id:r.id,image:byId.get(r.id).image,alt:r.alt,note:r.note||''})),null,2)+'\n');
  const gallery=records.map(r=>({id:r.id,image:'../'+byId.get(r.id).image,alt:r.alt,question:byId.get(r.id).question}));
  fs.writeFileSync(path.join(ROOT,'illustrations','overzicht.html'),`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eigen verkeersillustraties — overzicht</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;font:14px Arial,sans-serif;background:#f3f5f8;color:#25334b}header{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1400px;margin:auto auto 18px}h1{font-size:22px;margin:0}nav{display:flex;gap:12px;align-items:center}button{padding:12px;background:white;border:1px solid #ccd4de;border-radius:8px;cursor:pointer}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;max-width:1400px;margin:auto}figure{background:white;border-radius:12px;overflow:hidden;margin:0;border:1px solid #dce2e9}img{width:100%;height:auto;display:block}figcaption{padding:9px 12px;font-size:11px;line-height:1.4;min-height:65px}strong{color:#3459e6}a{color:inherit}@media(max-width:800px){main{grid-template-columns:repeat(2,minmax(0,1fr))}header{flex-direction:column}}</style><header><h1>${records.length} eigen verkeersillustraties</h1><nav><button id="prev">Vorige</button><span id="page"></span><button id="next">Volgende</button><a href="../index.html">Naar de trainer</a></nav></header><main id="grid"></main><script>const items=${JSON.stringify(gallery).replace(/</g,'\\u003c')};let page=0;const escape=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));function render(){document.getElementById('grid').innerHTML=items.slice(page*12,page*12+12).map(q=>'<figure><img width="800" height="500" src="'+q.image+'" alt="'+escape(q.alt)+'"><figcaption><strong>Vraag '+q.id+'</strong> '+escape(q.question)+'</figcaption></figure>').join('');document.getElementById('page').textContent=(page+1)+' / '+Math.ceil(items.length/12);document.getElementById('prev').disabled=page===0;document.getElementById('next').disabled=(page+1)*12>=items.length}document.getElementById('prev').onclick=()=>{page--;render()};document.getElementById('next').onclick=()=>{page++;render()};render();</script></html>`);
  console.log(`${records.length} vraagillustraties en ${Object.keys(signs.symbols).length} verkeersborden gegenereerd.`);
}
if (require.main === module) generate();
module.exports = { h, generate };
