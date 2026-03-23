import { Component, OnInit } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { NotificationConfig, NotificationConfigService } from '../service/notification-config.service';
import { PushService } from '../service/push.service';
import { AlertServices } from '../service/alert.service';

const BatteryOptimizationPlugin = registerPlugin<{
  isIgnoringBatteryOptimizations(): Promise<{ isIgnoring: boolean }>;
  openBatterySettings(): Promise<void>;
}>('BatteryOptimizationPlugin');

type PermissionStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'blocked';

@Component({
  selector: 'app-notification-config-modal',
  templateUrl: './notification-config-modal.component.html',
  styleUrls: ['./notification-config-modal.component.scss']
})
export class NotificationConfigModalComponent implements OnInit {

  visible = false;
  isNative = Capacitor.isNativePlatform();

  config: NotificationConfig = {
    sound: true,
    vibration: true,
    visual: true,
  };

  permStatus: PermissionStatus = 'idle';

  // true = MIUI está restringiendo batería → mostrar aviso
  isBatteryRestricted = false;

  constructor(
    private notifConfig: NotificationConfigService,
    private push: PushService,
    private alert: AlertServices
  ) {}

  ngOnInit(): void {}

  async open(): Promise<void> {
    this.config = this.notifConfig.get();
    await this.checkCurrentPermission();
    await this.checkBatteryOptimization();
    this.visible = true;
  }

  // ─────────────────────────────────────────────────────────────────
  // Permisos de notificación
  // ─────────────────────────────────────────────────────────────────

  private async checkCurrentPermission(): Promise<void> {
    if (this.isNative) {
      try {
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
        const result = await FirebaseMessaging.checkPermissions();
        this.permStatus = result.receive === 'granted' ? 'granted' : 'denied';
      } catch {
        this.permStatus = 'idle';
      }
    } else {
      if (!('Notification' in window)) {
        this.permStatus = 'denied';
        return;
      }
      if (Notification.permission === 'granted') {
        this.permStatus = 'granted';
      } else if (Notification.permission === 'denied') {
        this.permStatus = 'blocked';
      } else {
        this.permStatus = 'idle';
      }
    }
  }

  async requestPermission(): Promise<void> {
    this.permStatus = 'checking';
    try {
      if (this.isNative) {
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
        const result = await FirebaseMessaging.requestPermissions();
        if (result.receive === 'granted') {
          this.permStatus = 'granted';
          await this.registerNativeToken();
        } else {
          this.permStatus = 'blocked';
        }
      } else {
        const resp = await this.push.requestPermissionAndToken();
        if (resp?.perm === 'granted') {
          this.permStatus = 'granted';
        //@ts-ignore
        } else if (resp?.error) {
          this.permStatus = 'blocked';
        } else {
          this.permStatus = 'denied';
        }
      }
    } catch (e) {
      this.permStatus = 'denied';
      console.error('[NotifConfig] Error solicitando permiso:', e);
    }
  }

  // ✅ Renombrado para claridad + error handler incluido
  private async registerNativeToken(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        this.push.registerService(token).subscribe({
          next: () => console.log('[NotifConfig] Token registrado en backend ✔'),
          error: (err) => console.error('[NotifConfig] Error registrando token:', err)
        });
      } else {
        console.warn('[NotifConfig] getToken devolvió token vacío');
      }
    } catch (e) {
      console.error('[NotifConfig] Error obteniendo/registrando token:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Optimización de batería (MIUI)
  // ─────────────────────────────────────────────────────────────────

  private async checkBatteryOptimization(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { isIgnoring } = await BatteryOptimizationPlugin.isIgnoringBatteryOptimizations();
      this.isBatteryRestricted = !isIgnoring;
      console.log('[NotifConfig] Batería restringida:', this.isBatteryRestricted);
    } catch (e) {
      console.warn('[NotifConfig] No se pudo verificar batería:', e);
    }
  }

  async openBatterySettings(): Promise<void> {
    try {
      await BatteryOptimizationPlugin.openBatterySettings();
      // Al volver, re-verificar el estado
      setTimeout(async () => {
        await this.checkBatteryOptimization();
      }, 1000);
    } catch (e) {
      console.error('[NotifConfig] Error abriendo ajustes de batería:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Guardar y cerrar
  // ─────────────────────────────────────────────────────────────────

  save(): void {
    this.notifConfig.save(this.config);
    this.visible = false;
  }

  cancel(): void {
    this.visible = false;
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers template
  // ─────────────────────────────────────────────────────────────────

  get isGranted(): boolean  { return this.permStatus === 'granted'; }
  get isBlocked(): boolean  { return this.permStatus === 'blocked'; }
  get isChecking(): boolean { return this.permStatus === 'checking'; }
  get canRequest(): boolean { return this.permStatus === 'idle' || this.permStatus === 'denied'; }
}