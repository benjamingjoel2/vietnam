// Copies only the font files the site uses (Latin subset) from @fontsource into assets/fonts.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = [
  ['literata', 'literata-latin-400-normal.woff2'],
  ['literata', 'literata-latin-400-italic.woff2'],
  ['literata', 'literata-latin-500-normal.woff2'],
  ['work-sans', 'work-sans-latin-400-normal.woff2'],
  ['work-sans', 'work-sans-latin-500-normal.woff2'],
];
fs.mkdirSync(path.join(root, 'assets/fonts'), { recursive: true });
for (const [pkg, f] of files) {
  fs.copyFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', f), path.join(root, 'assets/fonts', f));
  console.log('font', f);
}
