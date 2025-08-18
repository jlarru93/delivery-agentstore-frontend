import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PushService {
  private messaging?: Messaging;
  constructor(private readonly http:HttpClient){

  }

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
    // cache local para no pedir token cada vez
    const cached = localStorage.getItem('tokenPush');
    if (cached) return cached;

    await this.init(); // initializeApp + isSupported + getMessaging
    if (!this.messaging) return null;

    // 1) permiso de notificación
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      console.warn('Permiso no concedido');
      return null;
    }

    // 2) aseguramos la registration del SW de FCM (NO usar ready)
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
      console.log('FCM SW registrado on-demand:', swReg.scope);
    }

    // 3) validaciones duras antes de getToken
    if (!environment.vapidKey || typeof environment.vapidKey !== 'string') {
      console.error('VAPID key ausente o inválida en environment');
      return null;
    }

    // 4) llamada directa, sin helpers intermedios
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg
      });
      console.log('getToken OK:', token);
      if (token) {
        localStorage.setItem('tokenPush', token);
        this.registerService(token).subscribe(()=>{console.log("se registro la notificación")});
      }
      return token ?? null;
    } catch (err) {
      console.error('getToken error ->', (err as any)?.code || err, err);
      return null;
    }
  }


  /**
   * Escucha mensajes cuando la pestaña está en foreground.
   */
  onForegroundMessage(cb: (payload: any) => void): void {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => cb(payload));
  }
  
  registerService(playerId:string){
    return this.http.post(environment.url.backEndMessague+"/pushNotification/agent-store",{playerId:playerId})
  }
}
