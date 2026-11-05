// Builds responsive AVIF + WebP files from images/raw/*.jpg and writes data/images.json.
// Run after adding or replacing a photo:  npm run images
// Output names carry a content hash, so the files can be cached forever.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const rawDir = path.join(root, 'images/raw');
const outDir = path.join(root, 'assets/img');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'images/manifest.json'), 'utf8'));

// Large widths only for images used full-bleed.
const HERO = new Set(['home-hero', 'hanoi-2', 'halong-1', 'about-1', 'sapa-1', 'hagiang-1', 'phongnha-2', 'hue-1', 'hoian-1', 'danang-2', 'hcmc-1', 'mekong-1', 'phuquoc-1', 'mekong-2', 'halong-2', 'phongnha-3', 'phongnha-1', 'ninhbinh-1', 'ninhbinh-2', 'halong-3', 'stays-1']);
const WIDTHS = [480, 800, 1200, 1600];
const HERO_WIDTHS = [480, 800, 1200, 1600, 2400];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const existing = new Set(fs.readdirSync(outDir));
  const keep = new Set();
  const out = {};
  for (const m of manifest) {
    const src = path.join(rawDir, m.file);
    if (!fs.existsSync(src)) { console.warn('missing', src); continue; }
    const buf = fs.readFileSync(src);
    const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
    const meta = await sharp(buf).rotate().metadata();
    const w0 = meta.width, h0 = meta.height;
    const widths = (HERO.has(m.slot) ? HERO_WIDTHS : WIDTHS).filter((w) => w <= w0);
    if (!widths.length || widths[widths.length - 1] < Math.min(w0, 1600)) widths.push(w0);
    const files = [];
    for (const w of widths) {
      for (const fmt of ['avif', 'webp']) {
        const name = `${m.slot}.${hash}-${w}.${fmt}`;
        keep.add(name);
        files.push({ w, fmt, name });
        if (existing.has(name)) continue;
        let p = sharp(buf).rotate().resize({ width: w, withoutEnlargement: true });
        p = fmt === 'avif' ? p.avif({ quality: w > 1200 ? 45 : 50, effort: 4 }) : p.webp({ quality: w > 1200 ? 68 : 72 });
        await p.toFile(path.join(outDir, name));
      }
    }
    // Social sharing image (1200x630 JPEG) for hero slots.
    if (HERO.has(m.slot)) {
      const og = `${m.slot}.${hash}-og.jpg`;
      keep.add(og);
      if (!existing.has(og)) await sharp(buf).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(outDir, og));
      out[m.slot] = { og };
    }
    out[m.slot] = Object.assign(out[m.slot] || {}, {
      w: w0, h: h0, hash,
      widths: [...new Set(widths)],
      focus: m.focus || 'center',
    });
    process.stdout.write('.');
  }
  for (const f of existing) if (!keep.has(f)) fs.unlinkSync(path.join(outDir, f));
  fs.writeFileSync(path.join(root, 'data/images.json'), JSON.stringify(out, null, 1));
  console.log('\nimages:', Object.keys(out).length);
})();
