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

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = await event.data.json(); } catch (_) {}

    const notif = payload.notification || {};
    const data  = payload.data || {};

    const title = notif.title || data.title || 'PIWI';
    const body  = notif.body  || data.body  || 'Tienes una notificación';

    const options = {
      body,  // ← ya no es JSON.stringify
      icon: notif.icon || '/assets/icons/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      data,
      actions: [
        { action: 'play',  title: '▶ Reproducir' },
        { action: 'pause', title: '⏸ Pausar' }
      ]
    };

    await self.registration.showNotification(title, options);

    // ✅ Audio: solo si viene audioUrl
    const audioUrl = data.audioUrl || 'assets/audio/audio.mp3';
    await broadcastToClients({
      type: 'PLAY_AUDIO',
      audioUrl,
      metadata: {
        title,
        artist: 'Piwi',
        album: '',
        artwork: [
          { src: '/assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
        ]
      }
    });
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
