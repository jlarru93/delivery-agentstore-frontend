import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AgentStoreStoreResponse } from 'src/app/app.menu.service';
import { StoreResponse } from '../main/service/data/response';
@Injectable({
    providedIn: "root"
})
export class dataSharedService{
    public listStore = new Subject<any>();
    listStore$ = this.listStore.asObservable();

    storeAviliable = new Subject<AgentStoreStoreResponse[]>();

    _storeBean=new Subject<StoreResponse>()
    storeBean$ = this._storeBean.asObservable()
    updateListStore(lst:any){
        this.listStore.next(lst)
    }

    setStoreAviliable(storeAviliable:AgentStoreStoreResponse[]){
        this.storeAviliable.next(storeAviliable)
    }
    setStoreBean(store:any){
        this._storeBean.next(store)
    }
}