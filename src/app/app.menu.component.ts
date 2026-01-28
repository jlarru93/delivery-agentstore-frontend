import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { ProductService } from './modules/product/service/product.service';
import { StoreResponse } from './modules/product/service/data/response';
import { Router } from '@angular/router';
import { DataSharedService } from './modules/service/data-shared.service';
import { RequestTripService } from './modules/request-trip/services/request-trip.service';
import { ZoneResponse } from './modules/request-trip/data/response';
import { StatusOpenStoreBean } from './modules/main/data';
import { Subscription } from 'rxjs';
import { Dropdown } from 'primeng/dropdown';
import { AudioBackgroundService } from './modules/service/audio.background.service';
import { PushService } from './modules/service/push.service';
import { AlertServices } from './modules/service/alert.service';

@Component({
    selector: 'app-menu',
    styleUrls: ['./app.menu.component.scss'],
    templateUrl: './app.menu.component.html',
    providers: []
})
export class AppMenuComponent implements OnInit, OnDestroy {

    model: any[];
    
    // Selector de tiendas
    storesOpen: StatusOpenStoreBean[] = [];
    selectedStoreOpen: StatusOpenStoreBean | null = null;
    private storesSubscription: Subscription;

    constructor(
        public appMain: AppMainComponent,
        private productService: ProductService,
        private router: Router,
        private store: DataSharedService,
        private requestTripService: RequestTripService,
        private audio: AudioBackgroundService,
        private push: PushService,
        private messageService: AlertServices
    ) { }

    ngOnInit() {
        this.model = [
            { label: 'Órdenes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/main'] },
            { label: 'Productos', icon: 'pi pi-fw pi-flag', routerLink: ['/product'] },
            { label: 'Solicitar Viaje', icon: 'pi pi-fw pi-car', command: () => this.redirectRequestTrip() },
            { label: 'Solicitar Viaje V2', icon: 'pi pi-fw pi-history', routerLink: ['/request-order'] },
            { label: 'Servicios en curso', icon: 'pi pi-fw pi-history', routerLink: ['/order-course'] },
            { label: 'Reporte de usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/user-report'] },
            { label: 'Reporte dinamico', icon: 'pi pi-fw pi-file', routerLink: ['/dynamic-report'] }
        ];

        // Suscribirse a las tiendas disponibles para productos
        this.store.storeAviliable.subscribe((storesAvilible) => {
            if (storesAvilible?.length == 0) {
                return;
            }
            const store_id = storesAvilible[0].store_id;
            this.getProducts(store_id);
        });

        // Suscribirse al estado de tiendas abiertas (viene del topbar)
        this.storesSubscription = this.store.storesOpenStatus$.subscribe((stores) => {
            if (stores && stores.length > 0) {
                this.storesOpen = stores;
                // Seleccionar la primera tienda por defecto si no hay selección
                if (!this.selectedStoreOpen) {
                    this.selectedStoreOpen = this.storesOpen[0];
                } else {
                    // Actualizar la selección actual con el nuevo estado
                    const updated = this.storesOpen.find(s => s.id === this.selectedStoreOpen.id);
                    if (updated) {
                        this.selectedStoreOpen = updated;
                    }
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.storesSubscription) {
            this.storesSubscription.unsubscribe();
        }
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

    // ==================== MANEJO DE TIENDAS ====================

    /**
     * Se ejecuta al cambiar el switch cuando hay UNA sola tienda
     * Cambia el estado directamente sin abrir dialog
     */
    onSingleStoreToggle(store: StatusOpenStoreBean): void {
        console.log('Toggle tienda única:', store.name, '-> isOpen:', store.isOpen);
        
        // Notificar al topbar para que ejecute el cambio de estado
        // El isOpen ya se actualizó por el ngModel, enviamos la tienda con el nuevo estado
        this.store.requestChangeStoreStatus(store);
    }

    /**
     * Se ejecuta al hacer CLICK en un item del dropdown (2+ tiendas)
     * Abre el dialog para confirmar cambio de estado
     */
    onStoreItemClick(store: StatusOpenStoreBean, dropdown: Dropdown): void {
        console.log('Click en tienda:', store);
        
        // Actualizar la selección
        this.selectedStoreOpen = store;
        
        // Cerrar el dropdown
        dropdown.hide();
        
        // Actualizar en el servicio compartido
        this.store.setSelectedStoreOpen(store);
        
        // Abrir el dialog de estado de tienda
        this.store.requestOpenStoreDialog(store);
    }

    // ==================== MÉTODOS EXISTENTES ====================
    
    storeFullName: string;
    
    getProducts(store_id: number) {
        this.productService.getProducts(store_id).subscribe((resp) => {
            let storeBean = StoreResponse.toBean(resp.data);
            localStorage.setItem('storeBean', JSON.stringify(storeBean));
            this.store.setStoreBean(storeBean);
            this.getPolygonByZone();
        });
    }

    zoneResponse: ZoneResponse;
    
    getPolygonByZone() {
        this.requestTripService.onGetPolygonZone().subscribe(
            (resp) => {
                this.zoneResponse = resp.data;
                localStorage.setItem('zoneResponse', JSON.stringify(this.zoneResponse));
            },
            (error) => {
                console.log('Ocurrio un error');
            }
        );
    }

    redirectRequestTrip() {
        localStorage.removeItem('edit-trip');
        this.router.navigate(['/request-trip']);
    }

    onSidebarMouseLeave(ev: MouseEvent) {
        const to = ev.relatedTarget as HTMLElement | null;
        // Si el mouse entra al panel del dropdown, no colapses el sidebar
        if (to && to.closest('.store-dropdown-panel')) return;
        this.appMain.sidebarActive = false;
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
}