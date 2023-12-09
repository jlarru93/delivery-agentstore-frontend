import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AppMainComponent} from './app.main.component';
import { AuthService } from './utils/auth.service';
import { OpenStoreRequest } from './modules/main/service/data/request';
import { MqttService } from './modules/service/mqtt.service';
import { Store } from './models';
import { AgentStoreStoreResponse, MenuService } from './app.menu.service';
import { environment } from 'src/environments/environment';
import { dataSharedService } from './modules/service/data-shared.service';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit{
    displayOpenStore:boolean=false
    activeItem: number;
    isOpenStore:boolean=false
    isLoadingOpenStatusStore:boolean=false

    userDetails: any
    userName: string
    IdAgent:any
    isConnectMqtt:boolean=false
    isDoneGetStatusOpenStore:boolean=false
    stores: AgentStoreStoreResponse[]
    selectedStore: Store[]=[]
    selectStore:Number[]=[]
    origenIcon: any ="assets/empresas/" + environment.NAME_COMPANY + environment.MARKERS.ORIGEN.URL;
    constructor(
        private auth: AuthService,
        private router: Router,
        public appMain: AppMainComponent,
        private mqtt:MqttService,
        private service: MenuService,
        private dataShared:dataSharedService
    ) {}
    
    ngOnInit(): void {
        var lstIdStore= JSON.parse(localStorage.getItem('lstIdStore'))
        
        this.getStatusOpenStore()
        this.mqtt._onConnect.subscribe((isConnect)=>{
            this.isConnectMqtt=isConnect
            this.validateConnectMqttAndGetStatus()
        })
        this.auth.getUserDetails().then((data) => {
                this.userDetails = data
                console.log(this.userDetails)
                let username = this.userDetails.find(user => user.Name == 'name')
                this.userName = username.Value
                this.IdAgent=this.userDetails.find(user=>user.Name=='custom:_idStore')
                if(this.IdAgent){
                    this.lstAgentStore()
                    if(lstIdStore!=null&&lstIdStore!=undefined&&lstIdStore.length>0){
                        this.selectStore=lstIdStore
                    }else{
                        this.selectStore .push(this.IdAgent.Value)
                    }
                    this.dataShared.updateListStore(this.selectStore)
                }
        })
    }

    validateConnectMqttAndGetStatus(){
        if(this.isConnectMqtt && this.isDoneGetStatusOpenStore){
            this.processSubsCribeStore()
        }
    }

    processSubsCribeStore(id?:any){
        
        var chanelStore
        if(id)
            chanelStore="store/"+id
        else
            chanelStore="store/"+this.auth.getParameterToken("idStore")
        console.log(chanelStore)
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
        localStorage.clear()
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
    lstAgentStore(){
        
        console.log(this.IdAgent)
        this.service.getStoreByIdAgent().subscribe((data:any)=>{
            this.stores=data.data

            this.dataShared.setStoreAviliable(this.stores)
        })
    }
    setStoreId(store:Store,id:any,event:any){
        this.dataShared.updateListStore(this.selectStore)                   
        if(this.selectStore.findIndex((eve)=>eve==id)==-1){
            this.isOpenStore=false
        }
        localStorage.setItem('lstIdStore',JSON.stringify(this.selectStore))       
        this.processSubsCribeStore(id) 
    }
}
