// ============================================================
// Service Worker — Encontro D'água Hub Digital
// Handles Web Push Notifications from send-push-notification
// Edge Function (VAPID / web-push protocol).
// ============================================================

const CACHE_NAME = 'hub-v1';
const OFFLINE_URL = '/offline.html';

// ── Install & activate ────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(['/', '/index.html']).catch(() => { })
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Push event: show notification ────────────────────────
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { notification: { title: '🔔 Hub Digital', body: event.data?.text() || 'Nova notificação' } };
    }

    const notif = data.notification || {};
    const title = notif.title || '🔔 Encontro D\'água Hub';
    const options = {
        body: notif.body || 'Você tem uma atualização.',
        icon: notif.icon || '/icon-192.png',
        badge: notif.badge || '/badge-72.png',
        vibrate: notif.vibrate || [200, 100, 200],
        data: {
            url: (notif.data && notif.data.url) || '/',
            timestamp: Date.now(),
        },
        actions: [
            { action: 'open', title: 'Abrir CRM' },
            { action: 'dismiss', title: 'Dispensar' },
        ],
        requireInteraction: false,
        silent: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: focus or open app ─────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Focus existing window if already open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ── Push subscription change ──────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
    // Re-subscribe automatically if subscription expires
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: self.VAPID_PUBLIC_KEY || '',
        }).then(newSubscription => {
            // Persist new subscription to backend
            return fetch('/api/update-push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubscription),
            });
        }).catch(err => console.warn('[SW] pushsubscriptionchange failed:', err))
    );
});
