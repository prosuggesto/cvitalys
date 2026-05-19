// Generates the full set of PWA icons from project/assets/logo.png.
//
// Two flavours per size:
//   - "any" purpose       → logo on transparent bg (used on home screen,
//                           Safari favicon, install dialogs)
//   - "maskable" purpose  → logo centered with a cream safe-zone bleed
//                           around it (used by Android adaptive icons +
//                           the splash screen). Without the bleed,
//                           Android adds a black/theme_color square
//                           behind the logo because it assumes the icon
//                           is designed for masking and pads it.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'project', 'assets', 'logo.png');
const OUT = path.join(__dirname, '..', 'project', 'assets', 'icons');
const BG_CREAM = { r: 247, g: 243, b: 236, alpha: 1 };  // #F7F3EC
const BG_TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // ── Transparent-bg icons (purpose: "any") ─────────────────────────────────
  await sharp(SRC)
    .resize(192, 192, { fit: 'contain', background: BG_TRANSPARENT })
    .toFile(path.join(OUT, 'icon-192.png'));
  await sharp(SRC)
    .resize(512, 512, { fit: 'contain', background: BG_TRANSPARENT })
    .toFile(path.join(OUT, 'icon-512.png'));
  await sharp(SRC)
    .resize(180, 180, { fit: 'contain', background: BG_TRANSPARENT })
    .toFile(path.join(OUT, 'apple-touch-icon.png'));
  await sharp(SRC)
    .resize(32, 32, { fit: 'contain', background: BG_TRANSPARENT })
    .toFile(path.join(OUT, 'favicon-32.png'));

  // ── Maskable icons (purpose: "maskable") ──────────────────────────────────
  // Logo at 65% of canvas → leaves ~17.5% bleed on each side, plenty for
  // Android's various mask shapes (circle, squircle, rounded square).
  for (const size of [192, 512]) {
    const logoSize = Math.round(size * 0.65);
    const logo = await sharp(SRC)
      .resize(logoSize, logoSize, { fit: 'contain', background: BG_TRANSPARENT })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG_CREAM },
    })
      .composite([{ input: logo, gravity: 'center' }])
      .png()
      .toFile(path.join(OUT, `icon-maskable-${size}.png`));
  }

  console.log('Icons generated.');
})();
