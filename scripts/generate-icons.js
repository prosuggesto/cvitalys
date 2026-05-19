// Generates the full set of PWA icons from project/assets/logo.png.
//
// All "any"-purpose icons now ship with the CREAM background baked in
// (instead of transparent). Reason: on Android, Chrome wraps the
// splash-screen icon in a system adaptive-icon container. If the icon
// has alpha, Chrome fills the container with a default white box behind
// the logo — which is the "white rounded square frame" the user sees on
// the Android splash. With cream baked into the icon image itself, the
// container's content matches the splash background_color and the frame
// becomes invisible (cream on cream blends).
//
// Trade-off: iOS home-screen icon (apple-touch-icon) is now also cream
// instead of transparent. iOS clips it to a rounded square anyway so
// the visual is "cream rounded square with logo inside" — consistent
// with the apple-touch-startup-image splash.
//
//   "any"      → cream bg + logo at ~80% of canvas
//   "maskable" → cream bg + logo at 65% of canvas (Android adaptive
//                safe-zone for circle/squircle/rounded-square masks)

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'project', 'assets', 'logo.png');
const OUT = path.join(__dirname, '..', 'project', 'assets', 'icons');
const BG_CREAM = { r: 247, g: 243, b: 236, alpha: 1 };  // #F7F3EC
const BG_TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function composeIcon(size, logoRatio, outFile) {
  const logoSize = Math.round(size * logoRatio);
  const logo = await sharp(SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: BG_TRANSPARENT })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG_CREAM },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, outFile));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // ── "any" purpose: cream bg + logo at 80% ─────────────────────────────────
  await composeIcon(192, 0.82, 'icon-192.png');
  await composeIcon(512, 0.82, 'icon-512.png');
  await composeIcon(180, 0.82, 'apple-touch-icon.png');
  await composeIcon(32,  0.82, 'favicon-32.png');

  // ── "maskable" purpose: cream bg + logo at 65% (Android safe zone) ────────
  await composeIcon(192, 0.65, 'icon-maskable-192.png');
  await composeIcon(512, 0.65, 'icon-maskable-512.png');

  console.log('Icons generated.');
})();
