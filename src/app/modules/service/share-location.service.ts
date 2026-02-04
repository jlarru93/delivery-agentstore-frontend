import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

/**
 * SharedLocationData: datos extraídos de la ubicación compartida desde WhatsApp/Google Maps.
 * Se pasa al micro-frontend de órdenes vía query params en la URL del iframe.
 */
export interface SharedLocationData {
  rawText: string;
  url?: string;
  coords?: { lat: number; lng: number };
  inputType: 'linkconvert' | 'coordinates';
}

@Injectable({
  providedIn: 'root'
})
export class ShareLocationService {

  constructor(private router: Router) {}

  /**
   * Debe llamarse una sola vez al arrancar la app (AppComponent.ngOnInit).
   * Lee los query params de window.location.search (antes del #, porque usamos hash routing)
   * y detecta si viene data del Share Target API.
   */
  checkIncomingShare(): void {
    const params = new URLSearchParams(window.location.search);
    const text  = params.get('text') || '';
    const url   = params.get('url') || '';
    const title = params.get('title') || '';

    if (!text && !url) return;

    // Combinar todo el contenido recibido para buscar ubicación
    const combined = [text, url, title].filter(Boolean).join(' ');
    const locationData = this.extractLocation(combined);

    // Limpiar los query params del navegador
    this.cleanUrl();

    if (locationData) {
      // Navegar a request-order pasando la ubicación como query params
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
  }

  // ───────────────────────────────────────────────────────────────────
  // Métodos privados
  // ───────────────────────────────────────────────────────────────────

  /**
   * Extrae ubicación de un texto compartido.
   * WhatsApp típicamente comparte:
   *  - "Ubicación en tiempo real: https://maps.google.com/?q=-8.3791,-74.5539"
   *  - "https://maps.app.goo.gl/XXXXX"
   *  - "-8.3791, -74.5539"
   * Google Maps comparte:
   *  - "Mira este lugar: https://maps.app.goo.gl/XXXXX"
   *  - "https://www.google.com/maps/place/..."
   *  - "https://www.google.com/maps/@-8.3791,-74.5539,17z"
   */
  private extractLocation(text: string): SharedLocationData | null {
    // 1) Intentar extraer URL de Google Maps
    const urlMatch = text.match(
      /https?:\/\/(?:www\.)?(?:maps\.app\.goo\.gl\/[A-Za-z0-9]+|goo\.gl\/maps\/[^\s]+|(?:maps\.)?google\.[A-Za-z.]+\/maps[^\s]*|maps\.google\.[A-Za-z.]+[^\s]*)/i
    );

    if (urlMatch) {
      const mapsUrl = urlMatch[0];

      // Intentar extraer coords directamente del URL
      const coordsFromUrl = this.extractCoordsFromUrl(mapsUrl);
      if (coordsFromUrl) {
        return {
          rawText: text,
          url: mapsUrl,
          coords: coordsFromUrl,
          inputType: 'coordinates'
        };
      }

      // Link acortado o complejo → el micro-frontend o backend lo resuelve
      return {
        rawText: text,
        url: mapsUrl,
        inputType: 'linkconvert'
      };
    }

    // 2) Intentar extraer coordenadas directas del texto
    const coordMatch = text.match(
      /(-?\d{1,3}\.\d{3,8})\s*[,\s]\s*(-?\d{1,3}\.\d{3,8})/
    );
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return {
          rawText: text,
          coords: { lat, lng },
          inputType: 'coordinates'
        };
      }
    }

    return null;
  }

  /**
   * Extrae coordenadas de una URL de Google Maps.
   * Formatos: ?q=lat,lng | @lat,lng | ?ll=lat,lng | /place/lat,lng
   */
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

  /**
   * Limpia los query params de window.location.search
   * (los que están ANTES del #) sin recargar la página.
   */
  private cleanUrl(): void {
    const cleanedUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanedUrl);
  }
}