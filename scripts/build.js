// Static site generator for Dragon Bay Travel. No dependencies: `node scripts/build.js`.
// Renders every page in every locale into dist/, pre-rendered, with no translation code in the browser.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const cfg = require('../config/site.config.js');
const D = require('../data/site-data.js');
const IMG = fs.existsSync(path.join(root, 'data/images.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'data/images.json'), 'utf8')) : {};
const MANIFEST = fs.existsSync(path.join(root, 'images/manifest.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'images/manifest.json'), 'utf8')) : [];
const C = Object.fromEntries(cfg.locales.map((l) => [l.code, require(`../content/${l.code}.js`)]));
const YEAR = new Date().getFullYear();

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s ?? '').replace(/<[^>]+>/g, '');
const addr1 = () => { const a = cfg.address; return `${a.line1}, ${a.street}, ${a.locality}, ${a.city} ${a.postcode}, ${a.country}`; };
const host = cfg.siteUrl.replace(/^https?:\/\//, '');
const fill = (s, L) => String(s ?? '')
  .replace(/\{\{brand\}\}/g, cfg.brand.name)
  .replace(/\{\{email\}\}/g, `<a href="mailto:${cfg.email}">${cfg.email}</a>`)
  .replace(/\{\{address\}\}/g, addr1())
  .replace(/\{\{site\}\}/g, host)
  .replace(/\{\{privacy\}\}/g, L ? u(L, '/privacy/') : '/privacy/');
const fillText = (s) => strip(String(s ?? '').replace(/\{\{brand\}\}/g, cfg.brand.name).replace(/\{\{email\}\}/g, cfg.email).replace(/\{\{address\}\}/g, addr1()).replace(/\{\{site\}\}/g, host));
const u = (L, p) => (L.prefix || '') + p;
const destBy = Object.fromEntries(D.destinations.map((d) => [d.key, d]));
const dpath = (k) => `/${destBy[k].slug}/`;
const region = (k) => { const i = D.destinations.findIndex((d) => d.key === k); return i < 5 ? 'north' : i < 9 ? 'centre' : 'south'; };

// ---------- icons and motifs ----------
const ICON = {
  ar: '<svg class="ar" viewBox="0 0 14 10" aria-hidden="true"><path d="M0 5h12.5M8.5 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  arL: '<svg class="ar" viewBox="0 0 14 10" aria-hidden="true"><path d="M14 5H1.5M5.5 1l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  lotus: '<svg class="mk" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5c1.6 1.6 2.2 3.6 1.7 6.1-.3 1.3-1 2.4-1.7 3.1-.7-.7-1.4-1.8-1.7-3.1C5.8 6.1 6.4 4.1 8 2.5Z M2 6.5c2.3.2 4 1.3 5 3.4.4.8.6 1.6.7 2.3-1.7.1-3.6-.6-4.7-2.1C2.3 9.2 2 7.9 2 6.5Zm12 0c0 1.4-.3 2.7-1 3.6-1.1 1.5-3 2.2-4.7 2.1.1-.7.3-1.5.7-2.3 1-2.1 2.7-3.2 5-3.4ZM3 13.3h10" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
  hat: '<svg class="mk" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3 1.5 12.2h13L8 3Zm-4.8 9.2c1.4 1.1 3 1.6 4.8 1.6s3.4-.5 4.8-1.6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
  strata: '<svg class="strata" viewBox="0 0 160 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1.5h160M0 5h118M0 7.2h140M0 10.5h86" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
};

// Seeded random so the karst silhouettes are identical on every build.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function smooth(pts) {
  // Catmull-Rom through the points, as cubic Bézier segments
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}
function karstPath(seed, W, H, n, minH, maxH) {
  // Limestone towers: tall, steep, undercut at the waterline, with knuckled crowns.
  const r = rng(seed);
  let p = '';
  let x = -40 + r() * 60;
  for (let i = 0; i < n * 3 && x < W + 40; i++) {
    const h = minH + Math.pow(r(), 0.8) * (maxH - minH);
    const w = h * (0.42 + r() * 0.5);
    const xL = x, xR = x + w, top = H - h;
    const pts = [
      [xL - w * 0.02, H + 2],
      [xL + w * 0.07, H - h * 0.05],
      [xL - w * 0.03, H - h * (0.18 + r() * 0.1)],
      [xL + w * (0.02 + r() * 0.06), H - h * (0.5 + r() * 0.12)],
      [xL + w * (0.1 + r() * 0.06), H - h * (0.82 + r() * 0.06)],
    ];
    const bumps = 2 + Math.floor(r() * 3);
    for (let b = 0; b < bumps; b++) {
      const fx = 0.2 + (b + r() * 0.6) * (0.6 / bumps);
      pts.push([xL + w * fx, top + h * (r() * 0.09)]);
    }
    pts.push([xR - w * (0.1 + r() * 0.06), H - h * (0.8 + r() * 0.08)]);
    pts.push([xR - w * (0.02 + r() * 0.05), H - h * (0.48 + r() * 0.12)]);
    pts.push([xR + w * 0.03, H - h * (0.2 + r() * 0.08)]);
    pts.push([xR - w * 0.07, H - h * 0.05]);
    pts.push([xR + w * 0.02, H + 2]);
    p += smooth(pts);
    x += w * (0.55 + r() * 0.5) + (r() < 0.3 ? r() * w * 1.4 : 0);
  }
  return p + `M0 ${H - 3}H${W}V${H + 2}H0Z`;
}
function karstSvg(seed, n, minH, maxH, fill, mist) {
  const W = 1600, H = 520;
  const id = `m${seed}`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">` +
    (mist ? `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill}" stop-opacity="${mist[0]}"/><stop offset="1" stop-color="${fill}" stop-opacity="${mist[1]}"/></linearGradient></defs>` : '') +
    `<path d="${karstPath(seed, W, H, n, minH, maxH)}" fill="${mist ? `url(#${id})` : fill}"/></svg>`;
}
// Layers: [seed, towers, minH, maxH, colour, mist, speed]
const HOME_LAYERS = [
  [11, 9, 150, 360, '#E4E8E3', [0.2, 0], 0.34],
  [23, 8, 120, 300, '#A9BBB4', [0.34, 0.06], 0.24],
  [37, 7, 90, 250, '#3B5A53', [0.9, 0.55], 0.13],
  [41, 6, 50, 190, '#17201E', [1, 0.96], 0.04],
];
const karstHome = () => `<div class="karst karst--home">${HOME_LAYERS.map((l) => `<div class="karst__layer" data-speed="${l[6]}">${karstSvg(l[0], l[1], l[2], l[3], l[4], l[5])}</div>`).join('')}</div>`;
const karstPage = (seed) => `<div class="karst karst--page"><div class="karst__layer" data-speed="0.12">${karstSvg(seed, 8, 80, 260, '#1D1F1C', [0.15, 0.7])}</div></div>`;

// ---------- images ----------
function pic(slot, alt, { sizes = '100vw', eager = false, cls = '', ratio, high = false } = {}) {
  const im = IMG[slot];
  if (!im) return `<div class="img-missing" role="img" aria-label="${esc(alt)}" style="background:#9AA39F;width:100%;height:100%"></div>`;
  const set = (fmt) => im.widths.map((w) => `/assets/img/${slot}.${im.hash}-${w}.${fmt} ${w}w`).join(', ');
  const fallbackW = im.widths.includes(1200) ? 1200 : im.widths[im.widths.length - 1];
  const w = 1200, h = Math.round(1200 * (ratio || im.h / im.w));
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/assets/img/${slot}.${im.hash}-${fallbackW}.webp" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? `loading="eager"${high ? ' fetchpriority="high"' : ''}` : 'loading="lazy"'} decoding="async" style="object-position:${im.focus || 'center'}"></picture>`;
}
const alt = (c, slot) => c.alts[slot] || '';
const preloadFor = (slot, sizes) => {
  const im = IMG[slot]; if (!im) return '';
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${im.widths.map((w) => `/assets/img/${slot}.${im.hash}-${w}.avif ${w}w`).join(', ')}" imagesizes="${sizes}" fetchpriority="high">`;
};

// ---------- assets ----------
const tokens = Object.entries(cfg.palette).map(([k, v]) => `--c-${k}:${v}`).join(';');
const CSS = `:root{${tokens}}` + fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}');
const JS = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//')).join('\n');
const jsHash = crypto.createHash('sha1').update(JS).digest('hex').slice(0, 10);
const JS_URL = `/assets/js/main.${jsHash}.js`;

// ---------- shared chrome ----------
function langLinks(L, pagePath) {
  return cfg.locales.map((l, i) => `${i ? '<span class="dot" aria-hidden="true">·</span>' : ''}<a href="${u(l, pagePath)}" hreflang="${l.hreflang}" lang="${l.code}"${l.code === L.code ? ' aria-current="true"' : ''}><span class="sr">${esc(l.name)}</span><span aria-hidden="true">${l.label}</span></a>`).join('');
}
function header(L, c, pagePath) {
  const t = c.ui;
  return `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="hdr">
  <div class="hdr__l">
    <a class="nav-link" href="${u(L, '/destinations/')}" data-menu-open><span class="burger" aria-hidden="true"></span><span>${esc(t.menu)}</span></a>
    <a class="nav-link nav-pill" href="${u(L, '/journeys/')}"${pagePath === '/journeys/' ? ' aria-current="page"' : ''}>${esc(t.navJourneys)}</a>
    <a class="nav-link nav-pill nav-pill--x" href="${u(L, '/stays/')}"${pagePath === '/stays/' ? ' aria-current="page"' : ''}>${esc(t.navStays)}</a>
  </div>
  <a class="brand" href="${u(L, '/')}" aria-label="${esc(cfg.brand.name)}, ${esc(t.home)}">${ICON.lotus}<span class="brand__full">${esc(cfg.brand.name)}</span><span class="brand__short">${esc(cfg.brand.short)}</span></a>
  <div class="hdr__r">
    <nav class="langs" aria-label="${esc(t.language)}">${langLinks(L, pagePath)}</nav>
    <a class="btn hdr__cta" href="${u(L, '/enquire/')}">${esc(t.enquire)}</a>
  </div>
</header>`;
}
function menu(L, c, pagePath) {
  const t = c.ui;
  const groups = [['north', D.destinations.slice(0, 5)], ['centre', D.destinations.slice(5, 9)], ['south', D.destinations.slice(9)]];
  let n = 0;
  const cols = groups.map(([g, ds]) => `<div class="menu__group"><p class="mono">${esc(c.destIndex.regions[g])}</p><ul class="menu__list">${ds.map((d) => `<li><a href="${u(L, dpath(d.key))}" data-pv="${d.key}"><span class="n">${String(++n).padStart(2, '0')}</span>${esc(c.dest[d.key].name)}</a></li>`).join('')}</ul></div>`).join('');
  const prev = D.destinations.map((d, i) => { const im = IMG[d.img[0]]; return im ? `<img data-src="/assets/img/${d.img[0]}.${im.hash}-800.webp" data-pv="${d.key}" alt="" width="800" height="600"${i === 0 ? ' class="is-on"' : ''}>` : ''; }).join('');
  return `<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="${esc(t.menu)}" inert>
  <div class="menu__top"><button class="pill" type="button" data-menu-close><span aria-hidden="true">✕</span>${esc(t.close)}</button><a class="brand" href="${u(L, '/')}">${ICON.lotus}<span class="brand__full">${esc(cfg.brand.name)}</span><span class="brand__short">${esc(cfg.brand.short)}</span></a><span></span></div>
  <div class="menu__body">
    <nav class="menu__cols" aria-label="${esc(t.navDestinations)}">${cols}</nav>
    <div class="menu__side">
      <div class="menu__preview" aria-hidden="true">${prev}</div>
      <nav class="menu__sec" aria-label="${esc(t.menu)}">
        <a href="${u(L, '/journeys/')}">${esc(t.navJourneys)}</a>
        <a href="${u(L, '/ha-long-lan-ha-bay/')}#which-bay">${esc(t.navBays)}</a>
        <a href="${u(L, '/phong-nha/')}#cave-ladder">${esc(t.navCaves)}</a>
        <a href="${u(L, '/stays/')}">${esc(t.navStays)}</a>
        <a href="${u(L, '/about/')}">${esc(t.navAbout)}</a>
        <a href="${u(L, '/journal/')}">${esc(t.navJournal)}</a>
        <a href="${u(L, '/enquire/')}">${esc(t.enquire)}</a>
      </nav>
      <nav class="langs" aria-label="${esc(t.language)}">${langLinks(L, pagePath)}</nav>
      <p class="menu__mail"><a href="mailto:${cfg.email}">${cfg.email}</a></p>
    </div>
  </div>
</div>`;
}
function footer(L, c, pagePath) {
  const t = c.ui;
  const dl = (k) => `<li><a href="${u(L, dpath(k))}">${esc(c.dest[k].name)}</a></li>`;
  const a = cfg.address;
  return `<footer class="ftr dark">
  <div class="ftr__panel"><div><p class="eyebrow">${esc(t.writeTo)}</p><h2 class="h2">${t.footerCta}</h2></div><div><p>${esc(t.footerCtaText)}</p><a class="btn btn--light" href="${u(L, '/enquire/')}">${esc(t.enquire)} ${ICON.ar}</a></div></div>
  <div class="ftr__cols">
    <div class="ftr__lead"><p class="ftr__brand">${esc(cfg.brand.name)}</p><p>${esc(t.footerLead)}</p><p><a href="mailto:${cfg.email}">${cfg.email}</a></p><address>${esc(a.line1)}, ${esc(a.street)}, ${esc(a.locality)}, ${esc(a.city)} ${esc(a.postcode)}, ${esc(a.country)}</address></div>
    <nav class="ftr__c1" aria-label="${esc(t.footerExplore)}"><h2>${esc(t.footerExplore)}</h2><ul class="ftr__two">${D.destinations.map((d) => dl(d.key)).join('')}</ul></nav>
    <nav class="ftr__c3" aria-label="${esc(t.footerCompany)}"><h2>${esc(t.footerCompany)}</h2><ul>
      <li><a href="${u(L, '/journeys/')}">${esc(t.navJourneys)}</a></li><li><a href="${u(L, '/stays/')}">${esc(t.navStays)}</a></li><li><a href="${u(L, '/about/')}">${esc(t.navAbout)}</a></li><li><a href="${u(L, '/journal/')}">${esc(t.navJournal)}</a></li><li><a href="${u(L, '/enquire/')}">${esc(t.enquire)}</a></li></ul></nav>
    <nav class="ftr__c4" aria-label="${esc(t.footerLegal)}"><h2>${esc(t.footerLegal)}</h2><ul>
      <li><a href="${u(L, '/privacy/')}">${esc(t.privacy)}</a></li><li><a href="${u(L, '/booking-terms/')}">${esc(t.terms)}</a></li><li><a href="${u(L, '/cookies/')}">${esc(t.cookies)}</a></li><li><a href="${u(L, '/credits/')}">${esc(t.credits)}</a></li></ul></nav>
  </div>
  <div class="ftr__bot"><span>© ${YEAR} ${esc(cfg.brand.name)}. ${esc(t.rights)}</span><nav class="langs" aria-label="${esc(t.language)}">${langLinks(L, pagePath)}</nav><a href="#top">${esc(t.toTop)} ↑</a></div>
</footer>`;
}

function jsonld(L, c, extra = []) {
  const a = cfg.address;
  const org = {
    '@context': 'https://schema.org', '@type': 'TravelAgency', '@id': `${cfg.siteUrl}/#org`,
    name: cfg.brand.name, url: cfg.siteUrl + '/', email: cfg.email, description: fillText(c.meta.home.description),
    image: IMG['home-hero'] ? `${cfg.siteUrl}/assets/img/home-hero.${IMG['home-hero'].hash}-og.jpg` : undefined,
    address: { '@type': 'PostalAddress', streetAddress: `${a.line1}, ${a.street}`, addressLocality: `${a.locality}, ${a.city}`, postalCode: a.postcode, addressCountry: a.countryCode },
    geo: { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng },
    areaServed: { '@type': 'Country', name: 'Vietnam' },
    knowsLanguage: cfg.locales.map((l) => l.code),
  };
  return [org, ...extra].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('');
}
const crumbs = (L, items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name: strip(name), item: cfg.siteUrl + u(L, p) })) });

function page(L, c, { path: pagePath, meta, body, preload = '', ogSlot = 'home-hero', ld = [], cta = true, noindex = false, bodyClass = '', navPath }) {
  const np = navPath || pagePath;
  const canonical = cfg.siteUrl + u(L, pagePath);
  const alts = cfg.locales.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${cfg.siteUrl + u(l, pagePath)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${cfg.siteUrl + pagePath}">`;
  const og = IMG[ogSlot] && IMG[ogSlot].og ? `${cfg.siteUrl}/assets/img/${IMG[ogSlot].og}` : '';
  const title = fillText(meta.title), desc = fillText(meta.description);
  return `<!doctype html>
<html lang="${L.code}" id="top">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
${navPath ? '' : `<link rel="canonical" href="${canonical}">
${alts}`}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(cfg.brand.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="${L.og}">${og ? `<meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="${cfg.palette.ink}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/literata-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/work-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<style>${CSS}</style>
<script src="${JS_URL}" defer></script>
${jsonld(L, c, ld)}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header(L, c, np)}
${menu(L, c, np)}
<main id="main">
${body}
</main>
${footer(L, c, np, { cta })}
</body>
</html>`;
}

// ---------- components ----------
const eyebrow = (s, mk = ICON.lotus) => `<p class="eyebrow">${mk}${s}</p>`;
function weatherStrip(L, c, { dark = true, id = 'when-to-go' } = {}) {
  const w = c.weather, M = c.ui.monthsShort;
  const labels = [w.poor, w.mixed, w.good];
  const data = { labels, regions: D.weather.map((r) => ({ name: w.regionShort[r.key], m: r.m, notes: w.notes[r.key] })) };
  return `<section class="sec ${dark ? 'dark' : ''} wx" id="${id}" data-wx="${esc(JSON.stringify(data))}" aria-labelledby="${id}-h">
  <div class="wrap">
    <div class="wx__head"><div>${eyebrow(esc(w.eyebrow))}<h2 class="h2" id="${id}-h">${w.title}</h2></div><p class="lede muted">${esc(w.lede)}</p></div>
    <div class="wx__months" role="group" aria-label="${esc(w.pick)}">${c.ui.months.map((m, i) => `<button type="button" aria-pressed="false" title="${esc(m)}">${esc(M[i])}</button>`).join('')}</div>
    <table>
      <caption class="sr">${esc(w.caption)}</caption>
      <thead><tr><th scope="col" style="width:22%"><span class="sr">${esc(c.ui.north)} → ${esc(c.ui.south)}</span></th>${M.map((m, i) => `<th scope="col" data-m="${i}">${esc(m)}</th>`).join('')}</tr></thead>
      <tbody>${D.weather.map((r) => `<tr><th scope="row">${esc(w.regions[r.key])}</th>${r.m.map((v, i) => `<td data-m="${i}"><span class="c c${v}" title="${esc(c.ui.months[i])}: ${esc(labels[v])} · ${esc(w.notes[r.key][i])}"><span class="sr">${esc(c.ui.months[i])}: ${esc(labels[v])}, ${esc(w.notes[r.key][i])}</span></span></td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div class="wx__legend" aria-hidden="true"><span><i class="c c2"></i>${esc(w.good)}</span><span><i class="c c1"></i>${esc(w.mixed)}</span><span><i class="c c0"></i>${esc(w.poor)}</span></div>
    <ul class="wx__out" aria-live="polite"></ul>
    <p class="small muted" style="margin-top:20px">${esc(w.caption)}</p>
  </div>
</section>`;
}
function wxMini(c, key) {
  const r = D.weather.find((x) => x.key === key);
  const lab = [c.weather.poor, c.weather.mixed, c.weather.good];
  return `<div class="wx-mini" role="list">${r.m.map((v, i) => `<span role="listitem" class="m${v}" title="${esc(c.ui.months[i])}: ${esc(lab[v])}"><span aria-hidden="true">${esc(c.ui.monthsShort[i].slice(0, 3))}</span><span class="sr">${esc(c.ui.months[i])}: ${esc(lab[v])}</span></span>`).join('')}</div>`;
}
function baysChooser(L, c) {
  const b = c.bays;
  const scores = Object.fromEntries(D.bays.map((x) => [x.key, x.scores]));
  const q = (name, legend, opts) => `<fieldset><legend>${esc(legend)}</legend><div class="chips">${Object.entries(opts).map(([v, l]) => `<label class="chip"><input type="radio" name="${name}" value="${v}"><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;
  const meter = (n) => `<span class="meter" aria-hidden="true">${[1, 2, 3].map((i) => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span>`;
  return `<section class="sec bays" id="which-bay" data-bays="${esc(JSON.stringify(scores))}" aria-labelledby="bays-h">
  <div class="wrap">
    <div class="shead"><div>${eyebrow(esc(b.eyebrow))}<h2 class="h2" id="bays-h">${b.title}</h2></div><p class="lede muted">${esc(b.lede)}</p></div>
    <form class="bays__q" onsubmit="return false">${q('p', b.q1, b.q1a)}${q('t', b.q2, b.q2a)}${q('w', b.q3, b.q3a)}
      <div style="grid-column:1/-1;display:flex;flex-wrap:wrap;gap:16px;align-items:center"><p class="h3" data-bay-result data-label="${esc(b.result)}" aria-live="polite" style="margin:0"></p><button class="lnk" type="reset" style="border:0;background-color:transparent;cursor:pointer">${esc(b.reset)}</button></div>
    </form>
    <div class="bays__grid">${D.bays.map((x) => { const t = b.items[x.key]; return `<article class="bay" data-bay="${x.key}">
      <div class="media">${pic(x.img, alt(c, x.img), { sizes: '(min-width:900px) 31vw, 100vw', ratio: 0.75 })}<span class="bay__pick">${esc(b.result)}</span></div>
      <h3>${esc(t.name)}</h3><p class="tag mono">${esc(t.tag)}</p>
      <dl>
        <div><dt>${esc(b.rowCrowds)} ${meter(x.crowd)}</dt><dd>${esc(t.crowds)}</dd></div>
        <div><dt>${esc(b.rowCruise)}</dt><dd>${esc(t.cruise)}</dd></div>
        <div><dt>${esc(b.rowKayak)} ${meter(x.kayak)}</dt><dd>${esc(t.kayak)}</dd></div>
        <div><dt>${esc(b.rowAccess)}</dt><dd>${esc(t.access)}</dd></div>
        <div><dt>${esc(b.rowBest)}</dt><dd>${esc(t.best)}</dd></div>
      </dl>
      <a class="btn btn--line" href="${u(L, '/enquire/')}?bay=${encodeURIComponent(t.name)}&amp;interest=bays">${esc(b.enquireBay)} ${ICON.ar}</a>
    </article>`; }).join('')}</div>
    <p class="small muted" style="margin-top:32px;max-width:48em">${esc(b.note)}</p>
  </div>
</section>`;
}
function caveLadder(L, c) {
  const k = c.caves;
  const lad = { reach: k.reach, stretch: k.stretch, beyond: k.beyond, none: k.none };
  const rungs = [...D.caves].reverse();
  const pips = (n) => `<span class="pips" aria-hidden="true">${[1, 2, 3, 4].map((i) => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span>`;
  return `<section class="sec dark" id="cave-ladder" aria-labelledby="ladder-h">
  <div class="wrap">
    <div class="shead"><div>${eyebrow(esc(k.eyebrow))}<h2 class="h2" id="ladder-h">${k.title}</h2></div><p class="lede muted">${esc(k.lede)}</p></div>
    <div class="ladder" data-ladder="${esc(JSON.stringify(lad))}">
      <form class="ladder__ctl" onsubmit="return false">
        <div><label class="mono" for="cl-days" style="display:block;margin-bottom:10px">${esc(k.daysLabel)}</label><div style="display:flex;align-items:center;gap:18px"><output class="range-out" for="cl-days">2</output><input class="range" id="cl-days" name="days" type="range" min="1" max="5" step="1" value="2"></div></div>
        <fieldset><legend>${esc(k.fitLabel)}</legend><div class="chips">${k.fit.map((f, i) => `<label class="chip"><input type="radio" name="fit" value="${i + 1}"${i === 1 ? ' checked' : ''}><span>${esc(f)}</span></label>`).join('')}</div></fieldset>
        <fieldset><legend>${esc(k.swimLabel)}</legend><div class="chips"><label class="chip"><input type="radio" name="swim" value="yes" checked><span>${esc(k.yes)}</span></label><label class="chip"><input type="radio" name="swim" value="no"><span>${esc(k.no)}</span></label></div></fieldset>
        <div class="ladder__top" aria-live="polite"><span class="mono">${esc(k.topRung)}</span><b>—</b></div>
        <p class="small muted">${esc(k.note)}</p>
      </form>
      <ol class="ladder__rungs" reversed>${rungs.map((r, i) => { const t = k.rungs[r.key]; return `<li><details class="rung" data-days="${r.days}" data-fit="${r.fit}" data-swim="${r.swim ? 1 : 0}"${i === rungs.length - 1 ? '' : ''}>
        <summary><span class="lvl">${String(rungs.length - i).padStart(2, '0')}</span><span class="nm">${esc(t.name)}<small>${esc(t.kind)} · ${esc(t.days)}</small></span><span class="st">${esc(k.reach)}</span></summary>
        <div class="rung__body"><p>${esc(t.text)}</p>
          <dl><div><dt>${esc(k.days)}</dt><dd>${esc(t.days)}</dd></div><div><dt>${esc(k.walking)}</dt><dd>${esc(t.walk)}</dd></div><div><dt>${esc(k.swim)}</dt><dd>${esc(t.swim)}</dd></div><div><dt>${esc(k.fitness)}</dt><dd>${pips(r.fit)} ${esc(t.fitness)}</dd></div><div><dt>${esc(k.age)}</dt><dd>${esc(t.age)}</dd></div><div><dt>${esc(k.operator)}</dt><dd>${esc(t.op)}</dd></div><div><dt>${esc(k.season)}</dt><dd>${esc(t.season)}</dd></div></dl>
          <a class="btn btn--line" href="${u(L, '/enquire/')}?cave=${encodeURIComponent(t.name)}&amp;interest=caves">${esc(k.planThis)} ${ICON.ar}</a></div>
      </details></li>`; }).join('')}</ol>
    </div>
  </div>
</section>`;
}
function destCard(L, c, d, i, sizes, eager = false) {
  const t = c.dest[d.key];
  return `<a class="card" href="${u(L, dpath(d.key))}"><div class="card__img">${pic(d.img[0], alt(c, d.img[0]), { sizes, ratio: 1.25, eager, high: eager && i === 0 })}<span class="card__num">${String(i + 1).padStart(2, '0')}</span></div><div class="card__meta"><p class="mono">${esc(t.region)} · ${esc(t.best)}</p><h3>${esc(t.name)}</h3><p>${esc(t.lede)}</p><span class="lnk">${esc(c.ui.discover)} ${ICON.ar}</span></div></a>`;
}
function rail(L, c, head, items) {
  return `<div class="rail">
  ${head ? `<div class="rail__head">${head}</div>` : ''}
  <div class="rail__track" tabindex="0" role="region" aria-label="${esc(c.ui.navDestinations)}">${items}</div>
  <div class="rail__foot"><div class="rail__bar" aria-hidden="true"><i></i></div><div class="rail__btns"><button type="button" aria-label="${esc(c.ui.previous)}">${ICON.arL}</button><button type="button" aria-label="${esc(c.ui.next)}">${ICON.ar}</button></div></div>
</div>`;
}
function panels(L, c) {
  return `<div class="panels">${D.journeys.map((j, i) => { const t = c.journeys[j.key]; return `<a class="panel${i === 0 ? ' is-active' : ''}" href="${u(L, '/journeys/')}#${j.key}">
    <div class="media">${pic(j.img, alt(c, j.img), { sizes: '(min-width:900px) 60vw, 100vw' })}</div>
    <div class="panel__v" aria-hidden="true"><span class="mono">${String(i + 1).padStart(2, '0')}</span><b>${esc(t.title)}</b></div>
    <div class="panel__body"><p class="mono">${String(i + 1).padStart(2, '0')} · ${esc(j.nights)} ${esc(c.ui.nights)} · ${j.months.length > 6 ? esc(c.ui.monthsShort[j.months[0] - 1]) + '–' + esc(c.ui.monthsShort[j.months[j.months.length - 1] - 1]) : j.months.map((m) => esc(c.ui.monthsShort[m - 1])).join(', ')}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><span class="btn">${esc(c.ui.viewJourney)} ${ICON.ar}</span></div>
  </a>`; }).join('')}</div>`;
}
function monthsRange(c, ms) {
  // consecutive months collapse into a range, wrapping the year end
  const S = c.ui.monthsShort;
  if (ms.length === 1) return S[ms[0] - 1];
  return `${S[ms[0] - 1]}–${S[ms[ms.length - 1] - 1]}`;
}
function journalIndex(L, c) {
  return `<div class="idx">${D.journal.map((a, i) => { const t = c.articles[a.key]; return `<a class="idx__row" href="${u(L, `/journal/${a.slug}/`)}"><span class="n mono">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(t.title)}</span><span class="d">${esc(t.dek)}</span><span class="go circle-ar">${ICON.ar}</span><span class="thumb" aria-hidden="true">${pic(a.img, '', { sizes: '220px' })}</span></a>`; }).join('')}</div>`;
}
function cta(L, c, slot, { eyebrowTxt, title, text } = {}) {
  return `<section class="cta">
  <div class="media" data-speed="0.1">${pic(slot, alt(c, slot), { sizes: '100vw' })}</div>
  <div class="cta__in rv">${eyebrow(esc(eyebrowTxt || c.home.ctaEyebrow))}<h2 class="h1">${title || c.home.ctaTitle}</h2><p>${esc(text || c.home.ctaText)}</p><a class="btn" href="${u(L, '/enquire/')}">${esc(c.ui.enquire)} ${ICON.ar}</a></div>
</section>`;
}
const heroLines = (n = 6) => `<div class="hero__lines" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;

// ---------- pages ----------
function homePage(L, c) {
  const h = c.home;
  const body = `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero__media" data-speed="0.42">${pic('home-hero', alt(c, 'home-hero'), { eager: true, high: true })}</div>
  ${karstHome()}
  ${heroLines(6)}
  <div class="hero__copy"><p class="eyebrow">${ICON.lotus}${esc(h.heroEyebrow)}</p><h1 class="hero__title" id="hero-h">${esc(h.heroTitle)}</h1><a class="btn hero__cta-m" href="${u(L, '/enquire/')}">${esc(h.heroCta)} ${ICON.ar}</a></div>
  <aside class="hero__card"><div class="row mono"><span>${esc(c.dest.halong.name)}</span><span>01 / 12</span></div><div class="bar"><i></i></div><p>${esc(h.heroCard)}</p><div class="row mono" style="border:0"><span>20°48'N 107°05'E</span></div><a class="btn" href="${u(L, '/enquire/')}">${esc(h.heroCta)} ${ICON.ar}</a></aside>
  <p class="hero__word" aria-hidden="true">${esc(h.heroWord)}</p>
</section>

<section class="sec intro">
  <div class="wrap grid">
    <div class="intro__label rv">${eyebrow(esc(h.introEyebrow))}${ICON.strata}</div>
    <p class="intro__text stmt rv">${esc(h.intro)}</p>
    <div class="stats">${h.stats.map((s) => `<div class="stat rv"><b>${esc(s.n)}</b><span>${esc(s.t)}</span></div>`).join('')}</div>
  </div>
</section>

<section class="sec" style="padding-top:0" aria-labelledby="dest-h">
  ${rail(L, c, `${eyebrow(esc(h.destEyebrow))}<h2 class="h2" id="dest-h">${h.destTitle}</h2><p class="muted">${esc(h.destText)}</p><a class="lnk" href="${u(L, '/destinations/')}">${esc(c.ui.allDestinations)} ${ICON.ar}</a>`,
    D.destinations.map((d, i) => destCard(L, c, d, i, '(min-width:900px) 25vw, (min-width:600px) 44vw, 74vw')).join(''))}
</section>

<section class="sec mist" aria-labelledby="bays-teaser-h">
  <div class="wrap ed ed--a">
    <article class="ed__item"><a class="media rv-img" href="${u(L, '/ha-long-lan-ha-bay/')}#which-bay" tabindex="-1" aria-hidden="true">${pic('halong-2', alt(c, 'halong-2'), { sizes: '(min-width:900px) 66vw, 100vw', ratio: 2 / 3 })}</a>
      <div class="txt rv">${eyebrow(esc(h.baysEyebrow))}<h2 class="h2" id="bays-teaser-h" style="margin-bottom:16px">${h.baysTitle}</h2><p>${esc(h.baysText)}</p><a class="lnk" href="${u(L, '/ha-long-lan-ha-bay/')}#which-bay">${esc(h.baysCta)} ${ICON.ar}</a></div></article>
    <article class="ed__item"><a class="media rv-img" href="${u(L, '/ha-long-lan-ha-bay/')}" tabindex="-1" aria-hidden="true">${pic('halong-4', alt(c, 'halong-4'), { sizes: '(min-width:900px) 33vw, 100vw', ratio: 1.25 })}</a>
      <div class="txt rv"><p class="mono muted" style="margin-bottom:10px">${esc(c.dest.halong.name)}</p><h3 class="h3">${esc(h.baysAsideTitle)}</h3><p>${esc(h.baysAsideText)}</p></div></article>
  </div>
</section>

${weatherStrip(L, c).replace(`${esc(c.weather.eyebrow)}</p>`, `${esc(h.weatherEyebrow)}</p>`)}

<section class="sec" aria-labelledby="jr-h">
  <div class="wrap">
    <div class="shead"><div>${eyebrow(esc(h.journeysEyebrow))}<h2 class="h2" id="jr-h">${h.journeysTitle}</h2></div><div><p class="muted">${esc(h.journeysText)}</p><a class="lnk" href="${u(L, '/journeys/')}">${esc(c.ui.allJourneys)} ${ICON.ar}</a></div></div>
    ${panels(L, c)}
  </div>
</section>

<section class="sec jade" aria-labelledby="cv-h">
  <div class="wrap ed ed--b">
    <article class="ed__item"><a class="media rv-img" href="${u(L, '/phong-nha/')}#cave-ladder" tabindex="-1" aria-hidden="true">${pic('phongnha-1', alt(c, 'phongnha-1'), { sizes: '(min-width:900px) 33vw, 100vw', ratio: 1.25 })}</a></article>
    <article class="ed__item"><div class="txt rv" style="padding-top:0;max-width:none">${eyebrow(esc(h.cavesEyebrow))}<h2 class="h2" id="cv-h" style="margin-bottom:16px">${esc(h.cavesTitle)}</h2><p style="max-width:34em">${esc(h.cavesText)}</p>
      <ol class="steps">${[...D.caves].reverse().map((r, i) => `<li><span><b>${esc(c.caves.rungs[r.key].name)}</b><span class="s-b">${esc(c.caves.rungs[r.key].kind)}</span></span><em>${esc(c.caves.rungs[r.key].days)}</em></li>`).join('').replace(/<li/g, '<li').replace(/::before/g, '')}</ol>
      <a class="btn" href="${u(L, '/phong-nha/')}#cave-ladder">${esc(h.cavesCta)} ${ICON.ar}</a></div></article>
  </div>
</section>

<section class="sec" aria-labelledby="st-h">
  <div class="wrap ed ed--a">
    <article class="ed__item"><a class="media rv-img" href="${u(L, '/stays/')}" tabindex="-1" aria-hidden="true">${pic('ninhbinh-2', alt(c, 'ninhbinh-2'), { sizes: '(min-width:900px) 66vw, 100vw', ratio: 2 / 3 })}</a>
      <div class="txt rv">${eyebrow(esc(h.staysEyebrow))}<h2 class="h2" id="st-h" style="margin-bottom:16px">${h.staysTitle}</h2><p>${esc(h.staysText)}</p><a class="lnk" href="${u(L, '/stays/')}">${esc(h.staysCta)} ${ICON.ar}</a></div></article>
    <article class="ed__item"><a class="media rv-img" href="${u(L, '/stays/')}" tabindex="-1" aria-hidden="true">${pic('stays-1', alt(c, 'stays-1'), { sizes: '(min-width:900px) 33vw, 100vw', ratio: 1.25 })}</a>
      <div class="txt rv"><p class="mono muted" style="margin-bottom:10px">${esc(c.stays.hoian.place)}</p><h3 class="h3">${esc(C.en.stays.hoian.name)}</h3><p>${esc(c.stays.hoian.text)}</p></div></article>
  </div>
</section>

<section class="sec" style="padding-top:0" aria-labelledby="jn-h">
  <div class="wrap">
    <div class="shead"><div>${eyebrow(esc(h.journalEyebrow))}<h2 class="h2" id="jn-h">${esc(h.journalTitle)}</h2></div><div><a class="lnk" href="${u(L, '/journal/')}">${esc(c.ui.navJournal)} ${ICON.ar}</a></div></div>
    ${journalIndex(L, c)}
  </div>
</section>

`;
  return page(L, c, { path: '/', meta: c.meta.home, body, preload: preloadFor('home-hero', '100vw') });
}

function destIndexPage(L, c) {
  const t = c.destIndex;
  const groups = [['north', D.destinations.slice(0, 5)], ['centre', D.destinations.slice(5, 9)], ['south', D.destinations.slice(9)]];
  let n = 0;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(t.eyebrow))}<h1 class="h1">${t.title}</h1></div><p class="lede muted">${esc(t.lede)}</p></div>
${groups.map(([g, ds]) => `<section class="sec--tight wrap" aria-labelledby="g-${g}"><h2 class="mono" id="g-${g}" style="margin-bottom:24px">${esc(t.regions[g])}</h2><div class="stays">${ds.map((d) => destCard(L, c, d, n++, '(min-width:900px) 58vw, (min-width:600px) 50vw, 100vw')).join('')}</div></section>`).join('')}
${weatherStrip(L, c)}`;
  return page(L, c, { path: '/destinations/', meta: c.meta.destinations, body, ld: [crumbs(L, [[c.ui.home, '/'], [t.eyebrow, '/destinations/']])] });
}

function destPage(L, c, d, i) {
  const t = c.dest[d.key], ui = c.ui;
  const imgs = d.img;
  const xpSlots = d.xp || [imgs[1], imgs[2], imgs[3] || imgs[0]];
  const nxt = D.destinations[(i + 1) % D.destinations.length];
  const staysHere = D.stays.filter((s) => s.dest === d.key);
  const jrs = D.journeys.filter((j) => j.route.includes(d.key));
  const isLong = t.name.length > 12;
  const body = `
<section class="phero" aria-labelledby="ph-h">
  <div class="hero__media" data-speed="0.35">${pic(imgs[0], alt(c, imgs[0]), { eager: true, high: true })}</div>
  ${karstPage(100 + i * 7)}
  ${heroLines(6)}
  <div class="phero__copy"><p class="eyebrow">${ICON.lotus}${esc(t.region)}</p><h1 class="sr" id="ph-h">${esc(t.name)}</h1><p>${esc(t.lede)}</p></div>
  <p class="hero__meta mono">${String(i + 1).padStart(2, '0')} / 12 · ${d.coords}</p>
  <p class="hero__word${isLong ? ' is-long' : ''}" aria-hidden="true">${esc(t.name)}</p>
</section>

<section class="sec">
  <div class="wrap dsplit">
    <div class="dsplit__a rv">${eyebrow(`${String(i + 1).padStart(2, '0')} · ${esc(t.name)}`)}
      <dl class="facts"><div><dt>${esc(ui.bestMonths)}</dt><dd>${esc(t.best)}</dd></div><div><dt>${esc(ui.suggestedNights)}</dt><dd>${esc(t.nights)}</dd></div><div><dt>${esc(ui.gettingThere)}</dt><dd>${esc(t.access)}</dd></div><div><dt>${esc(ui.pace)}</dt><dd>${esc(t.pace)}</dd></div></dl>
    </div>
    <div class="dsplit__b"><p class="stmt stmt--m rv">${esc(t.intro)}</p>
      <div class="rv" style="margin-top:48px"><p class="mono muted" style="margin-bottom:12px">${esc(ui.whenToGo)} · ${esc(c.weather.regions[d.wx])}</p>${wxMini(c, d.wx)}<p class="small muted" style="margin-top:10px"><a class="lnk-inline" href="${u(L, '/journeys/')}#when-to-go">${esc(c.weather.title.replace(/<[^>]+>/g, ''))}</a></p></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap xp">${t.exp.map((x, k) => `<article class="xp__row"><div class="media rv-img">${pic(xpSlots[k], alt(c, xpSlots[k]), { sizes: '(min-width:900px) 58vw, 100vw', ratio: k === 2 ? 1.25 : k === 1 ? 0.75 : 2 / 3 })}</div><div class="txt rv"><p class="n mono">${String(k + 1).padStart(2, '0')} / 03</p><h2 class="h3">${esc(x.t)}</h2><p>${esc(x.p)}</p></div></article>`).join('')}</div>
</section>

${d.key === 'halong' ? baysChooser(L, c) : ''}
${d.key === 'phongnha' ? caveLadder(L, c) : ''}

${staysHere.length ? `<section class="sec mist" aria-labelledby="sh-h"><div class="wrap ed ed--a">${staysHere.map((s) => { const st = c.stays[s.key]; return `<article class="ed__item"><div class="media rv-img">${pic(s.img, alt(c, s.img), { sizes: '(min-width:900px) 66vw, 100vw', ratio: 2 / 3 })}</div><div class="txt rv">${eyebrow(esc(ui.staysHere))}<h2 class="h2" id="sh-h" style="margin-bottom:10px">${esc(C.en.stays[s.key].name)}</h2><p class="mono muted" style="margin-bottom:14px">${esc(st.place)} · ${esc(st.kind)}</p><p>${esc(st.text)}</p><p class="ph-note">${esc(ui.placeholderNote)}</p><a class="lnk" href="${u(L, '/stays/')}">${esc(c.home.staysCta)} ${ICON.ar}</a></div></article>`; }).join('')}
  <article class="ed__item"><div class="media rv-img">${pic(imgs[0], alt(c, imgs[0]), { sizes: '(min-width:900px) 33vw, 100vw', ratio: 1.25 })}</div></article></div></section>` : ''}

<section class="sec" aria-labelledby="pr-h">
  <div class="wrap dsplit">
    <div class="dsplit__a">${eyebrow(esc(ui.practical))}<h2 class="h2" id="pr-h">${esc(t.name)}</h2></div>
    <div class="dsplit__b acc">${t.notes.map((n, k) => `<details${k === 0 ? ' open' : ''}><summary>${esc(n.q)}<span class="pm" aria-hidden="true"></span></summary><div><p>${esc(n.a)}</p></div></details>`).join('')}</div>
  </div>
</section>

${jrs.length ? `<section class="sec" style="padding-top:0" aria-labelledby="jh-h"><div class="wrap"><div class="shead"><div>${eyebrow(esc(ui.journeysHere))}<h2 class="h2" id="jh-h">${esc(c.journeysPage.title.replace(/<[^>]+>/g, ''))}</h2></div></div>
  <div class="idx">${jrs.map((j, k) => { const jt = c.journeys[j.key]; return `<a class="idx__row" href="${u(L, '/journeys/')}#${j.key}"><span class="n mono">${String(k + 1).padStart(2, '0')}</span><span class="t">${esc(jt.title)}</span><span class="d">${esc(jt.sub)} · ${esc(j.nights)} ${esc(ui.nights)}</span><span class="go circle-ar">${ICON.ar}</span><span class="thumb" aria-hidden="true">${pic(j.img, '', { sizes: '220px' })}</span></a>`; }).join('')}</div></div></section>` : ''}

<a class="next" href="${u(L, dpath(nxt.key))}"><div class="media">${pic(nxt.img[0], '', { sizes: '100vw' })}</div><div class="next__t"><span class="mono">${esc(i + 1 < D.destinations.length ? ui.nextPlace : ui.next)} · ${String(((i + 1) % 12) + 1).padStart(2, '0')} / 12</span><b>${esc(c.dest[nxt.key].name)}</b></div></a>`;
  const ld = [crumbs(L, [[ui.home, '/'], [ui.navDestinations, '/destinations/'], [t.name, dpath(d.key)]]),
    { '@context': 'https://schema.org', '@type': 'TouristDestination', name: t.name, description: t.lede, url: cfg.siteUrl + u(L, dpath(d.key)), inLanguage: L.code, containedInPlace: { '@type': 'Country', name: 'Vietnam' } }];
  const meta = { title: `${t.name} · ${cfg.brand.name}`, description: `${t.lede} ${ui.bestMonths}: ${t.best}.` };
  return page(L, c, { path: dpath(d.key), meta, body, preload: preloadFor(imgs[0], '100vw'), ogSlot: imgs[0], ld });
}

function journeysPage(L, c) {
  const t = c.journeysPage, ui = c.ui;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(t.eyebrow))}<h1 class="h1">${t.title}</h1></div><p class="lede muted">${esc(t.lede)}</p></div>
<section class="wrap sec--tight" style="padding-top:0" aria-labelledby="tbl-h"><h2 class="mono" id="tbl-h" style="margin-bottom:18px">${esc(t.tableTitle)}</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">${esc(t.colJourney)}</th><th scope="col">${esc(ui.route)}</th><th scope="col">${esc(t.colNights)}</th><th scope="col">${esc(t.colMonths)}</th><th scope="col">${esc(t.colPrice)}</th></tr></thead><tbody>
${D.journeys.map((j) => `<tr><td><a href="#${j.key}">${esc(c.journeys[j.key].title)}</a></td><td>${j.route.map((k) => esc(c.dest[k].name)).join(' · ')}</td><td>${esc(j.nights)}</td><td>${j.months.map((m) => esc(ui.monthsShort[m - 1])).join(', ')}</td><td>${esc(ui.priceOnRequest)}</td></tr>`).join('')}
</tbody></table></div></section>
<section class="wrap">
${D.journeys.map((j, i) => { const jt = c.journeys[j.key]; return `<article class="jr" id="${j.key}">
  <div class="media rv-img">${pic(j.img, alt(c, j.img), { sizes: '(min-width:900px) 40vw, 100vw', ratio: 1.25 })}</div>
  <div class="txt"><p class="mono">${String(i + 1).padStart(2, '0')} · ${esc(j.nights)} ${esc(ui.nights)} · ${j.months.map((m) => esc(ui.monthsShort[m - 1])).join(', ')}</p><h2 class="h2">${esc(jt.title)}</h2><p class="sub">${esc(jt.sub)}</p><p>${esc(jt.text)}</p>
    <p class="mono muted" style="margin-top:28px">${esc(t.dayByDay)}</p>
    <ol class="steps">${jt.steps.map((s) => `<li><span><b>${esc(s.p)}</b><span class="s-b">${esc(s.t)}</span></span><em>${esc(s.n)}</em></li>`).join('')}</ol>
    <p class="mono muted" style="margin-bottom:20px">${esc(t.colPrice)}: ${esc(ui.priceOnRequest)}</p>
    <a class="btn" href="${u(L, '/enquire/')}?journey=${encodeURIComponent(jt.title)}">${esc(ui.enquire)} ${ICON.ar}</a></div>
</article>`; }).join('')}
<p class="lede muted" style="padding:0 0 var(--space-m);border-top:1px solid rgba(29,31,28,.25);padding-top:32px">${esc(t.custom)}</p>
</section>
${weatherStrip(L, c)}`;
  return page(L, c, { path: '/journeys/', meta: c.meta.journeys, body, ogSlot: 'ninhbinh-1', ld: [crumbs(L, [[ui.home, '/'], [ui.navJourneys, '/journeys/']])] });
}

function staysPage(L, c) {
  const t = c.staysPage, ui = c.ui;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(t.eyebrow))}<h1 class="h1">${t.title}</h1></div><p class="lede muted">${esc(t.lede)}</p></div>
<section class="wrap" style="padding-bottom:var(--space-m)"><div class="stays">${D.stays.map((s, i) => { const st = c.stays[s.key]; return `<article class="card rv"><div class="card__img">${pic(s.img, alt(c, s.img), { sizes: '(min-width:900px) 58vw, (min-width:600px) 50vw, 100vw', ratio: 1.25 })}<span class="card__num">${String(i + 1).padStart(2, '0')}</span></div><div class="card__meta"><p class="mono">${esc(st.place)}</p><h2 class="h3" style="font-size:clamp(1.375rem,2vw,1.875rem);margin-bottom:8px">${esc(C.en.stays[s.key].name)}</h2><p class="mono" style="margin-bottom:10px">${esc(st.kind)}</p><p>${esc(st.text)}</p><p class="ph-note">${esc(ui.placeholderNote)}</p><a class="lnk" href="${u(L, dpath(s.dest))}">${esc(c.dest[s.dest].name)} ${ICON.ar}</a></div></article>`; }).join('')}</div></section>
${cta(L, c, 'ninhbinh-3')}`;
  return page(L, c, { path: '/stays/', meta: c.meta.stays, body, cta: false, ld: [crumbs(L, [[ui.home, '/'], [ui.navStays, '/stays/']])] });
}

function aboutPage(L, c) {
  const a = c.about, ui = c.ui;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(a.eyebrow))}<h1 class="h1">${a.title}</h1></div><p class="lede muted">${esc(a.lede)}</p></div>
<div class="rv-img" style="aspect-ratio:21/9;overflow:hidden;min-height:320px">${pic('about-1', alt(c, 'about-1'), { sizes: '100vw', ratio: 9 / 21 })}</div>
<section class="sec"><div class="wrap grid"><div class="intro__label rv">${eyebrow(esc(a.storyTitle))}${ICON.strata}</div><div class="intro__text">${a.story.map((p, i) => `<p class="${i === 0 ? 'stmt' : 'lede'} rv" style="margin-bottom:1.2em">${esc(p)}</p>`).join('')}</div></div></section>
<section class="sec dark"><div class="wrap"><div class="shead"><div>${eyebrow(esc(a.principlesTitle))}<h2 class="h2">${esc(a.principlesTitle)}</h2></div></div><div class="cols">${a.principles.map((p, i) => `<div class="rv"><p class="n mono">${String(i + 1).padStart(2, '0')}</p><h3>${esc(p.t)}</h3><p>${esc(p.p)}</p></div>`).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="shead"><div>${eyebrow(esc(a.processTitle))}<h2 class="h2">${esc(a.processTitle)}</h2></div></div><div class="cols">${a.process.map((p, i) => `<div class="rv"><p class="n mono">${String(i + 1).padStart(2, '0')}</p><h3>${esc(p.t)}</h3><p>${esc(p.p)}</p></div>`).join('')}</div></div></section>
${cta(L, c, 'halong-1')}`;
  return page(L, c, { path: '/about/', meta: c.meta.about, body, cta: false, ogSlot: 'about-1', ld: [crumbs(L, [[ui.home, '/'], [ui.navAbout, '/about/']])] });
}

function journalPage(L, c) {
  const t = c.journalPage, ui = c.ui;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(t.eyebrow))}<h1 class="h1">${t.title}</h1></div><p class="lede muted">${esc(t.lede)}</p></div>
<section class="wrap" style="padding-bottom:var(--space-s)">${journalIndex(L, c)}</section>
<section class="wrap" style="padding-bottom:var(--space-m)"><div class="ed ed--a">${D.journal.slice(0, 2).map((a) => { const at = c.articles[a.key]; return `<article class="ed__item"><a class="media rv-img" href="${u(L, `/journal/${a.slug}/`)}" tabindex="-1" aria-hidden="true">${pic(a.img, alt(c, a.img), { sizes: '(min-width:900px) 60vw, 100vw' })}</a><div class="txt rv"><p class="mono muted" style="margin-bottom:10px">${fmtDate(a.date, L)}</p><h2 class="h3"><a href="${u(L, `/journal/${a.slug}/`)}" style="text-decoration:none">${esc(at.title)}</a></h2><p>${esc(at.dek)}</p></div></article>`; }).join('')}</div></section>`;
  return page(L, c, { path: '/journal/', meta: c.meta.journal, body, ld: [crumbs(L, [[ui.home, '/'], [ui.navJournal, '/journal/']])] });
}
const fmtDate = (iso, L) => new Intl.DateTimeFormat({ en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' }[L.code], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));

function articlePage(L, c, a, i) {
  const t = c.articles[a.key], ui = c.ui;
  const words = t.body.join(' ').split(/\s+/).length;
  const p = `/journal/${a.slug}/`;
  const other = D.journal.filter((x) => x.key !== a.key);
  const body = `<div class="phead"><p class="eyebrow">${ICON.lotus}<a href="${u(L, '/journal/')}" style="text-decoration:none">${esc(ui.navJournal)}</a> · ${fmtDate(a.date, L)} · ${Math.max(2, Math.round(words / 200))} ${esc(ui.minRead)}</p><h1 class="h1">${esc(t.title)}</h1><p class="lede muted">${esc(t.dek)}</p></div>
<div class="wrap"><div class="rv-img" style="aspect-ratio:16/9;overflow:hidden">${pic(a.img, alt(c, a.img), { sizes: '100vw', ratio: 9 / 16 })}</div></div>
<section class="sec"><div class="wrap article"><div class="article__meta">${eyebrow(esc(ui.navJournal))}${ICON.strata}</div><div class="prose">${t.body.map((x) => `<p>${x}</p>`).join('')}<p style="margin-top:2em"><a class="lnk" href="${u(L, '/journal/')}" style="color:inherit">${ICON.arL} ${esc(ui.backToJournal)}</a></p></div></div></section>
<section class="sec mist"><div class="wrap">${eyebrow(esc(ui.navJournal))}<div class="idx">${other.map((o, k) => { const ot = c.articles[o.key]; return `<a class="idx__row" href="${u(L, `/journal/${o.slug}/`)}"><span class="n mono">${String(k + 1).padStart(2, '0')}</span><span class="t">${esc(ot.title)}</span><span class="d">${esc(ot.dek)}</span><span class="go circle-ar">${ICON.ar}</span></a>`; }).join('')}</div></div></section>`;
  const ld = [crumbs(L, [[ui.home, '/'], [ui.navJournal, '/journal/'], [t.title, p]]), { '@context': 'https://schema.org', '@type': 'Article', headline: t.title, description: t.dek, datePublished: a.date, inLanguage: L.code, author: { '@type': 'Organization', name: cfg.brand.name }, publisher: { '@id': `${cfg.siteUrl}/#org` }, mainEntityOfPage: cfg.siteUrl + u(L, p), image: IMG[a.img] && IMG[a.img].og ? `${cfg.siteUrl}/assets/img/${IMG[a.img].og}` : undefined }];
  return page(L, c, { path: p, meta: { title: `${t.title} · ${cfg.brand.name}`, description: t.dek }, body, ogSlot: a.img, ld });
}

function enquirePage(L, c) {
  const f = c.enquire, ui = c.ui;
  const req = `<span class="req">(${esc(f.required)})</span>`;
  const body = `<div class="phead phead--split"><div>${eyebrow(esc(f.eyebrow))}<h1 class="h1">${f.title}</h1></div><p class="lede muted">${esc(f.lede)}</p></div>
<section class="wrap" style="padding-bottom:var(--space-m)"><div class="form">
  <aside class="form__aside"><h2 class="h3">${esc(f.asideTitle)}</h2><ol>${f.aside.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p class="small muted">${esc(f.emailInstead)} <a class="lnk-inline" href="mailto:${cfg.email}">${cfg.email}</a></p></aside>
  <form class="form__main" id="enquiry" action="/api/enquiry/" method="post" novalidate data-thanks="${u(L, '/enquire/thanks/')}" data-sending="${esc(f.sending)}" data-err-required="${esc(f.errorRequired)}" data-err-email="${esc(f.errorEmail)}" data-err-consent="${esc(f.errorConsent)}" data-err-server="${esc(f.errorServer)}" data-pre-cave="${esc(f.prefillCave)}" data-pre-bay="${esc(f.prefillBay)}" data-pre-journey="${esc(f.prefillJourney)}">
    <input type="hidden" name="lang" value="${L.code}">
    <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <fieldset class="fgroup"><legend class="mono">${esc(f.sectionYou)}</legend>
      <div class="frow frow--2"><div class="field"><label for="f-name">${esc(f.name)}${req}</label><input class="input" id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
      <div class="field"><label for="f-email">${esc(f.email)}${req}</label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required maxlength="160"></div></div>
      <div class="field"><label for="f-country">${esc(f.country)}</label><input class="input" id="f-country" name="country" type="text" autocomplete="country-name" maxlength="80" aria-describedby="f-country-h"><span class="hint" id="f-country-h">${esc(f.countryHint)}</span></div>
    </fieldset>
    <fieldset class="fgroup"><legend class="mono">${esc(f.sectionTrip)}</legend>
      <div class="frow frow--2"><div class="field"><label for="f-when">${esc(f.when)}${req}</label><input class="input" id="f-when" name="when" type="text" required maxlength="120" aria-describedby="f-when-h"><span class="hint" id="f-when-h">${esc(f.whenHint)}</span></div>
      <div class="field"><label for="f-nights">${esc(f.nights)}</label><select class="input" id="f-nights" name="nights">${f.nightsOptions.map((o) => `<option>${esc(o)}</option>`).join('')}</select></div></div>
      <div class="frow frow--3"><div class="field"><label for="f-adults">${esc(f.adults)}</label><input class="input" id="f-adults" name="adults" type="number" min="1" max="30" value="2" inputmode="numeric"></div>
      <div class="field"><label for="f-children">${esc(f.children)}</label><input class="input" id="f-children" name="children" type="number" min="0" max="20" value="0" inputmode="numeric"></div>
      <div class="field"><label for="f-ages">${esc(f.childrenAges)}</label><input class="input" id="f-ages" name="ages" type="text" maxlength="60"></div></div>
    </fieldset>
    <fieldset class="fgroup"><legend class="mono">${esc(f.sectionStyle)}</legend>
      <fieldset class="field"><legend class="lbl" style="font:500 .875rem/1.4 var(--sans);letter-spacing:0;text-transform:none;color:inherit">${esc(f.interests)}</legend><div class="chips">${Object.entries(f.interestOptions).map(([v, l]) => `<label class="chip"><input type="checkbox" name="interests" value="${v}"><span>${esc(l)}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend class="lbl" style="font:500 .875rem/1.4 var(--sans);letter-spacing:0;text-transform:none;color:inherit">${esc(f.paceLabel)}</legend><div class="chips">${f.paceOptions.map((o, i) => `<label class="chip"><input type="radio" name="pace" value="${esc(o)}"${i === 0 ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>
      <div class="field"><label for="f-message">${esc(f.message)}</label><textarea class="input" id="f-message" name="message" maxlength="4000" aria-describedby="f-message-h"></textarea><span class="hint" id="f-message-h">${esc(f.messageHint)}</span></div>
    </fieldset>
    <label class="check"><input type="checkbox" name="consent" value="yes" required><span>${fill(f.consent, L)}</span></label>
    <p class="form__err" role="alert"></p>
    <button class="btn" type="submit" style="margin-top:18px">${esc(f.submit)} ${ICON.ar}</button>
  </form>
</div></section>`;
  return page(L, c, { path: '/enquire/', meta: c.meta.enquire, body, cta: false, ld: [crumbs(L, [[ui.home, '/'], [ui.enquire, '/enquire/']])] });
}
function thanksPage(L, c) {
  const t = c.thanks;
  const body = `<div class="phead"><p class="eyebrow">${ICON.lotus}${esc(t.eyebrow)}</p><h1 class="h1">${t.title}</h1><p class="lede muted">${fill(t.text, L)}</p><p style="margin-top:28px"><a class="btn" href="${u(L, '/')}">${esc(t.back)} ${ICON.ar}</a></p></div>
<section class="sec" style="padding-top:0"><div class="wrap">${eyebrow(esc(t.meanwhile))}${journalIndex(L, c)}</div></section>`;
  return page(L, c, { path: '/enquire/thanks/', meta: c.meta.thanks, body, cta: false, noindex: true });
}
function legalPage(L, c, key, p) {
  const g = c.legal[key];
  const body = `<div class="phead"><p class="eyebrow">${ICON.lotus}${esc(c.ui.footerLegal)}</p><h1 class="h1">${esc(g.title)}</h1><p class="small muted" style="margin-top:16px">${esc(c.legal.updated)}</p></div>
<section class="wrap" style="padding-bottom:var(--space-m)"><div class="legal"><nav aria-label="${esc(g.title)}">${g.sections.map((s, i) => `<a href="#s${i + 1}">${esc(s.h)}</a>`).join('')}</nav>
<div class="prose"><p class="lede">${fill(g.intro, L)}</p>${g.sections.map((s, i) => `<h2 id="s${i + 1}">${esc(s.h)}</h2>${s.p.map((x) => `<p>${fill(x, L)}</p>`).join('')}`).join('')}</div></div></section>`;
  return page(L, c, { path: p, meta: c.meta[key], body, cta: false });
}
function creditsPage(L, c) {
  const t = c.credits;
  const used = MANIFEST.filter((m) => IMG[m.slot] && m.credit !== false);
  const body = `<div class="phead"><p class="eyebrow">${ICON.lotus}${esc(t.eyebrow)}</p><h1 class="h1">${esc(t.title)}</h1><p class="lede muted" style="margin-top:1.5rem">${esc(t.lede)}</p></div>
<section class="wrap" style="padding-bottom:var(--space-m)"><ul class="credits" style="border-top:1px solid rgba(29,31,28,.2)">${used.map((m) => `<li><span>${esc(alt(c, m.slot))}</span><span>“${esc(m.title)}” ${esc(t.by)} ${esc(m.author)}</span><span>${m.licenseUrl ? `<a href="${esc(m.licenseUrl)}" rel="license noopener">${esc(m.license)}</a>` : esc(m.license)}</span><span><a href="${esc(m.source)}" rel="noopener">Wikimedia Commons</a></span></li>`).join('')}</ul></section>`;
  return page(L, c, { path: '/credits/', meta: c.meta.credits, body, cta: false });
}
function notFoundPage(L, c) {
  const t = c.notFound;
  const body = `<section class="hero" style="height:auto;min-height:100svh"><div class="hero__media">${pic('halong-3', '', { eager: true })}</div>${karstHome()}<div class="hero__copy" style="position:relative;padding:calc(var(--hdr) + 15vh) 0 30vh;left:auto;right:auto;top:auto;margin:0 var(--g)"><p class="eyebrow">404</p><h1 class="h1">${t.title}</h1><p class="lede" style="margin-top:20px">${esc(t.text)}</p><p style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap">${cfg.locales.map((l) => `<a class="btn${l.code === L.code ? '' : ' btn--ghost'}" href="${u(l, '/')}" lang="${l.code}">${esc(C[l.code].notFound.back)}</a>`).join('')}</p></div></section>`;
  return page(L, c, { path: '/404/', navPath: '/', meta: c.meta.notFound, body, cta: false, noindex: true });
}

// ---------- write ----------
function write(rel, html) {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), t = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, t); else fs.copyFileSync(s, t);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyDir(path.join(root, 'assets/fonts'), path.join(dist, 'assets/fonts'));
copyDir(path.join(root, 'assets/img'), path.join(dist, 'assets/img'));
fs.mkdirSync(path.join(dist, 'assets/js'), { recursive: true });
fs.writeFileSync(path.join(dist, JS_URL), JS);
fs.writeFileSync(path.join(dist, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="${cfg.palette.ink}"/><path d="M16 6c3 3 4.1 6.8 3.2 11.4-.5 2.4-1.8 4.4-3.2 5.7-1.4-1.3-2.7-3.3-3.2-5.7C11.9 12.8 13 9 16 6Zm-11 7.6c4.3.4 7.4 2.4 9.3 6.3.7 1.5 1.1 3 1.3 4.3-3.2.2-6.7-1.1-8.7-3.9-1.3-1.8-1.9-4.2-1.9-6.7Zm22 0c0 2.5-.6 4.9-1.9 6.7-2 2.8-5.5 4.1-8.7 3.9.2-1.3.6-2.8 1.3-4.3 1.9-3.9 5-5.9 9.3-6.3Z" fill="${cfg.palette.lotus}"/></svg>`);

const routes = [];
for (const L of cfg.locales) {
  const c = C[L.code];
  const out = (p, html) => { write(path.join(L.prefix || '', p, 'index.html'), html); routes.push({ L, p }); };
  out('/', homePage(L, c));
  out('/destinations/', destIndexPage(L, c));
  D.destinations.forEach((d, i) => out(dpath(d.key), destPage(L, c, d, i)));
  out('/journeys/', journeysPage(L, c));
  out('/stays/', staysPage(L, c));
  out('/about/', aboutPage(L, c));
  out('/journal/', journalPage(L, c));
  D.journal.forEach((a, i) => out(`/journal/${a.slug}/`, articlePage(L, c, a, i)));
  out('/enquire/', enquirePage(L, c));
  write(path.join(L.prefix || '', '/enquire/thanks/index.html'), thanksPage(L, c));
  out('/privacy/', legalPage(L, c, 'privacy', '/privacy/'));
  out('/booking-terms/', legalPage(L, c, 'terms', '/booking-terms/'));
  out('/cookies/', legalPage(L, c, 'cookies', '/cookies/'));
  out('/credits/', creditsPage(L, c));
  if (L.code === 'en') write('404.html', notFoundPage(L, c));
  else write(path.join(L.prefix, '404.html'), notFoundPage(L, c));
}

// sitemap with hreflang alternates
const uniq = [...new Set(routes.map((r) => r.p))];
const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  uniq.flatMap((p) => cfg.locales.map((L) => `<url><loc>${cfg.siteUrl + u(L, p)}</loc>${cfg.locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${cfg.siteUrl + u(l, p)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${cfg.siteUrl + p}"/></url>`)).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sm);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
console.log(`built ${routes.length} pages in ${cfg.locales.length} languages → dist/`);
