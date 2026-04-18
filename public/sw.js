// ============================================================
// Service Worker — Encontro D'Água Hub Digital
// V6.8: CACHE-FREE — apenas Push Notifications.
// O cache de assets foi DESATIVADO intencionalmente para
// garantir que deployments Vercel sejam sempre servidos
// frescos. NÃO adicione fetch handler de cache aqui.
// ============================================================

const CACHE_VERSION = 'hub-nocache-v2'; // bumpar a versão força uninstall do SW antigo

// ── Install: destrói TODOS os caches antigos, não cria novos ──────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        console.log('[SW] Deleting stale cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: limpa novamente e toma controle imediato ────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: PASS-THROUGH — nunca serve do cache ────────────────────────────
// Todos os requests vão direto para a rede (Vercel CDN).
self.addEventListener('fetch', () => {
  // Intencional: sem interceptação. O browser usa sua própria
  // estratégia de HTTP cache (controlada pelos headers da Vercel).
});

// ── Push event: exibe notificação ─────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { notification: { title: '🌊 Hub Digital', body: event.data?.text() || 'Nova notificação' } };
  }

  const notif   = data.notification || {};
  const title   = notif.title || '🌊 Encontro D\'Água Hub';
  const options = {
    body:             notif.body    || 'Você tem uma atualização.',
    icon:             notif.icon    || '/icon-192.png',
    badge:            notif.badge   || '/badge-72.png',
    vibrate:          notif.vibrate || [200, 100, 200],
    data:             { url: (notif.data && notif.data.url) || '/', timestamp: Date.now() },
    actions:          [{ action: 'open', title: 'Abrir CRM' }, { action: 'dismiss', title: 'Dispensar' }],
    requireInteraction: false,
    silent:           false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: foca ou abre a janela do app ─────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Push subscription change ──────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY || '',
    }).then(newSubscription =>
      fetch('/api/update-push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription),
      })
    ).catch(err => console.warn('[SW] pushsubscriptionchange failed:', err))
  );
});
