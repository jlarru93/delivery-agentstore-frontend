import { Injectable } from "@angular/core";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Router } from "@angular/router";
import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  Messaging,
} from "firebase/messaging";
import { App } from "@capacitor/app";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { NotificationConfigService } from "./notification-config.service";
import { Auth } from "aws-amplify";

const AlarmPlugin = registerPlugin<{
  stopAlarm(): Promise<void>;
  startAlarm(): Promise<void>;
  getPendingOrderUuid(): Promise<{ order: string | null }>;
}>("AlarmPlugin");

@Injectable({ providedIn: "root" })
export class PushService {
  private messaging?: Messaging;

  constructor(
    private readonly http: HttpClient,
    private notifConfig: NotificationConfigService,
    private router: Router
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Init — solo llamar cuando el usuario ya está autenticado
  // ─────────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    // ✅ Verificar sesión Cognito activa antes de intentar registrar token
    if (!(await this.isAuthReady())) {
      console.warn("[Push] init abortado: sesión Cognito no activa aún");
      return;
    }

    if (Capacitor.isNativePlatform()) {
      await this.initNative();
    } else {
      await this.initWeb();
    }
  }

  private async isAuthReady(): Promise<boolean> {
    try {
      await Auth.currentSession();
      return true;
    } catch {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Nativo (Android / Capacitor)
  // ─────────────────────────────────────────────────────────────────

  private async initNative(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import(
        "@capacitor-firebase/messaging"
      );

      const { receive } = await FirebaseMessaging.checkPermissions();
      if (receive === "granted") {
        await this.refreshAndRegisterNativeToken(FirebaseMessaging);
      } else if (receive === "prompt") {
        const result = await FirebaseMessaging.requestPermissions();
        if (result.receive === "granted") {
          await this.refreshAndRegisterNativeToken(FirebaseMessaging);
        } else {
          console.warn(
            "[Push] Permiso de notificaciones denegado por el usuario"
          );
        }
      } else {
        console.warn("[Push] Notificaciones bloqueadas en ajustes del sistema");
      }

      FirebaseMessaging.addListener(
        "notificationReceived",
        async (notification: any) => {
          const data = notification?.notification?.data;
          const type = data?.type ?? "NEW_ORDER";

          if (type === "CANCEL_ORDER") {
            await this.stopAlarm();
            return;
          }

          if (type === "NEW_ORDER") {
            if (this.notifConfig.isSound()) {
              await this.startAlarm();
            }
          }
        }
      );

      FirebaseMessaging.addListener(
        "notificationActionPerformed",
        async (action: any) => {
          await this.stopAlarm();

          const data = action.notification?.data;
          if (data && data.orderUuid) {
            this.router.navigate(["/main"], {
              queryParams: { order: data.orderUuid },
            });
          } else {
            await this.checkPendingOrder();
          }
        }
      );

      App.addListener("appStateChange", async ({ isActive }) => {
        if (!isActive) {
          await this.stopAlarm();
        }
      });
    } catch (e) {
      console.error("[Push] Error FCM nativo:", e);
    }
  }

  private async refreshAndRegisterNativeToken(
    FirebaseMessaging: any
  ): Promise<void> {
    try {
      const { token } = await FirebaseMessaging.getToken();
      console.log("[Push] Token FCM nativo obtenido:", token ? "✔" : "✘ vacío");
      if (token) {
        this.registerService(token).subscribe({
          next: () =>
            console.log("[Push] Token nativo registrado en backend ✔"),
          error: (err) =>
            console.error("[Push] Error registrando token nativo:", err),
        });
      }
    } catch (e) {
      console.error("[Push] Error obteniendo token FCM nativo:", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Verificar orden pendiente desde notificación (arranque + resume)
  // ─────────────────────────────────────────────────────────────────

  async checkPendingOrder(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { order } = await AlarmPlugin.getPendingOrderUuid();
      if (!order) return;

      console.log("[Push] Orden pendiente uuid:", order);
      await this.stopAlarm();

      this.router.navigate(["/main"], {
        queryParams: { order: order },
      });
    } catch (e) {
      console.error("[Push] checkPendingOrder error:", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Web / PWA
  // ─────────────────────────────────────────────────────────────────

  private async initWeb(): Promise<void> {
    if (!getApps().length) initializeApp(environment.firebase);
    if (!(await isSupported())) {
      console.warn("[Push] FCM no soportado en este navegador.");
      return;
    }
    this.messaging = getMessaging();

    // ✅ Si ya tenía permiso concedido → re-registrar token en cada sesión
    // Esto cubre el caso donde el token fue rotado o eliminado por softDelete
    if (Notification.permission === "granted") {
      await this.silentlyRefreshWebToken();
    }
  }

  private async silentlyRefreshWebToken(): Promise<void> {
    try {
      if (!this.messaging) return;

      let swReg = await navigator.serviceWorker.getRegistration(
        "/firebase-cloud-messaging-push-scope"
      );
      if (!swReg) {
        swReg = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/firebase-cloud-messaging-push-scope",
          }
        );
      }

      if (!environment.vapidKey || typeof environment.vapidKey !== "string") {
        console.warn(
          "[Push] VAPID key ausente, no se puede refrescar token web"
        );
        return;
      }

      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        localStorage.setItem("tokenPush", token);
        this.registerService(token).subscribe({
          next: () =>
            console.log("[Push] Token web re-registrado silenciosamente ✔"),
          error: (err) =>
            console.error("[Push] Error re-registrando token web:", err),
        });
      }
    } catch (err) {
      console.warn("[Push] No se pudo refrescar token web:", err);
    }
  }

  async requestPermissionAndToken() {
    if (Capacitor.isNativePlatform()) return null;

    await this.initWeb();
    if (!this.messaging) return null;

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      localStorage.removeItem("tokenPush");
      return null;
    }

    let swReg = await navigator.serviceWorker.getRegistration(
      "/firebase-cloud-messaging-push-scope"
    );
    if (!swReg) {
      swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/firebase-cloud-messaging-push-scope",
        }
      );
    }

    if (!environment.vapidKey || typeof environment.vapidKey !== "string") {
      return { error: "VAPID key ausente" };
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg,
      });
      if (token) {
        localStorage.setItem("tokenPush", token);
        this.registerService(token).subscribe({
          next: () => console.log("[Push] Token web registrado ✔"),
          error: (err) =>
            console.error("[Push] Error registrando token web:", err),
        });
      }
      return { token, perm };
    } catch (err) {
      return { error: "getToken error: " + (err as any)?.code };
    }
  }

  onForegroundMessage(cb: (payload: any) => void): void {
    if (Capacitor.isNativePlatform()) return;
    if (!this.messaging) return;
    onMessage(this.messaging, (payload) => {
      const config = this.notifConfig.get();
      if (config.sound || config.visual) {
        cb(payload);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Alarma nativa
  // ─────────────────────────────────────────────────────────────────

  async stopAlarm(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AlarmPlugin.stopAlarm();
      console.log("[Push] Alarma detenida");
    } catch (e) {
      console.error("[Push] Error deteniendo alarma:", e);
    }
  }

  async startAlarm(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.notifConfig.isSound()) return;
    try {
      await AlarmPlugin.startAlarm();
    } catch (e) {
      console.error("[Push] Error iniciando alarma:", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Backend
  // ─────────────────────────────────────────────────────────────────

  registerService(playerId: string) {
    return this.http.post(
      environment.url.backEndMessague + "/pushNotification/agent-store",
      { playerId }
    );
  }
}
