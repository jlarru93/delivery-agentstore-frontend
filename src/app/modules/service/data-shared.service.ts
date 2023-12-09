import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AgentStoreStoreResponse } from 'src/app/app.menu.service';
@Injectable({
    providedIn: "root"
})
export class dataSharedService{
    public listStore = new Subject<any>();
    listStore$ = this.listStore.asObservable();

    storeAviliable = new Subject<AgentStoreStoreResponse[]>();

    updateListStore(lst:any){
        this.listStore.next(lst)
    }

    setStoreAviliable(storeAviliable:AgentStoreStoreResponse[]){
        this.storeAviliable.next(storeAviliable)
    }

}