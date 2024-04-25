import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import { MqttService } from './modules/service/mqtt.service';
import { ConnectionService } from './modules/service/connection.service';
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
    constructor(private primengConfig: PrimeNGConfig,private _mqtt:MqttService,private connectionService:ConnectionService) {}

    ngOnInit() {
        
        this.primengConfig.ripple = true;
        this.connectionService.isConnected$.subscribe((result)=>{
            console.log("result",result)
            if(result===false){
                this.isDialogConnectionShow=true
                console.log("Lanzar modal")
            }
        })
    }
}
