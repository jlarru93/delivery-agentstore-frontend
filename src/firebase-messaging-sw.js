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
    try { 
        // Firebase encapsula los datos en un objeto "data"
        const rawData = event.data.json();
        payload = rawData.data || rawData; 
    } catch (_) { return; }

    const title = payload.title || 'Nueva Notificación';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/assets/icons/icon-192x192.png',
      data: payload, // Guardamos todo el payload para el 'notificationclick'
      tag: 'order-update'+Date.now(), // Evita duplicados
      //renotify: true
      silent: true,
    };
    
    // 2. Ejecutar tu lógica de audio
    if (payload.audioUrl) {
      await broadcastToClients({
        type: 'PLAY_AUDIO',
        audioUrl: payload.audioUrl,
        title: title
      });
    }

    // 1. Mostrar la notificación visualmente (Obligatorio en iOS para mantener el hilo vivo)
    await self.registration.showNotification(title, options);


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
