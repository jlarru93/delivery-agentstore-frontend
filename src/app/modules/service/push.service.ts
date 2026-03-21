import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NotificationConfigService } from './notification-config.service';

const AlarmPlugin = registerPlugin<{
  stopAlarm(): Promise<void>;
  startAlarm(): Promise<void>;
}>('AlarmPlugin');

@Injectable({ providedIn: 'root' })
export class PushService {

  private messaging?: Messaging;

  constructor(
    private readonly http: HttpClient,
    private notifConfig: NotificationConfigService
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.initNative();
    } else {
      await this.initWeb();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Nativo (Android)
  // ─────────────────────────────────────────────────────────────────

  private async initNative(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

      await FirebaseMessaging.requestPermissions();

      const { token } = await FirebaseMessaging.getToken();
      console.log('[Push] Token FCM nativo:', token);
      if (token) {
        this.registerService(token).subscribe(() => {
          console.log('[Push] Token registrado en backend');
        });
      }

      // Foreground: respetar config
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('[Push] Foreground notification:', notification);
        this.handleNativeNotification();
      });

      // Al tocar notificación → detener alarma
      FirebaseMessaging.addListener('notificationActionPerformed', () => {
        this.stopAlarm();
      });

    } catch (e) {
      console.error('[Push] Error FCM nativo:', e);
    }
  }

  private handleNativeNotification(): void {
    const config = this.notifConfig.get();

    // Vibración
    if (config.vibration && Capacitor.isNativePlatform()) {
      // La vibración la maneja AlarmService en Java
      // Si solo quieren vibrar sin sonido, podemos detener el audio
    }

    // Si no quiere sonido → detener AlarmService inmediatamente
    if (!config.sound) {
      this.stopAlarm();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Web / PWA
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
    if (Capacitor.isNativePlatform()) return null;

    await this.initWeb();
    if (!this.messaging) return null;

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      localStorage.removeItem('tokenPush');
      return null;
    }

    let swReg = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
    }

    if (!environment.vapidKey || typeof environment.vapidKey !== 'string') {
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
      return { error: 'getToken error: ' + (err as any)?.code };
    }
  }

  onForegroundMessage(cb: (payload: any) => void): void {
    if (Capacitor.isNativePlatform()) return;
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => {
      const config = this.notifConfig.get();
      // Web: respetar config de sonido
      if (config.sound) {
        cb(payload);
      } else if (config.visual) {
        // Solo visual, sin audio — pasar payload igualmente
        // El componente que recibe decide si reproduce audio
        cb({ ...payload, _skipAudio: true });
      }
    });
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

  async startAlarm(): Promise<void> {
    if (Capacitor.isNativePlatform() && this.notifConfig.isSound()) {
      try {
        await AlarmPlugin.startAlarm();
      } catch (e) {
        console.error('[Push] Error iniciando alarma:', e);
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