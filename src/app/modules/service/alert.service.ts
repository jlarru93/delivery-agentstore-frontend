import { Injectable } from '@angular/core';
import { Message } from 'primeng/api';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: "root"
})
export class AlertServices {
    public message = new Subject<Message>();
    showInfo(titel:any,msg:any){
        this.message.next({ severity: 'info', summary: titel, detail: msg });
    }
    showSuccess(titel:any,msg:any){
        this.message.next({ severity: 'success', summary: titel, detail: msg });
    }
    showWarning(titel:any,msg:any){
        this.message.next({ severity: 'warn', summary: titel, detail: msg });
    }
    showError(titel:any,msg:any){
        this.message.next({ severity: 'error', summary: titel, detail: msg });
    }
    // showConfirm(Confi:Confirmation) {       
    //     this.Config.next(Confi);           
    // }
}