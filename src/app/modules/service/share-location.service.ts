import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { filter, take } from 'rxjs/operators';

const ShareTargetPlugin = registerPlugin<{
  getPendingShare(): Promise<{ text: string | null }>;
}>('ShareTarget');

export interface SharedLocationData {
  rawText: string;
  url?: string;
  coords?: { lat: number; lng: number };
  inputType: 'linkconvert' | 'coordinates';
}

@Injectable({ providedIn: 'root' })
export class ShareLocationService {

  constructor(private router: Router) {}

  /**
   * Llamar en AppComponent.ngOnInit() SIN await.
   *
   * Cubre dos casos:
   *  1. App cerrada → share → abre en frío:
   *     espera el primer NavigationEnd (guards resueltos) y lee SharedPreferences.
   *
   *  2. App ya abierta → share → vuelve al frente:
   *     appStateChange detecta el resume y re-chequea SharedPreferences.
   */
  init(): void {
    if (!Capacitor.isNativePlatform()) {
      // PWA/web: leer query params una sola vez al inicio
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        take(1)
      ).subscribe(() => this.checkWebShare());
      return;
    }

    // ── CASO 1: Arranque en frío ──
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      take(1)
    ).subscribe(async () => {
      console.log('[ShareTarget] Arranque frío — chequeando share...');
      await this.checkNativeShare();
    });

    // ── CASO 2: App ya abierta, vuelve al frente ──
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        console.log('[ShareTarget] App resumida — chequeando share...');
        await this.checkNativeShare();
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────
  // Nativo
  // ───────────────────────────────────────────────────────────────────

  private async checkNativeShare(): Promise<void> {
    try {
      const result = await ShareTargetPlugin.getPendingShare();
      console.log('[ShareTarget] Resultado plugin:', result);

      const text = result?.text;
      if (!text) {
        console.log('[ShareTarget] Sin share pendiente');
        return;
      }

      console.log('[ShareTarget] Texto recibido:', text);
      const locationData = this.extractLocation(text);
      console.log('[ShareTarget] Location extraída:', locationData);

      if (locationData) {
        this.navigateWithLocation(locationData);
      } else {
        console.warn('[ShareTarget] No se pudo extraer ubicación del texto');
      }
    } catch (e) {
      console.error('[ShareTarget] Error:', e);
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Web / PWA
  // ───────────────────────────────────────────────────────────────────

  private checkWebShare(): void {
    const params = new URLSearchParams(window.location.search);
    const text   = params.get('text') || '';
    const url    = params.get('url') || '';
    const title  = params.get('title') || '';

    if (!text && !url) return;

    const combined = [text, url, title].filter(Boolean).join(' ');
    const locationData = this.extractLocation(combined);
    this.cleanUrl();

    if (locationData) {
      this.navigateWithLocation(locationData);
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Navegación
  // ───────────────────────────────────────────────────────────────────

  private navigateWithLocation(locationData: SharedLocationData): void {
    const queryParams: any = {};

    if (locationData.inputType === 'coordinates' && locationData.coords) {
      queryParams.sharedLat = locationData.coords.lat;
      queryParams.sharedLng = locationData.coords.lng;
    } else if (locationData.inputType === 'linkconvert' && locationData.url) {
      queryParams.sharedLocationUrl = locationData.url;
    }

    console.log('[ShareTarget] Navegando a request-order con:', queryParams);
    this.router.navigate(['/request-order'], { queryParams });
  }

  // ───────────────────────────────────────────────────────────────────
  // Extracción de ubicación
  // ───────────────────────────────────────────────────────────────────

  private extractLocation(text: string): SharedLocationData | null {
    const urlMatch = text.match(
      /https?:\/\/(?:www\.)?(?:maps\.app\.goo\.gl\/[A-Za-z0-9]+|goo\.gl\/maps\/[^\s]+|(?:maps\.)?google\.[A-Za-z.]+\/maps[^\s]*|maps\.google\.[A-Za-z.]+[^\s]*)/i
    );

    if (urlMatch) {
      const mapsUrl = urlMatch[0];
      const coordsFromUrl = this.extractCoordsFromUrl(mapsUrl);
      if (coordsFromUrl) {
        return { rawText: text, url: mapsUrl, coords: coordsFromUrl, inputType: 'coordinates' };
      }
      return { rawText: text, url: mapsUrl, inputType: 'linkconvert' };
    }

    const coordMatch = text.match(/(-?\d{1,3}\.\d{3,8})\s*[,\s]\s*(-?\d{1,3}\.\d{3,8})/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { rawText: text, coords: { lat, lng }, inputType: 'coordinates' };
      }
    }

    return null;
  }

  private extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
    const patterns = [
      /[?&]q=(-?\d{1,3}\.\d{3,8}),(-?\d{1,3}\.\d{3,8})/,
      /@(-?\d{1,3}\.\d{3,8}),(-?\d{1,3}\.\d{3,8})/,
      /[?&]ll=(-?\d{1,3}\.\d{3,8}),(-?\d{1,3}\.\d{3,8})/,
      /\/place\/(-?\d{1,3}\.\d{3,8}),(-?\d{1,3}\.\d{3,8})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    return null;
  }

  private cleanUrl(): void {
    const cleanedUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanedUrl);
  }
}