#!/usr/bin/env node
/* Kleine webserver om TheorieTrainer via http te openen, bijvoorbeeld op je telefoon.
 *
 *   node tools/server.cjs            alleen op deze computer: http://localhost:8080
 *   node tools/server.cjs --lan      ook voor andere apparaten op hetzelfde wifi-netwerk
 *   node tools/server.cjs --port 9000
 *
 * Geen extra pakketten nodig. Ondersteunt 'Range'-verzoeken: zonder die ondersteuning spelen
 * video's op een iPhone (Safari) niet af en werkt doorspoelen niet goed.
 * Stoppen: Ctrl+C. Op de computer zelf kun je index.html ook gewoon dubbelklikken.
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const args = process.argv.slice(2);
const lan = args.includes('--lan');
const portArg = args.indexOf('--port');
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT || 8080);
const root = path.resolve(__dirname, '..');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm'
};

function send(res, status, headers, body) {
  res.writeHead(status, { 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { Allow: 'GET, HEAD' }, 'Methode niet toegestaan');
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return send(res, 400, {}, 'Ongeldig adres'); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(root, '.' + rel);
  // Alleen bestanden binnen de projectmap, geen verborgen bestanden of mappen (zoals .git).
  if (file !== root && !file.startsWith(root + path.sep)) return send(res, 403, {}, 'Geen toegang');
  if (path.relative(root, file).split(path.sep).some(part => part.startsWith('.'))) return send(res, 404, {}, 'Niet gevonden');
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Niet gevonden');
    const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    let start = 0, end = stat.size - 1, status = 200;
    const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Last-Modified': stat.mtime.toUTCString() };
    if (range && (range[1] !== '' || range[2] !== '')) {
      if (range[1] === '') { start = Math.max(0, stat.size - Number(range[2])); }
      else { start = Number(range[1]); if (range[2] !== '') end = Math.min(Number(range[2]), stat.size - 1); }
      if (start > end || start >= stat.size) return send(res, 416, { 'Content-Range': `bytes */${stat.size}` }, '');
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, { 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', ...headers });
    if (req.method === 'HEAD' || stat.size === 0) return res.end();
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Poort ${port} is al in gebruik. Kies een andere, bijvoorbeeld: node tools/server.cjs --port 8081` : error.message);
  process.exit(1);
});

server.listen(port, lan ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`TheorieTrainer draait op http://localhost:${port}/`);
  if (lan) {
    const addresses = Object.values(os.networkInterfaces()).flat().filter(a => a && a.family === 'IPv4' && !a.internal).map(a => a.address);
    for (const address of addresses) console.log(`Op je telefoon (zelfde wifi): http://${address}:${port}/`);
    console.log('Let op: zolang de server draait, kan iedereen op dit netwerk de website openen.');
  } else {
    console.log('Alleen op deze computer bereikbaar. Gebruik --lan om hem op je telefoon te openen.');
  }
  console.log('Stoppen: Ctrl+C');
});
