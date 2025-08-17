import {Component, OnInit, ViewChild} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import { MqttService } from './modules/service/mqtt.service';
import { ConnectionService } from './modules/service/connection.service';
import { DialogUpdateWebComponent } from './modules/dialogUpdateWeb/dialogUpdateWeb.component';
import { HttpClient } from '@angular/common/http';
import { interval, map, Observable, switchMap } from 'rxjs';
import { PushService } from './modules/service/push.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit{

    horizontalMenu: boolean;

    darkMode = false;

    menuColorMode = 'light';

    menuColor = 'layout-menu-light';

    themeColor = 'blue';

    layoutColor = 'blue';

    ripple = true;

    inputStyle = 'outlined';

    isDialogConnectionShow:boolean
    private previousVersion: string | null = null;
    private currentVersion: string | null = null

    displayToken: string | null = null;
    @ViewChild(DialogUpdateWebComponent) dialogUpdate!: DialogUpdateWebComponent;
    constructor(
        private primengConfig: PrimeNGConfig,
        private _mqtt:MqttService,
        private connectionService:ConnectionService,
        private http:HttpClient,
        private push: PushService
    ) {}

    ngOnInit() {
        
        this.primengConfig.ripple = true;
        this.connectionService.isConnected$.subscribe((result)=>{
            console.log("result",result)
            if(result===false){
                this.isDialogConnectionShow=true
                console.log("Lanzar modal")
            }
        })

        interval(10000)
        .pipe(switchMap(() => this.loadVersion()))
        .subscribe((version) => {
        if (this.previousVersion && this.previousVersion !== version) {
            console.log(`La versión ha cambiado de ${this.previousVersion} a ${version}`);
            this.dialogUpdate.showMessage();
        }
        this.previousVersion = version;
        });
        this.push.onForegroundMessage((payload) => {
            console.log('Mensaje en foreground:', payload);
            // Aquí puedes mostrar un toast, alert, etc.
        });
        this.permitToNotify()
    }

    private loadVersion(): Observable<string | null> {
        return this.http.get<{ version: string }>('assets/version.json').pipe(
            map((data) => {
            this.currentVersion = data.version;
            console.log("VERSION::::",this.currentVersion)
            return this.currentVersion;
            })
        );
    }

    async permitToNotify() {
        try {
            this.displayToken = await this.push.requestPermissionAndToken();
            console.log('FCM token:', this.displayToken);
        } catch (error) {
            console.log("Error",error)
        }

    }
}
