// firebase-messaging-sw.js
importScripts('/firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();

// Utilidad: enviar mensajes a todas las ventanas/clientes
async function broadcastToClients(message) {
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  allClients.forEach(c => c.postMessage(message));
}

// Manejo de push (data-only o sobrescribiendo notificación)
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = await event.data.json(); } catch (_) {}

    const notif = payload.notification || {};
    const data  = payload.data || {};

    // 1) Mostrar notificación (opcional)
    const title = notif.title || 'Notificación';
    const options = {
      body: notif.body || '',
      icon: notif.icon || '/assets/icons/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      data, // aquí viajan tus claves personalizadas (click_action, audioUrl, etc.)
      actions: [
        { action: 'play',  title: '▶ Reproducir' },
        { action: 'pause', title: '⏸ Pausar' }
      ]
    };
    await self.registration.showNotification(title, options);

    // 2) Si viene audio en el payload, avisar a los clientes que reproduzcan
    if (data.audioUrl) {
      await broadcastToClients({
        type: 'PLAY_AUDIO',
        url: data.audioUrl,
        metadata: {
          title: data.title || notif.title,
          artist: data.artist || 'Piwi',
          album: data.album || '',
          artwork: data.artwork ? JSON.parse(data.artwork) : [
            { src: '/assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
          ]
        }
      });
    }
  })());
});

// Click en la notificación (botón o cuerpo)
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = (event.notification && event.notification.data) || {};
  const clickUrl = data.click_action || '/';

  // Acciones de controles
  if (event.action === 'play') {
    event.waitUntil(broadcastToClients({ type: 'PLAY_AUDIO', url: data.audioUrl, metadata: data }));
    return;
  }
  if (event.action === 'pause') {
    event.waitUntil(broadcastToClients({ type: 'PAUSE_AUDIO' }));
    return;
  }

  // Abrir/enfocar la app
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of allClients) {
      if (c.url.includes(self.location.origin)) {
        c.focus();
        return;
      }
    }
    await clients.openWindow(clickUrl);
  })());
});
