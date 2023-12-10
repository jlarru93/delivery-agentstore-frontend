import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AgentStoreStoreResponse } from 'src/app/app.menu.service';
import { StoreResponse } from '../main/service/data/response';
@Injectable({
    providedIn: "root"
})
export class dataSharedService{
    public listStore = new Subject<any>();
    listStore$ = this.listStore.asObservable();

    public storeAviliable = new BehaviorSubject<AgentStoreStoreResponse[]>([]);
    storeAviliable$ = this.storeAviliable.asObservable()
    _storeBean=new Subject<StoreResponse>()
    storeBean$ = this._storeBean.asObservable()
    updateListStore(lst:any){
        this.listStore.next(lst)
    }

    setStoreAviliable(storeAviliable:AgentStoreStoreResponse[]){
        if(storeAviliable?.length>0){
            console.log(storeAviliable)
            this.storeAviliable.next(storeAviliable)
        }
        
    }
    setStoreBean(store:any){
        this._storeBean.next(store)
    }
}