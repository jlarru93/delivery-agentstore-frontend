import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AppMainComponent} from './app.main.component';
import { AuthService } from './utils/auth.service';
import { OpenStoreRequest } from './modules/main/service/data/request';
import { MqttService } from './modules/service/mqtt.service';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit{
    displayOpenStore:boolean=false
    activeItem: number;
    isOpenStore:boolean=false
    isLoadingOpenStatusStore:boolean=false



    isConnectMqtt:boolean=false
    isDoneGetStatusOpenStore:boolean=false
    constructor(private auth: AuthService,private router: Router,public appMain: AppMainComponent,private mqtt:MqttService) {}
    
    ngOnInit(): void {
        this.getStatusOpenStore()
        this.mqtt._onConnect.subscribe((isConnect)=>{
            this.isConnectMqtt=isConnect
            this.validateConnectMqttAndGetStatus()
        })
    }

    validateConnectMqttAndGetStatus(){
        if(this.isConnectMqtt && this.isDoneGetStatusOpenStore){
            this.processSubsCribeStore()
        }
    }

    processSubsCribeStore(){
        const chanelStore="store/"+this.auth.getIdStore()
        if(this.isOpenStore){
            this.mqtt.subscribe(chanelStore)
        }else{
            this.mqtt.unSubscribe(chanelStore)
        }
    }
    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }
	async logout(){
		await this.auth.signOut();
		this.router.navigate(['/login']);
	}

    getStatusOpenStore(){
        this.isLoadingOpenStatusStore=true
        this.appMain.getStatusOpen().subscribe((resp)=>{
            this.isOpenStore=resp.data.status
            this.isLoadingOpenStatusStore=false
            this.isDoneGetStatusOpenStore=true
            this.validateConnectMqttAndGetStatus()
        },(error)=>{
            this.isLoadingOpenStatusStore=false
        },()=>{})
    }

    changeStatusOpenStore(){
        
        const request:OpenStoreRequest={
            status:!this.isOpenStore
        }
        this.displayOpenStore=false
        this.isLoadingOpenStatusStore=true
        this.appMain.changeStatusOpenStore(request).subscribe((resp)=>{
            this.isOpenStore=!this.isOpenStore
            this.processSubsCribeStore()
            this.isLoadingOpenStatusStore=false
        },(error)=>{
            this.isLoadingOpenStatusStore=false
        },()=>{})
    }

}
