// ---------------------------------------------------------------------------
// Brand configuration. Everything that identifies the brand lives here, so the
// site can be re-branded by editing this one file and running `npm run build`.
// ---------------------------------------------------------------------------
module.exports = {
  brand: {
    name: 'Dragon Bay Travel',
    short: 'Dragon Bay',
    // Ha Long means "descending dragon" bay.
    legalName: 'Dragon Bay Travel',
  },

  // Canonical domain used for canonical tags, hreflang, sitemap and JSON-LD.
  siteUrl: 'https://dragonbaytravel.tourground.com',
  // Where the site is currently deployed (Vercel). Updated after each deploy.
  liveUrl: 'https://dragonbaytravel.vercel.app',

  // The only public contact channel.
  email: 'dragonbaytravel@tourground.com',

  // Business address: The Executive Centre at The Nexus, a grade-A serviced
  // office and coworking space in central Ho Chi Minh City.
  address: {
    venue: 'The Executive Centre, The Nexus Building',
    line1: 'Level 17, The Nexus Building',
    street: '3A-3B Ton Duc Thang Street',
    locality: 'Saigon Ward',
    city: 'Ho Chi Minh City',
    postcode: '700000',
    country: 'Vietnam',
    countryCode: 'VN',
    geo: { lat: 10.7826, lng: 106.7059 },
  },

  // Languages. English is the default and lives at the site root.
  locales: [
    { code: 'en', label: 'EN', name: 'English', hreflang: 'en', og: 'en_GB', prefix: '' },
    { code: 'fr', label: 'FR', name: 'Français', hreflang: 'fr', og: 'fr_FR', prefix: '/fr' },
    { code: 'de', label: 'DE', name: 'Deutsch', hreflang: 'de', og: 'de_DE', prefix: '/de' },
    { code: 'es', label: 'ES', name: 'Español', hreflang: 'es', og: 'es_ES', prefix: '/es' },
  ],

  // Palette: KARST AND LOTUS. All text/ground pairs used on the site pass WCAG AA.
  palette: {
    limestone: '#EDEBE6', // page ground
    mist: '#E2DFD8',      // alternate ground
    ink: '#1D1F1C',       // lacquer ink: text, dark bands, footer
    karst: '#5E5E59',     // secondary text, hairlines (5.2:1 on limestone)
    paddy: '#3A6629',     // links and focus (5.7:1 on limestone)
    shoot: '#D3DFB0',     // young rice: tags, chart "good"
    lotus: '#E9A6B8',     // accent on ink only
    lotusdeep: '#A8385E', // small accent text on limestone
    lacquer: '#A3261C',   // lacquer red: primary buttons, markers (6.4:1 with white)
    jade: '#1F4E48',      // bay-water jade: dark bands (9.4:1 with limestone)
    jadelight: '#7FB3A6', // jade accent on ink/jade only
  },

  fonts: {
    display: 'Literata',  // literary serif for headlines
    text: 'Work Sans',    // clean sans for text and UI
  },
};
