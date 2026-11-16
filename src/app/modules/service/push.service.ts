import { Injectable, NgZone } from "@angular/core";
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
import { BehaviorSubject, Observable, firstValueFrom, from, of } from "rxjs";
import { catchError, switchMap, tap, timeout } from "rxjs/operators";
import { getPushDeviceInfo } from "../../utils/push-device-info";

// Token que este equipo registró en el motor nuevo: se guarda para darlo de baja al cerrar sesión.
const ENGINE_TOKEN_KEY = "pushEngineToken";

const AlarmPlugin = registerPlugin<{
  // orderUuid en stopAlarm = esa orden fue cancelada (el nativo lo recuerda por si "orden nueva" llega tarde)
  stopAlarm(opts?: { orderUuid?: string }): Promise<void>;
  startAlarm(opts?: { orderUuid?: string }): Promise<{ started?: boolean; reason?: string }>;
  reconcile(opts: { openOrders: number }): Promise<{ stopped: boolean }>;
  isRinging(): Promise<{ ringing: boolean }>;
  addListener(
    eventName: "alarmState",
    cb: (state: { ringing: boolean }) => void
  ): Promise<{ remove: () => Promise<void> }>;
  getPendingOrderUuid(): Promise<{ order: string | null }>;
}>("AlarmPlugin");

// Reintentos al pedir el token FCM cuando falla (espera creciente, en ms)
const TOKEN_RETRY_MS = [2_000, 10_000, 30_000, 120_000];

@Injectable({ providedIn: "root" })
export class PushService {
  private messaging?: Messaging;

  // Los listeners nativos se registran UNA vez: init() corre en cada resume y antes los duplicaba
  // (cada push disparaba N veces la misma acción).
  private nativeListenersReady = false;
  private tokenRetryTimer?: ReturnType<typeof setTimeout>;
  private tokenRetryCount = 0;

  // true mientras suena la alarma nativa (orden nueva o incidencia): el topbar muestra el botón "Silenciar"
  readonly alarmRinging$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private notifConfig: NotificationConfigService,
    private router: Router,
    private zone: NgZone
  ) {
    this.watchAlarmState();
  }

  private async watchAlarmState(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AlarmPlugin.addListener("alarmState", (s) =>
        this.zone.run(() => this.alarmRinging$.next(!!s?.ringing))
      );
      // Si la app se abre con la alarma ya sonando (llegó con la app cerrada)
      const { ringing } = await AlarmPlugin.isRinging();
      this.zone.run(() => this.alarmRinging$.next(!!ringing));
    } catch (e) {
      console.error("[Push] No se pudo vigilar el estado de la alarma:", e);
    }
  }

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

      console.log("[Push][perm] 1. checkPermissions → consultando…");
      const check = await FirebaseMessaging.checkPermissions();
      const { receive } = check;
      console.log("[Push][perm] 1. checkPermissions ←", JSON.stringify(check));
      if (receive === "granted") {
        console.log("[Push][perm] permiso ya concedido → pido token");
        await this.refreshAndRegisterNativeToken(FirebaseMessaging);
      } else if (receive === "prompt") {
        console.log("[Push][perm] 2. requestPermissions → mostrando diálogo…");
        const result = await FirebaseMessaging.requestPermissions();
        console.log("[Push][perm] 2. requestPermissions ←", JSON.stringify(result));
        if (result.receive === "granted") {
          await this.refreshAndRegisterNativeToken(FirebaseMessaging);
        } else {
          console.warn(
            "[Push] Permiso de notificaciones denegado por el usuario"
          );
        }
      } else {
        console.warn(
          "[Push] Notificaciones bloqueadas en ajustes del sistema (receive=" + receive + ")"
        );
      }

      if (!this.nativeListenersReady) {
        this.nativeListenersReady = true;
        this.registerNativeListeners(FirebaseMessaging);
      }
    } catch (e) {
      console.error("[Push] Error FCM nativo:", e);
    }
  }

  private registerNativeListeners(FirebaseMessaging: any): void {
    FirebaseMessaging.addListener(
      "notificationReceived",
      async (notification: any) => {
        const data = notification?.notification?.data;
        const type = data?.type ?? "NEW_ORDER";

        if (type === "CANCEL_ORDER") {
          // Con el uuid, el nativo recuerda que esa orden está cancelada
          await this.stopAlarm(data?.orderUuid);
          return;
        }

        // Incidencia (workboard): la alarma (3 veces) y el refresco de la lista los da PiwiFirebaseMessagingService
        if (type === "WB_CASE_UPDATED") {
          return;
        }

        if (type === "NEW_ORDER") {
          // Un aviso vencido no debe sonar (el servicio nativo ya lo descarta; aquí también)
          const expires = Number(data?.pushExpiresAt);
          if (expires && Date.now() / 1000 > expires) {
            console.log("[Push] NEW_ORDER vencido — no suena");
            return;
          }
          if (this.notifConfig.isSound()) {
            await this.startAlarm(data?.orderUuid);
          }
        }
      }
    );

    FirebaseMessaging.addListener(
      "notificationActionPerformed",
      async (action: any) => {
        await this.stopAlarm();

        const data = action.notification?.data;
        if (data?.type === "WB_CASE_UPDATED") {
          this.router.navigate(["/support"]);
          return;
        }
        if (data && data.orderUuid) {
          this.router.navigate(["/main"], {
            queryParams: { order: data.orderUuid },
          });
        } else {
          await this.checkPendingOrder();
        }
      }
    );

    // FCM renovó el token: se registra en el backend al instante (antes quedaba el viejo hasta el siguiente init)
    FirebaseMessaging.addListener("tokenReceived", async (ev: any) => {
      const token = ev?.token;
      if (!token) return;
      console.log("[Push] tokenReceived — registrando token renovado");
      this.registerService(token).subscribe({
        next: () => console.log("[Push] Token renovado registrado ✔"),
        error: (err) => console.error("[Push] Error registrando token renovado:", err),
      });
    });

    App.addListener("appStateChange", async ({ isActive }) => {
      if (!isActive) {
        await this.stopAlarm();
      }
    });
  }

  private scheduleTokenRetry(FirebaseMessaging: any): void {
    if (this.tokenRetryTimer) return; // ya hay un reintento en espera
    if (this.tokenRetryCount >= TOKEN_RETRY_MS.length) {
      console.warn("[Push] Sin token tras " + this.tokenRetryCount + " reintentos; se vuelve a intentar al volver a la app");
      this.tokenRetryCount = 0; // el próximo init() (resume) empieza de nuevo
      return;
    }
    const wait = TOKEN_RETRY_MS[this.tokenRetryCount++];
    console.log("[Push] Reintentando token en " + wait / 1000 + " s (intento " + this.tokenRetryCount + ")");
    this.tokenRetryTimer = setTimeout(async () => {
      this.tokenRetryTimer = undefined;
      await this.refreshAndRegisterNativeToken(FirebaseMessaging);
    }, wait);
  }

  private async refreshAndRegisterNativeToken(
    FirebaseMessaging: any
  ): Promise<void> {
    const t0 = Date.now();
    try {
      console.log("[Push][perm] 3. getToken → pidiendo token a FCM…");
      const { token } = await FirebaseMessaging.getToken();
      console.log("[Push][perm] 3. getToken ← en " + (Date.now() - t0) + " ms, longitud=" + (token ? token.length : 0));
      console.log("[Push] Token FCM nativo obtenido:", token ? "✔" : "✘ vacío");
      if (!token) {
        this.scheduleTokenRetry(FirebaseMessaging);
        return;
      }
      this.tokenRetryCount = 0;
      if (token) {
        this.registerService(token).subscribe({
          next: () =>
            console.log("[Push] Token nativo registrado en backend ✔"),
          error: (err) =>
            console.error("[Push] Error registrando token nativo:", err),
        });
      }
    } catch (e) {
      console.error(
        "[Push][perm] 3. getToken FALLÓ tras " + (Date.now() - t0) + " ms:",
        (e as any)?.message ?? e,
        "| online=" + navigator.onLine
      );
      console.error("[Push] Error obteniendo token FCM nativo:", e);
      this.scheduleTokenRetry(FirebaseMessaging);
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

  // orderUuid solo cuando esa orden fue CANCELADA (así el nativo no suena si su "orden nueva" llega tarde).
  // Para apagar porque el comercio la abrió/atendió, sin uuid.
  async stopAlarm(orderUuid?: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AlarmPlugin.stopAlarm(orderUuid ? { orderUuid } : undefined);
      console.log("[Push] Alarma detenida");
    } catch (e) {
      console.error("[Push] Error deteniendo alarma:", e);
    }
  }

  async startAlarm(orderUuid?: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.notifConfig.isSound()) return;
    try {
      const r = await AlarmPlugin.startAlarm(orderUuid ? { orderUuid } : undefined);
      if (r && r.started === false) console.log("[Push] startAlarm omitido:", r.reason);
    } catch (e) {
      console.error("[Push] Error iniciando alarma:", e);
    }
  }

  /**
   * Red de seguridad: si NO hay ninguna orden pendiente de aceptar y la alarma sigue sonando (la orden se canceló
   * o la atendió otro y el aviso de cancelación nunca llegó), el nativo la apaga. Solo con >30 s sonando.
   * Con una orden pendiente en la lista no hace nada: el aviso de orden nueva se queda hasta que la abran.
   */
  async reconcileAlarm(openOrders: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const r = await AlarmPlugin.reconcile({ openOrders });
      if (r?.stopped) console.log("[Push] Alarma apagada: ya no hay órdenes pendientes");
    } catch (e) {
      console.error("[Push] Error reconciliando alarma:", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Backend
  // ─────────────────────────────────────────────────────────────────

  /**
   * Registra el dispositivo del POS. Según `environment.pushEngine.mode`:
   *   - legacy (producción hoy): solo delivery-messaging-backend.
   *   - both   (pruebas en dev): en los dos; el motor nuevo no puede romper el registro actual (su falla se ignora).
   *   - new    (tras migrar):    solo en delivery-push-notification-backend.
   */
  registerService(playerId: string): Observable<any> {
    const legacy$ = this.http.post(
      environment.url.backEndMessague + "/pushNotification/agent-store",
      { playerId }
    );
    const engine = (environment as any).pushEngine as { url: string; mode: string } | undefined;
    if (!engine?.url || engine.mode === "legacy") return legacy$;

    const modern$ = from(getPushDeviceInfo()).pipe(
      switchMap((device) =>
        this.http.post<any>(engine.url + "/push/device/agent-store", {
          token: playerId,
          provider: "FCM",
          platform: device.platform,
          appVersion: device.appVersion,
        })
      ),
      tap(() => localStorage.setItem(ENGINE_TOKEN_KEY, playerId))
    );
    if (engine.mode === "new") return modern$;
    // both: el registro del motor nuevo se dispara aparte y su error no afecta al flujo actual
    modern$
      .pipe(
        catchError((e) => {
          console.warn("[Push] no se pudo registrar en el motor nuevo", e?.status ?? e);
          return of(null);
        })
      )
      .subscribe();
    return legacy$;
  }

  /**
   * Da de baja el token de este equipo en el motor nuevo (al cerrar sesión, para que un POS sin sesión no reciba pedidos).
   * Debe llamarse ANTES de cerrar la sesión de Cognito: la baja necesita el token de acceso. Sin efecto en modo legacy.
   */
  async unregisterFromEngine(): Promise<void> {
    const engine = (environment as any).pushEngine as { url: string; mode: string } | undefined;
    if (!engine?.url || engine.mode === "legacy") return;
    let token: string | null = null;
    try { token = localStorage.getItem(ENGINE_TOKEN_KEY); } catch { return; }
    if (!token) return;
    try {
      await firstValueFrom(
        this.http
          .request<any>("DELETE", engine.url + "/push/device/agent-store", { body: { token, provider: "FCM" } })
          .pipe(timeout(4000))
      );
    } catch (e) {
      console.warn("[Push] no se pudo dar de baja el token en el motor nuevo", e);
    }
  }
}
