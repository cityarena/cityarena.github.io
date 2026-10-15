// City Arena keeps its page on the device, so it opens at once even when the network to GitHub is slow or stuck.
// The kept page is shown straight away; a fresh copy is fetched in the background and used from the next opening.
// Only the page itself is kept: the venue's data always comes from the server.
const PAGE_CACHE = 'city-arena-page';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.mode !== 'navigate' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(PAGE_CACHE).then(async cache => {
    const kept = await cache.match('./');
    const fresh = fetch(request, { cache: 'no-store' }).then(response => {
      if (response.ok) cache.put('./', response.clone());
      return response;
    });
    if (!kept) return fresh;
    event.waitUntil(fresh.catch(() => null));
    return kept;
  }));
});
