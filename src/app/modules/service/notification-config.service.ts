import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';

const AlarmPlugin = registerPlugin<{
  saveConfig(config: { sound: boolean; vibration: boolean; bypassSilent: boolean }): Promise<void>;
}>('AlarmPlugin');

export interface NotificationConfig {
  sound: boolean;
  vibration: boolean;
  visual: boolean;
  bypassSilent: boolean;
}

const STORAGE_KEY = 'piwi_notification_config';

const DEFAULT_CONFIG: NotificationConfig = {
  sound: true,
  vibration: true,
  visual: true,
  bypassSilent: false,
};

@Injectable({ providedIn: 'root' })
export class NotificationConfigService {

  private config: NotificationConfig;

  constructor() {
    this.config = this.load();
    // Sincronizar config inicial con Java al arrancar
    this.syncToNative();
  }

  get(): NotificationConfig {
    return { ...this.config };
  }

  async save(config: NotificationConfig): Promise<void> {
    this.config = { ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    // Sincronizar con AlarmService en Java
    await this.syncToNative();
  }

  isSound(): boolean        { return this.config.sound; }
  isBypassSilent(): boolean { return this.config.bypassSilent ?? false; }
  isVibration(): boolean { return this.config.vibration && Capacitor.isNativePlatform(); }
  isVisual(): boolean    { return this.config.visual; }

  private async syncToNative(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AlarmPlugin.saveConfig({
        sound:        this.config.sound,
        vibration:    this.config.vibration,
        bypassSilent: this.config.bypassSilent ?? false,
      });
      console.log('[NotifConfig] Config sincronizada con AlarmService:', this.config);
    } catch (e) {
      console.warn('[NotifConfig] No se pudo sincronizar con AlarmPlugin:', e);
    }
  }

  private load(): NotificationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_CONFIG };
  }
}