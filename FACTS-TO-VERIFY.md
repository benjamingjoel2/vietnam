# Facts to verify before launch

Everything below appears on the site (in all four languages) and must be checked against an official or first-hand source before the site goes live. Where a fact changes, update `content/en.js` first, then the same key in `content/fr.js`, `content/de.js` and `content/es.js`. Ratings and numbers that are not words live in `data/site-data.js`.

Checked by: ________ Date: ________

## Entry, visas and arrival

| Claim on the site | Where | Check against |
|---|---|---|
| Visa and arrival rules change; travellers are told to check official guidance (no specific durations are stated on the site) | Ho Chi Minh City notes, Booking Terms §7 | https://evisa.gov.vn, https://xuatnhapcanh.gov.vn, https://www.gov.uk/foreign-travel-advice/vietnam/entry-requirements, https://travel.state.gov |
| Current visa exemption lengths by nationality and the e-visa (up to 90 days, single or multiple entry) — not stated on the site, but planners will be asked | Enquiry replies | Same as above |
| Phu Quoc has had its own visa-exemption rules for direct international arrivals | Phu Quoc notes | https://xuatnhapcanh.gov.vn and current FCDO advice |
| Digital arrival card / health declarations | Not stated; covered by "arrival paperwork" note | FCDO and immigration department |

## Weather, typhoons and floods

The weather strip (`data/site-data.js` → `weather`) rates each region good / mixed / avoid per month. Verify the whole matrix against the National Centre for Hydro-Meteorological Forecasting (https://nchmf.gov.vn) and long-run climate data.

| Claim | Where |
|---|---|
| Vietnam is about 1,600 km long, north to south | Home stats, journal "Three weathers", weather strip intro |
| "Three weather systems": north with a real winter; centre dry roughly Feb–Aug and wet Sep–Dec; south dry roughly Dec–Apr and wet May–Nov | Home stats, weather strip, journal |
| Typhoons possible in the north from about July to September; typhoon peak August | Weather strip notes, Ha Long notes, journal |
| Central coast storms and floods from September to December; Hoi An old town floods most years Oct–Dec | Hoi An, Hue, Da Nang notes |
| Hue is one of the wettest cities in Vietnam Sep–Dec | Hue notes |
| Phu Quoc south-west monsoon roughly May–October, rough seas mostly on the west coast; dry season Nov–Apr | Phu Quoc page, weather strip |
| Mekong high water roughly August–November | Mekong notes, weather strip |
| Hanoi Dec–Feb around 15–20 °C | Hanoi notes |
| Saigon around 30–35 °C, April hottest | HCMC notes |
| Hue often above 35 °C May–Aug | Hue notes |
| Sapa / Ha Giang near-freezing nights and fog Dec–Feb; occasional frost | Sapa notes |
| Terraces: water in May–June, harvest mid-September to early October; Mu Cang Chai best late Sep / early Oct | Sapa page |
| Ha Giang buckwheat flowers October–November | Ha Giang notes |
| Tam Coc rice best in May–early June and September | Ninh Binh notes |
| Sea at Da Nang rough Oct–Feb | Da Nang notes |

## The bays (Which Bay chooser)

| Claim | Check against |
|---|---|
| Ha Long, Lan Ha and Bai Tu Long form one seascape of nearly 2,000 limestone islands | UNESCO https://whc.unesco.org/en/list/672 |
| Ha Long is the busiest; most boats leave Tuan Chau on set licensed routes | Quang Ninh provincial tourism / bay management board |
| Lan Ha: fewer, smaller boats; departures from Cat Ba / Gia Luan and Lan Ha harbours; ~3 h from Hanoi | Hai Phong tourism authority; ground operator |
| Bai Tu Long: only a handful of licensed boats; mostly 2–3 day routes | Ha Long Bay Management Board; ground operator |
| Kayaking is limited to set points in Ha Long (e.g. Luon Cave); lagoons and arches in Lan Ha passable only at some tides | Bay management boards; current kayak rules change often |
| Ha Long ~2.5 h from Hanoi by expressway | Ground operator |
| Harbour authorities suspend sailings when storms are forecast | Quang Ninh / Hai Phong port authorities |
| **Cruise regulations**: licensed routes, overnight permits, kayak zones, swimming rules, boat safety standards | Ha Long Bay Management Board; Hai Phong (Cat Ba) authorities |

Crowd levels are deliberately described, not counted. The chooser's scores (`data/site-data.js` → `bays`) are editorial judgements; confirm with the ground operator.

## Phong Nha and the cave ladder

All cave details live in `content/*.js` → `caves.rungs` and `data/site-data.js` → `caves`.

| Claim | Check against |
|---|---|
| Phong Nha Cave entered by boat from the village; operated by the park boat cooperative | https://phongnhakebang.vn |
| Paradise Cave: long boardwalk, several hundred steps to the entrance, run by a park concession | Park website / concession |
| Dark Cave: zipline, swim, mud pool; season roughly March–August | Operator |
| Hang Tien: one-day trek, 5–6 h walking | Licensed operator |
| Tu Lan: 1–4 day versions, swims between caves | Licensed operator (e.g. Oxalis) |
| Hang En: 2 days / 1 night, camp on a beach inside the cave, roughly Feb–Aug | Licensed operator |
| **Son Doong booking**: one licensed operator, small groups, short season (roughly Feb–Aug), sells out a year or more ahead, 4 days / 3 nights, training and fitness checks | https://oxalis.com.vn |
| Minimum ages for each cave (the site currently says "Check with operator" except the show caves) | Operators |
| Flood season closes caves and roads roughly September–December | Park authority |
| "One of the oldest karst landscapes in Asia", "many caves explored only in the last thirty years" | UNESCO https://whc.unesco.org/en/list/951 |
| Red-shanked douc langurs on Son Tra | Da Nang / Son Tra nature reserve |

## Ha Giang road safety and permits

| Claim | Check against |
|---|---|
| Mountain roads are steep, narrow and shared with trucks; we use experienced local drivers, never self-drive | FCDO road-safety advice; ground operator's safety policy |
| Some border areas may need a permit for foreign visitors; the guide arranges it | Ha Giang provincial police / immigration; ground operator |
| Ha Giang ~6 h from Hanoi | Ground operator |
| The Ma Pi Leng pass runs above the Nho Que river; boat trips on the river | Ha Giang tourism |

## Places and history

| Claim | Check against |
|---|---|
| Ha Long means "descending dragon"; the legend of the dragon and the jewels that became islands | Standard references |
| Temple of Literature founded 1070, Vietnam's first university | Hanoi tourism / UNESCO Memory of the World (stelae) |
| Trang An is UNESCO-listed; some rowers row with their feet; many rowers are women from the villages | https://whc.unesco.org/en/list/1438; ground operator |
| Hang Mua: about 500 steps | Site management |
| Sapa at about 1,500 m in the Hoang Lien mountains; Hmong, Dao and other communities | Lao Cai tourism |
| Hue: seat of the Nguyen emperors until 1945 | https://whc.unesco.org/en/list/678 |
| Hoi An busy port from the 15th to 19th century; full-moon lantern nights | https://whc.unesco.org/en/list/948 |
| Cai Rang floating market near Can Tho; traders hang samples on poles | Can Tho tourism |
| Phu Quoc is Vietnam's largest island; much of it national park | Kien Giang / Phu Quoc authorities |
| Journey times: Ninh Binh ~2 h, Sapa ~5 h by expressway or overnight train, Hoi An 45 min from Da Nang airport, Phong Nha ~1 h from Dong Hoi, Phu Quoc ~1 h flight from HCMC, Mekong 3–4 h | Ground operator |

## Business and legal

| Item | Note |
|---|---|
| Business address: The Executive Centre, Level 17, The Nexus Building, 3A-3B Ton Duc Thang Street, Saigon Ward, Ho Chi Minh City 700000 | Address as published by The Executive Centre (its HCMC coworking floors are Levels 17 & 18 of The Nexus). The owner must hold a membership or virtual office there before using it, and confirm the exact level/suite. Note the 2025 ward reorganisation ("Saigon Ward", formerly Ben Nghe Ward, District 1). |
| Booking Terms: governing law (Vietnam), deposits, cancellation charges, insurance requirement, complaint window (28 days) | Have a lawyer review for the markets you sell to (UK Package Travel Regulations, EU Package Travel Directive, US seller-of-travel rules). |
| Privacy Policy: retention periods (24 months for enquiries, up to 7 years for bookings), transfer safeguards | Confirm with your hosting and email providers (Vercel; Resend if enabled). |
| Cookie Policy: "this website does not set any cookies" | True for the site as built. Re-check if analytics or embeds are ever added. |
| Prices | The site shows no prices ("Priced on request"). Any price added later must read "From (amount)". |
