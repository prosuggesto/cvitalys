// CVitalis Service Worker
// Strategy:
//   App shell  → cache-first (HTML, CSS, JS, assets)
//   Supabase   → network-first with cache fallback
//   Fonts/CDN  → cache-first after first load
//   Auto-update: skipWaiting + clients.claim → silent, no user action needed

const CACHE_VERSION = 'cvitalys-v4';

// All app-shell files to pre-cache
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
  '/assets/qrcode.min.js',
  '/assets/logo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/install-tutorial/step1.png',
  '/assets/install-tutorial/step2.png',
  '/assets/install-tutorial/step3.png',
  '/manifest.webmanifest',
];

// External CDN scripts — cache after first load (cache-first)
const CDN_ORIGINS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Supabase API — network-first
const SUPABASE_ORIGIN = 'supabase.co';

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(SHELL).catch((err) => {
        // Log failures but don't block install (some assets may 404 in dev)
        console.warn('[SW] Pre-cache partial failure:', err);
      })
    )
  );
  // Silent auto-update: activate immediately without waiting for old clients to close
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  // Take control of all open tabs/clients immediately
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Supabase API → network-first with stale-while-revalidate
  if (url.hostname.includes(SUPABASE_ORIGIN)) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // CDN scripts (React, Babel, Supabase JS, Fonts) → cache-first
  if (CDN_ORIGINS.some((o) => url.hostname.includes(o))) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // App shell & local assets → cache-first
  event.respondWith(cacheFirstWithNetwork(request));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

// Cache-first: serve from cache, fall back to network and update cache
async function cacheFirstWithNetwork(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not in cache — return offline fallback for HTML navigation
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Network-first: try network, update cache, fall back to cache if offline
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
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

// ─── Offline action queue (Background Sync fallback) ─────────────────────────
// Used for stat increments when offline.
// On iOS, Background Sync is not supported — we handle it in the app via
// localStorage queue + online event listener instead.
self.addEventListener('sync', (event) => {
  if (event.tag === 'cvitalys-sync-stats') {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  // The actual flush logic runs in the app (app reads localStorage queue
  // and calls Supabase directly). This SW handler is a no-op safety net
  // for browsers that support Background Sync.
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' }));
}

// ─── Message channel (for future use) ────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
