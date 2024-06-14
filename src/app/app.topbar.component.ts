import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {AppMainComponent} from './app.main.component';
import { AuthService } from './utils/auth.service';
import { OpenStoreRequest } from './modules/main/service/data/request';
import { MqttService } from './modules/service/mqtt.service';
import { Store } from './models';
import { AgentStoreStoreResponse, MenuService } from './app.menu.service';
import { environment } from 'src/environments/environment';
import { DataSharedService } from './modules/service/data-shared.service';
import { StatusOpenStoreBean } from './modules/main/data';
import { AudioService } from './modules/service/audio.service';
import { OpenStoreHandler } from './modules/service/handlers/store.open.handler';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit, AfterViewInit{
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
    selectStore:number[]=[]
    origenIcon: any ="assets/empresas/" + environment.NAME_COMPANY + environment.MARKERS.ORIGEN.URL;

     audioEnabled: boolean;

    constructor(
        private auth: AuthService,
        private router: Router,
        public appMain: AppMainComponent,
        private mqtt:MqttService,
        private service: MenuService,
        private dataShared:DataSharedService,
        private audioService:AudioService,
        private openStoreHanlder:OpenStoreHandler

    ) {}
    isWelcomeDialogOpen: boolean = true
    @ViewChild('op') overlayPanel: OverlayPanel;
    ngOnInit(): void {
        this.getFirstLogin()
        
        var flagAudio = JSON.parse(localStorage.getItem('audioEnabled'))
        var lstIdStore= JSON.parse(localStorage.getItem('lstIdStore'))
        if(flagAudio != undefined){
            this.audioEnabled = flagAudio
        }
        this.getStatusOpenStore()
        this.openStoreHanlder._data.subscribe((resp)=>{
            if(!resp){return}
            //console.log(resp)
            const data=resp.data
            const indexUpdate=this.storesOpen.findIndex(s=>s.id===data.id)
            if(indexUpdate>=0){
                this.storesOpen[indexUpdate].isOpen=data.isOpen
            }
        })
        
        this.mqtt._onConnect.subscribe((isConnect)=>{
            this.isConnectMqtt=isConnect
            this.validateConnectMqttAndGetStatus()
        })
        this.auth.getUserDetails().then((data) => {
                this.userDetails = data
                //console.log(this.userDetails)
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

    ngAfterViewInit() {
        // setTimeout(() => {
        //     var button2 = document.getElementById('btnHidden')
        //     button2.click()
        //   }, 500)
      }

    isFirstLogin: boolean = true
    getFirstLogin(){
        
        let firstLogin = JSON.parse(localStorage.getItem('isFirstLogin'))
        if(firstLogin) {
            this.isWelcomeDialogOpen = false
        } else {
            localStorage.setItem('isFirstLogin',JSON.stringify(this.isFirstLogin))
            this.isWelcomeDialogOpen = true
        }
    }

    validateConnectMqttAndGetStatus(){
        if(this.isConnectMqtt && this.isDoneGetStatusOpenStore){
            this.storesOpen.forEach(s=>{
                this.processSubsCribeStore(s.id)
                this.processSubsCribeOpenStore(s.id)
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
    processSubsCribeOpenStore(id?:any){
        var chanelStore = "open/store/"+id
        this.mqtt.subscribe(chanelStore)
       
    }
    
    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }
	async logout(){
		await this.auth.signOut();
        localStorage.clear()
        try{
            this.service.deleteContentFileAgentStore().subscribe((resp)=>{
                if(!resp.success){
                    console.log("Error en la limpieza del archivo",resp.error)
                }
            })
        }catch(error){}
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
        
        //console.log(this.IdAgent)
        this.service.getStoreByIdAgent().subscribe((data:any)=>{
            this.stores=data.data
            //console.log(this.stores)
            this.dataShared.setStoreAviliable(this.stores)
        })
    }
    setStoreId(store:Store,id:any,event:any){
        this.dataShared.updateListStore(this.selectStore)                   
        /*if(this.selectStore.findIndex((eve)=>eve==id)==-1){
            this.isOpenStore=false
        }*/
        console.log("ID",id)
        try{
            this.service.setFileAgentStore(this.selectStore).subscribe(resp=>{
                if(!resp.success){
                    console.log("No se pudo registrar en el archivo",resp.error)
                }
            })
        }
        catch(error){}

        localStorage.setItem('lstIdStore',JSON.stringify(this.selectStore))       
        this.processSubsCribeStore(id) 
    }

    onChangeFlagAudio(){
         // Actualiza el estado en el servicio StoreHandler
    this.audioService.audioEnabled = this.audioEnabled;

    // Almacena el estado en el localStorage
    this.audioService.storeAudioEnabledStateInLocalStorage();
    }

    onPlayAudioOnDialog(){
        this.audioService.onPlayAudioFirstLoad()
        this.isWelcomeDialogOpen = false
    }
}
