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

// ─── Install: minimal, no pre-cache. ─────────────────────────────────────────
// Previously the install handler fetched ~30 shell + static files in
// parallel with { cache: 'reload' } to bypass the HTTP cache. On a 2nd
// Android PWA launch where the SW was being reinstalled (e.g. after a
// deploy that bumped CACHE_VERSION), this caused a fetch storm during
// WebView startup which Android could interpret as resource pressure
// and kill the WebView. The user saw the home screen flash through
// while Android relaunched the PWA.
//
// Now: install does NOTHING except skipWaiting. Files get cached
// LAZILY as the fetch handler intercepts requests during normal use.
// First online use after install populates the cache; subsequent
// offline launches still work because the cache is already filled.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ─── Activate: do nothing. Old caches accumulate harmlessly. ─────────────────
// Previously the activate handler enumerated cache keys and deleted any
// that didn't match CACHE_VERSION. Problem: if the OLD SW is still
// controlling the currently-open page (we deliberately don't call
// clients.claim()), and the NEW SW deletes the OLD SW's cache during
// activate, the old SW suddenly can't serve the files it had cached
// and falls back to network — which can cause partial-loaded states
// or even WebView restart on Android. Letting old caches sit is
// inefficient but safe; storage cleanup happens naturally as the OS
// reclaims space.
self.addEventListener('activate', () => {
  // intentionally empty
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
