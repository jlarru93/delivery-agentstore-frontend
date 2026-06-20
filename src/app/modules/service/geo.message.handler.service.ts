import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * GeoMessageHandlerService
 *
 * Maneja solicitudes de geolocalización del micro-frontend (iframe) via postMessage.
 *
 * En plataforma nativa (Android/iOS) usa @capacitor/geolocation para obtener
 * la ubicación real del dispositivo con máxima precisión y permisos nativos JIT.
 * En web/browser usa navigator.geolocation como fallback.
 *
 * Mensajes que escucha:
 *   PIWI_GEO_PERMISSION_REQUEST → responde PIWI_GEO_PERMISSION_RESPONSE
 *   PIWI_GEO_LOCATION_REQUEST   → responde PIWI_GEO_LOCATION_RESPONSE | PIWI_GEO_LOCATION_ERROR
 *
 * Ciclo de vida:
 *   - Se inicializa en AppComponent.ngOnInit() — siempre activo
 *   - isLocationRequestActive: leído por AppComponent en appStateChange
 *     para evitar que el resume del diálogo de permisos dispare push.init()
 */

enum GeoMessageType {
  GEO_PERMISSION_REQUEST  = 'PIWI_GEO_PERMISSION_REQUEST',
  GEO_PERMISSION_RESPONSE = 'PIWI_GEO_PERMISSION_RESPONSE',
  GEO_LOCATION_REQUEST    = 'PIWI_GEO_LOCATION_REQUEST',
  GEO_LOCATION_RESPONSE   = 'PIWI_GEO_LOCATION_RESPONSE',
  GEO_LOCATION_ERROR      = 'PIWI_GEO_LOCATION_ERROR',
}

@Injectable({ providedIn: 'root' })
export class GeoMessageHandlerService implements OnDestroy {

  private ngZone = inject(NgZone);
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private initialized = false;

  /**
   * TRUE mientras hay un diálogo nativo de permisos de ubicación abierto.
   * El AppComponent lo lee en appStateChange para evitar que el resume
   * dispare push.init() innecesariamente (mismo patrón que contactos).
   */
  isLocationRequestActive = false;

  // ─────────────────────────────────────────────────────────────────
  // Ciclo de vida
  // ─────────────────────────────────────────────────────────────────

  init(): void {
    if (this.initialized) return;
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
    this.initialized = true;
    console.log('🌍 GeoHandler: Inicializado');
  }

  ngOnDestroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
      this.initialized = false;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Router de mensajes
  // ─────────────────────────────────────────────────────────────────

  private handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (!data.type?.startsWith('PIWI_GEO_')) return;

    const source = event.source as Window;
    if (!source) return;

    console.log('🌍 GeoHandler: Mensaje recibido', data.type);

    this.ngZone.run(() => {
      switch (data.type) {
        case GeoMessageType.GEO_PERMISSION_REQUEST:
          this.handlePermissionRequest(source, data.requestId);
          break;
        case GeoMessageType.GEO_LOCATION_REQUEST:
          this.handleLocationRequest(source, data.requestId);
          break;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Permiso
  // ─────────────────────────────────────────────────────────────────

  private async handlePermissionRequest(source: Window, requestId: string): Promise<void> {
    console.log('🌍 GeoHandler: Consultando estado del permiso...', requestId);

    let state: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'unsupported';

    try {
      if (Capacitor.isNativePlatform()) {
        // En nativo: usar el plugin de Capacitor para consultar el permiso real del SO
        const { Geolocation } = await import('@capacitor/geolocation');
        const perm = await Geolocation.checkPermissions();
        // location = permiso de localización general
        // coarseLocation = permiso de localización aproximada (Android 12+)
        state = perm.location === 'granted' || perm.coarseLocation === 'granted'
          ? 'granted'
          : perm.location === 'denied'
            ? 'denied'
            : 'prompt';
      } else if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        state = result.state as 'granted' | 'denied' | 'prompt';
      }
    } catch (e) {
      console.warn('🌍 GeoHandler: Error consultando permiso', e);
    }

    source.postMessage({ type: GeoMessageType.GEO_PERMISSION_RESPONSE, requestId, state }, '*');
    console.log('🌍 GeoHandler: Estado del permiso enviado:', state);
  }

  // ─────────────────────────────────────────────────────────────────
  // Ubicación
  // ─────────────────────────────────────────────────────────────────

  private async handleLocationRequest(source: Window, requestId: string): Promise<void> {
    console.log('🌍 GeoHandler: Solicitando ubicación...', requestId);

    if (Capacitor.isNativePlatform()) {
      await this.getNativeLocation(source, requestId);
    } else {
      this.getWebLocation(source, requestId);
    }
  }

  /**
   * Ubicación nativa via @capacitor/geolocation.
   * Pide permiso JIT si no está concedido. Activa isLocationRequestActive
   * para que appStateChange no dispare push.init() durante el diálogo.
   */
  private async getNativeLocation(source: Window, requestId: string): Promise<void> {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');

      // Verificar permiso — pedir JIT si no está concedido
      const perm = await Geolocation.checkPermissions();
      const hasPermission = perm.location === 'granted' || perm.coarseLocation === 'granted';

      if (!hasPermission) {
        // Señalizar que vamos a mostrar el diálogo nativo de permisos
        // para que appStateChange no confunda el resume con uno normal
        this.isLocationRequestActive = true;

        const req = await Geolocation.requestPermissions({ permissions: ['location'] });
        const granted = req.location === 'granted' || req.coarseLocation === 'granted';

        // Pequeño delay para que appStateChange ya procesó el resume
        setTimeout(() => { this.isLocationRequestActive = false; }, 500);

        if (!granted) {
          console.warn('🌍 GeoHandler: Permiso de ubicación denegado');
          source.postMessage({
            type: GeoMessageType.GEO_LOCATION_ERROR,
            requestId,
            code: 1, // PERMISSION_DENIED — mismo código que PositionError
            message: 'Permiso de ubicación denegado'
          }, '*');
          return;
        }
      }

      // Obtener posición con alta precisión
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      console.log('🌍 GeoHandler: Ubicación nativa obtenida',
        position.coords.latitude, position.coords.longitude);

      source.postMessage({
        type: GeoMessageType.GEO_LOCATION_RESPONSE,
        requestId,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        ts: Date.now(),
      }, '*');

    } catch (err: any) {
      this.isLocationRequestActive = false;
      console.error('🌍 GeoHandler: Error obteniendo ubicación nativa', err);
      source.postMessage({
        type: GeoMessageType.GEO_LOCATION_ERROR,
        requestId,
        code: err?.code ?? -1,
        message: err?.message ?? 'Error obteniendo ubicación'
      }, '*');
    }
  }

  /**
   * Ubicación web via navigator.geolocation (fallback para browser).
   */
  private getWebLocation(source: Window, requestId: string): void {
    if (!navigator.geolocation) {
      source.postMessage({
        type: GeoMessageType.GEO_LOCATION_ERROR,
        requestId,
        code: -1,
        message: 'Geolocation not supported'
      }, '*');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('🌍 GeoHandler: Ubicación web obtenida',
          position.coords.latitude, position.coords.longitude);

        source.postMessage({
          type: GeoMessageType.GEO_LOCATION_RESPONSE,
          requestId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          ts: Date.now(),
        }, '*');
      },
      (error) => {
        console.warn('🌍 GeoHandler: Error ubicación web', error.code, error.message);
        source.postMessage({
          type: GeoMessageType.GEO_LOCATION_ERROR,
          requestId,
          code: error.code,
          message: error.message
        }, '*');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }
}