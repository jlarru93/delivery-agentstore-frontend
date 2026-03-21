import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ConnectionService } from './modules/service/connection.service';
import { DialogUpdateWebComponent } from './modules/dialogUpdateWeb/dialogUpdateWeb.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { interval, map, Observable, switchMap } from 'rxjs';
import { PushService } from './modules/service/push.service';
import { WokerHandler } from './modules/service/worker.service';
import { TokenBridgeService } from './utils/token-bridge.service';
import { GeoMessageHandlerService } from './modules/service/geo.message.handler.service';
import { ShareLocationService } from './modules/service/share-location.service';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    horizontalMenu: boolean;
    darkMode = false;
    menuColorMode = 'light';
    menuColor = 'layout-menu-light';
    themeColor = 'blue';
    layoutColor = 'blue';
    ripple = true;
    inputStyle = 'outlined';
    isDialogConnectionShow: boolean;
    private previousVersion: string | null = null;
    private currentVersion: string | null = null;
    displayToken: string | null = null;

    @ViewChild(DialogUpdateWebComponent) dialogUpdate!: DialogUpdateWebComponent;

    constructor(
        private primengConfig: PrimeNGConfig,
        private _worker: WokerHandler,
        private connectionService: ConnectionService,
        private http: HttpClient,
        private push: PushService,
        private tokenBridge: TokenBridgeService,
        private geoHandler: GeoMessageHandlerService,
        private shareLocation: ShareLocationService
    ) {}

    ngOnInit() {
        // ── Status Bar verde PIWI ──
        if (Capacitor.isNativePlatform()) {
            StatusBar.show();
            StatusBar.setOverlaysWebView({ overlay: false });
            StatusBar.setStyle({ style: Style.Dark });
            StatusBar.setBackgroundColor({ color: '#398E3C' });
        }

        // ── Push / FCM ──
        this.push.init();

        // ── Share Target ──
        this.shareLocation.init();

        this.geoHandler.init();
        this.primengConfig.ripple = true;

        this.connectionService.isConnected$.subscribe((result) => {
            if (result === false) {
                this.isDialogConnectionShow = true;
            }
        });

        interval(10000)
            .pipe(switchMap(() => this.loadVersion()))
            .subscribe((version) => {
                if (this.previousVersion && this.previousVersion !== version) {
                    this.dialogUpdate.showMessage();
                }
                this.previousVersion = version;
            });

        // Mensajes web foreground (PWA)
        this.push.onForegroundMessage((payload) => {
            console.log('[Push] Mensaje foreground:', payload);
        });

        // Escuchar postMessage del micro-frontend para detener alarma
        // cuando el agente abre/acepta una orden
        window.addEventListener('message', (event: MessageEvent) => {
            if (!event.data || typeof event.data !== 'object') return;
            if (event.data.type === 'ORDER_OPENED' || event.data.type === 'ORDER_ACCEPTED') {
                this.push.stopAlarm();
            }
        });
    }

    private loadVersion(): Observable<string | null> {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        });
        const params = new HttpParams().set('t', Date.now().toString());
        return this.http.get<{ version: string }>('assets/version.json', { headers, params }).pipe(
            map((data) => {
                this.currentVersion = data.version;
                return this.currentVersion;
            })
        );
    }
}