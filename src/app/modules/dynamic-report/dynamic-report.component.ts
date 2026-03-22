import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

// Plugin nativo para print y descarga — mismo patrón que AlarmPlugin / AppInfoPlugin
const PiwiPlugin = registerPlugin<{
  printComanda(options: { html: string }): Promise<void>;
  downloadFile(options: { url: string; fileName: string }): Promise<void>;
}>('PiwiPlugin');

@Component({
  selector: 'app-dynamic-report',
  templateUrl: './dynamic-report.component.html',
  styleUrls: ['./dynamic-report.component.scss']
})
export class DynamicReportComponent implements OnInit, OnDestroy {

  url: SafeResourceUrl;
  private messageHandler: (e: MessageEvent) => void;

  constructor(
    public sanitizer: DomSanitizer,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Detectar plataforma y pasarla al micro-frontend via queryParam
    const platform = this.resolvePlatform();

    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.microFront.report}?userPoolId=${environment.awsConfig.cognito.userPoolId}&userPoolWebClientId=${environment.userPoolWebClientId}&platform=${platform}`
    );

    // Escuchar mensajes del micro-frontend solo si es nativo
    if (Capacitor.isNativePlatform()) {
      this.messageHandler = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg?.type?.startsWith('PIWI_')) return;
        this.ngZone.run(() => this.handleNativeMessage(msg));
      };
      window.addEventListener('message', this.messageHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
  }

  /**
   * Resuelve el valor de ?platform= que se pasa al micro-frontend.
   * El micro-frontend usa este valor para saber cómo imprimir/descargar.
   */
  private resolvePlatform(): string {
    if (!Capacitor.isNativePlatform()) {
      // PWA o web — el micro-frontend autodetecta standalone/browser
      return 'web';
    }
    // Nativo: android o ios
    return Capacitor.getPlatform(); // 'android' | 'ios'
  }

  /**
   * Recibe el postMessage del micro-frontend y delega al plugin nativo.
   * Solo se ejecuta cuando Capacitor.isNativePlatform() es true.
   */
  private async handleNativeMessage(msg: any): Promise<void> {
    try {
      switch (msg.type) {
        case 'PIWI_PRINT_COMANDA':
          await PiwiPlugin.printComanda({ html: msg.html });
          break;
        case 'PIWI_DOWNLOAD_FILE':
          await PiwiPlugin.downloadFile({ url: msg.url, fileName: msg.fileName });
          break;
      }
    } catch (e) {
      console.error('[DynamicReport] Error en plugin nativo:', e);
    }
  }
}