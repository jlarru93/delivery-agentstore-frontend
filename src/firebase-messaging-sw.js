// Usamos compat SOLO en el SW para simplificar importScripts
importScripts('/firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp(self.FIREBASE_CONFIG);

const messaging = firebase.messaging();
// Opción A: dejar que FCM muestre la notificación si el payload trae "notification".

// Opción B (personalizar): manejar data-only o sobreescribir la notificación
self.addEventListener('push', event => {
  try {
    const payload = event.data?.json() || {};
    const notif = payload.notification || {};
    const title = notif.title || 'Notificación';
    const options = {
      body: notif.body || '',
      icon: notif.icon || '/assets/icons/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      data: payload.data || {}
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // fallback
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.click_action || '/';
  event.waitUntil(clients.openWindow(url));
});
