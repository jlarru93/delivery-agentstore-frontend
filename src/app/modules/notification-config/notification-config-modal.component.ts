import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NotificationConfig, NotificationConfigService } from '../service/notification-config.service';
import { PushService } from '../service/push.service';
import { AlertServices } from '../service/alert.service';

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

  constructor(
    private notifConfig: NotificationConfigService,
    private push: PushService,
    private alert: AlertServices
  ) {}

  ngOnInit(): void {}

  async open(): Promise<void> {
    this.config = this.notifConfig.get();
    await this.checkCurrentPermission();
    this.visible = true;
  }

  // ─────────────────────────────────────────────────────────────────
  // Verificar estado actual del permiso
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
        this.permStatus = 'blocked'; // No se puede volver a pedir
      } else {
        this.permStatus = 'idle'; // 'default' → se puede pedir
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Solicitar permiso
  // ─────────────────────────────────────────────────────────────────

  async requestPermission(): Promise<void> {
    this.permStatus = 'checking';

    try {
      if (this.isNative) {
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
        const result = await FirebaseMessaging.requestPermissions();
        if (result.receive === 'granted') {
          this.permStatus = 'granted';
          await this.registerToken();
        } else {
          this.permStatus = 'blocked';
        }
      } else {
        // PWA/Web
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

  private async registerToken(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        this.push.registerService(token).subscribe(() => {
          console.log('[NotifConfig] Token registrado en backend');
        });
      }
    } catch (e) {
      console.error('[NotifConfig] Error registrando token:', e);
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
  // Helpers para el template
  // ─────────────────────────────────────────────────────────────────

  get isGranted(): boolean    { return this.permStatus === 'granted'; }
  get isBlocked(): boolean    { return this.permStatus === 'blocked'; }
  get isChecking(): boolean   { return this.permStatus === 'checking'; }
  get canRequest(): boolean   { return this.permStatus === 'idle' || this.permStatus === 'denied'; }
}