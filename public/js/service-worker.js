const CACHE_NAME = 'unlocked-library-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/main.js',
    '/js/components.js',
    '/js/utils.js',
    '/js/config.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    '/images/default-thumbnail.jpg',
    '/images/default-avatar.jpg',
    '/images/symbols/ussr-hammer-sickle.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        return event.respondWith(networkFirst(event.request));
    }

    // Handle static assets
    event.respondWith(cacheFirst(event.request));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

// Network-first strategy for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response(JSON.stringify({
            error: 'Network error. Please check your connection.'
        }), {
            status: 408,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-videos') {
        event.waitUntil(syncVideos());
    } else if (event.tag === 'sync-wiki') {
        event.waitUntil(syncWikiPosts());
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Content',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification('The Unlocked Library', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sync videos when online
async function syncVideos() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        const videoRequests = requests.filter(request => 
            request.url.includes('/api/videos') && 
            request.method === 'POST'
        );

        return Promise.all(
            videoRequests.map(async request => {
                try {
                    const response = await fetch(request.clone());
                    if (response.ok) {
                        await cache.delete(request);
                    }
                    return response;
                } catch (error) {
                    console.error('Error syncing video:', error);
                }
            })
        );
    } catch (error) {
        console.error('Error in syncVideos:', error);
    }
}

// Sync wiki posts when online
async function syncWikiPosts() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        const wikiRequests = requests.filter(request => 
            request.url.includes('/api/wiki') && 
            request.method === 'POST'
        );

        return Promise.all(
            wikiRequests.map(async request => {
                try {
                    const response = await fetch(request.clone());
                    if (response.ok) {
                        await cache.delete(request);
                    }
                    return response;
                } catch (error) {
                    console.error('Error syncing wiki post:', error);
                }
            })
        );
    } catch (error) {
        console.error('Error in syncWikiPosts:', error);
    }
}

// Periodic background sync for content updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

// Update cached content
async function updateContent() {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.add('/api/videos/latest');
        await cache.add('/api/wiki/latest');
    } catch (error) {
        console.error('Error updating content:', error);
    }
}
