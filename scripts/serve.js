// Local preview server: serves dist/ with clean URLs and runs api/enquiry.js.
// Usage: npm run build && npm run serve   → http://localhost:3000
const http = require('http'), fs = require('fs'), path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const enquiry = require('../api/enquiry.js');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = +process.env.PORT || 3000;
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.replace(/\/$/, '') === '/api/enquiry') return enquiry(req, res);
  let p = decodeURIComponent(url.pathname);
  if (!path.extname(p) && !p.endsWith('/')) { res.writeHead(308, { Location: p + '/' + url.search }); return res.end(); }
  let file = path.join(dist, p.endsWith('/') ? p + 'index.html' : p);
  if (!file.startsWith(dist) || !fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': types['.html'] }); return res.end(fs.readFileSync(path.join(dist, '404.html'))); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}`));
