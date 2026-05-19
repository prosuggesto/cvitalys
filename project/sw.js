// CVitalis Service Worker
// Strategies:
//   App shell (HTML, CSS, JSX) → cache-first → instant, predictable load
//   Static assets (images, fonts, CDN scripts) → cache-first
//   Supabase API → network-first with cache fallback (offline support)
//
// Auto-update flow:
//   1. CACHE_VERSION is bumped on every Vercel build by
//      scripts/bump-sw-version.js (uses git commit SHA).
//   2. Browser fetches new sw.js (Vercel serves it no-cache).
//   3. Different bytes → browser installs the new SW in the background
//      and PRE-CACHES the new shell.
//   4. New SW stays in "waiting" while the user is using the app.
//   5. Next launch (PWA reopened from home screen) → new SW activates
//      automatically → user sees the new version, no reload prompt,
//      no mid-session interruption.

const CACHE_VERSION = 'cvitalys-dev';

// App shell — these get stale-while-revalidate so deploys propagate silently
const SHELL = [
  '/',
  '/styles.css',
  '/src/supabase.jsx',
  '/src/icons.jsx',
  '/src/data.jsx',
  '/src/i18n.jsx',
  '/src/ui.jsx',
  '/src/shell.jsx',
  '/src/landing.jsx',
  '/src/auth.jsx',
  '/src/cvs.jsx',
  '/src/customize.jsx',
  '/src/analytics.jsx',
  '/src/nfc.jsx',
  '/src/account.jsx',
  '/src/public.jsx',
  '/src/legal.jsx',
  '/src/install-tutorial.jsx',
  '/src/app.jsx',
  '/manifest.webmanifest',
];

// Static assets — cache-first, change rarely
const STATIC_ASSETS = [
  '/assets/qrcode.min.js',
  '/assets/logo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-192.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/favicon-32.png',
  '/assets/install-tutorial/step1.png',
  '/assets/install-tutorial/step2.png',
  '/assets/install-tutorial/step3.png',
];

// External hosts — cache-first after first load
const CDN_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const SUPABASE_HOST = 'supabase.co';

// ─── Install: pre-cache everything, bypass HTTP cache for shell ──────────────
// skipWaiting() is called so the new SW activates as soon as it's installed,
// without waiting for all clients to close. The page-side reload that picks
// up the new code is GATED by user interaction (see CVitalis.html): if the
// user hasn't tapped/typed anything yet, the page reloads silently during
// the loading screen; otherwise the new version waits for the next launch.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const shellRequests = SHELL.map((url) => new Request(url, { cache: 'reload' }));
      const staticRequests = STATIC_ASSETS.map((url) => new Request(url));
      await Promise.all(
        [...shellRequests, ...staticRequests].map((req) =>
          fetch(req)
            .then((res) => res.ok && cache.put(req, res))
            .catch(() => {})
        )
      );
      self.skipWaiting();
    })()
  );
});

// ─── Activate: delete old caches + claim clients so future fetches go
// through the new SW (current page keeps its old in-memory JS until the
// page-side reload gate fires — or until the next launch).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// ─── Fetch routing ────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Supabase API → network-first
  if (url.hostname.includes(SUPABASE_HOST)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Same-origin: app shell + static assets all go cache-first.
  // Updates land on next launch via the new SW (see install/activate above).
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // CDN scripts & fonts → cache-first
  if (CDN_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: just go to network
  event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

// Cache-first: cache → network → 503
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  } catch {
    if (request.mode === 'navigate') {
      const root = await cache.match('/');
      if (root) return root;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Network-first: try network, update cache, fall back to cache when offline
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Offline action queue bridge ─────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'cvitalys-sync-stats') {
    event.waitUntil(notifyClientsToFlush());
  }
});

async function notifyClientsToFlush() {
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' }));
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
