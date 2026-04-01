import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    templateUrl: 'app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss'],
    providers: []
})
export class AppTopBarComponent implements OnInit, AfterViewInit, OnDestroy {
    // ==================== VARIABLES ORIGINALES (sin cambios) ====================
    displayOpenStore: boolean = false;
    activeItem: number;
    storesOpen: StatusOpenStoreBean[] = [];
    storeOpenSelected: StatusOpenStoreBean;
    isAllLoadingOpenStatusStore: boolean = false;
    isMobile: boolean = false;
    value: any;
    userDetails: any;
    userName: string;
    isConnectMqtt: boolean = false;
    isDoneGetStatusOpenStore: boolean = false;
    isWindowsAlarmConnected: boolean = false;
    isConnectingAlarm: boolean = false;
    displayAlarmConfig: boolean = false;
    stores: AgentStoreStoreResponse[];
    selectedStore: Store[] = [];
    selectStore: number[] = [];
    brand: Brand;
    origenIcon: any = "assets/images/TRACKING COMERCIO.png";
    listInvoice: any[] = [];
    isShowDialog: boolean = false;
    audioEnabled: boolean;
    invoiceMap = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    dataReady: boolean = false;
    listInvoices: any[] = [];
    listInvoicesAfterPay: any[] = [];
    listInvoicesBeforeTwoDays: any[] = [];
    invoiceMapAfterPay = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    invoiceMapBeforeTwoDays = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
    invoices: any;
    iterator: number = 1;
    items: MenuItem[] | undefined;
    statusMsg: string;
    isWelcomeDialogOpen: boolean = true;
    isFirstLogin: boolean = true;
    isVisibleLeyend: boolean = false;

    @ViewChild('op') overlayPanel: OverlayPanel;
    @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
    @ViewChild('quickActionsPanel') quickActionsPanel: OverlayPanel;

    private openStoreDialogSubscription: Subscription;
    private changeStoreStatusSubscription: Subscription;

    constructor(
        private auth: AuthService,
        private router: Router,
        public appMain: AppMainComponent,
        private workerHandler: WokerHandler,
        private service: MenuService,
        private dataShared: DataSharedService,
        private audioService: AudioService,
        private openStoreHanlder: OpenStoreHandler,
        private push: PushService,
        private readonly pwaInstallService: PwaInstallService,
        private messageService: AlertServices,
        private audio: AudioBackgroundService,
        
        private zone: NgZone
        
    ) { }

    // ==================== LIFECYCLE HOOKS ====================
    ngOnInit(): void {
        this.getFirstLogin();
        this.checkDevice();
        window.addEventListener('resize', () => this.checkDevice());

        var flagAudio = JSON.parse(localStorage.getItem('audioEnabled'));
        var lstIdStore = JSON.parse(localStorage.getItem('lstIdStore'));
        if (flagAudio != undefined) {
            this.audioEnabled = flagAudio;
        }

        // ⚡ CRÍTICO: Obtener estado de tiendas
        this.getStatusOpenStore();

        // ⚡ CRÍTICO: Suscribirse a cambios de estado de tiendas
        this.openStoreHanlder._data.subscribe((resp) => {
            if (!resp) { return; }
            const data = resp.data;
            const indexUpdate = this.storesOpen.findIndex(s => s.id === data.id);
            if (indexUpdate >= 0) {
                this.storesOpen[indexUpdate].isOpen = data.isOpen;
            }
        });

        // ⚡ CRÍTICO: Suscribirse a conexión MQTT
        this.workerHandler._onConnectWorker.subscribe((isConnect) => {
            this.isConnectMqtt = isConnect;
            this.validateConnectMqttAndGetStatus();
        });

        // Obtener detalles del usuario
        this.auth.getUserDetails().then((data) => {
            this.userDetails = data;
            let username = this.userDetails.find(user => user.Name == 'name');
            this.userName = username.Value;
            this.lstAgentStore();
        });

        // Service Worker para audio
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
                console.log("serviceWorker::message:::event", event);
                const data = event.data || {};
                this.zone.run(() => {
                    if (data.type === 'PLAY_AUDIO') {
                        const audioUrl = "assets/audio/audio.mp3";
                        this.audio.play(audioUrl, data.metadata);
                    }
                    if (data.type === 'PAUSE_AUDIO') {
                        this.audio.pause();
                    }
                });
            });
        }

        this.openStoreDialogSubscription = this.dataShared.openStoreDialog$.subscribe((store) => {
            if (store) {
                this.showDialogOpenStore(store);
            }
        });

        this.changeStoreStatusSubscription = this.dataShared.changeStoreStatus$.subscribe((store) => {
            if (store) {
                this.changeStoreStatusDirect(store);
            }
        });
    }

    ngAfterViewInit() { }

    // ==================== MÉTODOS CRÍTICOS (sin cambios en lógica) ====================

    /**
     * ⚡ CRÍTICO: Valida conexión MQTT y estado de tiendas
     * Solo procede cuando AMBOS flags están activos
     */
    validateConnectMqttAndGetStatus() {
        if (this.isConnectMqtt && this.isDoneGetStatusOpenStore) {
            this.storesOpen.forEach(s => {
                this.processSubsCribeStore(s.id);
                this.processSubsCribeOpenStore(s.id);
            });
        }
    }

    /**
     * ⚡ CRÍTICO: Suscribe/desuscribe a canal de tienda según estado
     */
    processSubsCribeStore(id?: any) {
        var chanelStore = "store/" + id;
        const store = this.storesOpen.find(s => s.id == id);
        if (store.isOpen) {
            this.workerHandler.subscribe(chanelStore);
        } else {
            this.workerHandler.unsubscribe(chanelStore);
        }
    }

    /**
     * ⚡ CRÍTICO: Suscribe al canal de apertura de tienda
     */
    processSubsCribeOpenStore(id?: any) {
        var chanelStore = "open/store/" + id;
        this.workerHandler.subscribe(chanelStore);
    }

    /**
     * ⚡ CRÍTICO: Obtiene estado de apertura de todas las tiendas
     * Setea isDoneGetStatusOpenStore = true cuando termina
     */
    getStatusOpenStore() {
        this.isAllLoadingOpenStatusStore = true;
        this.appMain.getStatusOpen().subscribe((resp) => {
            this.storesOpen = resp.data;
            if (this.storesOpen) {
                this.items = this.storesOpen.map(storeOpen => ({
                    label: storeOpen.name ?? 'Tienda',
                    icon: storeOpen.isOpen ? 'pi pi-check-circle' : 'pi pi-times-circle',
                    styleClass: storeOpen.isOpen ? 'open-store' : 'closed-store',
                    command: () => this.showDialogOpenStore(storeOpen)
                }));
            }
            this.isAllLoadingOpenStatusStore = false;
            this.isDoneGetStatusOpenStore = true;  // ⚡ FLAG CRÍTICO
            this.validateConnectMqttAndGetStatus();

            // Compartir estado con el menú lateral
            this.dataShared.setStoresOpenStatus(this.storesOpen);
        }, (error) => {
            this.isAllLoadingOpenStatusStore = false;
        }, () => { });
    }

    changeStatusOpenStore() {
        const request: OpenStoreRequest = {
            id: this.storeOpenSelected.id,
            status: !this.storeOpenSelected.isOpen
        };

        this.displayOpenStore = false;
        this.storeOpenSelected.isLoadingOpenStatusStore = true;

        this.appMain.changeStatusOpenStore(request).subscribe((resp) => {
            const data = resp.data;
            this.storeOpenSelected.isOpen = data.isOpen;
            this.updateMenuItems();
            this.processSubsCribeStore(data.id);
            this.storeOpenSelected.isLoadingOpenStatusStore = false;

            // Actualizar estado compartido
            this.dataShared.setStoresOpenStatus(this.storesOpen);
        }, (error) => {
            this.storeOpenSelected.isLoadingOpenStatusStore = false;
        }, () => { });
    }

    updateMenuItems() {
        this.items = this.storesOpen.map(storeOpen => ({
            label: storeOpen.name ?? 'Tienda',
            icon: storeOpen.isOpen ? 'pi pi-check-circle' : 'pi pi-times-circle',
            styleClass: storeOpen.isOpen ? 'open-store' : 'closed-store',
            command: () => this.showDialogOpenStore(storeOpen)
        }));
    }

    // ==================== MÉTODOS DE TIENDAS/AGENTE ====================

    lstAgentStore() {
        this.service.getStoreByIdAgent().subscribe((data) => {
            this.selectStore = data.data.map(s => s.store_id);
            this.stores = data.data;
            console.log("this.stores", this.stores);
            console.log("this.selectStore", this.selectStore);

            localStorage.setItem('lstIdStore', JSON.stringify(this.selectStore));
            this.dataShared.updateListStore(this.selectStore);
            this.dataShared.setStoreAviliable(this.stores);
            //this.setStoreToWindows();
            this.stores.forEach(s => this.processSubsCribeStore(s.store_id));
        });
    }

    setStoreId(store: Store, id: any, event: any) {
        this.dataShared.updateListStore(this.selectStore);
        console.log("this.selectStore", this.selectStore);
        console.log("ID", id);
        console.log("STORES", store);
        
        // ❌ ELIMINAR - ya no se llama automáticamente
        // this.setStoreToWindows();
        
        localStorage.setItem('lstIdStore', JSON.stringify(this.selectStore));
        this.processSubsCribeStore(id);
        
        // Si ya está conectada la alarma, actualizar las tiendas
        if (this.isWindowsAlarmConnected) {
            this.connectWindowsAlarm();
        }
    }

    setStoreToWindows() {
        try {
            this.service.setFileAgentStore(this.selectStore).subscribe(resp => {
                if (!resp.success) {
                    console.log("No se pudo registrar en el archivo", resp.error);
                }
            });
        } catch (error) { }
    }

    // ==================== MÉTODOS DE UI ====================

    checkDevice() {
        this.isMobile = window.innerWidth <= 768;
    }

    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }

    showDialogOpenStore(storeOpen: StatusOpenStoreBean) {
        this.displayOpenStore = true;
        this.listBrands();
        this.storeOpenSelected = storeOpen;
    }

    showLeyend() {
        this.isVisibleLeyend = true;
    }

    // ==================== MÉTODOS DE AUDIO/NOTIFICACIONES ====================

    onChangeFlagAudio() {
        this.audioService.audioEnabled = this.audioEnabled;
        this.audioService.storeAudioEnabledStateInLocalStorage();
    }

    onPlayAudioOnDialog() {
        this.audioService.onPlayAudioFirstLoad();
        this.isWelcomeDialogOpen = false;
    }

    async permitToNotify() {
        console.log("permitToNotify");
        this.audio.play("assets/audio/audio.mp3");
        try {
            const resp = await this.push.requestPermissionAndToken();
            if (resp.perm != 'granted') { }
            if (resp?.error) {
                this.messageService.showError('Error', resp.error);
            }
        } catch (error) {
            console.log("Error", error);
            this.messageService.showError('Error', error);
        }
    }

    // ==================== MÉTODOS DE FACTURAS ====================

    startDataFetch() {
        this.listBrands();
        const intervalFiveMinutes = 5 * 60 * 1000;
        setInterval(() => {
            this.listBrands();
            this.iterator++;
            console.log("ITERATOR:::", this.iterator);
        }, intervalFiveMinutes);
    }

    listBrands() {
        this.service.getBrandsInvoice().subscribe(async (resp) => {
            //await this.getLastInvoiceFromABrand(resp.data);
        },
            (_error) => { },
            () => { });
    }

    async getLastInvoiceFromABrand(brands: Brand[]) {
        try {
            if (this.listInvoicesAfterPay.length > 0) {
                this.isShowDialog = false;
            }

            this.listInvoicesAfterPay = [];
            this.listInvoicesBeforeTwoDays = [];
            this.invoiceMapAfterPay = new Map<string, { paymentLink?: string; reportLink?: string }[]>();
            this.invoiceMapBeforeTwoDays = new Map<string, { paymentLink?: string; reportLink?: string }[]>();

            const statusFilters = ['pending', 'intent', 'failed'];
            const date = new Date();
            const timestampInSeconds = Number(date.getTime().toString().substring(0, 10));

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
                if (this.iterator > 1 && this.listInvoicesBeforeTwoDays.length > 0) {
                    this.isShowDialog = false;
                } else {
                    this.isShowDialog = true;
                }
                this.dataReady = false;
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    // ==================== OTROS MÉTODOS ====================

    getFirstLogin() {
        let firstLogin = JSON.parse(localStorage.getItem('isFirstLogin'));
        if (firstLogin) {
            this.isWelcomeDialogOpen = false;
        } else {
            localStorage.setItem('isFirstLogin', JSON.stringify(this.isFirstLogin));
            this.isWelcomeDialogOpen = true;
        }
    }

    async logout() {
        await this.auth.signOut();
        localStorage.clear();
        try {
            this.service.deleteContentFileAgentStore().subscribe((resp) => {
                if (!resp.success) {
                    console.log("Error en la limpieza del archivo", resp.error);
                }
            });
        } catch (error) { }
        this.router.navigate(['/login']);
    }

    // ==================== GETTER PARA NOTIFICACIONES ====================
    get hasNotifications(): boolean {
        // Puedes implementar lógica real aquí
        return this.listInvoicesAfterPay?.length > 0 || this.listInvoicesBeforeTwoDays?.length > 0;
    }

    changeStoreStatusDirect(store: StatusOpenStoreBean): void {
        const request: OpenStoreRequest = {
            id: store.id,
            status: store.isOpen  // El switch ya cambió el valor
        };

        // Encontrar la tienda en el array local
        const storeIndex = this.storesOpen.findIndex(s => s.id === store.id);
        if (storeIndex >= 0) {
            this.storesOpen[storeIndex].isLoadingOpenStatusStore = true;
        }

        this.appMain.changeStatusOpenStore(request).subscribe(
            (resp) => {
                const data = resp.data;
                
                // Actualizar el estado local
                if (storeIndex >= 0) {
                    this.storesOpen[storeIndex].isOpen = data.isOpen;
                    this.storesOpen[storeIndex].isLoadingOpenStatusStore = false;
                }
                
                this.updateMenuItems();
                this.processSubsCribeStore(data.id);
                
                // Actualizar estado compartido
                this.dataShared.setStoresOpenStatus(this.storesOpen);
            },
            (error) => {
                // Revertir el cambio del switch si hay error
                if (storeIndex >= 0) {
                    this.storesOpen[storeIndex].isOpen = !store.isOpen;
                    this.storesOpen[storeIndex].isLoadingOpenStatusStore = false;
                }
                // Notificar al menú del estado revertido
                this.dataShared.setStoresOpenStatus(this.storesOpen);
                
                console.error('Error al cambiar estado de tienda:', error);
            }
        );
    }

    // Método para conectar alarma Windows
    connectWindowsAlarm() {
        if (this.selectStore.length === 0) {
            this.messageService.showWarning('Advertencia', 'No hay tiendas seleccionadas');
            return;
        }
        
        this.isConnectingAlarm = true;
        this.service.setFileAgentStore(this.selectStore).subscribe(
            resp => {
                this.isConnectingAlarm = false;
                if (resp.success) {
                    this.isWindowsAlarmConnected = true;
                    this.messageService.showSuccess('Conectado', `Alarma configurada para ${this.selectStore.length} tienda(s)`);
                } else {
                    this.isWindowsAlarmConnected = false;
                    this.messageService.showError('Error', resp.error || 'No se pudo conectar');
                }
            },
            error => {
                this.isConnectingAlarm = false;
                this.isWindowsAlarmConnected = false;
                // No mostrar error - el servicio simplemente no está disponible
                console.log('Servicio de alarma Windows no disponible');
            }
        );
    }

    // Mostrar diálogo de configuración
    showAlarmConfig() {
        this.displayAlarmConfig = true;
    }
    ngOnDestroy(): void {
        if (this.openStoreDialogSubscription) {
            this.openStoreDialogSubscription.unsubscribe();
        }
        if (this.changeStoreStatusSubscription) {
            this.changeStoreStatusSubscription.unsubscribe();
        }
    }
    
}