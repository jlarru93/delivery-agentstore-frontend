import {Component} from '@angular/core';
import { Router } from '@angular/router';
import {AppMainComponent} from './app.main.component';
import { AuthService } from './utils/auth.service';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html'
})
export class AppTopBarComponent {
    displayOpenStore:boolean=false
    activeItem: number;
    isOpenStore:boolean=false
    constructor(private auth: AuthService,private router: Router,public appMain: AppMainComponent) {}

    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }
	async logout(){
		await this.auth.signOut();
		this.router.navigate(['/login']);
	}

}
