const CACHE_NAME = 'spa-cache-v1';
const MUTATION_QUEUE = [];

self.addEventListener('install', (event) => {
  console.info('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.info('[SW] Activate');
  self.clients.claim();
});

// Message event: handle FETCH_REQUEST and new MUTATION_REQUEST
self.addEventListener('message', async (event) => {
  const { type } = event.data;

  if (type === 'FETCH_REQUEST') {
    const { url } = event.data;

    try {
      const cachedResponse = await caches.match(url);

      if (cachedResponse) {
        const data = await cachedResponse.json();

        event.ports[0].postMessage({ response: data });

        return;
      }

      const networkResponse = await fetch(url);
      const clone = networkResponse.clone();

      const cache = await caches.open(CACHE_NAME);

      await cache.put(url, clone);

      const data = await networkResponse.json();

      event.ports[0].postMessage({ response: data });
    } catch (error) {
      event.ports[0].postMessage({ error: error.message });
    }
  }

  if (type === 'MUTATION_REQUEST') {
    const { payload } = event.data;
    const port = event.ports[0];

    try {
      const response = await fetch(payload.url, {
        method: payload.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.body),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      port?.postMessage({ success: true });
    } catch (error) {
      console.warn('[SW] Mutation failed, queueing', error);
      MUTATION_QUEUE.push(payload);

      try {
        await self.registration.sync.register('sync-mutations');
      } catch (err) {
        console.warn('[SW] Failed to register sync', err);
      }

      port?.postMessage({ error: error.message || 'Unknown error' });
    }
  }
});

// Fetch event: fallback catch-all for navigation or resources
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return; // only cache GETs

  event.respondWith(
    caches
      .match(request)
      .then((cached) => cached || fetch(request))
      .catch((err) => {
        console.error('[SW] Fetch failed', err);

        return new Response('Offline', { status: 503 });
      }),
  );
});

// Background Sync event: process queued mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    console.info('[SW] Background sync triggered');
    event.waitUntil(processQueuedMutations());
  }
});

// Helper to process queued mutations
async function processQueuedMutations() {
  console.info('[SW] Processing queued mutations', MUTATION_QUEUE.length);

  while (MUTATION_QUEUE.length > 0) {
    const payload = MUTATION_QUEUE.shift(); // Take first mutation

    try {
      const response = await fetch(payload.url, {
        method: payload.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.body),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      console.info('[SW] Mutation replayed successfully');
    } catch (error) {
      console.error('[SW] Failed to replay mutation', error);

      // If failed again, push back to the front and stop
      MUTATION_QUEUE.unshift(payload);
      break;
    }
  }
}
