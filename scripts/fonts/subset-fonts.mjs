// Builds the site's web fonts from the full font files (C1, L7):
//   npm run fonts:build -- <folder with the .ttf and OFL files>
// Writes public/fonts/<font>/<font>.woff2 (Hebrew and Latin only) and copies the licence text beside it. The folder
// holds FrankRuhlLibre.ttf, Heebo.ttf, GveretLevin.ttf and a <Name>-OFL.txt for each (the full files are not kept in the repo).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import subsetFont from 'subset-font';
import { subsetText } from './charset.mjs';
import { FONTS } from './fonts.mjs';

const source = process.argv[2];
if (!source || !existsSync(source)) {
  console.error('Usage: npm run fonts:build -- <folder with the .ttf and OFL files>');
  process.exit(1);
}

const text = subsetText();
for (const font of FONTS) {
  const input = join(source, `${font.file}.ttf`);
  const licence = join(source, `${font.file}-OFL.txt`);
  if (!existsSync(input) || !existsSync(licence)) {
    console.error(`Missing ${font.file}.ttf or ${font.file}-OFL.txt in ${source}`);
    process.exit(1);
  }
  const output = await subsetFont(readFileSync(input), text, {
    targetFormat: 'woff2',
    ...(font.axes ? { variationAxes: font.axes } : {}),
  });
  const folder = join('public', 'fonts', font.folder);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, `${font.folder}.woff2`), output);
  copyFileSync(licence, join(folder, 'OFL.txt'));
  console.log(`${font.folder}: ${output.length} bytes`);
}
