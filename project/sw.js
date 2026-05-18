// CVitalis Service Worker
// Strategies:
//   App shell (HTML, CSS, JSX) → stale-while-revalidate
//     → cache served instantly, network fetch updates cache in background
//     → user sees latest version on next reload, no manual action needed
//   Static assets (images, fonts, CDN scripts) → cache-first
//   Supabase API → network-first with cache fallback (offline support)
//
// Auto-update: CACHE_VERSION is bumped on every Vercel build by
// scripts/bump-sw-version.js → byte-different sw.js → browser detects new SW
// → install + skipWaiting + clients.claim → controllerchange in the page
// → silent reload. User never has to reinstall.

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
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Force network fetch (bypass HTTP cache) so we always cache the latest
      // version of every shell file at install time.
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

// ─── Activate: delete old caches, take control immediately ────────────────────
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

  // Same-origin requests
  if (url.origin === self.location.origin) {
    // App shell (HTML, CSS, JSX, manifest) → stale-while-revalidate
    if (isShellUrl(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
    // Static assets (images, fonts) → cache-first
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

function isShellUrl(pathname) {
  if (pathname === '/' || pathname === '/CVitalis.html') return true;
  if (pathname === '/styles.css') return true;
  if (pathname === '/manifest.webmanifest') return true;
  if (pathname.startsWith('/src/') && pathname.endsWith('.jsx')) return true;
  return false;
}

// ─── Strategies ───────────────────────────────────────────────────────────────

// Stale-while-revalidate: serve cache, fetch fresh in background, update cache
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  // Return cached immediately if available, else wait for network
  return cached || fetchPromise;
}

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
