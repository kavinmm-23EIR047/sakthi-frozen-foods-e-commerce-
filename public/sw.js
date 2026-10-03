/**
 * Sakthi Frozen Foods - Web Push Service Worker
 * Standard W3C Push API & Notification API implementation (Zero third-party dependencies)
 */

self.addEventListener('install', (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become available to all active clients immediately
  event.waitUntil(self.clients.claim());
});

// ─── Listen for Web Push Events ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Sakthi Frozen Foods',
        body: event.data.text() || 'You have a new update.',
      };
    }
  } else {
    data = {
      title: 'Sakthi Frozen Foods',
      body: 'You have a new update regarding your order.',
    };
  }

  const title = data.title || 'Sakthi Frozen Foods';
  const targetUrl = data.data?.url || data.url || '/orders';

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/favicon-32x32.png',
    image: data.image || undefined,
    data: {
      url: targetUrl,
      timestamp: Date.now(),
    },
    tag: data.tag || `sakthi-${Date.now()}`,
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction),
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'View Details' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Handle Notification Clicks (Focus existing tab or open URL) ─────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const rawUrl = event.notification.data?.url || '/orders';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Check if an existing tab with our origin is already open
      for (const client of clientList) {
        if ('focus' in client && client.url.startsWith(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // 2. If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
