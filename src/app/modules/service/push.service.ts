import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

// Plugin para detener la alarma nativa desde Angular
const AlarmPlugin = registerPlugin<{
  stopAlarm(): Promise<void>;
  startAlarm(): Promise<void>;
}>('AlarmPlugin');

@Injectable({ providedIn: 'root' })
export class PushService {

  private messaging?: Messaging;

  constructor(private readonly http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────────
  // Inicialización — llamar al arrancar la app
  // ─────────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.initNative();
    } else {
      await this.initWeb();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Nativo (Android/iOS) — usa @capacitor-firebase/messaging
  // ─────────────────────────────────────────────────────────────────

  private async initNative(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

      // Pedir permiso
      await FirebaseMessaging.requestPermissions();

      // Obtener token FCM y registrarlo en backend
      const { token } = await FirebaseMessaging.getToken();
      console.log('[Push] Token FCM nativo:', token);
      if (token) {
        this.registerService(token).subscribe(() => {
          console.log('[Push] Token registrado en backend');
        });
      }

      // Escuchar notificaciones en foreground
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('[Push] Foreground notification:', notification);
      });

      // Cuando el agente toca la notificación → detener alarma
      FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        console.log('[Push] Notificación tocada:', action);
        this.stopAlarm();
      });

    } catch (e) {
      console.error('[Push] Error inicializando FCM nativo:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Web / PWA — usa Firebase JS SDK (implementación actual)
  // ─────────────────────────────────────────────────────────────────

  private async initWeb(): Promise<void> {
    if (!getApps().length) {
      initializeApp(environment.firebase);
    }
    if (!(await isSupported())) {
      console.warn('[Push] FCM no soportado en este navegador.');
      return;
    }
    this.messaging = getMessaging();
  }

  async requestPermissionAndToken() {
    if (Capacitor.isNativePlatform()) {
      // En nativo ya se pidió en initNative()
      return null;
    }

    await this.initWeb();
    if (!this.messaging) return null;

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      localStorage.removeItem('tokenPush');
      console.warn('[Push] Permiso no concedido');
      return null;
    }

    let swReg = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
    }

    if (!environment.vapidKey || typeof environment.vapidKey !== 'string') {
      console.error('[Push] VAPID key ausente');
      return { error: 'VAPID key ausente' };
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg
      });
      if (token) {
        localStorage.setItem('tokenPush', token);
        this.registerService(token).subscribe(() => console.log('[Push] Token registrado'));
      }
      return { token, perm };
    } catch (err) {
      console.error('[Push] getToken error:', err);
      return { error: 'getToken error: ' + (err as any)?.code };
    }
  }

  onForegroundMessage(cb: (payload: any) => void): void {
    if (Capacitor.isNativePlatform()) return; // nativo usa addListener
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => cb(payload));
  }

  // ─────────────────────────────────────────────────────────────────
  // Alarma nativa
  // ─────────────────────────────────────────────────────────────────

  async stopAlarm(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await AlarmPlugin.stopAlarm();
        console.log('[Push] Alarma detenida');
      } catch (e) {
        console.error('[Push] Error deteniendo alarma:', e);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Backend
  // ─────────────────────────────────────────────────────────────────

  registerService(playerId: string) {
    return this.http.post(
      environment.url.backEndMessague + '/pushNotification/agent-store',
      { playerId }
    );
  }
}