import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export interface NotificationConfig {
  sound: boolean;       // Sonido en bucle hasta abrir orden
  vibration: boolean;   // Vibración (solo Android nativo)
  visual: boolean;      // Notificación flotante visual
}

const STORAGE_KEY = 'piwi_notification_config';

const DEFAULT_CONFIG: NotificationConfig = {
  sound: true,
  vibration: true,
  visual: true,
};

@Injectable({ providedIn: 'root' })
export class NotificationConfigService {

  private config: NotificationConfig;

  constructor() {
    this.config = this.load();
  }

  get(): NotificationConfig {
    return { ...this.config };
  }

  save(config: NotificationConfig): void {
    this.config = { ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }

  isSound(): boolean     { return this.config.sound; }
  isVibration(): boolean { return this.config.vibration && Capacitor.isNativePlatform(); }
  isVisual(): boolean    { return this.config.visual; }

  private load(): NotificationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_CONFIG };
  }
}