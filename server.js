// Local server for PUBG Scoreboard. No npm packages required.
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 8080;
const root = __dirname;
const dataFile = path.join(root, 'scores.json');
let state = [];
try { state = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch { /* first run */ }
const clients = new Set();
const json = (res, status, value) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}); res.end(JSON.stringify(value)); };
const broadcast = () => { const msg = `data: ${JSON.stringify(state)}\n\n`; for (const res of clients) res.write(msg); };

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/state' && req.method === 'GET') return json(res, 200, state);
  if (url.pathname === '/api/state' && req.method === 'PUT') {
    let body = ''; req.on('data', chunk => body += chunk);
    return req.on('end', () => { try { const next = JSON.parse(body); if (!Array.isArray(next) || next.length > 25) throw Error(); state = next; fs.writeFileSync(dataFile, JSON.stringify(state, null, 2)); broadcast(); json(res, 200, {ok:true}); } catch { json(res, 400, {error:'Invalid team data'}); } });
  }
  if (url.pathname === '/events') { res.writeHead(200, {'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', Connection:'keep-alive'}); clients.add(res); res.write(`data: ${JSON.stringify(state)}\n\n`); req.on('close', () => clients.delete(res)); return; }
  const requested = ['/', '/admin', '/live', '/overlay'].includes(url.pathname) ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.resolve(root, requested);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  const type = path.extname(file) === '.css' ? 'text/css' : path.extname(file) === '.js' ? 'application/javascript' : 'text/html';
  res.writeHead(200, {'Content-Type': `${type}; charset=utf-8`}); fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`PUBG Scoreboard: http://localhost:${port}`));
