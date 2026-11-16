/* NutriSalta · service worker
   - App (HTML, íconos, manifest): red primero, si no hay conexión usa la copia guardada.
   - Librerías de CDN (PDF.js, MediaPipe): se guardan la primera vez y se sirven desde caché.
   - La API de Groq nunca se cachea.
   - El modelo local (Gemma) lo guarda la app en su propia caché 'ns-local-model'. */
const VERSION = 'ns-shell-v2';
const RUNTIME = 'ns-runtime';
const MODEL_CACHE = 'ns-local-model';
const SHELL = [
  './', './index.html', './nutrisalta.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-64.png'
];
const CDN_PRECACHE = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    const r = await caches.open(RUNTIME);
    await Promise.all(CDN_PRECACHE.map(u => r.add(new Request(u, { mode: 'cors' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [VERSION, RUNTIME, MODEL_CACHE];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isCdn = url => /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)cdn\.jsdelivr\.net$/.test(url.hostname);

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'api.groq.com' || url.hostname.endsWith('huggingface.co')) return; // siempre a la red

  // Librerías: caché primero
  if (isCdn(url)) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
      return res;
    })());
    return;
  }

  // Mismo origen: red primero (para recibir actualizaciones), caché si no hay conexión
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(VERSION)).put(req, res.clone());
        return res;
      } catch (e) {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') return (await caches.match('./nutrisalta.html')) || Response.error();
        return Response.error();
      }
    })());
  }
});
