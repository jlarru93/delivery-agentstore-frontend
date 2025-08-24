import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppMainComponent } from './app.main.component';
import { AuthService } from './utils/auth.service';
import { OpenStoreRequest } from './modules/main/service/data/request';
import { Brand, Store } from './models';
import { AgentStoreStoreResponse, MenuService } from './app.menu.service';
import { DataSharedService } from './modules/service/data-shared.service';
import { StatusOpenStoreBean } from './modules/main/data';
import { AudioService } from './modules/service/audio.service';
import { OpenStoreHandler } from './modules/service/handlers/store.open.handler';
import { OverlayPanel } from 'primeng/overlaypanel';
import { MenuItem } from 'primeng/api';
import { PushService } from './modules/service/push.service';
import { AlertServices } from './modules/service/alert.service';
import { PwaInstallService } from './modules/service/pwa-install.service';
import { WokerHandler } from './modules/service/worker.service';
import { AudioBackgroundService } from './modules/service/audio.background.service';
import { url } from 'inspector';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss'],
    providers:[]
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
    brand:Brand
    origenIcon: any ="assets/images/TRACKING COMERCIO.png";
    listInvoice:any[]=[]
    isShowDialog:boolean = false
    audioEnabled: boolean;
    invoiceMap = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    dataReady:boolean=false
    listInvoices: any[] = [];
    listInvoicesAfterPay: any[] = [];
    listInvoicesBeforeTwoDays: any[] = [];
    invoiceMapAfterPay = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    invoiceMapBeforeTwoDays = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    invoices: any
    iterator:number = 1

    items: MenuItem[] | undefined;
    statusMsg:string
    constructor(
        private auth: AuthService,
        private router: Router,
        public appMain: AppMainComponent,
        private workerHandler:WokerHandler,
        private service: MenuService,
        private dataShared:DataSharedService,
        private audioService:AudioService,
        private openStoreHanlder:OpenStoreHandler,
        private push: PushService,
        private readonly pwaInstallService:PwaInstallService,
        private messageService:AlertServices,
        private audio: AudioBackgroundService, 
        private zone: NgZone
    ) {
    }
    isWelcomeDialogOpen: boolean = true
    @ViewChild('op') overlayPanel: OverlayPanel;
    @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
    
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
        
        this.workerHandler._onConnectWorker.subscribe((isConnect)=>{
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
                        console.log("AXAXA",lstIdStore)
                        this.selectStore=lstIdStore
                    }else{
                        this.selectStore .push(this.IdAgent.Value)
                    }
                    this.startDataFetch()
                    this.dataShared.updateListStore(this.selectStore)
                    try{
                        this.service.setFileAgentStore(this.selectStore).subscribe(resp=>{
                            if(!resp.success){
                                console.log("No se pudo registrar en el archivo",resp.error)
                            }
                        })
                    }
                    catch(error){}
                }
        });
        this.permitToNotify();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
                console.log("serviceWorker::message:::event",event)
                const data = event.data || {};
                this.zone.run(() => { // asegurar cambio dentro de Angular
                    if (data.type === 'PLAY_AUDIO' && data.audioUrl) {
                        const audioUrl=data.audioUrl??"assets/audio/audio.mp3"
                        this.audio.play(audioUrl, data.metadata);  
                    }
                    if (data.type === 'PAUSE_AUDIO') {
                        this.audio.pause();
                    }
                });
            });
        }
    }

    ngAfterViewInit() {
        // setTimeout(() => {
        //     var button2 = document.getElementById('btnHidden')
        //     button2.click()
        //   }, 500)
    }

    startDataFetch() {
        this.listBrands();
        const intervalFiveMinutes = 5 * 60 * 1000;
        setInterval(() => {
            this.listBrands();
            this.iterator++
            console.log("ITERATOR:::",this.iterator)
        }, intervalFiveMinutes); 
    }

    listBrands(){
        this.service.getBrandsInvoice().subscribe(async (resp) => {
            await this.getLastInvoiceFromABrand(resp.data);
        },
        (_error) => {},
        () => {});
    }

    async getLastInvoiceFromABrand(brands: Brand[]) {
        try {
            if(this.listInvoicesAfterPay.length > 0){
                this.isShowDialog = false;
            }

            this.listInvoicesAfterPay = [];
            this.listInvoicesBeforeTwoDays = [];
            this.invoiceMapAfterPay = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
            this.invoiceMapBeforeTwoDays = new Map<string, { paymentLink?: string; reportLink?: string }[]>();

            const statusFilters = ['pending', 'intent', 'failed'];
            const date = new Date();
            const timestampInSeconds = Number(date.getTime().toString().substring(0,10));

            const processInvoices = (data: any[], map: Map<string, { paymentLink?: string; reportLink?: string }[]>, condition: (invoice: any) => boolean) => {
                data.filter(condition).forEach(invoice => {
                    if (!map.has(invoice.brandName)) {
                        map.set(invoice.brandName, []);
                    }
                    map.get(invoice.brandName)?.push({
                        paymentLink: invoice.paymentLink,
                        reportLink: invoice.reportLink
                    });
                });
            };

            const promises = brands.map(brand => {
                const request = {
                    filters: [{ field: "brand_id", value: brand.id }],
                    page: 1,
                    size: 50
                };
                return this.service.getLastInvoiceOfABrand(request).toPromise();
            });

            const responses = await Promise.all(promises);

            responses.forEach((response: any) => {
                this.invoices = response.data;

                processInvoices(this.invoices, this.invoiceMapAfterPay, invoice => 
                    statusFilters.includes(invoice.status) && timestampInSeconds > invoice.due_date
                );
                
                processInvoices(this.invoices, this.invoiceMapBeforeTwoDays, invoice => 
                    statusFilters.includes(invoice.status) && timestampInSeconds >= (invoice.due_date - (2 * 24 * 60 * 60)) && timestampInSeconds < invoice.due_date
                );
            });

            this.listInvoicesAfterPay = Array.from(this.invoiceMapAfterPay, ([brandName, invoices]) => ({ brandName, invoices }));
            this.listInvoicesBeforeTwoDays = Array.from(this.invoiceMapBeforeTwoDays, ([brandName, invoices]) => ({ brandName, invoices }));

            this.dataReady = true;
            if (this.dataReady && (this.listInvoicesAfterPay.length || this.listInvoicesBeforeTwoDays.length)) {
                if(this.iterator > 1 && this.listInvoicesBeforeTwoDays.length > 0){
                    this.isShowDialog = false
                }
                else{
                    this.isShowDialog = true;
                }
                this.dataReady = false;
            }
        } catch (error) {
            console.log('error', error);
        }
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
            this.workerHandler.subscribe(chanelStore)
        }else{
            this.workerHandler.unsubscribe(chanelStore)
        }
    }
    processSubsCribeOpenStore(id?:any){
        var chanelStore = "open/store/"+id
        this.workerHandler.subscribe(chanelStore)
       
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
            if(this.storesOpen){
                this.items = this.storesOpen.map(storeOpen => ({
                    label: storeOpen.name ?? 'Tienda',
                    icon: storeOpen.isOpen ? 'pi pi-check-circle' : 'pi pi-times-circle',
                    styleClass: storeOpen.isOpen ? 'open-store' : 'closed-store',
                    command: () => this.showDialogOpenStore(storeOpen)
                  }));
            }
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
        this.storeOpenSelected.isLoadingOpenStatusStore=true;

        this.appMain.changeStatusOpenStore(request).subscribe((resp)=>{
            const data=resp.data
            this.storeOpenSelected.isOpen=data.isOpen
            this.updateMenuItems();

            this.processSubsCribeStore(data.id)
            this.storeOpenSelected.isLoadingOpenStatusStore=false
        },(error)=>{
            this.storeOpenSelected.isLoadingOpenStatusStore=false
        },()=>{})
    }

    updateMenuItems() {
        this.items = this.storesOpen.map(storeOpen => ({
          label: storeOpen.name ?? 'Tienda',
          icon: storeOpen.isOpen ? 'pi pi-check-circle' : 'pi pi-times-circle', // Cambia icono según estado
          styleClass: storeOpen.isOpen ? 'open-store' : 'closed-store',
          command: () => this.showDialogOpenStore(storeOpen)
        }));
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
        console.log("STORES",store)
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

    isVisibleLeyend:boolean=false
    showLeyend(){
        this.isVisibleLeyend = true
    }
    
    showDialogOpenStore(storeOpen:StatusOpenStoreBean){
        this.displayOpenStore=true;
        this.listBrands()
        this.storeOpenSelected=storeOpen
    }
    async permitToNotify() {
        console.log("permitToNotify")
        this.audio.play("assets/audio/audio.mp3");
        try {
            const resp=await this.push.requestPermissionAndToken()
            if(resp.perm!='granted'){
                
            }
            if(resp?.error){
                this.messageService.showError('Error', resp.error);
            }
            //this.messageService.showError('Error',JSON.stringify(resp.perm))
        } catch (error) {
            console.log("Error",error)
            this.messageService.showError('Error', error);
        }
    }

}
