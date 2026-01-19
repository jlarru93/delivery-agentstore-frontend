import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AgentStoreStoreResponse } from 'src/app/app.menu.service';
import { StoreResponse } from '../main/service/data/response';
import { StatusOpenStoreBean } from '../main/data';
@Injectable({
    providedIn: "root"
})
export class DataSharedService{
    public listStore = new BehaviorSubject<number[]>([]);
    listStore$ = this.listStore.asObservable();

    public storeAviliable = new BehaviorSubject<AgentStoreStoreResponse[]>([]);
    storeAviliable$ = this.storeAviliable.asObservable()
    _storeBean=new Subject<StoreResponse>()
    storeBean$ = this._storeBean.asObservable()

    private storesOpenStatusSubject = new BehaviorSubject<StatusOpenStoreBean[]>([]);
    public storesOpenStatus$: Observable<StatusOpenStoreBean[]> = this.storesOpenStatusSubject.asObservable();

    private selectedStoreOpenSubject = new BehaviorSubject<StatusOpenStoreBean | null>(null);
    public selectedStoreOpen$: Observable<StatusOpenStoreBean | null> = this.selectedStoreOpenSubject.asObservable();

    private openStoreDialogSubject = new Subject<StatusOpenStoreBean>();
    public openStoreDialog$ = this.openStoreDialogSubject.asObservable();

    private changeStoreStatusSubject = new Subject<StatusOpenStoreBean>();
    public changeStoreStatus$ = this.changeStoreStatusSubject.asObservable();

    updateListStore(lst:number[]){
        this.listStore.next(lst)
    }

    setStoreAviliable(storeAviliable:AgentStoreStoreResponse[]){
        if(storeAviliable?.length>0){
            //console.log(storeAviliable)
            this.storeAviliable.next(storeAviliable)
        }
        
    }
    setStoreBean(store:any){
        this._storeBean.next(store)
    }

    setStoresOpenStatus(stores: StatusOpenStoreBean[]): void {
        this.storesOpenStatusSubject.next(stores);
    }

    getStoresOpenStatus(): StatusOpenStoreBean[] {
        return this.storesOpenStatusSubject.getValue();
    }

     setSelectedStoreOpen(store: StatusOpenStoreBean): void {
        this.selectedStoreOpenSubject.next(store);
    }

    getSelectedStoreOpen(): StatusOpenStoreBean | null {
        return this.selectedStoreOpenSubject.getValue();
    }

    updateStoreOpenStatus(storeId: number, isOpen: boolean): void {
        const currentStores = this.storesOpenStatusSubject.getValue();
        const updatedStores = currentStores.map(store => 
            store.id === storeId ? { ...store, isOpen } : store
        );
        this.storesOpenStatusSubject.next(updatedStores);
        
        const selectedStore = this.selectedStoreOpenSubject.getValue();
        if (selectedStore && selectedStore.id === storeId) {
            this.selectedStoreOpenSubject.next({ ...selectedStore, isOpen });
        }
    }

    requestOpenStoreDialog(store: StatusOpenStoreBean): void {
        this.openStoreDialogSubject.next(store);
    }

    requestChangeStoreStatus(store: StatusOpenStoreBean): void {
        this.changeStoreStatusSubject.next(store);
    }
}