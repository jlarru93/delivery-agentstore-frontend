import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Datos del dispositivo que el motor de push necesita al registrar el token: la plataforma (para armar el mensaje según
 * Android, iOS o Web) y la versión de la app. Ver planificacion/motor-push/5_contrato_apps_push.md.
 */
export interface PushDeviceInfo {
  platform: 'ANDROID' | 'IOS' | 'WEB';
  appVersion: string | null;
}

export async function getPushDeviceInfo(): Promise<PushDeviceInfo> {
  const p = Capacitor.getPlatform();
  const platform: PushDeviceInfo['platform'] = p === 'android' ? 'ANDROID' : p === 'ios' ? 'IOS' : 'WEB';
  let appVersion: string | null = null;
  if (Capacitor.isNativePlatform()) {
    try {
      appVersion = (await App.getInfo()).version || null;
    } catch {
      appVersion = null;
    }
  }
  return { platform, appVersion };
}
