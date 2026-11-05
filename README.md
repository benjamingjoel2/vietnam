# Dragon Bay Travel

Static website for **Dragon Bay Travel**: private journeys through Vietnam, north to south, at the right pace. (Ha Long means "descending dragon" bay.)

- Live: https://dragonbaytravel.vercel.app
- Canonical domain (when connected): https://dragonbaytravel.tourground.com
- Languages: English (root), French (`/fr/`), German (`/de/`), Spanish (`/es/`). Every page is pre-rendered in all four; there is no translation code in the browser and no automatic language redirect.

## Run it

Requires Node 18 or newer.

```bash
npm install
```

```bash
npm run build
```

```bash
npm run serve
```

Then open http://localhost:3000. The local server also runs the enquiry endpoint.

```bash
npm run check
```

`check` crawls `dist/` for broken links, missing hreflang/canonical tags, images without width, height or alt text, and banned content (phone numbers, WhatsApp, social links, Unsplash credits, stray email addresses).

The build itself (`scripts/build.js`) uses only Node's standard library. `npm install` is needed only for the image and font scripts.

## Where things live

| What | File |
|---|---|
| Brand name, email, address, domain, languages, **palette** | `config/site.config.js` |
| All English copy (nav, pages, forms, legal, alt text) | `content/en.js` |
| French, German, Spanish copy (same keys) | `content/fr.js`, `content/de.js`, `content/es.js` |
| Slugs, image slots, weather ratings, bay scores, cave data, journeys, stays | `data/site-data.js` |
| Page templates and the static generator | `scripts/build.js` |
| Styles (inlined into each page at build) | `src/styles.css` |
| Behaviour (menu, parallax, weather strip, bay chooser, cave ladder, form) | `src/main.js` |
| Enquiry endpoint (Vercel function) | `api/enquiry.js` |
| Photos: originals and licence data | `images/raw/`, `images/manifest.json` |
| Optimised photos (AVIF + WebP, hashed names) | `assets/img/`, map in `data/images.json` |
| Hosting config: build, output, clean URLs, cache headers | `vercel.json` |

## Editing

**Copy.** Change the string in `content/en.js`, then the same key in the other three language files. Keep the `{{brand}}`, `{{email}}`, `{{address}}`, `{{site}}` and `{{privacy}}` tokens; they are filled in from the config at build time. Rebuild.

**Re-branding.** Edit `config/site.config.js` (name, email, address, domain, colours) and rebuild. The giant footer wordmark and the hero word are in `scripts/build.js` (`ftr__word`) and `content/*.js` (`home.heroWord`).

**Weather strip.** Ratings are in `data/site-data.js` → `weather` (2 good, 1 mixed, 0 avoid, January first). Month notes are in `content/*.js` → `weather.notes`.

**Which bay / cave ladder.** Scores and difficulty levels in `data/site-data.js` (`bays`, `caves`); words in `content/*.js` (`bays`, `caves`).

**Photos.** Put a JPEG in `images/raw/<slot>.jpg`, add or update its entry (title, author, licence, source, alt) in `images/manifest.json`, then:

```bash
npm run images
```

This writes responsive AVIF/WebP files (480 to 2400 px wide) with content-hashed names to `assets/img/` and updates `data/images.json`. Commit both. Creative Commons photos are credited automatically on `/credits/`. Use only photos whose location matches the page, and see `IMAGES-NEEDED.md` for the rules on named venues.

**Fonts.** Literata (400, 400 italic, 500) and Work Sans (400, 500), self-hosted from `@fontsource`, Latin subset, `font-display: swap`. To refresh: `npm run fonts`.

**Prices.** None are shown ("Priced on request"). If you add one, it must read "From (amount)".

## Enquiry form

The form posts to `/api/enquiry` (works without JavaScript; with JavaScript it validates inline and sends with `fetch`). The function validates the fields, drops spam caught by a honeypot, and writes every enquiry to the Vercel function log.

To have enquiries **emailed** to dragonbaytravel@tourground.com, add these environment variables in the Vercel project and redeploy:

- `RESEND_API_KEY`: an API key from https://resend.com (free tier is enough)
- `ENQUIRY_FROM` (optional): a verified sender, e.g. `Dragon Bay Travel <enquiries@tourground.com>`; the sending domain must be verified in Resend

Until the key is set, read enquiries in Vercel → Project → Logs (filter on `[enquiry]`).

## Performance

- CSS inlined, one deferred script (about 10 KB), no third-party requests.
- Hero image preloaded with `fetchpriority="high"`; every image has width and height, AVIF/WebP `srcset` and `sizes`; below-the-fold images lazy-load.
- Only the five font files in use, preloaded and swapped.
- `vercel.json` sets one-year immutable caching on `/assets/*` (file names are hashed or versioned).
- Motion (parallax, reveals, view transitions) is skipped when the visitor prefers reduced motion.

## Deploying

Vercel project `dragonbaytravel` (team "Benjamin - Sevo"), connected to `benjamingjoel2/vietnam`, deploys `main` automatically. Build command `npm run build`, output `dist`. To use the canonical domain, add `dragonbaytravel.tourground.com` in Vercel → Project → Domains and create the CNAME it asks for.

## Before launch

Read `FACTS-TO-VERIFY.md` (visas, weather, typhoons, Son Doong, Ha Giang roads, bay cruise rules, the business address) and `IMAGES-NEEDED.md`.
