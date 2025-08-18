// pwa-install.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt?: BIPEvent;
  private _canInstall$ = new BehaviorSubject<boolean>(false);
  canInstall$ = this._canInstall$.asObservable();

  constructor() {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault(); // evita el mini-infobar
      this.deferredPrompt = e as BIPEvent;
      this._canInstall$.next(true);
    });

    // Si ya está instalada, ocultar botón
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = undefined;
      this._canInstall$.next(false);
    });

    // También ocultar si ya corre en standalone
    if (this.isStandalone()) this._canInstall$.next(false);
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
  }

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) return 'unavailable';
    this._canInstall$.next(false); // deshabilita mientras muestra prompt
    const dp = this.deferredPrompt;
    this.deferredPrompt = undefined;

    await dp.prompt();
    const { outcome } = await dp.userChoice;
    // si rechazó, puedes volver a permitir mostrar el botón
    if (outcome === 'dismissed') this._canInstall$.next(true);
    return outcome;
  }
}
