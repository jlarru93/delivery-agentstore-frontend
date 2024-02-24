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
import { StatusOpenStoreBean } from './modules/main/data';
import { StoreHandler } from './modules/service/handlers/store.handler';
import { AudioService } from './modules/service/audio.service';
import { OpenStoreHandler } from './modules/service/handlers/store.open.handler';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit{
    displayOpenStore:boolean=false
    activeItem: number;
    storesOpen:StatusOpenStoreBean[]=[]
    storeOpenSelected:StatusOpenStoreBean
    //isOpenStore:boolean=false
    isAllLoadingOpenStatusStore:boolean=false

    value: any;


    userDetails: any
    userName: string
    IdAgent:any
    isConnectMqtt:boolean=false
    isDoneGetStatusOpenStore:boolean=false
    stores: AgentStoreStoreResponse[]
    selectedStore: Store[]=[]
    selectStore:Number[]=[]
    origenIcon: any ="assets/empresas/" + environment.NAME_COMPANY + environment.MARKERS.ORIGEN.URL;

     audioEnabled: boolean;

    constructor(
        private auth: AuthService,
        private router: Router,
        public appMain: AppMainComponent,
        private mqtt:MqttService,
        private service: MenuService,
        private dataShared:dataSharedService,
        private audioService:AudioService,
        private openStoreHanlder:OpenStoreHandler

    ) {}
    
    ngOnInit(): void {
        var flagAudio = JSON.parse(localStorage.getItem('audioEnabled'))
        var lstIdStore= JSON.parse(localStorage.getItem('lstIdStore'))
        if(flagAudio != undefined){
            this.audioEnabled = flagAudio
        }
        this.openStoreHanlder._data.subscribe((data)=>{
            this.getStatusOpenStore()
        })
        
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
            this.storesOpen.forEach(s=>{
                this.processSubsCribeStore(s.id)
            })
        }
    }

    processSubsCribeStore(id?:any){
        var chanelStore = "store/"+id
        const store=this.storesOpen.find(s=>s.id==id)
        if(store.isOpen){
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
        this.isAllLoadingOpenStatusStore=true
        this.appMain.getStatusOpen().subscribe((resp)=>{
            this.storesOpen=resp.data
            ///this.isOpenStore=resp.data.status
            this.isAllLoadingOpenStatusStore=false
            this.isDoneGetStatusOpenStore=true
            this.validateConnectMqttAndGetStatus()
        },(error)=>{
            this.isAllLoadingOpenStatusStore=false
        },()=>{})
    }

    changeStatusOpenStore(){
        
        const request:OpenStoreRequest={
            id:this.storeOpenSelected.id,
            status:!this.storeOpenSelected.isOpen
        }
        this.displayOpenStore=false
        this.storeOpenSelected.isLoadingOpenStatusStore=true
        this.appMain.changeStatusOpenStore(request).subscribe((resp)=>{
            const data=resp.data
            this.storeOpenSelected.isOpen=data.isOpen
            this.processSubsCribeStore(data.id)
            this.storeOpenSelected.isLoadingOpenStatusStore=false
        },(error)=>{
            this.storeOpenSelected.isLoadingOpenStatusStore=false
        },()=>{})
    }
    lstAgentStore(){
        
        console.log(this.IdAgent)
        this.service.getStoreByIdAgent().subscribe((data:any)=>{
            this.stores=data.data
            console.log(this.stores)
            this.dataShared.setStoreAviliable(this.stores)
        })
    }
    setStoreId(store:Store,id:any,event:any){
        this.dataShared.updateListStore(this.selectStore)                   
        /*if(this.selectStore.findIndex((eve)=>eve==id)==-1){
            this.isOpenStore=false
        }*/
        localStorage.setItem('lstIdStore',JSON.stringify(this.selectStore))       
        this.processSubsCribeStore(id) 
    }

    onChangeFlagAudio(){
         // Actualiza el estado en el servicio StoreHandler
    this.audioService.audioEnabled = this.audioEnabled;

    // Almacena el estado en el localStorage
    this.audioService.storeAudioEnabledStateInLocalStorage();
    }
}
