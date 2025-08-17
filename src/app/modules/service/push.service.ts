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
    await this.init();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted' || !this.messaging) return null;

    // Usa el SW activo de Angular (básico) o uno propio (ver sección 7).
    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(this.messaging, {
      vapidKey: environment.vapidKey,
      serviceWorkerRegistration: swReg, // básico: usa ngsw-worker
    });

    return token ?? null;
  }

  /**
   * Escucha mensajes cuando la pestaña está en foreground.
   */
  onForegroundMessage(cb: (payload: any) => void): void {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => cb(payload));
  }
}
