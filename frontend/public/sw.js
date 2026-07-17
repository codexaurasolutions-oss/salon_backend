// Intentionally empty — Service Worker disabled to prevent FetchEvent errors
// with Vite dev server lazy chunks.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
// No fetch listener — all requests go directly to network.