// Kill switch del antiguo Angular Service Worker (ngsw).
//
// Hasta ago-2025 la app registraba 'ngsw-worker.js' en el scope '/'. Se quitó el
// registro, pero los navegadores que ya lo tenían siguen ejecutándolo y sirven
// index.html/JS viejos desde caché tras cada despliegue (pantalla en blanco con spinner).
//
// Este archivo reemplaza a ese SW: al actualizarse, borra las cachés de ngsw,
// se desregistra y recarga las pestañas abiertas para que carguen la versión nueva.
// NO toca firebase-messaging-sw.js (tiene su propio scope y registro).
// Mantenerlo desplegado varios meses para que alcance a todos los dispositivos.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith('ngsw:')).map((k) => caches.delete(k))
      );
    } catch (_) { /* ignore */ }

    await self.registration.unregister();

    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((client) => {
      try { client.navigate(client.url); } catch (_) { /* ignore */ }
    });
  })());
});

// Sin handler de 'fetch': todas las peticiones van directo a la red.
