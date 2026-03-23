import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { ConnectionService } from './modules/service/connection.service';
import { DialogUpdateWebComponent } from './modules/dialogUpdateWeb/dialogUpdateWeb.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { interval, map, Observable, of, switchMap } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { PushService } from './modules/service/push.service';
import { WokerHandler } from './modules/service/worker.service';
import { TokenBridgeService } from './utils/token-bridge.service';
import { GeoMessageHandlerService } from './modules/service/geo.message.handler.service';
import { ShareLocationService } from './modules/service/share-location.service';
import { AppUpdateService } from './modules/service/app-update.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
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
        private shareLocation: ShareLocationService,
        private appUpdate: AppUpdateService,
        private router: Router
    ) {}

    ngOnInit() {
        // ── Status Bar verde PIWI ──
        if (Capacitor.isNativePlatform()) {
            StatusBar.show();
            StatusBar.setOverlaysWebView({ overlay: false });
            StatusBar.setStyle({ style: Style.Dark });
            StatusBar.setBackgroundColor({ color: '#398E3C' });
        }

        // ── Verificar actualización forzada (Remote Config) ──
        of(this.appUpdate.checkForUpdate()).subscribe(() => {});

        // ── Share Target ──
        this.shareLocation.init();

        // ── Push / FCM: inicializar solo después de primera NavigationEnd ──
        // Garantiza que Cognito ya cargó la sesión antes de registrar el token FCM
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            take(1)
        ).subscribe(async (e: any) => {
            const url: string = e.urlAfterRedirects || e.url || '';

            // No inicializar push si estamos en login (usuario no autenticado)
            if (!url.includes('/login')) {
                await this.push.init();
            }

            // Verificar si hay una orden pendiente por notificación (solo nativo)
            await this.push.checkPendingOrder();
        });

        // ── App resume (nativo): re-registrar token y verificar orden pendiente ──
        if (Capacitor.isNativePlatform()) {
            App.addListener('appStateChange', async ({ isActive }) => {
                if (isActive) {
                    // Re-registrar token por si rotó mientras la app estaba en background
                    await this.push.init();
                    await this.push.checkPendingOrder();
                    of(this.appUpdate.checkForUpdate()).subscribe(() => {});
                }
            });
        }

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

        this.push.onForegroundMessage((payload) => {
            console.log('[Push] Mensaje foreground:', payload);
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