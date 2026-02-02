import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * GeoMessageHandlerService - Para el POS (delivery-agentstore-frontend)
 * 
 * Maneja solicitudes de geolocalización del micro-frontend via postMessage.
 * 
 * USO:
 * 1. Importar en AppModule o como providedIn: 'root'
 * 2. Inyectar en AppComponent y llamar init() en ngOnInit()
 * 
 * Ejemplo en app.component.ts:
 * 
 * export class AppComponent implements OnInit {
 *   private geoHandler = inject(GeoMessageHandlerService);
 *   
 *   ngOnInit() {
 *     this.geoHandler.init();
 *   }
 * }
 */

enum GeoMessageType {
  GEO_PERMISSION_REQUEST = 'PIWI_GEO_PERMISSION_REQUEST',
  GEO_PERMISSION_RESPONSE = 'PIWI_GEO_PERMISSION_RESPONSE',
  GEO_LOCATION_REQUEST = 'PIWI_GEO_LOCATION_REQUEST',
  GEO_LOCATION_RESPONSE = 'PIWI_GEO_LOCATION_RESPONSE',
  GEO_LOCATION_ERROR = 'PIWI_GEO_LOCATION_ERROR'
}

@Injectable({ providedIn: 'root' })
export class GeoMessageHandlerService implements OnDestroy {
  
  private ngZone = inject(NgZone);
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
    this.initialized = true;
    
    console.log('🌍 POS GeoHandler: Inicializado');
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data;
    
    if (!data || typeof data !== 'object') return;
    if (!data.type?.startsWith('PIWI_GEO_')) return;
    
    const source = event.source as Window;
    if (!source) return;

    console.log('🌍 POS GeoHandler: Mensaje recibido', data.type);

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

  private async handlePermissionRequest(source: Window, requestId: string): Promise<void> {
    console.log('🌍 POS GeoHandler: Procesando solicitud de permiso', requestId);
    
    let state: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'unsupported';
    
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        state = result.state as 'granted' | 'denied' | 'prompt';
      }
    } catch (e) {
      console.warn('🌍 POS GeoHandler: Error consultando permisos', e);
    }
    
    source.postMessage({
      type: GeoMessageType.GEO_PERMISSION_RESPONSE,
      requestId,
      state
    }, '*');
    
    console.log('🌍 POS GeoHandler: Estado del permiso enviado', state);
  }

  private handleLocationRequest(source: Window, requestId: string): void {
    console.log('🌍 POS GeoHandler: Procesando solicitud de ubicación', requestId);
    
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
        source.postMessage({
          type: GeoMessageType.GEO_LOCATION_RESPONSE,
          requestId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          ts: Date.now()
        }, '*');
        
        console.log('🌍 POS GeoHandler: Ubicación enviada', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        source.postMessage({
          type: GeoMessageType.GEO_LOCATION_ERROR,
          requestId,
          code: error.code,
          message: error.message
        }, '*');
        
        console.log('🌍 POS GeoHandler: Error enviado', error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  }

  ngOnDestroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
      this.initialized = false;
    }
  }
}