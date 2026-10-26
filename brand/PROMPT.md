# Build prompt: Limestone (Vietnam)

Prompt v1, 2026-10-26. Repo: `benjamingjoel2/vietnam`. The brief is at `brand/BRIEF.md` in this repo. Read it first: it holds the research, the sources and every fact that still needs verifying.

---

## 1. What the brand is

You are building the website for **Limestone**, a tailor-made travel specialist for **Vietnam (VN)**. The business is enquiry-led: **no prices and no booking engine.** Every page leads to the trip planner, the enquiry form or WhatsApp.

**Positioning:** *For unhurried travellers: Vietnam's 1,600 kilometres taken one landscape at a time, with the right region for the month and the quiet bay instead of the busy one.*

**Brand story** (use it in full on About, and an excerpt on Home):

> In Lan Ha Bay, before the day boats arrive, the water between the karsts is so still that a kayak leaves a line you can see for minutes. The stone is grey where the rain has washed it and black where it hasn't, with a skirt of green at the waterline where the sea has carved the foot away. Somewhere behind you a fisherman is pulling in a net by hand.
>
> We named the company after that stone because it is the thread through Vietnam. It rises out of the paddies at Trang An, where women row the sampans with their feet. It holds the caves of Phong Nha. It shapes the passes of Ha Giang. And it teaches the thing we try to plan around: everything here was made slowly.
>
> So we plan slowly. Vietnam runs about 1,600 kilometres from north to south, with three weather systems. We match the region to the month, choose the quiet bay over the famous one, and give each place enough nights to settle. Then we find the cook, the boatwoman and the caver who make it yours.

Put a `verify()` flag on the length, the "three weather systems" framing and the foot-rowing claim until a specialist signs them off.

**Voice:**
- **Measured.** Calm sentences, no hype. Let the detail carry it.
- **Seasonal.** Every recommendation names a month and a region.
- **Exact about effort.** Say how hard, how wet, how long.
- **Banned words:** exotic, timeless, mystical, Indochina charm, hidden gem, breathtaking, unforgettable, bucket list, "Good Morning Vietnam", war-tourism clichés, conical-hat silhouettes as decoration.

Sample headlines:
- "Lan Ha, not Ha Long. Same stone, fewer boats."
- "The cave ladder: from boardwalk to four days underground."
- "Three weeks, five bases, no rush."

**Currencies:** USD is primary for budget bands (the currency most Vietnam ground quotes use). GBP, EUR and AUD are display options, used only in the planner's budget-band step. No trip or stay prices anywhere.

## 2. Stack

Follow the pattern of `/home/user/greece` and `/home/user/sri-lanka` (read both READMEs). Do **not** use Next.js.

### Build
- A dependency-free Node (18.17+) static site generator.
- `build.mjs` renders `src/pages/*.mjs` with the data into plain HTML/CSS in `dist/`.
- Dev dependencies are allowed only for the checks (Playwright, axe-core).
- Scripts: `npm run build`, `npm run dev`, `npm run serve`, `npm run check:fast`, `npm run check`.

### `site.config.json`, the only place for:
- `brand`: name, shortName, tagline, positioning, nameStory, copyright year.
  - **The brand name lives only here.** The build fails if "Limestone" appears hard-coded as the brand in `src/` templates. Geology copy in data files may use the lowercase word "limestone"; the lint checks templates for the capitalised brand word and the wordmark.
- `contact`: email, phone, WhatsApp, address, hours, and a licence line. **All are `[PLACEHOLDER]`.**
- `enquiry.endpoint`
- `analytics`: `{ "provider": "" | "plausible" | "ga4" | "vercel", "id": "" }`
- `site.url`, `site.basePath`
- `palette`, `contrastPairs`, `fonts`, `currencies`

### `src/data/*.json`, all content
No copy is hard-coded in templates, so a later TravelPorts migration is a data move.

| File | Holds |
|---|---|
| `destinations.json` | The 12 destinations: intro, best for, season by month, how long, getting there, linked experiences and routes, photo keys, region (`north` / `centre` / `south`) |
| `experiences.json` | The 9 experiences |
| `routes.json` | The 5 trip-planner routes |
| `bays.json` | Which Bay: the four bays with access, day/overnight, boat size, kayaking, crowding notes (words, not numbers), best months, coordinates, `verify` flags |
| `caves.json` | The Cave Ladder: each cave with days, walking hours, swimming, minimum age, operator, season, fitness line, `verify` flags |
| `coast.json` | Simplified Natural Earth (public domain) outline for the Gulf of Tonkin and Vietnam |
| `stays.json` | Stays. Every entry is `placeholder: true` |
| `faq.json`, `journal.json` | FAQ and journal content |

### `photos.json`, an Unsplash registry until real photos exist
- Hotlink `images.unsplash.com` with a responsive `srcset`.
- Accept a photo only if the photographer's own Unsplash **location tag** names the place, and store that tag verbatim.
- Free Unsplash License only, never Unsplash+.
- Every photo has a visible credit, and `/credits/` lists them all.
- If a place has no verified photo, show a strata-line panel labelled "Illustration". Never show somewhere else (Guilin, Krabi and Laos karsts look similar and are banned unless tagged correctly).
- Photo direction: still water, mist, wet stone, rice in every stage, cave light shafts, lacquer and wood interiors, food close up. No conical-hat posing, no war relics as spectacle, no crowds of cruise junks.

### `FACTS-TO-VERIFY.md`
- Start from BRIEF section 8: visa exemption and e-visa, digital arrival card, UNESCO listings, Son Doong and the other caves, Ha Giang permits, Con Dao turtles, weather and typhoons, the length of the country, foot-rowing, FCDO and US advice.
- Record where each fact is used, its official source link, and the date it was checked.
- Pages show inline `verify()` flags until each fact is signed off.

### Check scripts
- WCAG AA contrast for every `contrastPairs` entry. The check fails below 4.5:1.
- An internal link check over `dist/`.
- An axe-core audit of every page at 375px and 1280px.
- A brand-name lint.

## 3. Design

### Palette
Emit the palette as CSS custom properties `--c-<token>`. Never hard-code hex values in CSS or templates.

| Token | Hex | Role |
|---|---|---|
| `limestone` | `#EDEBE6` | Page ground |
| `ink` | `#1F201E` | Text, header, dark bands, footer |
| `karst` | `#62625E` | Secondary text, hairlines |
| `paddy` | `#3A6629` | Links, buttons, focus ring |
| `lotus` | `#E9A6B8` | Accent **on `ink` only**: rules, markers, display words |
| `lotusdeep` | `#A8385E` | Small accent text and active states on `limestone` |
| `shoot` | `#D3DFB0` | Alternate section ground, map land, tags |

`contrastPairs` (text/ground):
- ink/limestone 13.73
- ink/shoot 11.65
- karst/limestone 5.14
- paddy/limestone 5.66
- paddy/shoot 4.80
- lotusdeep/limestone 5.20
- limestone/ink 13.73
- limestone/paddy 5.66
- limestone/lotusdeep 5.20
- lotus/ink 8.27
- shoot/ink 11.65

Forbidden pairs: lotus on limestone or shoot; paddy, karst or lotusdeep on ink; karst or lotusdeep on shoot. Text over photos sits on an ink scrim of at least 65%, tested against pure white.

### Fonts (assigned)
- **Literata** for display: 400–600 with optical sizing, sentence case, generous leading; italic for pull quotes. The wordmark is Literata 500 small caps with wide tracking.
- **Work Sans** for text and UI: 400, 500 and 600. Labels are Work Sans 500 caps with +0.1em tracking.
- Load from Google Fonts with `display=swap` and preconnect, and preload Literata. **No third font.**

### Design references (primary first)
Use the design patterns only. **Never copy text, photos, logos, icons or code.**
- **Primary: aman.com.** Full-screen photographic hero with almost no text, a thin header with small caps nav and the wordmark centred, very large white space, small centred captions under images, slow cross-fades, horizontal destination carousels, and a quiet multi-column footer. Restraint everywhere.
- **Secondary: monocle.com.** Use it only where density helps: the destination and journal indexes, small caps section labels, bylines and dates, bold horizontal rules between sections, and a magazine-style journal page.

### House rules
- Generous white space; never more than one idea per band on Home.
- No invented credibility: no testimonials, awards, press logos, review scores or "years of experience".

### Don't reuse sibling signature moves
- No river calendar (Laos), no time-of-day palette (Cambodia), no indigo.
- No giant word along the bottom of the hero, no `(01)` mono labels, no fixed side tab, no expanding image panels.

### Motif
- The strata line: three or four fine horizontal hairlines of uneven spacing under headings and as section breaks.
- **No** conical-hat silhouettes, dragons, war imagery or faux lacquer gold.

### Two signature features (unique to this brand)

**Which Bay (`/bays/`)**
- Four cards side by side on desktop (stacked on mobile): Ha Long, Lan Ha, Bai Tu Long and Ninh Binh.
- Each card shows: how you get there, day or overnight, boat size, kayaking, crowding (described in words), best months, and "what it's for", all from `bays.json`.
- Filter chips ("I want to kayak", "I get seasick", "one night only", "travelling with children") highlight the best fit, with a text reason, not just a colour.
- An SVG map of the coast from `coast.json` places the four, at true relative position.
- "Plan this bay" pre-fills the planner. Without JS it renders as a comparison table.

**The Cave Ladder (`/caves/`)**
- A vertical ladder of caves in Phong Nha-Ke Bang, easiest at the top: boardwalk caves, day caves, overnight caves, multi-day expeditions (Son Doong last, marked "Oxalis only; sells out years ahead", `verify`).
- Each rung shows days, walking hours, swimming yes/no, minimum age, licensed operator and season, from `caves.json`.
- A four-question self-check (walking hours, swimming, heights, mud) highlights the highest suitable rung and explains why.
- "Plan this rung" pre-fills the planner. Without JS it is an ordered list with the self-check as plain guidance.

## 4. Pages and content

- **Home:**
  - full-screen hero (Lan Ha or Trang An at first light)
  - the positioning line
  - the brand story excerpt
  - destinations carousel and a map of north, centre and south
  - signature experiences
  - the five routes
  - teasers for Which Bay and the Cave Ladder
  - "how we plan" in 4 steps, with no stats
  - a closing call to action
- **Destinations:** an index (filter by region and month) and 12 pages:
  - Hanoi
  - Ha Long, Lan Ha & Bai Tu Long
  - Ninh Binh
  - Sapa & Mu Cang Chai
  - Ha Giang
  - Phong Nha-Ke Bang
  - Hue
  - Hoi An & Da Nang
  - Quy Nhon
  - Ho Chi Minh City
  - The Mekong Delta
  - Con Dao & Phu Quoc

  Each page has: intro, best for, the season strip (text labels, not colour alone), how long, getting there (no timetables), experiences, routes, placeholder stays, verified photos, and a call to action.
- **Experiences:** an index and 9 pages:
  - Lan Ha by small boat and kayak
  - Trang An or Tam Coc by sampan
  - The cave ladder in Phong Nha
  - Ha Giang's passes with a driver-guide
  - Hanoi's Old Quarter at dawn with a food writer
  - Hue's royal tombs by boat
  - A Hoi An tailor, then the An Bang shore
  - The Mekong by sampan
  - Sea turtles on Con Dao
- **Routes:** an index and 5 pages. Each pre-fills the planner.
  1. The length of it (18–21 nights)
  2. Stone and water (10–12)
  3. The central coast (9–11)
  4. The far north (8–10)
  5. The south, slowly (9–11)
- **Trip planner (`/plan/`):** a multi-step enquiry:
  1. destinations or a route
  2. month (shows a typhoon warning for central-coast stops from September to December)
  3. nights
  4. party (adults, children and ages)
  5. pace and fitness (links to the Cave Ladder)
  6. interests (food, boats, caves, craft, history, beach)
  7. an optional budget band per person (USD, switchable to GBP/EUR/AUD)
  8. contact details

  It validates each step, saves progress in `localStorage`, and posts to `enquiry.endpoint`.
- `/bays/` and `/caves/`
- **Journal:** an index and 3 posts:
  - "Lan Ha or Ha Long? Choosing your bay"
  - "Three weathers: when to go where"
  - "What a cave expedition actually asks of you"
- **About:** the full story and the name story. No invented team bios.
- FAQ, built from the topics in BRIEF section 7. Answers only restate facts listed in `FACTS-TO-VERIFY.md`.
- Contact / enquire
- Privacy, terms, cookies, credits, 404

## 5. From day one (phase 1, not phase 5)

1. **The enquiry form posts to `enquiry.endpoint`.**
   - It uses `fetch`, with an ordinary POST as the no-JS fallback.
   - It has inline validation, an error summary, a live-region status and a honeypot.
   - **If the endpoint is empty:**
     - the build prints a loud warning: `WARNING: enquiry.endpoint is empty. Enquiries open the visitor's email app and are NOT delivered.`
     - the form falls back to `mailto:` to `contact.email`, and the page says so
     - the README and config carry a `TODO`
   - The planner, the routes, Which Bay and the Cave Ladder all feed this same form.
2. **Analytics slot.** Inject the snippet only when `analytics.id` is set, and only after consent when the provider sets cookies (GA4). Plausible and Vercel Analytics need no banner. Every brand gets its own ID.
3. **Legal pages** `/privacy/`, `/terms/` and `/cookies/`, linked in the footer.
   - Draft them for UK GDPR / PECR and EU GDPR, with a clause on Vietnam's personal data protection rules for data shared with Vietnamese suppliers.
   - Every company detail (legal name, company number, address, the ground operator's international travel licence, ATOL / insolvency protection) is `[PLACEHOLDER]` and marked "Draft: needs legal review".

## 6. Build phases: stop for review after each

1. **Layout, header, footer and design tokens.**
   - `site.config.json` with the palette, fonts, contrast pairs, endpoint and analytics.
   - The header and full-screen menu, the footer (with legal links), and an understated "Plan a journey" call to action in the header.
   - The strata line, and the photo frame and credit component.
   - The check scripts and `vercel.json`.

   **Stop for review.**
2. **Homepage**, every section listed in part 4. **Stop for review.**
3. **Trip planner.**
   - The multi-step planner, tested end to end: an enquiry actually arrives, or report a blocker.
   - Route, Which Bay and Cave Ladder pre-fill; the typhoon-season warning.

   **Stop for review.**
4. **Detail pages and journal.**
   - Destinations, experiences, routes, Which Bay, the Cave Ladder, journal, FAQ, About, legal, credits.
   - `FACTS-TO-VERIFY.md` complete.

   **Stop for review.**
5. **Polish, accessibility, SEO and Lighthouse.**
   - Metadata, canonical URLs, sitemap, robots.
   - JSON-LD `TravelAgency`, leaving out placeholder fields rather than inventing them.
   - An OG image.
   - A clean axe audit and **mobile Lighthouse 90+**.
   - `prefers-reduced-motion` respected (cross-fades become instant), and the site works without JS.
   - A README "Before launch" list of every placeholder.

   **Stop for review.**

Accessibility from phase 1:
- a skip link and visible focus (paddy on light, lotus on dark, 2px plus offset)
- 44px touch targets
- landmarks, labelled controls and live regions; carousels are keyboard operable and pausable
- no information carried by colour alone
- lazy-loaded images with width and height, except the hero
- no horizontal scroll at 360px

## 7. Final step: host on Vercel

1. Make sure `npm run build` succeeds and writes `dist/`.
2. Add `vercel.json`:
   - `"buildCommand": "npm run build"`, `"outputDirectory": "dist"`, `"cleanUrls": true`, trailing slashes
   - long caching for the hashed assets
   - basic security headers
3. Push to the GitHub repo **`benjamingjoel2/vietnam`** on `main`.
4. In Vercel (team **"Benjamin - Sevo"**), import the repo with framework preset **Other**, and deploy.
5. On the live `*.vercel.app` URL, check every page, check for broken links, and submit the enquiry form.
6. Put the URL in `site.config.json` (`site.url`) and the README, then push again to redeploy.

## Design fidelity: match the primary reference closely (overrides any looser wording above)
The first design reference listed above is the **primary reference**. The site must read as the same design as that site when compared side by side: header and nav, hero composition, section order and rhythm, grid and containers, type scale (mapped onto this brand's fonts), cards, buttons, footer and motion. Before building, open the primary reference with Playwright, screenshot it at 1440 and 390 wide, and measure its type sizes, spacing and container widths. If the primary reference will not load, use the second reference as primary and say so. Then compare your own screenshots against it after every phase and fix the differences. Keep this brand's own name, palette, fonts, copy and photos. Never copy the reference's text, photos, logos, icons or source code: rebuild the design yourself. Full rules are in brands-pipeline/REF-MATCH.md in benjamingjoel2/jarvis.

Every page in the list above must be built completely with real content: no empty sections, no lorem ipsum. Before you finish, open every page with Playwright at both widths and confirm there are no console errors, no broken images or links, and no horizontal scroll on mobile.
