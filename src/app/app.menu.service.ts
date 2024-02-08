import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ObjetResponse } from './models';
@Injectable()
export class MenuService {

    private menuSource = new Subject<string>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    constructor(private http:HttpClient) { }
    onMenuStateChange(key: string) {
        this.menuSource.next(key);
    }

    reset() {
        this.resetSource.next(null);
    }
    
    getStoreByIdAgent(){
       var url=environment.url.backEnd+'/agentStore-store'
       return this.http.get<ObjetResponse<AgentStoreStoreResponse>>(url)
    }
}

export class AgentStoreStoreResponse{
    id: number
    agentStore_id: string
    store_id: number
    store_name: string
    enable: number
}