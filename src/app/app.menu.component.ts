import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { ProductService } from './modules/product/service/product.service';
import { StoreResponse } from './modules/product/service/data/response';
import { Router } from '@angular/router';
import { DataSharedService } from './modules/service/data-shared.service';
import { RequestTripService } from './modules/request-trip/services/request-trip.service';
import { ZoneResponse } from './modules/request-trip/data/response';

@Component({
    selector: 'app-menu',
    styleUrls: ['./app.menu.component.scss'],
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[];
    constructor(
        public appMain: AppMainComponent,
        private productService: ProductService,
        private router: Router,
        private store:DataSharedService,
        private requestTripService: RequestTripService,
    ) { }

    ngOnInit() {
        this.model = [
            { label: 'Órdenes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/main'] },
            { label: 'Productos', icon: 'pi pi-fw pi-flag', routerLink: ['/product'] },
            { label: 'Solicitar Viaje', icon: 'pi pi-fw pi-car', command: () => this.redirectRequestTrip()},
            { label: 'Servicios en curso', icon: 'pi pi-fw pi-history', routerLink: ['/order-course']},
            { label: 'Historial de Órdenes', icon: 'pi pi-fw pi-history', routerLink: ['/order-history']},
            { label: 'Reporte de usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/user-report']},
            { label: 'Quejas', icon: 'pi pi-fw pi-box', routerLink: ['/complaint-report']},
            { label: 'Asignacion Multiple', icon: 'pi pi-sitemap', routerLink: ['/multiple-assignment']},       
            { label: 'Reporte dinamico', icon: 'pi pi-fw pi-file', routerLink: ['/dynamic-report']}
        ];
        this.store.storeAviliable.subscribe((storesAvilible)=>{
            if(storesAvilible?.length==0){
                return
            }
            //console.log(storesAvilible)
            const store_id=storesAvilible[0].store_id
            this.getProducts(store_id)
        })
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

    storeFullName: string
    getProducts(store_id:number){        
        this.productService.getProducts(store_id).subscribe((resp) => { 
            let storeBean=StoreResponse.toBean(resp.data)
            //this.storeFullName = storeBean.fullName
            localStorage.setItem('storeBean', JSON.stringify(storeBean))
            this.store.setStoreBean(storeBean)
            this.getPolygonByZone()
        })
    }

    zoneResponse: ZoneResponse
    getPolygonByZone(){
        this.requestTripService.onGetPolygonZone().subscribe(
        (resp) => {
            this.zoneResponse = resp.data
            localStorage.setItem('zoneResponse', JSON.stringify(this.zoneResponse))
        },
        (error) => {
            console.log('Ocurrio un error')
        }
        )
    }

    redirectRequestTrip(){
        localStorage.removeItem('edit-trip');
        this.router.navigate(['/request-trip']);
    }
}
