// Generates iOS PWA startup images so iPhones don't show a black screen
// between the home-screen tap and the React loading screen.
// Each image = solid cream background (#F7F3EC, same as the React
// LoadingScreen) + the CVitalis logo centered, taking ~30% of the
// shortest viewport side. Transition from splash → loading screen is
// visually seamless.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '..', 'project', 'assets', 'logo.png');
const OUT_DIR = path.join(__dirname, '..', 'project', 'assets', 'splash');
const BG = { r: 247, g: 243, b: 236, alpha: 1 }; // #F7F3EC

// One entry per iPhone screen size we want to cover. Portrait only —
// PWAs are locked to portrait via the manifest.
const SIZES = [
  { w: 1290, h: 2796, label: 'iPhone 14/15 Pro Max, Plus' },
  { w: 1179, h: 2556, label: 'iPhone 14/15 Pro, 15' },
  { w: 1170, h: 2532, label: 'iPhone 12/13/14' },
  { w: 1125, h: 2436, label: 'iPhone X/XS/11 Pro' },
  { w: 828,  h: 1792, label: 'iPhone XR/11' },
  { w: 1242, h: 2688, label: 'iPhone XS Max/11 Pro Max' },
  { w: 1242, h: 2208, label: 'iPhone 8 Plus' },
  { w: 750,  h: 1334, label: 'iPhone 8/SE 2/SE 3' },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const { w, h, label } of SIZES) {
    const logoSize = Math.round(Math.min(w, h) * 0.30);
    const logo = await sharp(LOGO_PATH).resize(logoSize, logoSize).toBuffer();
    await sharp({
      create: { width: w, height: h, channels: 4, background: BG },
    })
      .composite([{ input: logo, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT_DIR, `splash-${w}x${h}.png`));
    console.log(`Generated splash-${w}x${h}.png (${label})`);
  }
})();
