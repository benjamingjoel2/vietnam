// Language-neutral data: page slugs, image slots, coordinates, ratings.
// All words shown to visitors live in content/<lang>.js.

// Destinations, north to south. `wx` points at a weather region below.
const destinations = [
  { key: 'hanoi', slug: 'hanoi', img: ['hanoi-2', 'hanoi-1', 'hanoi-3'], xp: ['hanoi-1', 'hanoi-2', 'hanoi-3'], coords: "21°02'N 105°51'E", wx: 'delta' },
  { key: 'halong', slug: 'ha-long-lan-ha-bay', img: ['halong-1', 'halong-2', 'halong-3', 'halong-4'], xp: ['halong-2', 'halong-4', 'halong-3'], coords: "20°54'N 107°11'E", wx: 'delta' },
  { key: 'ninhbinh', slug: 'ninh-binh', img: ['about-1', 'ninhbinh-1', 'ninhbinh-2', 'ninhbinh-3'], coords: "20°15'N 105°54'E", wx: 'delta' },
  { key: 'sapa', slug: 'sapa', img: ['sapa-1', 'sapa-2', 'sapa-3'], xp: ['sapa-3', 'sapa-2', 'sapa-1'], coords: "22°20'N 103°50'E", wx: 'mountains' },
  { key: 'hagiang', slug: 'ha-giang', img: ['hagiang-1', 'hagiang-2', 'hagiang-3'], coords: "23°15'N 105°24'E", wx: 'mountains' },
  { key: 'phongnha', slug: 'phong-nha', img: ['phongnha-2', 'phongnha-1', 'phongnha-5', 'phongnha-4'], coords: "17°35'N 106°17'E", wx: 'phongnha' },
  { key: 'hue', slug: 'hue', img: ['hue-1', 'hue-2', 'hue-3'], xp: ['hue-2', 'hue-1', 'hue-3'], coords: "16°28'N 107°35'E", wx: 'centre' },
  { key: 'hoian', slug: 'hoi-an', img: ['hoian-1', 'hoian-2', 'hoian-3'], xp: ['stays-1', 'hoian-2', 'hoian-3'], coords: "15°53'N 108°20'E", wx: 'centre' },
  { key: 'danang', slug: 'da-nang', img: ['danang-2', 'danang-1', 'danang-3'], coords: "16°03'N 108°13'E", wx: 'centre' },
  { key: 'hcmc', slug: 'ho-chi-minh-city', img: ['hcmc-1', 'hcmc-2', 'hcmc-3'], xp: ['hcmc-3', 'hcmc-1', 'hcmc-2'], coords: "10°46'N 106°42'E", wx: 'south' },
  { key: 'mekong', slug: 'mekong-delta', img: ['mekong-1', 'mekong-2', 'mekong-3'], xp: ['mekong-1', 'mekong-2', 'mekong-3'], coords: "10°02'N 105°47'E", wx: 'south' },
  { key: 'phuquoc', slug: 'phu-quoc', img: ['phuquoc-1', 'phuquoc-2', 'phuquoc-3'], xp: ['phuquoc-2', 'phuquoc-1', 'phuquoc-3'], coords: "10°13'N 103°57'E", wx: 'island' },
];

// Month-by-month travel conditions, north to south.
// 2 = good, 1 = mixed (go with care or with the right plan), 0 = poor.
// Source: general climate pattern; see FACTS-TO-VERIFY.md before launch.
const weather = [
  { key: 'mountains', m: [1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1] },
  { key: 'delta', m: [1, 1, 2, 2, 2, 1, 1, 0, 1, 2, 2, 1] },
  { key: 'phongnha', m: [1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1] },
  { key: 'centre', m: [1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1] },
  { key: 'south', m: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2] },
  { key: 'island', m: [2, 2, 2, 2, 1, 1, 0, 0, 0, 1, 2, 2] },
];

// Which bay: scores used by the chooser (higher = better fit).
const bays = [
  { key: 'halong', img: 'halong-1', crowd: 3, kayak: 1, scores: { quiet: 0, kayak: 1, classic: 3, day: 3, one: 2, two: 1, family: 2, couple: 1 } },
  { key: 'lanha', img: 'halong-2', crowd: 2, kayak: 3, scores: { quiet: 2, kayak: 3, classic: 1, day: 2, one: 3, two: 2, family: 3, couple: 2 } },
  { key: 'baitulong', img: 'halong-3', crowd: 1, kayak: 2, scores: { quiet: 3, kayak: 2, classic: 1, day: 0, one: 2, two: 3, family: 1, couple: 3 } },
];

// The cave ladder, easiest rung first. fit: 1 easy walker .. 4 expedition fit.
const caves = [
  { key: 'phongnhacave', days: 0.5, fit: 1, swim: false, img: 'phongnha-2' },
  { key: 'paradise', days: 0.5, fit: 1, swim: false, img: 'phongnha-1' },
  { key: 'darkcave', days: 0.5, fit: 2, swim: true, img: 'phongnha-4' },
  { key: 'hangtien', days: 1, fit: 2, swim: false, img: 'phongnha-4' },
  { key: 'tulan', days: 2, fit: 3, swim: true, img: 'phongnha-4' },
  { key: 'hangen', days: 2, fit: 3, swim: false, img: 'phongnha-5' },
  { key: 'sondoong', days: 4, fit: 4, swim: true, img: 'phongnha-3' },
];

// Sample journeys: route as destination keys, nights, best months (1-12).
const journeys = [
  { key: 'length', route: ['hanoi', 'ninhbinh', 'halong', 'hue', 'hoian', 'hcmc', 'mekong'], nights: '18–21', months: [2, 3, 4], img: 'ninhbinh-1' },
  { key: 'stone', route: ['hanoi', 'ninhbinh', 'halong', 'phongnha'], nights: '10–12', months: [3, 4, 5, 6, 7, 8], img: 'halong-4' },
  { key: 'north', route: ['hanoi', 'hagiang', 'sapa'], nights: '8–10', months: [3, 4, 5, 9, 10, 11], img: 'hagiang-1' },
  { key: 'central', route: ['hue', 'hoian', 'danang'], nights: '9–11', months: [2, 3, 4, 5, 6, 7, 8], img: 'hoian-1' },
  { key: 'south', route: ['hcmc', 'mekong', 'phuquoc'], nights: '9–11', months: [12, 1, 2, 3, 4], img: 'mekong-1' },
];

// Stays: described by place and type until partner properties are confirmed.
const stays = [
  { key: 'hanoi', dest: 'hanoi', img: 'hanoi-2' },
  { key: 'lanha', dest: 'halong', img: 'halong-2' },
  { key: 'ninhbinh', dest: 'ninhbinh', img: 'ninhbinh-2' },
  { key: 'sapa', dest: 'sapa', img: 'sapa-3' },
  { key: 'phongnha', dest: 'phongnha', img: 'phongnha-4' },
  { key: 'hue', dest: 'hue', img: 'hue-2' },
  { key: 'hoian', dest: 'hoian', img: 'stays-1' },
  { key: 'mekong', dest: 'mekong', img: 'mekong-3' },
  { key: 'phuquoc', dest: 'phuquoc', img: 'phuquoc-3' },
];

const journal = [
  { key: 'lanha', slug: 'lan-ha-not-ha-long', img: 'halong-2', date: '2026-10-12' },
  { key: 'weathers', slug: 'three-weathers-one-country', img: 'hoian-1', date: '2026-09-28' },
  { key: 'ladder', slug: 'the-cave-ladder-explained', img: 'phongnha-1', date: '2026-09-14' },
];

module.exports = { destinations, weather, bays, caves, journeys, stays, journal };
