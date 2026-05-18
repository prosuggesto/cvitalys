// Runs on every Vercel build. Bumps CACHE_VERSION in sw.js so the browser
// sees a new sw.js byte-for-byte → triggers SW update → silent reload.
// Without this, deploying app.jsx without changing sw.js would not invalidate
// the cache and users would keep seeing the old version until reinstall.
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'project', 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');

// Use Vercel git commit SHA when available (deterministic per deploy),
// fall back to timestamp for local builds.
const version =
  (process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8)) ||
  String(Date.now());

const tag = `cvitalys-${version}`;
sw = sw.replace(
  /const CACHE_VERSION = ['"][^'"]+['"];/,
  `const CACHE_VERSION = '${tag}';`
);
fs.writeFileSync(swPath, sw);
console.log(`[build] sw.js CACHE_VERSION → ${tag}`);
