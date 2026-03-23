import { Component, OnInit, NgZone } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { NotificationConfig, NotificationConfigService } from '../service/notification-config.service';
import { PushService } from '../service/push.service';
import { AlertServices } from '../service/alert.service';

const BatteryOptimizationPlugin = registerPlugin<{
  isIgnoringBatteryOptimizations(): Promise<{ isIgnoring: boolean }>;
  openBatterySettings(): Promise<void>;
}>('BatteryOptimizationPlugin');

const AlarmPlugin = registerPlugin<{
  getAudioStatus(): Promise<{
    ringerMode: number;
    hasDndAccess: boolean;
    hasOverlayPermission: boolean;
    alarmVolume: number;
    alarmMaxVolume: number;
    bypassSilent: boolean;
  }>;
  openDndSettings(): Promise<void>;
  openSoundSettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;
  saveConfig(config: {
    sound: boolean;
    vibration: boolean;
    bypassSilent: boolean;
  }): Promise<void>;
}>('AlarmPlugin');

type PermissionStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'blocked';

export interface AudioStatus {
  ringerMode: number;
  hasDndAccess: boolean;
  hasOverlayPermission: boolean;
  alarmVolume: number;
  alarmMaxVolume: number;
  bypassSilent: boolean;
}

@Component({
  selector: 'app-notification-config-modal',
  templateUrl: './notification-config-modal.component.html',
  styleUrls: ['./notification-config-modal.component.scss']
})
export class NotificationConfigModalComponent implements OnInit {

  visible  = false;
  isNative = Capacitor.isNativePlatform();

  config: NotificationConfig = { sound: true, vibration: true, visual: true };
  bypassSilent = false;

  permStatus: PermissionStatus = 'idle';
  isBatteryRestricted = false;

  audioStatus: AudioStatus | null = null;
  isLoadingAudio = false;

  constructor(
    private notifConfig: NotificationConfigService,
    private push: PushService,
    private alert: AlertServices,
    private zone: NgZone
  ) {}

  ngOnInit(): void {}

  async open(): Promise<void> {
    this.config = this.notifConfig.get();
    await this.checkCurrentPermission();
    await this.checkBatteryOptimization();
    if (this.isNative) {
      // ✅ Al abrir: sincronizar bypassSilent desde Java UNA sola vez
      await this.refreshAudioStatus(true);
    }
    this.visible = true;
  }

  // ─────────────────────────────────────────────────────────────────
  // Permisos push
  // ─────────────────────────────────────────────────────────────────

  async checkCurrentPermissionAndRefresh(): Promise<void> {
    await this.checkCurrentPermission();
  }

  private async checkCurrentPermission(): Promise<void> {
    if (this.isNative) {
      try {
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
        const result = await FirebaseMessaging.checkPermissions();
        this.permStatus = result.receive === 'granted' ? 'granted' : 'denied';
      } catch { this.permStatus = 'idle'; }
    } else {
      if (!('Notification' in window)) { this.permStatus = 'denied'; return; }
      if (Notification.permission === 'granted')     this.permStatus = 'granted';
      else if (Notification.permission === 'denied') this.permStatus = 'blocked';
      else                                           this.permStatus = 'idle';
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
        if (resp?.perm === 'granted')  this.permStatus = 'granted';
        //@ts-ignore
        else if (resp?.error)          this.permStatus = 'blocked';
        else                           this.permStatus = 'denied';
      }
    } catch (e) {
      this.permStatus = 'denied';
      console.error('[NotifConfig] Error solicitando permiso:', e);
    }
  }

  private async registerNativeToken(): Promise<void> {
    try {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        this.push.registerService(token).subscribe({
          next: () => console.log('[NotifConfig] Token registrado ✔'),
          error: (err) => console.error('[NotifConfig] Error:', err)
        });
      }
    } catch (e) { console.error('[NotifConfig] Error getToken:', e); }
  }

  // ─────────────────────────────────────────────────────────────────
  // Batería
  // ─────────────────────────────────────────────────────────────────

  async checkBatteryAndRefresh(): Promise<void> {
    await this.checkBatteryOptimization();
  }

  private async checkBatteryOptimization(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { isIgnoring } = await BatteryOptimizationPlugin.isIgnoringBatteryOptimizations();
      this.isBatteryRestricted = !isIgnoring;
    } catch (e) { console.warn('[NotifConfig] No se pudo verificar batería:', e); }
  }

  async openBatterySettings(): Promise<void> {
    await BatteryOptimizationPlugin.openBatterySettings();
    setTimeout(async () => await this.checkBatteryOptimization(), 1000);
  }

  // ─────────────────────────────────────────────────────────────────
  // Audio / permisos de bypass
  //
  // syncBypass=true  → solo en open(), sincroniza el switch desde Java
  // syncBypass=false → en refresh manual, NO toca el switch
  // ─────────────────────────────────────────────────────────────────

  async refreshAudioStatus(syncBypass = false): Promise<void> {
    if (!this.isNative) return;
    this.isLoadingAudio = true;
    try {
      const status = await AlarmPlugin.getAudioStatus();
      this.zone.run(() => {
        this.audioStatus    = status;
        this.isLoadingAudio = false;
        // ✅ Solo sincronizar el switch cuando se abre el modal por primera vez
        if (syncBypass) {
          this.bypassSilent = status.bypassSilent;
        }
      });
    } catch (e) {
      console.warn('[NotifConfig] No se pudo leer estado de audio:', e);
      this.isLoadingAudio = false;
    }
  }

  async openDndSettings(): Promise<void> {
    await AlarmPlugin.openDndSettings();
    setTimeout(() => this.refreshAudioStatus(), 1500);
  }

  async openSoundSettings(): Promise<void> {
    await AlarmPlugin.openSoundSettings();
    setTimeout(() => this.refreshAudioStatus(), 1500);
  }

  async openOverlaySettings(): Promise<void> {
    await AlarmPlugin.openOverlaySettings();
    setTimeout(() => this.refreshAudioStatus(), 1500);
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers de template
  // ─────────────────────────────────────────────────────────────────

  get isSilent(): boolean         { return this.audioStatus?.ringerMode === 0; }
  get isAlarmVolumeLow(): boolean { return (this.audioStatus?.alarmVolume ?? 1) === 0; }
  get needsOverlay(): boolean     { return this.bypassSilent && !!this.audioStatus && !this.audioStatus.hasOverlayPermission; }

  get isGranted(): boolean  { return this.permStatus === 'granted'; }
  get isBlocked(): boolean  { return this.permStatus === 'blocked'; }
  get isChecking(): boolean { return this.permStatus === 'checking'; }
  get canRequest(): boolean { return this.permStatus === 'idle' || this.permStatus === 'denied'; }

  // ─────────────────────────────────────────────────────────────────
  // Guardar
  // ─────────────────────────────────────────────────────────────────

  save(): void {
    this.notifConfig.save(this.config);
    AlarmPlugin.saveConfig({
      sound:        this.config.sound,
      vibration:    this.config.vibration,
      bypassSilent: this.bypassSilent
    }).catch(err => console.error('[NotifConfig] Error guardando config:', err));
    this.visible = false;
  }

  cancel(): void { this.visible = false; }
}