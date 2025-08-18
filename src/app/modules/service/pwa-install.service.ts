// pwa-install.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window { __piwiBIP?: BIPEvent | null; }
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferred: BIPEvent | null = null;
  private _canInstall$ = new BehaviorSubject<boolean>(false);
  canInstall$ = this._canInstall$.asObservable();

  constructor() {
    // 1) Si ya estaba capturado antes de que Angular inicialice
    if (window.__piwiBIP) {
      this.deferred = window.__piwiBIP!;
      this._canInstall$.next(true);
    }

    // 2) Escucha cuando el script global avise que ya hay evento
    fromEvent(window, 'piwi-bip-ready').subscribe(() => {
      this.deferred = window.__piwiBIP ?? null;
      this._canInstall$.next(!!this.deferred && !this.isStandalone());
    });

    // 3) Limpieza cuando se instala
    fromEvent(window, 'piwi-bip-cleared').subscribe(() => {
      this.deferred = null;
      this._canInstall$.next(false);
    });

    // Si ya corre como standalone, no mostrar botón
    if (this.isStandalone()) this._canInstall$.next(false);
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
  }

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferred) return 'unavailable';
    const ev = this.deferred;
    this.deferred = null;             // Chrome deja de considerarlo “pendiente”
    this._canInstall$.next(false);

    await ev.prompt();
    const { outcome } = await ev.userChoice;
    // Si lo rechazó, vuelve a permitir mostrar botón
    if (outcome === 'dismissed') {
      // ojo: Chrome puede “enfriar” el prompt durante días; mantén el botón visible
      this._canInstall$.next(true);
    }
    // guarda de nuevo por si Chrome sigue permitiendo reusar (a veces no)
    window.__piwiBIP = null;
    return outcome;
  }
}
