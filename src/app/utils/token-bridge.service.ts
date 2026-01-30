import { Injectable, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Protocolo de mensajes para comunicación padre ↔ hijo (iframe)
 */
export enum TokenMessageType {
  // Hijo → Padre
  TOKEN_REQUEST = 'PIWI_TOKEN_REQUEST',
  TOKEN_REFRESH_REQUEST = 'PIWI_TOKEN_REFRESH_REQUEST',
  
  // Padre → Hijo
  TOKEN_RESPONSE = 'PIWI_TOKEN_RESPONSE',
  TOKEN_UPDATE = 'PIWI_TOKEN_UPDATE',
  TOKEN_ERROR = 'PIWI_TOKEN_ERROR',
  LOGOUT = 'PIWI_LOGOUT'
}

export interface TokenPayload {
  idToken: string;
  accessToken: string;
  expiresAt: number; // timestamp en ms
}

export interface TokenMessage {
  type: TokenMessageType;
  payload?: TokenPayload;
  error?: string;
  requestId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenBridgeService implements OnDestroy {
  
  // Dominios permitidos para recibir tokens (micro-frontends)
  private allowedOrigins: string[] = [
    'https://micro-invoice.piwi.pe',
    'https://micro-product.piwi.pe',
    'https://micro-report.piwi.pe',
    'https://micro-multi-assigment.piwi.pe',
    'https://micro-order.piwi.pe',
    // Dev
    'https://dev-micro-invoice.piwi.pe',
    'https://dev-micro-product.piwi.pe',
    'https://dev-micro-report.piwi.pe',
    'https://dev-micro-multi-assigment.piwi.pe',
    'https://dev-micro-order.piwi.pe',
    // Local para desarrollo
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202'
  ];

  // Registro de iframes hijos para broadcast
  private childFrames: Set<MessageEventSource> = new Set();

  // Estado de fullscreen mode para micro-frontends
  private fullscreenModeSubject = new BehaviorSubject<boolean>(false);
  public fullscreenMode$: Observable<boolean> = this.fullscreenModeSubject.asObservable();

  private messageHandler: (event: MessageEvent) => void;

  constructor(
    private authService: AuthService,
    private location: Location
  ) {
    this.messageHandler = this.handleMessage.bind(this);
    this.initListener();
  }

  /**
   * Inicia el listener de mensajes de los iframes hijos
   */
  private initListener(): void {
    window.addEventListener('message', this.messageHandler);
    console.log('🔌 TokenBridge: Escuchando peticiones de micro-frontends');
  }

  /**
   * Maneja mensajes entrantes de los iframes
   */
  private async handleMessage(event: MessageEvent): Promise<void> {
    // Validar origen
    if (!this.isAllowedOrigin(event.origin)) {
      return; // Ignorar mensajes de orígenes no permitidos
    }

    const message = event.data;
    
    // Validar que sea un mensaje de nuestro protocolo
    if (!message?.type) {
      return;
    }

    // Manejar mensajes de fullscreen (REQUEST_FULLSCREEN_MODE)
    if (message.type === 'REQUEST_FULLSCREEN_MODE') {
      this.handleFullscreenRequest(message.payload?.enabled ?? false, event);
      return;
    }

    // Manejar mensaje de navegación hacia atrás
    if (message.type === 'NAVIGATE_BACK') {
      this.handleNavigateBack();
      return;
    }

    // Validar que sea un mensaje del protocolo de tokens
    if (!message.type.startsWith('PIWI_')) {
      return;
    }

    console.log('📨 TokenBridge: Mensaje recibido', message.type, 'de', event.origin);

    // Registrar el iframe para futuros broadcasts
    if (event.source) {
      this.childFrames.add(event.source);
    }

    switch (message.type) {
      case TokenMessageType.TOKEN_REQUEST:
        await this.handleTokenRequest(event);
        break;
        
      case TokenMessageType.TOKEN_REFRESH_REQUEST:
        await this.handleRefreshRequest(event);
        break;
    }
  }

  /**
   * Responde a una petición de token
   */
  private async handleTokenRequest(event: MessageEvent): Promise<void> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (!isAuthenticated) {
        this.sendToChild(event.source, event.origin, {
          type: TokenMessageType.TOKEN_ERROR,
          error: 'NOT_AUTHENTICATED',
          requestId: event.data.requestId
        });
        return;
      }

      const tokenPayload = await this.getTokenPayload();
      
      this.sendToChild(event.source, event.origin, {
        type: TokenMessageType.TOKEN_RESPONSE,
        payload: tokenPayload,
        requestId: event.data.requestId
      });
      
      console.log('✅ TokenBridge: Token enviado a', event.origin);
      
    } catch (error) {
      console.error('❌ TokenBridge: Error obteniendo token', error);
      this.sendToChild(event.source, event.origin, {
        type: TokenMessageType.TOKEN_ERROR,
        error: 'TOKEN_ERROR',
        requestId: event.data.requestId
      });
    }
  }

  /**
   * Maneja petición de refresh del hijo
   */
  private async handleRefreshRequest(event: MessageEvent): Promise<void> {
    try {
      const refreshed = await this.authService.refreshToken();
      
      if (refreshed) {
        const tokenPayload = await this.getTokenPayload();
        
        // Enviar token actualizado al hijo que pidió el refresh
        this.sendToChild(event.source, event.origin, {
          type: TokenMessageType.TOKEN_UPDATE,
          payload: tokenPayload,
          requestId: event.data.requestId
        });
        
        // También notificar a todos los demás hijos
        this.broadcastTokenUpdate(tokenPayload, event.source);
        
        console.log('🔄 TokenBridge: Token refrescado y distribuido');
      } else {
        this.sendToChild(event.source, event.origin, {
          type: TokenMessageType.TOKEN_ERROR,
          error: 'REFRESH_FAILED',
          requestId: event.data.requestId
        });
      }
    } catch (error) {
      console.error('❌ TokenBridge: Error en refresh', error);
      this.sendToChild(event.source, event.origin, {
        type: TokenMessageType.TOKEN_ERROR,
        error: 'REFRESH_ERROR',
        requestId: event.data.requestId
      });
    }
  }

  /**
   * Maneja petición de fullscreen del micro-frontend
   */
  private handleFullscreenRequest(enabled: boolean, event: MessageEvent): void {
    console.log('📱 TokenBridge: Fullscreen solicitado:', enabled, 'de', event.origin);
    this.fullscreenModeSubject.next(enabled);
    
    // Notificar al hijo que el fullscreen fue aplicado
    if (event.source && 'postMessage' in event.source) {
      (event.source as Window).postMessage({
        type: 'FULLSCREEN_MODE_CHANGED',
        payload: { enabled }
      }, event.origin);
    }
  }

  /**
   * Getter para el estado actual de fullscreen
   */
  public get isFullscreenMode(): boolean {
    return this.fullscreenModeSubject.value;
  }

  /**
   * Maneja petición de navegación hacia atrás desde el micro-frontend
   */
  private handleNavigateBack(): void {
    console.log('📱 TokenBridge: Navegación hacia atrás solicitada');
    
    // Desactivar fullscreen primero
    this.fullscreenModeSubject.next(false);
    
    // Navegar hacia atrás
    this.location.back();
  }

  /**
   * Obtiene el payload del token actual
   */
  private async getTokenPayload(): Promise<TokenPayload> {
    const idToken = this.authService.getAutorizationToken();
    const accessToken = await this.authService.getCurrentToken();
    
    // Decodificar para obtener expiración
    const decoded = JSON.parse(atob(idToken.split('.')[1]));
    const expiresAt = decoded.exp * 1000; // Convertir a ms
    
    return {
      idToken,
      accessToken: accessToken || idToken,
      expiresAt
    };
  }

  /**
   * Envía mensaje a un iframe específico
   */
  private sendToChild(target: MessageEventSource | null, origin: string, message: TokenMessage): void {
    if (target && 'postMessage' in target) {
      (target as Window).postMessage(message, origin);
    }
  }

  /**
   * Envía token actualizado a todos los iframes registrados (excepto el excluido)
   */
  private broadcastTokenUpdate(payload: TokenPayload, exclude?: MessageEventSource | null): void {
    const message: TokenMessage = {
      type: TokenMessageType.TOKEN_UPDATE,
      payload
    };

    this.childFrames.forEach(frame => {
      if (frame !== exclude && 'postMessage' in frame) {
        // Broadcast a todos los orígenes permitidos
        this.allowedOrigins.forEach(origin => {
          try {
            (frame as Window).postMessage(message, origin);
          } catch (e) {
            // Ignorar errores de origen no coincidente
          }
        });
      }
    });
  }

  /**
   * Notifica a todos los hijos que el usuario cerró sesión
   */
  public broadcastLogout(): void {
    const message: TokenMessage = {
      type: TokenMessageType.LOGOUT
    };

    this.childFrames.forEach(frame => {
      if ('postMessage' in frame) {
        this.allowedOrigins.forEach(origin => {
          try {
            (frame as Window).postMessage(message, origin);
          } catch (e) {
            // Ignorar
          }
        });
      }
    });

    console.log('🚪 TokenBridge: Logout broadcast enviado');
  }

  /**
   * Valida si el origen está permitido
   */
  private isAllowedOrigin(origin: string): boolean {
    return this.allowedOrigins.some(allowed => 
      origin === allowed || origin.endsWith('.piwi.pe')
    );
  }

  /**
   * Agrega un origen permitido dinámicamente
   */
  public addAllowedOrigin(origin: string): void {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.childFrames.clear();
  }
}