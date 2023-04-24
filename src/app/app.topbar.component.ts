import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AppMainComponent} from './app.main.component';
import { AuthService } from './utils/auth.service';
import { OpenStoreRequest } from './modules/main/service/data/request';

@Component({
    selector: 'app-topbar',
    templateUrl:'app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit{
    displayOpenStore:boolean=false
    activeItem: number;
    isOpenStore:boolean=false
    isLoadingOpenStatusStore:boolean=false
    constructor(private auth: AuthService,private router: Router,public appMain: AppMainComponent) {}
    
    ngOnInit(): void {
        this.getStatusOpenStore()
    }

    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }
	async logout(){
		await this.auth.signOut();
		this.router.navigate(['/login']);
	}

    getStatusOpenStore(){
        this.isLoadingOpenStatusStore=true
        this.appMain.getStatusOpen().subscribe((resp)=>{
            this.isOpenStore=resp.data.status
            this.isLoadingOpenStatusStore=false
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
            this.isLoadingOpenStatusStore=false
        },(error)=>{
            this.isLoadingOpenStatusStore=false
        },()=>{})
    }

}
