// Sanity checks on the built site: `npm run build && npm run check`.
// Broken internal links, missing alternates, images without size or alt, and banned content.
const fs = require('fs');
const path = require('path');
const cfg = require('../config/site.config.js');
const dist = path.join(__dirname, '..', 'dist');

const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) files.push(p); } })(dist);

const exists = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean.startsWith('/api/')) return true;
  const p = path.join(dist, decodeURIComponent(clean));
  return fs.existsSync(clean.endsWith('/') ? path.join(p, 'index.html') : p) || fs.existsSync(p + '.html');
};
const problems = [];
const banned = [/tel:/i, /whatsapp/i, /unsplash/i, /\+84\s?\d/, /facebook\.com|instagram\.com|twitter\.com|x\.com\/|tiktok\.com|linkedin\.com|youtube\.com/i, /testimonial/i, /lorem ipsum/i, /TODO|TBD|\[placeholder\]/];
let imgs = 0;
for (const f of files) {
  const rel = '/' + path.relative(dist, f);
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) if (!exists(m[1])) problems.push(`${rel}: broken ${m[1]}`);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0]; if (u.startsWith('/') && !exists(u)) problems.push(`${rel}: broken srcset ${u}`); }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) { imgs++; const t = m[0]; if (!/\bwidth="\d+"/.test(t) || !/\bheight="\d+"/.test(t)) problems.push(`${rel}: img without size ${t.slice(0, 80)}`); if (!/\balt="/.test(t)) problems.push(`${rel}: img without alt`); }
  if (!/<html lang="(en|fr|de|es)"/.test(html)) problems.push(`${rel}: no lang`);
  if (!rel.endsWith('404.html')) {
    if ((html.match(/rel="alternate" hreflang=/g) || []).length !== cfg.locales.length + 1) problems.push(`${rel}: hreflang count`);
    if (!/rel="canonical"/.test(html)) problems.push(`${rel}: no canonical`);
  }
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  for (const b of banned) if (b.test(text)) problems.push(`${rel}: banned pattern ${b}`);
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)) if (m[0] !== cfg.email) problems.push(`${rel}: unexpected email ${m[0]}`);
}
console.log(`${files.length} pages, ${imgs} images checked`);
if (problems.length) { console.log(problems.slice(0, 60).join('\n')); console.log(`${problems.length} problem(s)`); process.exit(1); }
console.log('all checks passed');
