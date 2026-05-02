import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { PushService } from './modules/service/push.service';
import { AlertServices } from './modules/service/alert.service';
import { NotificationConfigModalComponent } from './modules/notification-config/notification-config-modal.component';

@Component({
    selector: 'app-menu',
    styleUrls: ['./app.menu.component.scss'],
    templateUrl: './app.menu.component.html',
    providers: []
})
export class AppMenuComponent implements OnInit, OnDestroy {

    model: any[];

    storesOpen: StatusOpenStoreBean[] = [];
    selectedStoreOpen: StatusOpenStoreBean | null = null;
    private storesSubscription: Subscription;

    @ViewChild('notifConfigModal') notifConfigModal: NotificationConfigModalComponent;

    constructor(
        public appMain: AppMainComponent,
        private productService: ProductService,
        private router: Router,
        private store: DataSharedService,
        private requestTripService: RequestTripService,
        private push: PushService,
        private messageService: AlertServices
    ) { }

    ngOnInit() {
        this.model = [
            { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/profile'] },
            { label: 'Órdenes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/main'] },
            { label: 'Productos', icon: 'pi pi-fw pi-flag', routerLink: ['/product'] },
            { label: 'Solicitar Viaje', icon: 'pi pi-fw pi-car', command: () => this.redirectRequestTrip() },
            { label: 'Solicitar Viaje V2', icon: 'pi pi-fw pi-history', routerLink: ['/request-order'] },
            //{ label: 'Servicios en curso', icon: 'pi pi-fw pi-history', routerLink: ['/order-course'] },
            //{ label: 'Reporte de usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/user-report'] },
            { label: 'Reporte dinamico', icon: 'pi pi-fw pi-file', routerLink: ['/dynamic-report'] },
        ];

        this.store.storeAviliable.subscribe((storesAvilible) => {
            if (storesAvilible?.length == 0) return;
            this.getProducts(storesAvilible[0].store_id);
        });

        this.storesSubscription = this.store.storesOpenStatus$.subscribe((stores) => {
            if (stores && stores.length > 0) {
                this.storesOpen = stores;
                if (!this.selectedStoreOpen) {
                    this.selectedStoreOpen = this.storesOpen[0];
                } else {
                    const updated = this.storesOpen.find(s => s.id === this.selectedStoreOpen.id);
                    if (updated) this.selectedStoreOpen = updated;
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.storesSubscription) this.storesSubscription.unsubscribe();
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

    // ==================== TIENDAS ====================

    onSingleStoreToggle(store: StatusOpenStoreBean): void {
        this.store.requestChangeStoreStatus(store);
    }

    onStoreItemClick(store: StatusOpenStoreBean, dropdown: Dropdown): void {
        this.selectedStoreOpen = store;
        dropdown.hide();
        this.store.setSelectedStoreOpen(store);
        this.store.requestOpenStoreDialog(store);
    }

    // ==================== PRODUCTOS / ZONA ====================

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
            (error) => { console.log('Error zona:', error); }
        );
    }

    redirectRequestTrip() {
        localStorage.removeItem('edit-trip');
        this.router.navigate(['/request-trip']);
    }

    onSidebarMouseLeave(ev: MouseEvent) {
        const to = ev.relatedTarget as HTMLElement | null;
        if (to && to.closest('.store-dropdown-panel')) return;
        this.appMain.sidebarActive = false;
    }

    // ==================== ALERTAS ====================

    openNotifConfig(): void {
        this.notifConfigModal.open();
    }
}