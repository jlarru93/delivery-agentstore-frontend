import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

/**
 * SharedLocationData: datos extraídos de la ubicación compartida desde WhatsApp.
 * - rawText:  texto original que llegó vía Share Target
 * - url:      URL de Google Maps detectada (maps.google.com, maps.app.goo.gl, goo.gl/maps)
 * - coords:   coordenadas directas si se encontraron en el texto
 * - inputType: tipo de input detectado (linkconvert | coordinates) para reusar la lógica existente de request-trip
 */
export interface SharedLocationData {
  rawText: string;
  url?: string;
  coords?: { lat: number; lng: number };
  inputType: 'linkconvert' | 'coordinates';
}

const STORAGE_KEY = 'piwi_shared_location';

@Injectable({
  providedIn: 'root'
})
export class ShareLocationService {

  private _pending = new BehaviorSubject<SharedLocationData | null>(null);
  /** Observable que emite cuando hay una ubicación compartida pendiente de procesar */
  pending$ = this._pending.asObservable();

  constructor(private router: Router) {}

  /**
   * Debe llamarse una sola vez al arrancar la app (AppComponent.ngOnInit).
   * Lee los query params de window.location.search (no del hash) y
   * detecta si viene data del Share Target API.
   */
  checkIncomingShare(): void {
    const params = new URLSearchParams(window.location.search);
    const text = params.get('text') || '';
    const url  = params.get('url') || '';
    const title = params.get('title') || '';

    // Si no hay nada, revisar si quedó algo pendiente en localStorage (por si hubo redirect al login)
    if (!text && !url) {
      this.restoreFromStorage();
      return;
    }

    // Combinar todo el contenido recibido para buscar ubicación
    const combined = [text, url, title].filter(Boolean).join(' ');
    const locationData = this.extractLocation(combined);

    if (locationData) {
      // Guardar en localStorage por si el auth guard redirige a login
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
      this._pending.next(locationData);

      // Limpiar los query params de la URL para que no se queden visibles
      this.cleanUrl();

      // Navegar a request-trip (si ya está autenticado, irá directo; si no, el guard lo manda a login)
      this.router.navigate(['/request-trip']);
    } else {
      this.cleanUrl();
    }
  }

  /**
   * Restaura datos compartidos desde localStorage.
   * Útil cuando el usuario fue redirigido al login y ahora vuelve.
   */
  restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: SharedLocationData = JSON.parse(raw);
        this._pending.next(data);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Llamado por request-trip después de consumir la data.
   * Retorna la data pendiente y la limpia para que no se re-procese.
   * Busca primero en el BehaviorSubject; si está vacío, intenta localStorage
   * (cubre el caso donde el usuario tuvo que pasar por login primero).
   */
  consume(): SharedLocationData | null {
    let data = this._pending.getValue();

    // Fallback: si el BehaviorSubject está vacío, probar localStorage
    if (!data) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          data = JSON.parse(raw);
        }
      } catch (_) {}
    }

    // Limpiar todo
    this._pending.next(null);
    localStorage.removeItem(STORAGE_KEY);
    return data;
  }

  /** Verifica si hay data pendiente sin consumirla */
  hasPending(): boolean {
    return this._pending.getValue() !== null;
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
      
      // Intentar extraer coords directamente del URL (ej: ?q=-8.3791,-74.5539)
      const coordsFromUrl = this.extractCoordsFromUrl(mapsUrl);
      if (coordsFromUrl) {
        return {
          rawText: text,
          url: mapsUrl,
          coords: coordsFromUrl,
          inputType: 'coordinates'
        };
      }

      // Si es un link acortado o complejo, usar linkconvert del backend
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
   * Formatos comunes:
   *  - ?q=-8.3791,-74.5539
   *  - @-8.3791,-74.5539
   *  - /place/-8.3791,-74.5539
   *  - ?ll=-8.3791,-74.5539
   */
  private extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
    // Patrón: ?q=lat,lng  ó  @lat,lng  ó  /lat,lng
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
   * Limpia los query params de la URL del navegador
   * sin recargar la página. Evita que los params se queden visibles.
   */
  private cleanUrl(): void {
    const cleanedUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanedUrl);
  }
}