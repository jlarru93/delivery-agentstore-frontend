import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { ProductService } from './modules/product/service/product.service';
import { StoreResponse } from './modules/product/service/data/response';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    styleUrls: ['./app.menu.component.scss'],
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[];
    constructor(
        public appMain: AppMainComponent,
        private router: Router
    ) { }

    ngOnInit() {
        this.model = [
            { label: 'Órdenes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/main'] },
            { label: 'Productos', icon: 'pi pi-fw pi-flag', routerLink: ['/product'] },
            { label: 'Solicitar Viaje', icon: 'pi pi-fw pi-car', command: () => this.redirectRequestTrip()},
            { label: 'Servicios en curso', icon: 'pi pi-fw pi-history', routerLink: ['/order-course']},
            { label: 'Historial de Órdenes', icon: 'pi pi-fw pi-history', routerLink: ['/order-history']},
            { label: 'Quejas', icon: 'pi pi-fw pi-box', routerLink: ['/complaint-report']}
        ];
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }


    redirectRequestTrip(){
        localStorage.removeItem('edit-trip');
        this.router.navigate(['/request-trip']);
    }
}
