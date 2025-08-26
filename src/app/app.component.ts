import {Component, OnInit, ViewChild} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import { ConnectionService } from './modules/service/connection.service';
import { DialogUpdateWebComponent } from './modules/dialogUpdateWeb/dialogUpdateWeb.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { interval, map, Observable, of, switchMap } from 'rxjs';
import { PushService } from './modules/service/push.service';
import { WokerHandler } from './modules/service/worker.service';
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
        private _worker:WokerHandler,
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
        })
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
