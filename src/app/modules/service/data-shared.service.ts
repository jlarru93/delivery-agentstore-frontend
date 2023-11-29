import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from 'src/app/models';
@Injectable({
    providedIn: "root"
})
export class dataSharedService{
    public listStore = new Subject<any>();
    listStore$ = this.listStore.asObservable();

    UpdateListStore(lst:any){
        this.listStore.next(lst)
    }
}