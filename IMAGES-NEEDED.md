# Images needed

Photo rules for this site:

- High quality only, and only where the photo's location matches the place it is used for.
- Unsplash photos carry no credit line on the site. Creative Commons photos (e.g. Wikimedia Commons) are credited on `/credits/`, which is generated from `images/manifest.json`.
- A named hotel, lodge, restaurant or café may be shown only with an image we are clearly allowed to use: the venue's media kit or press terms, a booking-platform partner feed, or Creative Commons. Never copy images from a venue's own website.
- If no permitted image exists, show a correct photo of the location instead and list the venue here.

## Current state

Every photo on the site is a Creative Commons or public-domain photograph from Wikimedia Commons, matched to its place. See `images/manifest.json` (title, author, licence, source page) and the `/credits/` page.

The site names **no real hotels, lodges, restaurants or cafés**. Caves, temples, markets and landmarks are shown with Commons photos of those places.

## To source before launch

### Stays (placeholder names)

The stays page and the destination pages use placeholder property names, shown with location photos and the note "Placeholder name. The property will be confirmed with your quote." When each real partner property is confirmed, replace the name in `content/en.js` → `stays` and get a permitted photo of the property (media kit, press terms or booking-platform partner feed), then update `data/site-data.js` → `stays[].img`.

| Placeholder | Region | Shown with now |
|---|---|---|
| The Lake House | Hanoi, Old Quarter edge | Hoan Kiem Lake (hanoi-2) |
| Slack Water | Lan Ha Bay | Lan Ha Bay (halong-2) |
| Paddy House | Ninh Binh, near Tam Coc | Tam Coc (ninhbinh-2) |
| Cloud Terrace | Sapa, Muong Hoa valley | Sapa valley (sapa-3) |
| River Bend | Phong Nha, Son river | Phong Nha-Ke Bang landscape (phongnha-4) |
| Garden of the Perfume River | Hue | Perfume River (hue-2) |
| Lantern Fields | Hoi An | Traditional house (stays-1) |
| Coconut Water | Mekong, Ben Tre | Mekong delta (mekong-3) |
| West Light | Phu Quoc, north-west coast | Phu Quoc coast (phuquoc-3) |

### Nice to have

- Kayaking in a Lan Ha lagoon at slack water (licensed operator's media kit), to replace the general bay photo.
- Hang En camp and Tu Lan swims from the licensed cave operator's press materials, for the cave ladder rungs (they currently share a Phong Nha-Ke Bang landscape photo).
- A Hoi An tailor at work (with the tailor's permission) for the Hoi An experience row.
