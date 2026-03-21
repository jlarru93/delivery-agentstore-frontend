import { Injectable, NgZone } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

const AppInfoPlugin = registerPlugin<{
  getVersionName(): Promise<{ versionName: string }>;
}>('AppInfoPlugin');

@Injectable({ providedIn: 'root' })
export class AppUpdateService {

  readonly updateRequired$ = new BehaviorSubject<boolean>(false);

  private readonly PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=pe.piwi.agent';

  constructor(private ngZone: NgZone) {}

  async checkForUpdate(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { FirebaseRemoteConfig } = await import('@capacitor-firebase/remote-config');

      // fetchConfig acepta minimumFetchIntervalInSeconds directamente
      // En prod: 3600s (1h de caché). En dev: 0 para siempre obtener valor fresco
      const minimumFetchIntervalInSeconds = environment.production ? 3600 : 0;

      await FirebaseRemoteConfig.fetchConfig({ minimumFetchIntervalInSeconds });
      await FirebaseRemoteConfig.activate();
      console.log('[Update] fetch + activate OK');

      const { value: minVersion } = await FirebaseRemoteConfig.getString({
        key: 'min_version'
      });
      console.log('[Update] min_version remota:', minVersion);

      if (!minVersion) {
        console.warn('[Update] min_version vacía');
        return;
      }

      const { versionName } = await AppInfoPlugin.getVersionName();
      console.log('[Update] versionName del APK:', versionName);

      if (this.isOutdated(versionName, minVersion)) {
        console.log('[Update] Actualización requerida — mostrando modal');
        this.ngZone.run(() => {
          this.updateRequired$.next(true);
        });
      } else {
        console.log('[Update] App actualizada ✅');
      }
    } catch (e) {
      console.error('[Update] ERROR:', e);
    }
  }

  openPlayStore(): void {
    window.open(this.PLAY_STORE_URL, '_system');
  }

  private isOutdated(current: string, minimum: string): boolean {
    const toNumbers = (v: string) =>
      v.split('.').map(n => parseInt(n, 10) || 0);

    const cur = toNumbers(current);
    const min = toNumbers(minimum);
    const len = Math.max(cur.length, min.length);

    for (let i = 0; i < len; i++) {
      const c = cur[i] ?? 0;
      const m = min[i] ?? 0;
      if (c < m) return true;
      if (c > m) return false;
    }
    return false;
  }
}