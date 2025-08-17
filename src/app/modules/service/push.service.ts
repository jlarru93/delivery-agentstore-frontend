import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private messaging?: Messaging;

  async init(): Promise<void> {
    if (!getApps().length) {
      initializeApp(environment.firebase);
    }
    if (!(await isSupported())) {
      console.warn('FCM no soportado en este navegador.');
      return;
    }
    this.messaging = getMessaging();
  }

  /**
   * Llamar esto desde un botón (gesto de usuario).
   * Retorna el token FCM o null si no hay permiso.
   */
  async requestPermissionAndToken(): Promise<string | null> {
    // ...
    // 1) intenta conseguir la registration del SW de FCM explícitamente
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');

    // 2) si no existe, registra de nuevo por si el load aún no la hizo
    if (!swReg) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope'
        });
        console.log('FCM SW registrado on-demand:', swReg.scope);
      } catch (e) {
        console.error('No se pudo registrar el FCM SW:', e);
      }
    }

    // 3) como último recurso, usa cualquiera que esté "ready"
    if (!swReg) {
      swReg = await navigator.serviceWorker.ready;
      console.warn('Usando SW ready (probablemente ngsw) como fallback');
    }

    // 4) pide el token con esa registration
    let token: string | null = null;
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      console.log('SW regs:', regs.map(r => ({ scope: r.scope })));
      token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg
      });
      console.log('getToken OK:', token);
    } catch (err:any) {
      console.error('getToken error:', err?.code || err, err);
      return null;
    }
    return null
  }

  /**
   * Escucha mensajes cuando la pestaña está en foreground.
   */
  onForegroundMessage(cb: (payload: any) => void): void {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => cb(payload));
  }
}
