// CVitalis Service Worker
// Strategies:
//   HTML + JSX + CSS  → network-first → user always gets the latest code
//                       on every online launch. Falls back to cache when
//                       offline so "Présenter au recruteur" still works.
//   Static assets     → cache-first → fast, offline-friendly (images, icons,
//   (images, fonts)     fonts rarely change, no need to refetch).
//   Supabase API      → network-first with cache fallback.
//
// Why network-first on the code: previously cache-first on HTML meant the
// SW kept serving the OLD HTML/JSX from launch N for several launches
// after a deploy, which created the perceived "crash and reload" because
// when the new SW eventually took over, files inconsistently flipped.
// Network-first means every online launch gets fresh code immediately, no
// hidden SW dance, no lifecycle reloading.

const CACHE_VERSION = 'cvitalys-v1';

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

// ─── Activate: delete old caches. Does NOT call self.clients.claim().
// Reasoning: claim() makes the new SW take over the page that's already
// open, which fires `controllerchange` on the client and used to trigger
// our reload gate in CVitalis.html → visible "crash and reload" on every
// PWA launch (because we auto-bump CACHE_VERSION on every Vercel build,
// so almost every launch detects a new sw.js). Without claim, the new
// SW stays "active" in the background; the current page keeps using
// the old SW for the remainder of its life, and the new SW automatically
// controls the page on the next full reload (e.g. next cold launch of
// the PWA, or when the WebView is killed by Android and the user
// reopens the app). Updates still propagate, just on next cold start.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
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

  // Same-origin app code (HTML + JSX + CSS + manifest) → network-first.
  // Static assets (images, fonts, qrcode lib, icons) → cache-first.
  // This split means a code deploy is visible on the next online launch
  // without requiring a new SW activation cycle, while offline-critical
  // assets stay snappy and cached.
  if (url.origin === self.location.origin) {
    if (isCodeUrl(url.pathname)) {
      event.respondWith(networkFirst(request));
    } else {
      event.respondWith(cacheFirst(request));
    }
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

function isCodeUrl(pathname) {
  if (pathname === '/' || pathname === '/CVitalis.html') return true;
  if (pathname === '/styles.css') return true;
  if (pathname === '/manifest.webmanifest') return true;
  if (pathname.startsWith('/src/') && pathname.endsWith('.jsx')) return true;
  return false;
}

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
