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

async function composeIcon(size, logoRatio, outFile, opts = {}) {
  const logoSize = Math.round(size * logoRatio);
  const logo = await sharp(SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: BG_TRANSPARENT })
    .toBuffer();
  let pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: BG_CREAM },
  }).composite([{ input: logo, gravity: 'center' }]);

  // Flatten to RGB (drop alpha channel) for "any" icons used by Android
  // Chrome on the PWA splash. With an alpha channel present, even when
  // fully opaque, some Chrome builds (notably on MIUI/Xiaomi) treat the
  // PNG as "supports transparency" and wrap it in a system adaptive
  // icon container with a white fill — that's the white rounded square
  // frame around the logo on the Android splash. A pure RGB PNG has no
  // alpha to interpret, so Chrome renders the icon flat on the splash
  // background_color with no wrapper.
  if (opts.flatten) {
    pipeline = pipeline
      .flatten({ background: BG_CREAM })
      .removeAlpha()
      .png({ palette: false });
  } else {
    pipeline = pipeline.png();
  }
  return pipeline.toFile(path.join(OUT, outFile));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // ── "any" purpose: cream bg + logo at 80% — FLATTENED (RGB, no alpha)
  //    so Android Chrome doesn't wrap them in a white adaptive container.
  await composeIcon(192, 0.82, 'icon-192.png',         { flatten: true });
  await composeIcon(512, 0.82, 'icon-512.png',         { flatten: true });
  await composeIcon(180, 0.82, 'apple-touch-icon.png', { flatten: true });
  await composeIcon(32,  0.82, 'favicon-32.png',       { flatten: true });

  // ── "maskable" purpose: cream bg + logo at 65% (Android safe zone).
  //    Also flattened for the same reason as above.
  await composeIcon(192, 0.65, 'icon-maskable-192.png', { flatten: true });
  await composeIcon(512, 0.65, 'icon-maskable-512.png', { flatten: true });

  console.log('Icons generated.');
})();
