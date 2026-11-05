// Vercel serverless function: receives the enquiry form.
// Without JavaScript the form posts here and is redirected to the thank-you page;
// with JavaScript it is sent with fetch and gets JSON back.
// Delivery: if RESEND_API_KEY is set in the Vercel project, the enquiry is emailed to the
// brand address with Resend (https://resend.com). It is always written to the function log.
const cfg = require('../config/site.config.js');

const LOCALES = cfg.locales.map((l) => l.code);
const clean = (v, n = 500) => String(v == null ? '' : Array.isArray(v) ? v.join(', ') : v).replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, n);

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await new Promise((res) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => res(d)); });
  const type = String(req.headers['content-type'] || '');
  if (type.includes('application/json')) { try { return JSON.parse(raw); } catch { return {}; } }
  const p = new URLSearchParams(raw); const o = {};
  for (const [k, v] of p) o[k] = k in o ? [].concat(o[k], v) : v;
  return o;
}

module.exports = async (req, res) => {
  const wantsJson = String(req.headers.accept || '').includes('application/json');
  const reply = (code, obj, lang) => {
    if (wantsJson) { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); return res.end(JSON.stringify(obj)); }
    const prefix = lang && lang !== 'en' ? `/${lang}` : '';
    res.statusCode = 303; res.setHeader('Location', obj.ok ? `${prefix}/enquire/thanks/` : `${prefix}/enquire/?error=1`); return res.end();
  };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(405, { ok: false, error: 'method' }); }

  const b = await readBody(req);
  const lang = LOCALES.includes(b.lang) ? b.lang : 'en';
  if (clean(b.website)) return reply(200, { ok: true }, lang); // honeypot: quietly accept bots
  const e = {
    name: clean(b.name, 120), email: clean(b.email, 160), country: clean(b.country, 80), when: clean(b.when, 120),
    nights: clean(b.nights, 40), adults: clean(b.adults, 4), children: clean(b.children, 4), ages: clean(b.ages, 60),
    interests: clean(b.interests, 300), pace: clean(b.pace, 80), message: clean(b.message, 4000), consent: clean(b.consent, 5), lang,
  };
  if (!e.name || !e.email || !e.when) return reply(422, { ok: false, error: 'required' }, lang);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email)) return reply(422, { ok: false, error: 'email' }, lang);
  if (e.consent !== 'yes') return reply(422, { ok: false, error: 'consent' }, lang);

  const text = Object.entries(e).map(([k, v]) => `${k}: ${v}`).join('\n');
  console.log(`[enquiry] ${new Date().toISOString()}\n${text}`);

  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.ENQUIRY_FROM || `${cfg.brand.name} <${cfg.email}>`, to: [cfg.email], reply_to: e.email, subject: `Enquiry: ${e.name} (${e.when})`, text }),
      });
      if (!r.ok) { console.error('[enquiry] email failed', r.status, await r.text()); return reply(502, { ok: false, error: 'send' }, lang); }
    } catch (err) { console.error('[enquiry] email error', err); return reply(502, { ok: false, error: 'send' }, lang); }
  }
  return reply(200, { ok: true }, lang);
};
